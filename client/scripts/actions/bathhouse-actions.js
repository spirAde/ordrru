import { List, fromJS } from 'immutable';

import { flatten, isNull, trim, map, assign } from 'lodash';

import { Bathhouse } from '../API';

import { removeTag, addTag, changeSearchNameFilterValue, changeOptionsFilterValue,
  changePrepaymentFilterValue, changeDateTimeFilterValues, changeDistanceFilterValue,
  changeGuestFilterValue, changeTypesFilterValue, changePriceFilterValues,
  changeSortingFilterValue } from './filter-actions';

export const FIND_BATHHOUSES_REQUEST = 'FIND_BATHHOUSES_REQUEST';
export const FIND_BATHHOUSES_SUCCESS = 'FIND_BATHHOUSES_SUCCESS';
export const FIND_BATHHOUSES_FAILURE = 'FIND_BATHHOUSES_FAILURE';

export const CHANGE_ACTIVE_ROOM = 'CHANGE_ACTIVE_ROOM';
export const UPDATE_ROOMS = 'UPDATE_ROOMS';
export const SORT_ROOMS = 'SORT_ROOMS';

export const UPDATE_ROOM_SCHEDULE = 'UPDATE_ROOM_SCHEDULE';

/**
 * Sorting room by type and direction
 * @param {Array.<Object>} bathhouses - list of bathhouses
 * @param {Array.<Object>} rooms - list of rooms
 * @param {string} type - type of sorting
 * @param {boolean} isDesc - desc or asc sorting direction
 * @return {Array.<Object>} list of sorted rooms
 * */
function sortingRoomsByType(bathhouses, rooms, type, isDesc) {
  let sorted;

  if (type === 'popularity') {
    sorted = rooms.sortBy(
      room => room.get('popularity'),
      (prev, next) => isDesc ? next - prev : prev - next
    );
  } else if (type === 'distance') {
    sorted = rooms.sortBy(
      room => bathhouses.find(
        bathhouse => bathhouse.get('id') === room.get('bathhouseId')
      ).get('distance'),
      (prev, next) => isDesc ? next - prev : prev - next
    );
  } else if (type === 'price') {
    sorted = rooms.sortBy(
      room => room.getIn(['price', 'min']),
      (prev, next) => isDesc ? next - prev : prev - next
    );
  }

  return sorted;
}

/**
 * Request fetching bathhouses
 * @return {{type: string, payload: {}}}
 * */
function fetchBathhousesRequest() {
  return {
    type: FIND_BATHHOUSES_REQUEST,
    payload: {},
  };
}

/**
 * Success fetching bathhouses
 * @param {Array.<Object>} bathhouses - list of bathhouses
 * @param {Array.<Object>} rooms - list of rooms
 * @return {{type: string, payload: {bathhouses: Array.<Object>, rooms: Array.<Object>}}}
 * */
function fetchBathhousesSuccess(bathhouses, rooms) {
  return {
    type: FIND_BATHHOUSES_SUCCESS,
    payload: {
      bathhouses,
      rooms,
    },
  };
}

/**
 * Failure fetching bathhouses
 * @param {Object} error
 * @return {{type: string, payload: {error: Object}}}
 * */
function fetchBathhousesFailure(error) {
  return {
    type: FIND_BATHHOUSES_FAILURE,
    payload: {
      error,
    },
    error,
  };
}

/**
 * Fetch bathhouses and rooms by city.
 * @param {string} cityId - city id
 * @return {Function} - thunk action
 * */
export function findBathhousesAndRooms(cityId) {
  return (dispatch, getState) => {
    const state = getState();

    dispatch(fetchBathhousesRequest());

    return Bathhouse.find({ include: 'rooms', where: { cityId, isActive: true } })
      .then(data => {
        //  mb use normalizr https://github.com/gaearon/normalizr
        const sorting = state.filter
          .getIn(['filters', 'sorting'])
          .find(type => type.get('checked'));

        const rooms = fromJS(flatten(map(data, 'rooms')));

        const bathhouses = fromJS(data.map(
          bathhouse => assign({}, bathhouse, { rooms: map(bathhouse.rooms, 'id') })
        ));

        const sortedRooms =
          sortingRoomsByType(bathhouses, rooms, sorting.get('name'), sorting.get('isDesc'));

        dispatch(fetchBathhousesSuccess(bathhouses, sortedRooms));
      })
      .catch(error => dispatch(fetchBathhousesFailure(error)));
  };
}

