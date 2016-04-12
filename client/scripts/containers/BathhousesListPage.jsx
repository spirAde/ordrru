import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';

import { trim, escape } from 'lodash';
import moment from 'moment-timezone';
import later from 'later';

import { BathhousesListSelectors } from '../selectors/BathhousesListSelectors';

import shallowEqualImmutable from '../utils/shallowEqualImmutable';

import { shouldFetchBathhousesForCity, findBathhousesAndRooms,
  changeActiveRoom } from '../actions/bathhouse-actions';
import { shouldChangeActiveCity, changeActiveCity, getCityBySlug } from '../actions/city-actions';
import { setFiltersData, shouldSetFilters } from '../actions/filter-actions';
import { addToSocketRoom } from '../actions/user-actions';
import { findRoomScheduleIfNeed } from '../actions/schedule-actions';
import { changeGlobalCurrentDateAndPeriod } from '../actions/application-actions';

import HeaderComponent from '../components/Header/index.jsx';
import FiltersListComponent from '../components/FiltersList/index.jsx';
import RoomsListComponent from '../components/RoomsList/index.jsx';
import MapComponent from '../components/Map/index.jsx';

let globalCheckCurrentPeriodInterval = null;

/**
 * BathhouseListPage - smart component, container of rooms and bathhouses, map and filters
 * Smart components - none
 * Dumb components - HeaderComponent, FiltersListComponent, RoomsListComponent, MapComponent
 * */
@asyncConnect([{
  promise: ({ store: { dispatch, getState } }) => {
    const promises = [];
    const state = getState();
    const params = state.routing.locationBeforeTransitions.query;
    const city = getCityBySlug(state, params.city);

    moment.tz.setDefault(city.timezone);

    if (shouldChangeActiveCity(state, city.get('id'))) {
      dispatch(changeActiveCity(city.get('id')));
    }

    if (shouldSetFilters(state, city.get('id'))) {
      dispatch(setFiltersData(city.get('id')));
    }

    if (shouldFetchBathhousesForCity(state)) {
      promises.push(dispatch(findBathhousesAndRooms(city.get('id'))));
    }

    if (params.room) {
      const roomId = escape(trim(params.room));
      dispatch(changeActiveRoom(roomId));
      promises.push(dispatch(findRoomScheduleIfNeed(roomId)));
    }

    return Promise.all(promises);
  },
}])
class BathhouseListPage extends Component {

  /**
   * componentDidMount
   * send city id by socket, added to socket room. Add interval for global date and period
   * @return {void}
   * */
  componentDidMount() {
    const { activeCityId } = this.props;

    //if (window.__FIRST_RENDER__) {
      this.props.addToSocketRoom(activeCityId);
      this.props.changeGlobalCurrentDateAndPeriod(activeCityId);

      const globalCheckCurrentPeriod = later.parse.text('every 30 minutes');

      globalCheckCurrentPeriodInterval = later.setInterval(() => {
        this.props.changeGlobalCurrentDateAndPeriod();
      }, globalCheckCurrentPeriod);
    //}
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps) {
    return !shallowEqualImmutable(this.props, nextProps);
  }

  /**
   * componentWillUnmount - clear time interval
   * @return {void}
   * */
  componentWillUnmount() {
    window.clearInterval(globalCheckCurrentPeriodInterval);
  }

  /**
   * render
   * @return {XML} ReactElement
   * */
  render() {
    const { mode } = this.props;

    const isListMode = mode === 'list';

    return (
      <div>
        <Helmet title="Bathhouses" />
        <HeaderComponent mode={mode} />
        <FiltersListComponent />
        <RoomsListComponent isActive={isListMode} />
        <MapComponent isActive={!isListMode} />
      </div>
    );
  }
}

/**
 * propTypes
 * @property {string} mode - current mode of page(list or map)
 */
BathhouseListPage.propTypes = {
  store: PropTypes.object,
  mode: PropTypes.oneOf(['list', 'map']),
  activeCityId: PropTypes.string.isRequired,
  addToSocketRoom: PropTypes.func.isRequired,
  changeGlobalCurrentDateAndPeriod: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    addToSocketRoom: (cityId) => dispatch(addToSocketRoom(cityId)),
    changeActiveRoom: (id) => dispatch(changeActiveRoom(id)),
    findRoomScheduleIfNeed: (id) => dispatch(findRoomScheduleIfNeed(id)),
    changeGlobalCurrentDateAndPeriod:
      (cityId) => dispatch(changeGlobalCurrentDateAndPeriod(cityId)),
  };
}

export default connect(BathhousesListSelectors, mapDispatchToProps)(BathhouseListPage);
