import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import ManagerScheduleRowComponent from '../ManagerScheduleRow/index.jsx';
import IconComponent from '../Icon/index.jsx';
import TooltipComponent from '../Tooltip/index.jsx';

import './style.css';

import { FIRST_PERIOD, LAST_PERIOD, STEP } from '../../../../common/utils/schedule-helper';

const ANIMATION_TRANSFORM_ENABLE = false; // TODO: future manager settings
const CELL_WIDTH = 60;
const CELL_MARGIN = 10;

class ManagerSchedulePanelComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipIsActive: false,
    };

    this.handleMouseOverTooltip = this.handleMouseOverTooltip.bind(this);
    this.handleMouseLeaveTooltip = this.handleMouseLeaveTooltip.bind(this);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  /**
   * handle mouse over on question mark and open tooltip(development only)
   * */
  handleMouseOverTooltip(event) {
    event.preventDefault();

    this.setState({
      tooltipIsActive: true,
    });
  }

  /**
   * handle mouse leave on question mark and open tooltip(development only)
   * */
  handleMouseLeaveTooltip(event) {
    event.preventDefault();

    this.setState({
      tooltipIsActive: false,
    });
  }

  renderRows() {
    const { orders, schedules } = this.props;

    const schedulesLength = schedules.size;

    return schedules.map((schedule, index) => {
      const dateOrders = orders.filter(order => {
        const startDate = order.getIn(['datetime', 'startDate']);

        return moment(startDate).isSame(schedule.get('date'));
      });

      const isFirst = index === 0;
      const isLast = index === schedulesLength;

      return (
        <ManagerScheduleRowComponent
          key={schedule.get('id')}
          date={schedule.get('date')}
          orders={dateOrders}
          cells={schedule.get('periods')}
          cellWidth={CELL_WIDTH}
          cellMargin={CELL_MARGIN}
          isFirst={isFirst}
          isLast={isLast}
        />
      );
    });
  }
  render() {
    const { room, schedules, dx } = this.props;
    const { tooltipIsActive } = this.state;

    if (schedules && schedules.size) {
      const periodsLength = (LAST_PERIOD - FIRST_PERIOD) / STEP;
      const cellWidth = CELL_WIDTH + CELL_MARGIN;

      const translateX = dx * cellWidth;

      const styles = ANIMATION_TRANSFORM_ENABLE ?
      { transform: `translate3d(${translateX}px, 0px, 0px)`, transition: 'all 0.25s ease 0s' } :
      { transform: `translate(${translateX}px, 0px)` };

      styles.width = cellWidth * schedules.size * periodsLength + 2 * CELL_MARGIN;

      const rows = this.renderRows();

      return (
        <div className="ManagerSchedulePanel">
          <div className="g-clear">
            <h2 className="ManagerSchedulePanel-header">{room.get('name')}</h2>
            {
              __DEVELOPMENT__ ?
                <div style={{ float: 'left' }}>
                  <IconComponent
                    className="ManagerSchedulePanel-icon-devtool-question"
                    id={room.get('id')}
                    name="icon-question"
                    rate={1.5}
                    onMouseOver={this.handleMouseOverTooltip}
                    onMouseLeave={this.handleMouseLeaveTooltip}
                  />
                  {
                    tooltipIsActive ?
                      <TooltipComponent>
                        <div>ID room: {room.get('id')}</div>
                        <div>ID bathhouse: {room.get('bathhouseId')}</div>
                        <div>
                          Minimal order duration: {room.getIn(['settings', 'minOrderDuration'])}
                        </div>
                      </TooltipComponent> : null
                  }
                </div> : null
            }
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
            <div className="ManagerSchedulePanel-stage" style={styles}>
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