/**
 * Check if bathhouse state is empty and not fetching just now
 * @param {object} state - state
 * @return {boolean} - should or not fetch
 * */
export function shouldFetchBathhousesForCity(state) {
  const bathhouses = state.bathhouse.get('bathhouses');
  if (bathhouses.isEmpty()) {
    return true;
  } else if (state.bathhouse.get('isFetching') || !bathhouses.isEmpty()) {
    return false;
  }
}

/**
 * Update valid and invalid rooms.
 * @param {array} valid - valid list of room ids
 * @param {object} invalid - object of invalid rooms for current type.
 * @return {{type: string, payload: {valid: array<string>, invalid: object}}} - action
 * */
export function updateRooms(valid, invalid) {
  return {
    type: UPDATE_ROOMS,
    payload: {
      valid,
      invalid,
    },
  };
}

/**
 * Update rooms by new sorting
 * @param {Array.<Object>} rooms - list of rooms
 * @return {{type: string, payload: {rooms: Array.<Object>}}} - action
 * */
export function sortRooms(rooms) {
  return {
    type: SORT_ROOMS,
    payload: {
      rooms,
    },
  };
}

/**
 * Change active room, which will be open or close.
 * @param {string} id - room id
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function changeActiveRoom(id) {
  return {
    type: CHANGE_ACTIVE_ROOM,
    payload: {
      id,
    },
  };
}

/**
 * Find rooms, the distance from center of city less then value.
 * @param {number} value - distance from city of center
 * @return {function} - thunk function
 * */
export function updateRoomsByDistance(value) {
  return (dispatch, getState) => {
    const state = getState();
    const bathhouses = state.bathhouse.get('bathhouses');
    const allRoomIds = state.bathhouse.get('rooms').map(room => room.get('id'));

    const newInvalid = state.bathhouse.get('invalid').withMutations(invalid => {
      state.bathhouse.get('rooms').forEach(room => {
        const bathhouse = bathhouses.find(bath => bath.get('id') === room.get('bathhouseId'));

        if (bathhouse.get('distance') > parseFloat(value)) {
          invalid.update('distance', distance => distance.push(room.get('id')));
        }
      });
    });

    const newValid = state.bathhouse.get('valid').withMutations(list => {
      const allInvalidRoomIds = newInvalid.toList().flatten();
      const allUniqueInvalidRoomIds = List.of(...new Set(allInvalidRoomIds.toJS()));
      const valid = allRoomIds.filter(id => !allUniqueInvalidRoomIds.includes(id));
      list.clear().merge(valid);
    });

    dispatch(changeDistanceFilterValue(value));

    //  if active room is not valid after check, set activeRoomId to null
    if (!newValid.includes(state.bathhouse.get('activeRoomId')) &&state.bathhouse.get('activeRoomId')) {
      dispatch(changeActiveRoom(state.bathhouse.get('activeRoomId')));
    }

    if (newInvalid.get('distance').isEmpty() && state.filter.get('tags').includes('distance')) {
      dispatch(removeTag('distance', state.city.get('activeCityId')));
    } else if (!newInvalid.get('distance').isEmpty() && !state.filter.get('tags').includes('distance')) {
      dispatch(addTag('distance'));
    }

    dispatch(updateRooms(newValid, newInvalid));
  };
}

/**
 * Find rooms which contains options, or bathhouse(room parent) contains options
 * @param {Object.<string, string|boolean>} value options and checked or unchecked
 * @return {Function} - thunk function
 * */
