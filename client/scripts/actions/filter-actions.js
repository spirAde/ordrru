export const SET_FILTERS_DATA = 'SET_FILTERS_DATA';
export const ADD_TAG = 'ADD_TAG';
export const REMOVE_TAG = 'REMOVE_TAG';
export const UPDATE_OFFERS_COUNT = 'UPDATE_OFFERS_COUNT';

export const CHANGE_DATETIME_FILTER_VALUES = 'CHANGE_DATETIME_FILTER_VALUES';
export const CHANGE_DISTANCE_FILTER_VALUE = 'CHANGE_DISTANCE_FILTER_VALUE';
export const CHANGE_PREPAYMENT_FILTER_VALUE = 'CHANGE_PREPAYMENT_FILTER_VALUE';
export const CHANGE_OPTIONS_FILTER_VALUE = 'CHANGE_OPTIONS_FILTER_VALUE';
export const CHANGE_TYPES_FILTER_VALUE = 'CHANGE_TYPES_FILTER_VALUE';
export const CHANGE_GUEST_FILTER_VALUE = 'CHANGE_GUEST_FILTER_VALUE';
export const CHANGE_PRICE_FILTER_VALUES = 'CHANGE_PRICE_FILTER_VALUES';
export const CHANGE_SEARCH_NAME_FILTER_VALUE = 'CHANGE_SEARCH_NAME_FILTER_VALUE';
export const CHANGE_SORTING_FILTER_VALUE = 'CHANGE_SORTING_FILTER_VALUE';

/**
 * Set filters for selected city
 * @param {string} id - city id
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function setFiltersData(id) {
  return {
    type: SET_FILTERS_DATA,
    payload: {
      id: id
    }
  };
}

/**
 * Add tag to list
 * @param {string} tag - tag name
 * @return {{type: string, payload: {tag: string}}} - action
 * */
export function addTag(tag) {
  return {
    type: ADD_TAG,
    payload: {
      tag
    }
  };
}

/**
 * Remove tag from list
 * @param {string} tag - tag name
 * @param {string} id - city id
 * @return {{type: string, payload: {tag: string}}} - action
 * */
export function removeTag(tag, id) {
  return {
    type: REMOVE_TAG,
    payload: {
      tag,
      id
    }
  };
}

/**
 * Change start date and end data values of datetime filter
 * @param {Object.<string, string>} values
 * @return {{type: string, payload: {values: Object}}} - action
 * */
export function changeDateTimeFilterValues(values) {
  return {
    type: CHANGE_DATETIME_FILTER_VALUES,
    payload: {
      values
    }
  };
}

/**
 * Change distance from city center value
 * @param {number} value
 * @return {{type: string, payload: {value: number}}} - action
 * */
export function changeDistanceFilterValue(value) {
  return {
    type: CHANGE_DISTANCE_FILTER_VALUE,
    payload: {
      value
    }
  };
}

/**
 * Change type of prepayment
 * @param {Object.<string, string|boolean>} value
 * @return {{type: string, payload: {value: Object}}} - action
 * */
export function changePrepaymentFilterValue(value) {
  return {
    type: CHANGE_PREPAYMENT_FILTER_VALUE,
    payload: {
      value
    }
  };
}

/**
 * Change checked or unchecked options
 * @param {Object.<string, string|boolean>} value
 * @return {{type: string, payload: {value: Object}}} - action
 * */
export function changeOptionsFilterValue(value) {
  return {
    type: CHANGE_OPTIONS_FILTER_VALUE,
    payload: {
      value
    }
  };
}

/**
 * Change checked or unchecked types
 * @param {Object.<string, string|boolean>} value
 * @return {{type: string, payload: {value: Object}}} - action
 * */
export function changeTypesFilterValue(value) {
  return {
    type: CHANGE_TYPES_FILTER_VALUE,
    payload: {
      value
    }
  };
}

/**
 * Change count of guest filter
 * @param {number} value
 * @return {{type: string, payload: {value: number}}} - action
 * */
export function changeGuestFilterValue(value) {
  return {
    type: CHANGE_GUEST_FILTER_VALUE,
    payload: {
      value
    }
  };
}

/**
 * Change price interval values
 * @param {Object.<string, number>} values
 * @return {{type: string, payload: {values: Object}}} - action
 * */
export function changePriceFilterValues(values) {
  return {
    type: CHANGE_PRICE_FILTER_VALUES,
    payload: {
      values
    }
  };
}

/**
 * Change searched room or bathhouse name
 * @param {string} value
 * @return {{type: string, payload: {value: string}}} - action
 * */
export function changeSearchNameFilterValue(value) {
  return {
    type: CHANGE_SEARCH_NAME_FILTER_VALUE,
    payload: {
      value
    }
  };
}

/**
 * Change sort type for room, popularity, distance, price
 * */
export function changeSortingFilterValue(value) {
  return {
    type: CHANGE_SORTING_FILTER_VALUE,
    payload: {
      value
    }
  };
}

export function shouldSetFilters(state, id) {
  return state.city.get('activeCityId') !== id;
}
