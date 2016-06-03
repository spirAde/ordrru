import { Map } from 'immutable';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { indexOf } from 'lodash';

import { RoomsListSelectors } from '../../selectors/RoomsListSelectors';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import { changeActiveRoom } from '../../actions/bathhouse-actions';
import { findRoomScheduleIfNeed, resetOrderSchedule } from '../../actions/schedule-actions';
import { findCommentsIfNeed } from '../../actions/comment-actions';
import { selectOrder, resetFullOrder, resetDatetimeOrder, checkOrder,
  sendOrder } from '../../actions/order-actions';

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
    this.handleResetDatetimeOrder = this.handleResetDatetimeOrder.bind(this);
  }

  componentDidMount() {
    const { activeRoomId } = this.props;

    if (activeRoomId) {
      const activeRoomRef = `room-${activeRoomId}`;
      const activeRoomComponent = this.refs[activeRoomRef];

      if (activeRoomComponent) {
        const domNode = ReactDOM.findDOMNode(activeRoomComponent);
        const parentNode = ReactDOM.findDOMNode(this);

        const rectObject = domNode.getBoundingClientRect();

        const domNodeIndex = indexOf(parentNode.childNodes, domNode);
        const domNodeOffsetY = (domNodeIndex - 1) * rectObject.height;

        console.log(domNodeOffsetY);

        window.scrollTo(0, domNodeOffsetY);
      }
    }
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
   * handle change active room, active room box is open
   * if room is opened first time, then load data
   * if room was close, then reset order and cancel forceDisable periods
   * @param {string} id - room id or undefined
   * @return {void}
   */
  handleChangeActiveRoom(id) {
    this.props.changeActiveRoom(id);

    if (id) {
      this.props.findRoomScheduleIfNeed(id);
      this.props.findCommentsIfNeed(id);
    }

    if (!id) {
      this.props.resetFullOrder();
      this.props.resetOrderSchedule();
    }
  }

  /**
   * handle click reset datetime order
   * @return {void}
   * */
  handleResetDatetimeOrder() {
    this.props.resetDatetimeOrder();
    this.props.resetOrderSchedule();
  }

  /**
   * handles selected cell twice. First for date and period of start order,
   * and other for end of order.
   * take into consideration, that need disabled nearby cells in min duration
   * of order less than room setting.
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
    const { activeRoomId, order, steps } = this.props;

    return rooms.map(room => {
      const bathhouse = bathhouses.find(
        bathhouse => bathhouse.get('id') === room.get('bathhouseId')
      );
      const schedule = schedules.get(room.get('id'));
      const activeRoomOrder = order.get('roomId') === room.get('id') ? order : Map();

      return (
        <RoomItemComponent
          ref={`room-${room.get('id')}`}
          isOpen={activeRoomId === room.get('id')}
          room={room}
          bathhouse={bathhouse}
          schedule={schedule}
          order={activeRoomOrder}
          steps={steps}
          isClosable={false}
          onChangeActiveRoom={this.handleChangeActiveRoom}
          onSelectOrder={this.props.selectOrder}
          onCheckOrder={this.props.checkOrder}
          onSendOrder={this.props.sendOrder}
          onResetDatetimeOrder={this.handleResetDatetimeOrder}
          key={room.get('id')}
        />
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { style, bathhouses, rooms, schedules, isActive } = this.props;
    const nothingToShow = !rooms.size;

    if (isActive) {
      const roomItems = this.renderRooms(bathhouses, rooms, schedules);

      return (
        <div className="RoomsList" style={style}>
          {roomItems}
          {
            nothingToShow ?
              <div className="RoomsList-empty-result">
                <FormattedMessage id="emptyResultShowText" />
              </div> : null
          }
        </div>
      );
    }

    return null;
  }
}

/**
 * propTypes
 * @property {Object} style - parent passed styles
 * @property {string|undefined} activeRoomId - active room id, box with this id will be open
 * @property {Array.<Object>} bathhouses - list of bathhouses
 * @property {Array.<Object>} rooms - list of valid rooms
 * @property {Object.<string, Array>} schedules - original and changes of schedules
 * @property {boolean} isActive - room is open or close
 * @property {Object} order - selected order by user
 * @property {Object} steps - steps for order
 * @property {Function} resetFullOrder - reset selected user order
 * @property {Function} resetDatetimeOrder - reset datetime user order
 * @property {Function} changeActiveRoom - change active room id, if null then all rooms is closed
 * @property {Function} findRoomScheduleIfNeed - find room schedule if need
 * @property {Function} findCommentsIfNeed - find room comments if need
 * @property {Function} selectOrder - select order from room item
 * @property {Function} checkOrder - send order to validate
 * @property {Function} resetOrderSchedule - reset order schedule
 */
RoomsListComponent.propTypes = {
  style: PropTypes.object.isRequired,
  activeRoomId: PropTypes.string,
  bathhouses: ImmutablePropTypes.list.isRequired,
  rooms: ImmutablePropTypes.list.isRequired,
  schedules: ImmutablePropTypes.map,
  isActive: PropTypes.bool.isRequired,
  order: ImmutablePropTypes.map,
  steps: ImmutablePropTypes.map,
  resetFullOrder: PropTypes.func.isRequired,
  resetDatetimeOrder: PropTypes.func.isRequired,
  changeActiveRoom: PropTypes.func.isRequired,
  findRoomScheduleIfNeed: PropTypes.func.isRequired,
  findCommentsIfNeed: PropTypes.func.isRequired,
  selectOrder: PropTypes.func.isRequired,
  checkOrder: PropTypes.func.isRequired,
  sendOrder: PropTypes.func.isRequired,
  resetOrderSchedule: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    resetFullOrder: () => dispatch(resetFullOrder()),
    resetDatetimeOrder: () => dispatch(resetDatetimeOrder()),
    changeActiveRoom: (id) => dispatch(changeActiveRoom(id)),
    findRoomScheduleIfNeed: (id) => dispatch(findRoomScheduleIfNeed(id)),
    findCommentsIfNeed: (id) => dispatch(findCommentsIfNeed(id)),
    selectOrder: (id, date, period) => dispatch(selectOrder(id, date, period)),
    checkOrder: (order) => dispatch(checkOrder(order)),
    sendOrder: () => dispatch(sendOrder()),
    resetOrderSchedule: () => dispatch(resetOrderSchedule()),
  };
}

export default connect(RoomsListSelectors, {
  resetFullOrder,
  resetDatetimeOrder,
  changeActiveRoom,
  findRoomScheduleIfNeed,
  findCommentsIfNeed,
  selectOrder,
  checkOrder,
  sendOrder,
  resetOrderSchedule,
})(RoomsListComponent);
