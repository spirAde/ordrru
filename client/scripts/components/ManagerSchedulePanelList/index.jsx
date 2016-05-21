import { List } from 'immutable';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import ManagerSchedulePanelComponent from '../ManagerSchedulePanel/index.jsx';
import LoaderComponent from '../Loader/index.jsx';

import './style.css';

import whyDidYouUpdateMixin from '../../utils/whyDidYouUpdateMixin';

class ManagerSchedulePanelListComponent extends Component {
  constructor(props) {
    super(props);

    //this.componentDidUpdate = whyDidYouUpdateMixin.componentDidUpdate.bind(this);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  renderSchedulePanels() {
    const { rooms, orders, schedules, dx, onShowOrder, onCreateOrder } = this.props;

    return rooms.map(room => {
      const roomSchedules = schedules.get(room.get('id'));
      const roomOrders = orders.get(room.get('id'));

      return (
        <ManagerSchedulePanelComponent
          room={room}
          orders={roomOrders}
          schedules={roomSchedules}
          dx={dx}
          key={room.get('id')}
          onShowOrder={onShowOrder}
          onCreateOrder={onCreateOrder}
        />
      );
    });
  }
  render() {
    const { rooms, isFetching } = this.props;

    const renderedSchedulePanels = rooms && rooms.size ? this.renderSchedulePanels() : List();

    return (
      <div className="ManagerSchedulePanelList">
        <LoaderComponent active={isFetching}>
          {renderedSchedulePanels}
        </LoaderComponent>
      </div>
    );
  }
}

ManagerSchedulePanelListComponent.propTypes = {
  rooms: ImmutablePropTypes.list.isRequired,
  orders: ImmutablePropTypes.map.isRequired,
  schedules: ImmutablePropTypes.map.isRequired,
  dx: PropTypes.number.isRequired,
  isFetching: PropTypes.bool.isRequired,

  onShowOrder: PropTypes.func.isRequired,
  onCreateOrder: PropTypes.func.isRequired,
};

export default ManagerSchedulePanelListComponent;
