import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import qs from 'query-string';

import shallowEqualImmutable from '../utils/shallowEqualImmutable';

import { shouldFetchBathhousesForCity, findBathhousesAndRooms } from '../actions/bathhouse-actions';
import { shouldChangeActiveCity, changeActiveCity, getCityBySlug } from '../actions/city-actions';
import { setFiltersData, shouldSetFilters } from '../actions/filter-actions';

import HeaderComponent from '../components/Header/index.jsx';
import FiltersListComponent from '../components/FiltersList/index.jsx';
import RoomsListComponent from '../components/RoomsList/index.jsx';
import MapComponent from '../components/Map/index.jsx';

/**
 * BathhouseListPage - smart component, container of rooms and bathhouses, map and filters
 * Smart components - none
 * Dumb components - HeaderComponent, FiltersListComponent, RoomsListComponent, MapComponent
 * */
class BathhouseListPage extends Component {

  /**
   * constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps) {
    return !shallowEqualImmutable(this.props, nextProps);
  }

  /**
   * SSR method, preload state with data fetched inside this method
   * @param {Function} dispatch
   * @param {Function} getState
   * @param {Object} location
   * @return {Promise} - promise contains api methods for fetching data
   * */
  static fetchData(dispatch, getState, location) {
    const promises = [];
    const params = qs.parse(location.search);
    const state = getState();
    const city = getCityBySlug(state, params.city);

    if (shouldChangeActiveCity(state, city.get('id'))) {
      dispatch(changeActiveCity(city.get('id')));
    }

    if (shouldSetFilters(state, city.get('id'))) {
      dispatch(setFiltersData(city.get('id')));
    }

    if (shouldFetchBathhousesForCity(state)) {
      promises.push(dispatch(findBathhousesAndRooms(city.get('id'))));
    }

    return Promise.all(promises);
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
        <RoomsListComponent isActive={isListMode}/>
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
  mode: PropTypes.oneOf(['list', 'map'])
};

/**
 * pass state to props
 * @param {Object} state - current redux state
 * @return {Object.<string, string|number|Array|Object>} props - list of params
 * */
function mapStateToProps(state) {
  return {
    mode: state.router.location.query.mode
  };
}

export default connect(mapStateToProps)(BathhouseListPage);
