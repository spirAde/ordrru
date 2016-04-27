import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import ManagerScheduleRow from '../ManagerScheduleRow/index.jsx';

import './style.css';

class ManagerSchedulePanel extends Component {
  renderRows() {
    const { rooms, orders, schedules } = this.props;

    return rooms.map(room => (
      <ManagerScheduleRow
        key={room.get('id')}
        room={room}
        orders={orders.get(room.get('id'))}
        schedule={schedules.get(room.get('id'))}
      />
    ));
  }
  render() {
    const rows = this.renderRows();

    return (
      <div className="schedule-panel schedule-carousel schedule-loaded">
        {rows}
      </div>
    );
  }
}

ManagerSchedulePanel.propTypes = {
  rooms: ImmutablePropTypes.list.isRequired,
  orders: ImmutablePropTypes.map.isRequired,
  schedules: ImmutablePropTypes.map.isRequired,
};

export default ManagerSchedulePanel;
