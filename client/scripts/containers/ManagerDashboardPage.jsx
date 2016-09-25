import forEach from 'lodash/forEach';
import ceil from 'lodash/ceil';
import throttle from 'lodash/throttle';

import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { provideHooks } from 'redial';
import ImmutablePropTypes from 'react-immutable-proptypes';
import KeyHandler, { KEYUP } from 'react-key-handler';

import { fromJS } from 'immutable';

import { findBathhouseAndRooms } from '../actions/bathhouse-actions';
import { findRoomScheduleIfNeed, findRoomScheduleForDatesIfNeed,
  resetOrderSchedule } from '../actions/schedule-actions';
import { findOrdersIfNeed, findOrdersForDatesIfNeed, selectOrder, resetFullOrder,
  resetDatetimeOrder, checkOrder, sendOrder } from '../actions/order-actions';
import { logout, addToSocketRoom } from '../actions/manager-actions';

import shallowEqualImmutable from '../utils/shallowEqualImmutable';

import ManagerDashboardHeaderComponent from '../components/ManagerDashboardHeader/index.jsx';
import DatepaginatorComponent from '../components/DatePaginator/index.jsx';
import ManagerSchedulePanelListComponent from '../components/ManagerSchedulePanelList/index.jsx';
import OrderModalComponent from '../components/OrderModal/index.jsx';

import { MOMENT_FORMAT } from '../../../common/utils/date-helper';
import { FIRST_PERIOD, LAST_PERIOD, STEP } from '../../../common/utils/schedule-helper';

import ManagerDashboardSelectors from '../selectors/ManagerDashboardSelectors';

const ESC_KEY = 27;

const SCROLL_STEP = 6; // TODO: future manager setting, quantity of scroll cells by 1 wheel time

// if order was splitting, because order more than 1 day duration, then concat parts of order
// find start date, start period, end date, end period of order
function concatOrderParts(orders) {
  const sortedParts = orders.sort(
    (curr, prev) => moment(curr.getIn(['datetime', 'startDate']))
      .isAfter(prev.getIn(['datetime', 'startDate']))
  );

  const firstPart = sortedParts.first();
  const lastPart = sortedParts.last();

  return firstPart.merge(fromJS({
    datetime: {
      startDate: firstPart.getIn(['datetime', 'startDate']),
      startPeriod: firstPart.getIn(['datetime', 'startPeriod']),
      endDate: lastPart.getIn(['datetime', 'endDate']),
      endPeriod: lastPart.getIn(['datetime', 'endPeriod']),
    },
  }));
}

const hooks = {
  fetch: ({ dispatch, getState }) => {
    const promises = [];
    const state = getState();
    const bathhouseId = state.manager.getIn(['manager', 'organizationId']);

    return new Promise(resolve => dispatch(findBathhouseAndRooms(bathhouseId))
      .then(data => {
        forEach(data.payload.rooms, room => {
          promises.push(dispatch(findRoomScheduleIfNeed(room.id, { left: false, right: true })));
          promises.push(dispatch(findOrdersIfNeed(room.id)));
        });

        return resolve(Promise.all(promises));
      })
    );
  },
};

/**
 * ManagerDashboardPage - manager dashboard
 * Smart components - none
 * Dumb components - none
 * */
class ManagerDashboardPage extends Component {
  constructor(props) {
    super(props);

    this.state = {
      date: moment(props.date).format(MOMENT_FORMAT),
      dx: 0,
      orderModalIsActive: false,
      shownOrder: null,
    };

    this.handleMouseWheelEvent = throttle(this.handleMouseWheelEvent.bind(this), 250);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSelectDate = this.handleSelectDate.bind(this);

    this.handleShowOrder = this.handleShowOrder.bind(this);
    this.handleCreateOrder = this.handleCreateOrder.bind(this);

    this.handleClickCloseButton = this.handleClickCloseButton.bind(this);
    this.handleClickCreateOrderButton = this.handleClickCreateOrderButton.bind(this);

    this.handleKeyUpEscape = this.handleKeyUpEscape.bind(this);
  }

