import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';

import { BathhousesListSelectors } from '../selectors/BathhousesListSelectors';

import shallowEqualImmutable from '../utils/shallowEqualImmutable';

import { shouldFetchBathhousesForCity, findBathhousesAndRooms } from '../actions/bathhouse-actions';
import { shouldChangeActiveCity, changeActiveCity, getCityBySlug } from '../actions/city-actions';
import { setFiltersData, shouldSetFilters } from '../actions/filter-actions';
import { addToSocketRoom } from '../actions/user-actions';

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
  },
}])
class BathhouseListPage extends Component {

  /**
   * componentDidMount - send city id by socket, added to socket room
   * @return {void}
   * */
  componentDidMount() {
    const { activeCityId, addToSocketRoom } = this.props;
    addToSocketRoom(activeCityId);
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
  };
}

export default connect(BathhousesListSelectors, mapDispatchToProps)(BathhouseListPage);
