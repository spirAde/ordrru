import isNull from 'lodash/isNull';

import { redefineRoomSchedule } from './schedule-actions';

export const CHANGE_ORGANIZATION_TYPE = 'CHANGE_ORGANIZATION_TYPE';
export const CHANGE_CITY = 'CHANGE_CITY';

export const SET_USER_DEVICE = 'SET_USER_DEVICE';
export const CHANGE_USER_VIEWPORT = 'CHANGE_USER_VIEWPORT';

export const UPDATE_ORDER_DATETIME_START = 'UPDATE_ORDER_DATETIME_START';
export const UPDATE_ORDER_DATETIME_END = 'UPDATE_ORDER_DATETIME_END';

export const RESET_ORDER = 'RESET_ORDER';

/**
 * update start datetime of order
 * @param {string} id - room id
 * @param {Date} date - start date
 * @param {number} period - start period
 * @return {{type: string, payload: {Object}}} - action
 * */
function updateOrderDatetimeStart(id, date, period) {
  return {
    type: UPDATE_ORDER_DATETIME_START,
    payload: {
      id,
      date,
      period
    }
  };
}

/**
 * update end datetime of order
 * @param {Date} date - end date
 * @param {number} period - end period
 * @return {{type: string, payload: {Object}}} - action
 * */
function updateOrderDatetimeEnd(date, period) {
  return {
    type: UPDATE_ORDER_DATETIME_END,
    payload: {
      date,
      period
    }
  };
}

/**
 * Change city selected by the user.
 * @param {string} id - city id
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function changeCity(id) {
  return {
    type: CHANGE_CITY,
    payload: {
      id
    }
  };
}

/**
 * Change organization selected type by user.
 * @param {string} id - organization type id(bathhouse or carwash)
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function changeOrganizationType(id) {
  return {
    type: CHANGE_ORGANIZATION_TYPE,
    payload: {
      id
    }
  };
}

export function setUserDevice(device) {
  return {
    type: SET_USER_DEVICE,
    payload: {
      device
    }
  };
}

export function changeUserViewport(viewport) {
  return {
    type: CHANGE_USER_VIEWPORT,
    payload: {
      viewport
    }
  };
}

/**
 * get selected date and period of order. Perform this action twice for start and end of order(startDate, endDate, startPeriod,
 * endPeriod) see user-state for details.
 * @param {string} id - room id
 * @param {Date} date - date of start or end
 * @param {number} period - period id
 * @return {Function} - thunk function
 * */
export function selectOrder(id, date, period) {
  return (dispatch, getState) => {
    const state = getState();
    const order = state.user.get('order');

    isNull(order.get('roomId')) ?
      dispatch(updateOrderDatetimeStart(id, date, period)) :
      dispatch(updateOrderDatetimeEnd(date, period));

    dispatch(redefineRoomSchedule(id, date, period, isNull(order.get('roomId'))));
  };
}

export function resetOrder() {
  return {
    type: RESET_ORDER
  };
}
