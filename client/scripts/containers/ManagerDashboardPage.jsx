import forEach from 'lodash/forEach';
import ceil from 'lodash/ceil';

import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { provideHooks } from 'redial';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { findBathhouseAndRooms } from '../actions/bathhouse-actions';
import { findRoomScheduleIfNeed, findRoomScheduleForDateIfNeed } from '../actions/schedule-actions';
import { findOrdersIfNeed, findOrdersForDate } from '../actions/order-actions';
import { logout } from '../actions/manager-actions';

import shallowEqualImmutable from '../utils/shallowEqualImmutable';

import ManagerDashboardHeaderComponent from '../components/ManagerDashboardHeader/index.jsx';
import DatepaginatorComponent from '../components/DatePaginator/index.jsx';
import ManagerSchedulePanelListComponent from '../components/ManagerSchedulePanelList/index.jsx';

import { MOMENT_FORMAT } from '../../../common/utils/date-helper';
import { FIRST_PERIOD, LAST_PERIOD, STEP } from '../../../common/utils/schedule-helper';

import { ManagerDashboardSelectors } from '../selectors/ManagerDashboardSelectors';

const SCROLL_STEP = 6; // TODO: future manager setting, quantity of scroll cells by 1 wheel time

const hooks = {
  fetch: ({ dispatch, getState }) => {
    const promises = [];
    const state = getState();
    const bathhouseId = state.manager.getIn(['manager', 'organizationId']);

    return new Promise(resolve => dispatch(findBathhouseAndRooms(bathhouseId))
      .then(data => {
        forEach(data.payload.rooms, room => {
          promises.push(dispatch(findRoomScheduleIfNeed(room.id)));
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
    };

    this.handleMouseWheelEvent = this.handleMouseWheelEvent.bind(this); // TODO: add debounce
    this.handleLogout = this.handleLogout.bind(this);
    this.handleSelectDate = this.handleSelectDate.bind(this);
  }

  componentDidMount() {
    const panelElement = ReactDOM.findDOMNode(this.refs.panel);
    panelElement.addEventListener('mousewheel', this.handleMouseWheelEvent, false);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  handleMouseWheelEvent(event) {
    event.preventDefault();

    const { dx } = this.state;

    const newDx = event.deltaY > 0 ? dx + SCROLL_STEP : dx - SCROLL_STEP;

    this.setState({
      dx: newDx,
    });
  }

  handleLogout() {
    this.props.logout();
  }

  handleSelectDate(date) {
    const currentDate = moment();
    const fullDatesDiff = ceil(moment(date).diff(currentDate, 'days', true));

    const cellsCount = 1 + (LAST_PERIOD - FIRST_PERIOD) / STEP;
    const dx = fullDatesDiff * cellsCount;

    this.setState({
      date,
      dx: -dx,
    });
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

    const { rooms, orders, schedules } = this.props;
    const { date, dx } = this.state;

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
          schedules={schedules}
          dx={dx}
        />
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
  orders: ImmutablePropTypes.map.isRequired,
  schedules: ImmutablePropTypes.map.isRequired,
  viewport: ImmutablePropTypes.map.isRequired,
  date: PropTypes.string.isRequired,

  logout: PropTypes.func.isRequired,
  findRoomScheduleForDateIfNeed: PropTypes.func.isRequired,
  findOrdersForDate: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(logout()),
    findRoomScheduleForDateIfNeed: (roomId, date) =>
      dispatch(findRoomScheduleForDateIfNeed(roomId, date)),
    findOrdersForDate: (roomId, date) => dispatch(findOrdersForDate(roomId, date)),
  };
}

export default provideHooks(hooks)(connect(
  ManagerDashboardSelectors, mapDispatchToProps
)(ManagerDashboardPage));