export function updateRoomsByOptions(value) {
  return (dispatch, getState) => {
    const state = getState();
    const bathhouses = state.bathhouse.get('bathhouses');
    const allRoomIds = state.bathhouse.get('rooms').map(room => room.get('id'));

    const newInvalid = state.bathhouse.get('invalid').withMutations(invalid => {
      state.bathhouse.get('rooms').forEach(room => {
        const bathhouse = bathhouses.find(bath => bath.get('id') === room.get('bathhouseId'));

        if (value.get('checked')) {
          if (!room.get('options').includes(value.get('name')) && !bathhouse.get('options').includes(value.get('name'))) {
            invalid.update('options', options => options.push(room.get('id')));
          }
        } else {
          if (!room.get('options').includes(value.get('name')) && !bathhouse.get('options').includes(value.get('name'))) {
            invalid.update('options', options => options.delete(options.findIndex(id => id === room.get('id'))));
          }
        }
      });
    });

    const newValid = state.bathhouse.get('valid').withMutations(list => {
      const allInvalidRoomIds = newInvalid.toList().flatten();
      const allUniqueInvalidRoomIds = List.of(...new Set(allInvalidRoomIds.toJS()));
      const valid = allRoomIds.filter(id => !allUniqueInvalidRoomIds.includes(id));
      list.clear().merge(valid);
    });

    dispatch(changeOptionsFilterValue(value));

    //  if active room is not valid after check, set activeRoomId to null
    if (!newValid.includes(state.bathhouse.get('activeRoomId')) && state.bathhouse.get('activeRoomId')) {
      dispatch(changeActiveRoom(state.bathhouse.get('activeRoomId')));
    }

    if (newInvalid.get('options').isEmpty() && state.filter.get('tags').includes('options')) {
      dispatch(removeTag('options', state.city.get('activeCityId')));
    } else if (!newInvalid.get('options').isEmpty() && !state.filter.get('tags').includes('options')) {
      dispatch(addTag('options'));
    }

    dispatch(updateRooms(newValid, newInvalid));
  };
}

/**
 * Find rooms, which have the type of bathhouse. Dispatch valid and invalid lists.
 * @param {Object.<string, string|boolean>} value - type: bathhouse, sauna, hammam, and checked or unchecked
 * @return {Function} - thunk function
 * */
export function updateRoomsByTypes(value) {
  return (dispatch, getState) => {
    const state = getState();
    const allRoomIds = state.bathhouse.get('rooms').map(room => room.get('id'));

    const newInvalid = state.bathhouse.get('invalid').withMutations(invalid => {
      state.bathhouse.get('rooms').forEach(room => {
        if (value.get('checked')) {
          if (!room.get('types').includes(value.get('name'))) {
            invalid.update('types', types => types.push(room.get('id')));
          }
        } else {
          if (!room.get('types').includes(value.get('name'))) {
            invalid.update('types', types => types.delete(types.findIndex(id => id === room.get('id'))));
          }
        }
      });
    });

    const newValid = state.bathhouse.get('valid').withMutations(list => {
      const allInvalidRoomIds = newInvalid.toList().flatten();
      const allUniqueInvalidRoomIds = List.of(...new Set(allInvalidRoomIds.toJS()));
      const valid = allRoomIds.filter(id => !allUniqueInvalidRoomIds.includes(id));
      list.clear().merge(valid);
    });

    dispatch(changeTypesFilterValue(value));

    //  if active room is not valid after check, set activeRoomId to null
    if (!newValid.includes(state.bathhouse.get('activeRoomId')) && !isNull(state.bathhouse.get('activeRoomId'))) {
      dispatch(changeActiveRoom(state.bathhouse.get('activeRoomId')));
    }

    if (newInvalid.get('types').isEmpty() && state.filter.get('tags').includes('types')) {
      dispatch(removeTag('types', state.city.get('activeCityId')));
    } else if (!newInvalid.get('types').isEmpty() && !state.filter.get('tags').includes('types')) {
      dispatch(addTag('types'));
    }

    dispatch(updateRooms(newValid, newInvalid));
  };
}

/**
 * Find rooms, which have empty interval for order between 2 dates. Dispatch valid and invalid lists.
 * @param {object} values
 * @param {string} values.startDate - start date
 * @param {number} values.starePeriod - start period
 * @param {string} values.endData - end date
 * @param {number} values.endPeriod - end period
 * @return {Function} - thunk function
 * */
export function updateRoomsByDateTime(values) {
  return (dispatch, getState) => {
    //
  };
}

/**
 * Find rooms, which have the type of prepayment. Dispatch valid and invalid lists.
 * @param {Object.<string, boolean|null>} value - true, false or null(for whatever)
 * @return {Function} - thunk function
 * */
