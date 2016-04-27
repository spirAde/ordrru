import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import './style.css';

import { FIRST_PERIOD, LAST_PERIOD } from '../../../../common/utils/schedule-helper';

class ManagerScheduleRow extends Component {
  render() {
    const { room } = this.props;

    return (
      <div className="ManagerScheduleRow">
        <div>
          {room.get('name')}
        </div>
      </div>
    );
  }
}

ManagerScheduleRow.propTypes = {
  room: ImmutablePropTypes.map.isRequired,
  orders: ImmutablePropTypes.list.isRequired,
  schedule: ImmutablePropTypes.list.isRequired,
};

export default ManagerScheduleRow;
