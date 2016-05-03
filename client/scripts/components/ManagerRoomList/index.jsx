import { List } from 'immutable';

import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import ManagerRoomItemComponent from '../ManagerRoomItem/index.jsx';

import './style.css';

class ManagerRoomListComponent extends Component {
	/**
	 * shouldComponentUpdate
	 * @return {boolean}
	 * */
	shouldComponentUpdate(nextProps, nextState) {
		return !shallowEqualImmutable(this.props, nextProps) ||
			!shallowEqualImmutable(this.state, nextState);
	}

	renderRooms() {
    const { rooms, orders, schedules } = this.props;

    return rooms.map(room => {
			const roomSchedules = schedules.get(room.get('id'));
			const roomOrders = orders.get(room.get('id'));

			return (
				<ManagerRoomItemComponent
					room={room}
					orders={roomOrders}
					schedules={roomSchedules}
					key={room.get('id')}
				/>
			);
		});
  }
  render() {
		const { rooms } = this.props;

    const renderedRooms = rooms && rooms.size ? this.renderRooms() : List();

    return (
      <div className="ManagerRoomList">
        {renderedRooms}
      </div>
    );
  }
}

ManagerRoomListComponent.propTypes = {
  rooms: ImmutablePropTypes.list.isRequired,
  orders: ImmutablePropTypes.list.isRequired,
  schedules: ImmutablePropTypes.list.isRequired,
};

export default ManagerRoomListComponent;
