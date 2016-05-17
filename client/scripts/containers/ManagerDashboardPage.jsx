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

import { fromJS } from 'immutable';

import { findBathhouseAndRooms } from '../actions/bathhouse-actions';
import { findRoomScheduleIfNeed, findRoomScheduleForDateIfNeed,
  resetOrderSchedule } from '../actions/schedule-actions';
import { findOrdersIfNeed, findOrdersForDate, selectOrder, resetFullOrder, resetDatetimeOrder,
  checkOrder, sendOrder } from '../actions/order-actions';
import { logout } from '../actions/manager-actions';

import shallowEqualImmutable from '../utils/shallowEqualImmutable';

import ManagerDashboardHeaderComponent from '../components/ManagerDashboardHeader/index.jsx';
import DatepaginatorComponent from '../components/DatePaginator/index.jsx';
import ManagerSchedulePanelListComponent from '../components/ManagerSchedulePanelList/index.jsx';
import OrderModalComponent from '../components/OrderModal/index.jsx';

import { MOMENT_FORMAT } from '../../../common/utils/date-helper';
import { FIRST_PERIOD, LAST_PERIOD, STEP } from '../../../common/utils/schedule-helper';

import { ManagerDashboardSelectors } from '../selectors/ManagerDashboardSelectors';

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

    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  componentDidMount() {
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

  handleCloseModal() {
    this.setState({
      orderModalIsActive: false,
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
                onClose={this.handleCloseModal}
                action="show"
              /> : null
          }
          {
            order.getIn(['datetime', 'endDate']) ?
              <OrderModalComponent
                order={order}
                active={orderModalIsActive}
                width="50vw"
                onClose={this.handleCloseModal}
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
 */
ManagerDashboardPage.propTypes = {
  manager: ImmutablePropTypes.map.isRequired,
  bathhouse: ImmutablePropTypes.map.isRequired,
  rooms: ImmutablePropTypes.list.isRequired,
  order: ImmutablePropTypes.map.isRequired,
  orders: ImmutablePropTypes.map.isRequired,
  schedules: ImmutablePropTypes.map.isRequired,
  viewport: ImmutablePropTypes.map.isRequired,
  date: PropTypes.string.isRequired,

  ordersIsFetching: PropTypes.bool.isRequired,
  schedulesIsFetching: PropTypes.bool.isRequired,

  logout: PropTypes.func.isRequired,
  findRoomScheduleForDateIfNeed: PropTypes.func.isRequired,
  findOrdersForDate: PropTypes.func.isRequired,
  resetFullOrder: PropTypes.func.isRequired,
  resetDatetimeOrder: PropTypes.func.isRequired,
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
    selectOrder:
      (id, date, period, createdByUser) => dispatch(selectOrder(id, date, period, createdByUser)),
    checkOrder: (order) => dispatch(checkOrder(order)),
    sendOrder: () => dispatch(sendOrder()),
    resetOrderSchedule: () => dispatch(resetOrderSchedule()),
    logout: () => dispatch(logout()),
    findRoomScheduleForDateIfNeed: (roomId, date) =>
      dispatch(findRoomScheduleForDateIfNeed(roomId, date)),
    findOrdersForDate: (roomId, date) => dispatch(findOrdersForDate(roomId, date)),
  };
}

export default provideHooks(hooks)(connect(
  ManagerDashboardSelectors, mapDispatchToProps
)(ManagerDashboardPage));