export function updateRoomsByPrepayment(value) {
  return (dispatch, getState) => {
    const state = getState();
    const allRoomIds = state.bathhouse.get('rooms').map(room => room.get('id'));

    const newInvalid = state.bathhouse.get('invalid').withMutations(invalid => {
      if (!isNull(value.get('isRequired'))) {
        state.bathhouse.get('rooms').forEach(room => {
          if (value.get('isRequired')) {
            if (!room.getIn(['settings', 'prepayment'])) {
              invalid.update('prepayment', options => options.push(room.get('id')));
            }
          } else {
            if (!room.getIn(['settings', 'prepayment'])) {
              invalid.update('prepayment', options => options.delete(options.findIndex(id => id === room.get('id'))));
            }
          }
        });
      }
    });

    const newValid = state.bathhouse.get('valid').withMutations(list => {
      if (!isNull(value.get('isRequired'))) {
        const allInvalidRoomIds = newInvalid.toList().flatten();
        const allUniqueInvalidRoomIds = List.of(...new Set(allInvalidRoomIds.toJS()));
        const valid = allRoomIds.filter(id => !allUniqueInvalidRoomIds.includes(id));
        list.clear().merge(valid);
      }
    });

    dispatch(changePrepaymentFilterValue(value));

    //  if active room is not valid after check, set activeRoomId to null
    if (!newValid.includes(state.bathhouse.get('activeRoomId')) && state.bathhouse.get('activeRoomId')) {
      dispatch(changeActiveRoom(state.bathhouse.get('activeRoomId')));
    }

    if (newInvalid.get('prepayment').isEmpty() && state.filter.get('tags').includes('prepayment')) {
      dispatch(removeTag('prepayment', state.city.get('activeCityId')));
    } else if (!newInvalid.get('prepayment').isEmpty() && !state.filter.get('tags').includes('prepayment')) {
      dispatch(addTag('prepayment'));
    }

    dispatch(updateRooms(newValid, newInvalid));
  };
}

/**
 * Find rooms, which allows number of guests. Dispatch valid and invalid lists.
 * @param {number} value - guest count
 * @return {Function} - thunk function
 * */
export function updateRoomsByGuest(value) {
  return (dispatch, getState) => {
    //
  };
}

/**
 * Find rooms, that are less then price. Dispatch valid and invalid lists.
 * @param {Array} values - price
 * @return {Function} - thunk function
 * */
export function updateRoomsByPrice(values) {
  return (dispatch, getState) => {
    const state = getState();
    const allRoomIds = state.bathhouse.get('rooms').map(room => room.get('id'));

    const newInvalid = state.bathhouse.get('invalid').withMutations(invalid => {
      state.bathhouse.get('rooms').forEach(room => {
        if (room.getIn(['price', 'min']) >= parseFloat(values[0]) &&
            room.getIn(['price', 'min']) <= parseFloat(values[1])) {
          invalid.update('price', distance => distance.push(room.get('id')));
        }
      });
    });

    const newValid = state.bathhouse.get('valid').withMutations(list => {
      const allInvalidRoomIds = newInvalid.toList().flatten();
      const allUniqueInvalidRoomIds = List.of(...new Set(allInvalidRoomIds.toJS()));
      const valid = allRoomIds.filter(id => !allUniqueInvalidRoomIds.includes(id));
      list.clear().merge(valid);
    });

    dispatch(changePriceFilterValues(values));

    //  if active room is not valid after check, set activeRoomId to null
    if (!newValid.includes(state.bathhouse.get('activeRoomId')) && state.bathhouse.get('activeRoomId')) {
      dispatch(changeActiveRoom(state.bathhouse.get('activeRoomId')));
    }

    if (newInvalid.get('price').isEmpty() && state.filter.get('tags').includes('price')) {
      dispatch(removeTag('price', state.city.get('activeCityId')));
    } else if (!newInvalid.get('price').isEmpty() && !state.filter.get('tags').includes('price')) {
      dispatch(addTag('price'));
    }

    dispatch(updateRooms(newValid, newInvalid));
  };
}

/**
 * Find rooms, that are less then price. Dispatch valid and invalid lists.
 * @param {Object} value - searched text
 * @return {Function} - thunk function
 * */
