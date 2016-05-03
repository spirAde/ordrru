import moment from 'moment';

import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import ManagerScheduleRowComponent from '../ManagerScheduleRow/index.jsx';

import './style.css';

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
      const dateOrders = orders.find(
        order => moment(order.get('date')).isSame(schedule.get('date'))
      );

      return (
        <ManagerScheduleRowComponent
          key={schedule.get('id')}
          orders={dateOrders}
          cells={schedule.get('periods')}
        />
      );
    });
  }
  render() {
    const { schedules } = this.props;

    if (schedules && schedules.size) {
      const rows = this.renderRows();

      return (
        <div className="ManagerSchedulePanel">
          <div className="ManagerSchedulePanel-stage-outer">
            <div className="ManagerSchedulePanel-stage" style={{ width: 108355 }}>
              {rows}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

ManagerSchedulePanelComponent.propTypes = {
  orders: ImmutablePropTypes.list.isRequired,
  schedules: ImmutablePropTypes.list.isRequired,
};

export default ManagerSchedulePanelComponent;
