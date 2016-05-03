import forEach from 'lodash/forEach';
import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { provideHooks } from 'redial';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { findBathhouseAndRooms } from '../actions/bathhouse-actions';
import { findRoomScheduleIfNeed } from '../actions/schedule-actions';
import { findOrdersIfNeed } from '../actions/order-actions';
import { logout } from '../actions/manager-actions';

import shallowEqualImmutable from '../utils/shallowEqualImmutable';

import ManagerDashboardHeaderComponent from '../components/ManagerDashboardHeader/index.jsx';
import DatepaginatorComponent from '../components/DatePaginator/index.jsx';
import ManagerRoomListComponent from '../components/ManagerRoomList/index.jsx';

import { MOMENT_FORMAT } from '../../../common/utils/date-helper';

import { ManagerDashboardSelectors } from '../selectors/ManagerDashboardSelectors';

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
      currentDate: moment(props.date).format(MOMENT_FORMAT),
    };

    this.handleLogout = this.handleLogout.bind(this);
    this.handleSelectDate = this.handleSelectDate.bind(this);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  handleLogout() {
    this.props.logout();
  }

  handleSelectDate(date) {
    this.setState({
      currentDate: date,
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { manager, viewport, rooms, orders, schedules } = this.props;
    const { currentDate } = this.state;

    return (
      <div>
        <Helmet title="Dashboard" />
        <ManagerDashboardHeaderComponent
          manager={manager}
          onSubmit={this.handleLogout}
        />
        {
          viewport ?
            <DatepaginatorComponent
              width={viewport.get('width')}
              date={currentDate}
              onSelectDate={this.handleSelectDate}
            /> : null
        }
        <ManagerRoomListComponent
          rooms={rooms}
          orders={orders}
          schedules={schedules}
          date={currentDate}
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
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    logout: () => dispatch(logout()),
  };
}

export default provideHooks(hooks)(connect(
  ManagerDashboardSelectors, mapDispatchToProps
)(ManagerDashboardPage));