  componentDidMount() {
    const { manager } = this.props;
    const bathhouseId = manager.get('organizationId');

    this.props.addToSocketRoom(bathhouseId);

    const panelElement = ReactDOM.findDOMNode(this.refs.panel);
    panelElement.addEventListener('mousewheel', this.handleMouseWheelEvent, false);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.order.getIn(['datetime', 'endDate'])) {
      this.setState({
        orderModalIsActive: true,
      });
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

  componentWillUnmount() {
    const panelElement = ReactDOM.findDOMNode(this.refs.panel);
    panelElement.removeEventListener('mousewheel', this.handleMouseWheelEvent, false);
  }

  handleClickCloseButton() {
    this.props.resetFullOrder();

    this.setState({
      orderModalIsActive: false,
      shownOrder: null,
    });
  }

  handleClickCreateOrderButton() {
    this.props.sendOrder(true);
  }

  handleKeyUpEscape() {
    this.props.resetFullOrder();

    this.setState({
      orderModalIsActive: false,
      shownOrder: null,
    });
  }

  /**
   * handleMouseWheelEvent - scroll schedule panel and change datepaginator date, if
   * first period of date position becomes left visible
   * */
  handleMouseWheelEvent(event) {
    event.preventDefault();

    const { dx, date } = this.state;

    let newDate = date;
    const newDx = event.deltaY > 0 ? dx + SCROLL_STEP : dx - SCROLL_STEP;

    if (newDx % 48 === 0 && newDx < dx) {
      newDate = moment(date).add(1, 'days').format(MOMENT_FORMAT);
    } else if (dx % 48 === 0 && newDx > dx) {
      newDate = moment(date).subtract(1, 'days').format(MOMENT_FORMAT);
    }

    this.setState({
      date: newDate,
      dx: newDx,
    });
  }

  handleLogout() {
    this.props.logout();
  }

  handleSelectDate(date) {
    const currentDate = moment();
    const fullDatesDiff = ceil(moment(date).diff(currentDate, 'days', true));

    const cellsCount = (LAST_PERIOD - FIRST_PERIOD) / STEP;
    const dx = fullDatesDiff * cellsCount;

    this.setState({
      date,
      dx: -dx,
    });
  }

  handleShowOrder(roomId, orderId) {
    const { orders } = this.props;

    const order = orders.get(roomId).filter(order => order.get('id') === orderId);

    this.setState({
      shownOrder: order.size > 1 ? concatOrderParts(order) : order.first(),
      orderModalIsActive: true,
    });
  }

  handleCreateOrder(roomId, date, period) {
    this.props.selectOrder(roomId, date, period, false);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { manager, viewport } = this.props;

    if (!viewport) {
      return (
        <div>
          <Helmet title="Dashboard" />
          <ManagerDashboardHeaderComponent
            manager={manager}
            onSubmit={this.handleLogout}
          />
        </div>
      );
    }

    const { rooms, order, orders, schedules, ordersIsFetching, schedulesIsFetching } = this.props;
    const { dx, date, orderModalIsActive, shownOrder } = this.state;

    return (
      <div>
        <Helmet title="Dashboard" />
        <KeyHandler
          keyEventName={KEYUP}
          keyCode={ESC_KEY}
          onKeyHandle={this.handleKeyUpEscape}
        />
        <ManagerDashboardHeaderComponent
          manager={manager}
          onSubmit={this.handleLogout}
        />
        <DatepaginatorComponent
          width={viewport.get('width')}
          date={date}
          onSelectDate={this.handleSelectDate}
        />
        <ManagerSchedulePanelListComponent
          ref="panel"
          rooms={rooms}
          orders={orders}
          isFetching={ordersIsFetching || schedulesIsFetching}
          schedules={schedules}
          dx={dx}
          onShowOrder={this.handleShowOrder}
          onCreateOrder={this.handleCreateOrder}
        />
        <div>
          {
            shownOrder ?
              <OrderModalComponent
                order={shownOrder}
                active={orderModalIsActive}
                width="50vw"
                onClickCloseButton={this.handleClickCloseButton}
                action="show"
              /> : null
          }
          {
            order.getIn(['datetime', 'endDate']) ?
              <OrderModalComponent
                order={order}
                active={orderModalIsActive}
                width="50vw"
                onClickCloseButton={this.handleClickCloseButton}
                onClickCreateOrderButton={this.handleClickCreateOrderButton}
                action="create"
              /> : null
          }
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Object} manager - data about manager
 * @property {Object} bathhouse - bathhouse data
 * @property {Array.<Object>} rooms - bathhouse rooms data
 * @property {Object} order - current created manager order
 * @property {Object.<Object>} orders - orders for each room
 * @property {Object.<Object>} schedules - schedules for each room
 * @property {Object} interval - start and end of schedules date
 * @property {Object} viewport - viewport of device
 * @property {String} date - current application date(taken from server)
 * @property {Boolean} ordersIsFetching - if find orders is fetching
 * @property {Boolean} schedulesIsFetching - if find schedules is fetching
 */
ManagerDashboardPage.propTypes = {
  manager: ImmutablePropTypes.map.isRequired,
  bathhouse: ImmutablePropTypes.map.isRequired,
  rooms: ImmutablePropTypes.list.isRequired,
  order: ImmutablePropTypes.map.isRequired,
  orders: ImmutablePropTypes.map.isRequired,
  schedules: ImmutablePropTypes.map.isRequired,
  interval: ImmutablePropTypes.map.isRequired,
  viewport: ImmutablePropTypes.map.isRequired,
  date: PropTypes.string.isRequired,
  ordersIsFetching: PropTypes.bool.isRequired,
  schedulesIsFetching: PropTypes.bool.isRequired,

  logout: PropTypes.func.isRequired,
  findRoomScheduleForDatesIfNeed: PropTypes.func.isRequired,
  findOrdersForDatesIfNeed: PropTypes.func.isRequired,
  resetFullOrder: PropTypes.func.isRequired,
  resetDatetimeOrder: PropTypes.func.isRequired,
  selectOrder: PropTypes.func.isRequired,
  checkOrder: PropTypes.func.isRequired,
  sendOrder: PropTypes.func.isRequired,
  resetOrderSchedule: PropTypes.func.isRequired,
  addToSocketRoom: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
export default provideHooks(hooks)(connect(ManagerDashboardSelectors, {
  resetFullOrder,
  resetDatetimeOrder,
  selectOrder,
  checkOrder,
  sendOrder,
  resetOrderSchedule,
  logout,
  findRoomScheduleForDatesIfNeed,
  findOrdersForDatesIfNeed,
  addToSocketRoom,
})(ManagerDashboardPage));
