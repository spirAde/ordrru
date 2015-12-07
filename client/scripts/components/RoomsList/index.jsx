import { Map } from 'immutable';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import { changeActiveRoom } from '../../actions/bathhouse-actions';
import { findRoomScheduleIfNeed } from '../../actions/schedule-actions';
import { selectOrder } from '../../actions/user-actions';

import RoomItemComponent from '../RoomItem/index.jsx';

import './style.css';

/**
 * RoomsListComponent - dumb component, panel of room boxes
 * Smart components - none
 * Dumb components - RoomItemComponent
 * */
class RoomsListComponent extends Component {

  /**
   * constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.handleChangeActiveRoom = this.handleChangeActiveRoom.bind(this);
    this.handleSelectOrder = this.handleSelectOrder.bind(this);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }

  /**
   * handle change active room, active room box is open
   * @param {string} id - room id
   * @return {void}
   */
  handleChangeActiveRoom(id) {
    this.props.changeActiveRoom(id);
    this.props.findRoomScheduleIfNeed(id);
  }

  /**
   * handles selected cell twice. First for date and period of start order, and other for end of order.
   * take into consideration, that need disabled nearby cells in min duration of order less than room setting.
   * @param {string} id - room id
   * @param {Date} date - start or end date
   * @param {number} period - period id
   * @return {void}
   * */
  handleSelectOrder(id, date, period) {
    this.props.selectOrder(id, date, period);
  }

  /**
   * renderRooms - render room item components
   * @param {Array.<Object>} bathhouses - list of bathhouses
   * @param {Array.<Object>} rooms - list of rooms
   * @param {Object.<string, Array>} schedules - schedules of rooms
   * @return {Array.<Element>} RoomItems - room boxes
   * */
  renderRooms(bathhouses, rooms, schedules) {
    const { activeRoomId } = this.props;

    return rooms.map((room, index) => {
      const bathhouse = bathhouses.find(bathhouse => bathhouse.get('id') === room.get('bathhouseId'));
      const schedule = schedules.get(room.get('id'));

      return (
        <RoomItemComponent
          isOpen={activeRoomId === room.get('id')}
          room={room}
          bathhouse={bathhouse}
          schedule={schedule}
          onChangeActiveRoom={this.handleChangeActiveRoom}
          onSelectOrder={this.props.selectOrder}
          isClosable={false}
          key={index}
        />
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { bathhouses, rooms, schedules, isActive } = this.props;
    const nothingToShow = !rooms.size;

    if (isActive) {
      const roomItems = this.renderRooms(bathhouses, rooms, schedules);

      return (
        <div className="RoomsList">
          {roomItems}
          {
            nothingToShow ?
              <div className="RoomsList-empty-result">
                <FormattedMessage id="emptyResultShowText" />
              </div> :
              <div></div>
          }
        </div>
      );
    }

    return (
      <div></div>
    );
  }
}

/**
 * propTypes
 * @property {string|undefined} activeRoomId - active room id, box with this id will be open
 * @property {Array.<Object>} bathhouses - list of bathhouses
 * @property {Array.<Object>} rooms - list of valid rooms
 * @property {Object.<string, Array>} schedules - original and changes of schedules
 * @property {boolean} isActive - room is open or close
 * @property {Function} changeActiveRoom - change active room id, if null then all rooms is closed
 * @property {Function} findRoomScheduleIfNeed - find room schedule if need
 * @property {Function} selectOrder - select order from room item
 */
RoomsListComponent.propTypes = {
  activeRoomId: PropTypes.string,
  bathhouses: ImmutablePropTypes.list.isRequired,
  rooms: ImmutablePropTypes.list.isRequired,
  schedules: ImmutablePropTypes.map,
  isActive: PropTypes.bool.isRequired,
  changeActiveRoom: PropTypes.func.isRequired,
  findRoomScheduleIfNeed: PropTypes.func.isRequired,
  selectOrder: PropTypes.func.isRequired
};

/**
 * pass state to props
 * @param {Object} state - current redux state
 * @return {Object.<string, string|number|Array|Object>} props - list of params
 * */
function mapStateToProps(state) {
  const validRooms = state.bathhouse.get('valid');
  return {
    bathhouses: state.bathhouse.get('bathhouses'),
    rooms: state.bathhouse.get('rooms').filter(room => validRooms.includes(room.get('id'))),
    schedules: state.schedule.get('mixed'),
    activeRoomId: state.bathhouse.get('activeRoomId')
  };
}

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    changeActiveRoom: (id) => dispatch(changeActiveRoom(id)),
    findRoomScheduleIfNeed: (id) => dispatch(findRoomScheduleIfNeed(id)),
    selectOrder: (id, date, period) => dispatch(selectOrder(id, date, period))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(RoomsListComponent);
