import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';

import { trim, escape } from 'lodash';
import moment from 'moment-timezone';

import { BathhousesListSelectors } from '../selectors/BathhousesListSelectors';

import shallowEqualImmutable from '../utils/shallowEqualImmutable';

import { shouldFetchBathhousesForCity, findBathhousesAndRooms,
  changeActiveRoom } from '../actions/bathhouse-actions';
import { shouldChangeActiveCity, changeActiveCity, getCityBySlug } from '../actions/city-actions';
import { setFiltersData, shouldSetFilters } from '../actions/filter-actions';
import { addToSocketRoom } from '../actions/user-actions';
import { findRoomScheduleIfNeed } from '../actions/schedule-actions';

import HeaderComponent from '../components/Header/index.jsx';
import FiltersListComponent from '../components/FiltersList/index.jsx';
import RoomsListComponent from '../components/RoomsList/index.jsx';
import MapComponent from '../components/Map/index.jsx';

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
   * componentDidMount - send city id by socket, added to socket room
   * @return {void}
   * */
  componentDidMount() {
    const { activeCityId } = this.props;
    this.props.addToSocketRoom(activeCityId);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps) {
    return !shallowEqualImmutable(this.props, nextProps);
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
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    addToSocketRoom: (id) => dispatch(addToSocketRoom(id)),
    changeActiveRoom: (id) => dispatch(changeActiveRoom(id)),
    findRoomScheduleIfNeed: (id) => dispatch(findRoomScheduleIfNeed(id)),
  };
}

export default connect(BathhousesListSelectors, mapDispatchToProps)(BathhouseListPage);