export function updateRoomsBySearchName(value) {
  return (dispatch, getState) => {
    const state = getState();
    const bathhouses = state.bathhouse.get('bathhouses');
    const allRoomIds = state.bathhouse.get('rooms').map(room => room.get('id'));

    const text = trim(value);
    const regexp = new RegExp(`${text}`, 'i');

    const newInvalid = state.bathhouse.get('invalid').withMutations(invalid => {
      state.bathhouse.get('rooms').forEach(room => {
        const bathhouse = bathhouses.find(bath => bath.get('id') === room.get('bathhouseId'));

        if (value.length) {
          if (!regexp.test(room.get('name')) && !regexp.test(bathhouse.get('name'))) {
            invalid.update('searchName', searchName => searchName.push(room.get('id')));
          }
        } else {
          if (!regexp.test(room.get('name')) && !regexp.test(bathhouse.get('name'))) {
            invalid.update('searchName', searchName => searchName.delete(searchName.findIndex(id => id === room.get('id'))));
          }
        }
      });
    });

    const newValid = state.bathhouse.get('valid').withMutations(list => {
      const allInvalidRoomIds = newInvalid.toList().flatten();
      const allUniqueInvalidRoomIds = List.of(...new Set(allInvalidRoomIds.toJS()));
      const valid = allRoomIds.filter(id => !allUniqueInvalidRoomIds.includes(id));
      list.clear().merge(valid);
    });

    dispatch(changeSearchNameFilterValue(text));

    //  if active room is not valid after check, set activeRoomId to null
    if (!newValid.includes(state.bathhouse.get('activeRoomId')) && state.bathhouse.get('activeRoomId')) {
      dispatch(changeActiveRoom(state.bathhouse.get('activeRoomId')));
    }

    if (newInvalid.get('searchName').isEmpty() && state.filter.get('tags').includes('searchName')) {
      dispatch(removeTag('searchName', state.city.get('activeCityId')));
    } else if (!newInvalid.get('searchName').isEmpty() && !state.filter.get('tags').includes('searchName')) {
      dispatch(addTag('searchName'));
    }

    dispatch(updateRooms(newValid, newInvalid));
  };
}

/**
 * Update rooms position by sorting type
 * @param {Object} value - type of sort and direct(ASC|DESC)
 * @return {Function} - thunk function
 * */
export function updateRoomsBySorting(value) {
  return (dispatch, getState) => {
    const state = getState();
    const bathhouses = state.bathhouse.get('bathhouses');
    const rooms = state.bathhouse.get('rooms');

    dispatch(changeSortingFilterValue(value));
    dispatch(sortRooms(
      sortingRoomsByType(bathhouses, rooms, value.get('name'),
      value.get('isDesc')
    )));
  };
}

/**
 * Remove all rooms from invalid by type|tag.
 * @param {string} tag - tag name
 * @return {Function} - thunk function
 * */
export function resetRoomsByTag(tag) {
  return (dispatch, getState) => {
    const state = getState();
    const allRoomIds = state.bathhouse.get('rooms').map(room => room.get('id'));

    const newInvalid = state.bathhouse.get('invalid').update(tag, list => list.clear());

    // TODO: ugly hack, find all new invalid room id, remove all duplicates, and check availability
    // TODO: in all rooms. Need solution use clear Immutable
    const newValid = state.bathhouse.get('valid').withMutations(list => {
      const allInvalidRoomIds = newInvalid.toList().flatten();
      const allUniqueInvalidRoomIds = List.of(...new Set(allInvalidRoomIds.toJS()));
      const valid = allRoomIds.filter(id => !allUniqueInvalidRoomIds.includes(id));
      list.clear().merge(valid);
    });

    dispatch(removeTag(tag, state.city.get('activeCityId')));
    dispatch(updateRooms(newValid, newInvalid));
  };
}

/**
 * Update schedule of room
 * @param {string} id - room id
 * @param {Date} date - date in schedule
 * @param {Array.<number>} periods - list of periods
 * @return {{type: string, payload: {}}}
 * */
export function updateRoomSchedule(id, date, periods) {
  return {
    type: UPDATE_ROOM_SCHEDULE,
    payload: {
      id,
      date,
      periods,
    },
  };
}
