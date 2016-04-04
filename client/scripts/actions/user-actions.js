import { isNull } from 'lodash';

import { Order } from '../API';

import { redefineRoomSchedule } from './schedule-actions';

import { calculateDatetimeOrderSum } from '../../../common/utils/schedule-helper';

export const CHANGE_ORGANIZATION_TYPE = 'CHANGE_ORGANIZATION_TYPE';
export const CHANGE_CITY = 'CHANGE_CITY';

export const SET_USER_DEVICE = 'SET_USER_DEVICE';
export const CHANGE_USER_VIEWPORT = 'CHANGE_USER_VIEWPORT';

export const UPDATE_ORDER_DATETIME_START = 'UPDATE_ORDER_DATETIME_START';
export const UPDATE_ORDER_DATETIME_END = 'UPDATE_ORDER_DATETIME_END';
export const UPDATE_ORDER_SUM = 'UPDATE_ORDER_SUM';

export const RESET_FULL_ORDER = 'RESET_FULL_ORDER';
export const RESET_DATETIME_ORDER = 'RESET_DATETIME_ORDER';

export const ADD_TO_SOCKET_ROOM = 'ADD_TO_SOCKET_ROOM';

export const CHECK_ORDER_REQUEST = 'CHECK_ORDER_REQUEST';
export const CHECK_ORDER_SUCCESS = 'CHECK_ORDER_SUCCESS';
export const CHECK_ORDER_FAILURE = 'CHECK_ORDER_FAILURE';

export const SEND_ORDER_REQUEST = 'SEND_ORDER_REQUEST';
export const SEND_ORDER_SUCCESS = 'SEND_ORDER_SUCCESS';
export const SEND_ORDER_FAILURE = 'SEND_ORDER_FAILURE';

export const CHANGE_ORDER_STEP = 'CHANGE_ORDER_STEP';

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
      period,
    },
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
      period,
    },
  };
}

/**
 * update order sum for datetime or options
 * @param {String} type - datetime or options
 * @param {number} sum - order type sum
 * @return {{type: string, payload: {Object}}} - action
 * */
function updateOrderSum(type = 'datetime', sum) {
  return {
    type: UPDATE_ORDER_SUM,
    payload: {
      type,
      sum,
    },
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
      id,
    },
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
      id,
    },
  };
}

/**
 * set user device
 * @param {String} device - device
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function setUserDevice(device) {
  return {
    type: SET_USER_DEVICE,
    payload: {
      device,
    },
  };
}

/**
 * set user device viewport
 * @param {Object} viewport - height, width
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function changeUserViewport(viewport) {
  return {
    type: CHANGE_USER_VIEWPORT,
    payload: {
      viewport,
    },
  };
}

/**
 * get selected date and period of order. Perform this action twice for start and end
 * of order(startDate, endDate, startPeriod, endPeriod) see user-state for details.
 * after calculate sum for datetime order
 * @param {string} id - room id
 * @param {Date} date - date of start or end
 * @param {number} period - period id
 * @return {Function} - thunk function
 * */
export function selectOrder(id, date, period) {
  return (dispatch, getState) => {
    const state = getState();
    const order = state.user.get('order');

    if (isNull(order.getIn(['datetime', 'startDate']))) {
      dispatch(updateOrderDatetimeStart(id, date, period));
    } else {
      dispatch(updateOrderDatetimeEnd(date, period));

      const datetimeOrder = {
        startDate: order.getIn(['datetime', 'startDate']),
        startPeriod: order.getIn(['datetime', 'startPeriod']),
        endDate: date,
        endPeriod: period,
      };

      const room = state.bathhouse.get('rooms').find(room => room.get('id') === id);
      const prices = room.getIn(['price', 'chunks']);
      const sum = calculateDatetimeOrderSum(datetimeOrder, prices.toJS());

      dispatch(updateOrderSum('datetime', sum));
    }

    const isStartOrder = isNull(order.getIn(['datetime', 'startDate']));
    dispatch(redefineRoomSchedule(id, date, period, isStartOrder));
  };
}

/**
 * change order step for choice(booking), prepayment(if room require that), confirm(mobile phone)
 * @param {String} currentStep - choice, prepayment, confirm
 * @param {String} nextStep - choice, prepayment, confirm
 * @return {{type: string, payload: {}}}
 * */
function changeOrderStep(currentStep, nextStep) {
  return {
    type: CHANGE_ORDER_STEP,
    payload: {
      currentStep,
      nextStep,
    },
  };
}

/**
 * Request check order
 * @return {{type: string, payload: {}}}
 * */
function checkOrderRequest() {
  return {
    type: CHECK_ORDER_REQUEST,
  };
}

/**
 * Success validation order
 * @return {{type: string, payload: {}}}
 * */
function checkOrderSuccess() {
  return {
    type: CHECK_ORDER_SUCCESS,
  };
}

/**
 * Failure validation order
 * @param {Object} error
 * @return {{type: string, payload: {error: Object}}}
 * */
function checkOrderFailure(error) {
  return {
    type: CHECK_ORDER_FAILURE,
    payload: {
      error: error.message,
    },
    error,
  };
}

/**
 * check order before create
 * @return {Function} - thunk action
 * */
export function checkOrder() {
  return (dispatch, getState) => {
    const state = getState();
    const order = state.user.get('order');

    dispatch(checkOrderRequest());

    Order.check(order.toJS())
      .then(data => {
        dispatch(checkOrderSuccess(data));
        dispatch(changeOrderStep('choice', 'confirm'));
      })
      .catch(error => dispatch(checkOrderFailure(error)));
  };
}

/**
 * Request create order
 * @return {{type: string, payload: {}}}
 * */
function sendOrderRequest() {
  return {
    type: SEND_ORDER_REQUEST,
  };
}

/**
 * Success create order
 * @return {{type: string, payload: {}}}
 * */
function sendOrderSuccess() {
  return {
    type: SEND_ORDER_SUCCESS,
  };
}

/**
 * Failure create order
 * @param {Object} error
 * @return {{type: string, payload: {error: Object}}}
 * */
function sendOrderFailure(error) {
  return {
    type: SEND_ORDER_FAILURE,
    payload: {
      error: error.message,
    },
    error,
  };
}

/**
 * create order
 * @return {Function} - thunk action
 * */
export function sendOrder() {
  return (dispatch, getState) => {
    const state = getState();
    const order = state.user.get('order');

    dispatch(sendOrderRequest());

    Order.create(order.toJS())
      .then(() => dispatch(sendOrderSuccess()))
      .catch(error => dispatch(sendOrderFailure(error)));
  };
}

/**
 * reset full order
 * Datetime, services, guests, sums
 * */
export function resetFullOrder() {
  return {
    type: RESET_FULL_ORDER,
  };
}

/**
 * reset datetime order
 * */
export function resetDatetimeOrder() {
  return {
    type: RESET_DATETIME_ORDER,
  };
}

/**
 * After initialize page, send selected city id, that add socket to socket room
 * @param {String} cityId - active city id
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function addToSocketRoom(cityId) {
  return {
    type: ADD_TO_SOCKET_ROOM,
    payload: {
      cityId,
    },
    meta: {
      remote: true,
    },
  };
}
