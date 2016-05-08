import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import ManagerScheduleRowComponent from '../ManagerScheduleRow/index.jsx';

import './style.css';

const ANIMATION_TRANSFORM_ENABLE = false; // TODO: future manager settings
const CELL_WIDTH = 60;
const CELL_MARGIN = 10;

class ManagerSchedulePanelComponent extends Component {
  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  renderRows() {
    const { orders, schedules } = this.props;

    return schedules.map(schedule => {
      const dateOrders = orders.filter(order => {
        const startDate = order.getIn(['datetime', 'startDate']);
        const endDate = order.getIn(['datetime', 'endDate']);

        return moment(startDate).isSame(schedule.get('date')) ||
          moment(endDate).isSame(schedule.get('date'));
      });

      return (
        <ManagerScheduleRowComponent
          key={schedule.get('id')}
          date={schedule.get('date')}
          orders={dateOrders}
          cells={schedule.get('periods')}
          cellWidth={CELL_WIDTH}
          cellMargin={CELL_MARGIN}
        />
      );
    });
  }
  render() {
    const { room, schedules, dx } = this.props;

    const translateX = dx * (CELL_WIDTH + CELL_MARGIN);

    const styles = ANIMATION_TRANSFORM_ENABLE ?
      { transform: `translate3d(${translateX}px, 0px, 0px)`, transition: 'all 0.25s ease 0s' } :
      { transform: `translate(${translateX}px, 0px)` };

    if (schedules && schedules.size) {
      const rows = this.renderRows();

      return (
        <div className="ManagerSchedulePanel">
          <div className="g-clear">
            <h2 className="ManagerSchedulePanel-header">{room.get('name')}</h2>
            <div className="ManagerSchedulePanel-help">
              <span
                className="ManagerSchedulePanel-help-item ManagerSchedulePanel-help-item--available"
              >
                <FormattedMessage id="availableTime" />
              </span>
              <span
                className="ManagerSchedulePanel-help-item ManagerSchedulePanel-help-item--disabled"
              >
                <FormattedMessage id="disabledTime" />
              </span>
              <span
                className="ManagerSchedulePanel-help-item ManagerSchedulePanel-help-item--manager"
              >
                <FormattedMessage id="createdManagerTime" />
              </span>
              <span className="ManagerSchedulePanel-help-item ManagerSchedulePanel-help-item--user">
                <FormattedMessage id="createdUserTime" />
              </span>
            </div>
          </div>
          <div className="ManagerSchedulePanel-stage-outer">
            <div
              className="ManagerSchedulePanel-stage"
              style={{
                width: 108355,
                ...styles,
              }}
            >
              {rows}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

ManagerSchedulePanelComponent.defaultProps = {
  dx: 0,
};

ManagerSchedulePanelComponent.propTypes = {
  room: ImmutablePropTypes.map.isRequired,
  orders: ImmutablePropTypes.list.isRequired,
  schedules: ImmutablePropTypes.list.isRequired,
  dx: PropTypes.number,
};

export default ManagerSchedulePanelComponent;
