import isNull from 'lodash/isNull';

import { Order } from '../API';

import { redefineRoomSchedule } from './schedule-actions';

import { calculateDatetimeOrderSum, STEP } from '../../../common/utils/schedule-helper';

export const FIND_ORDERS_REQUEST = 'FIND_ORDERS_REQUEST';
export const FIND_ORDERS_SUCCESS = 'FIND_ORDERS_SUCCESS';
export const FIND_ORDERS_FAILURE = 'FIND_ORDERS_FAILURE';

export const UPDATE_ORDER_DATETIME_START = 'UPDATE_ORDER_DATETIME_START';
export const UPDATE_ORDER_DATETIME_END = 'UPDATE_ORDER_DATETIME_END';
export const UPDATE_ORDER_SUM = 'UPDATE_ORDER_SUM';

export const RESET_FULL_ORDER = 'RESET_FULL_ORDER';
export const RESET_DATETIME_ORDER = 'RESET_DATETIME_ORDER';

export const CHECK_ORDER_REQUEST = 'CHECK_ORDER_REQUEST';
export const CHECK_ORDER_SUCCESS = 'CHECK_ORDER_SUCCESS';
export const CHECK_ORDER_FAILURE = 'CHECK_ORDER_FAILURE';

export const SEND_ORDER_REQUEST = 'SEND_ORDER_REQUEST';
export const SEND_ORDER_SUCCESS = 'SEND_ORDER_SUCCESS';
export const SEND_ORDER_FAILURE = 'SEND_ORDER_FAILURE';

export const CHANGE_ORDER_STEP = 'CHANGE_ORDER_STEP';

function findOrdersRequest() {
  return {
    type: FIND_ORDERS_REQUEST,
  };
}

function findOrdersSuccess(roomId, orders) {
  return {
    type: FIND_ORDERS_SUCCESS,
    payload: {
      id: roomId,
      orders,
    },
  };
}

function findOrdersFailure(error) {
  return {
    type: FIND_ORDERS_FAILURE,
    payload: {
      error: error.message,
    },
    error,
  };
}

export function findOrdersIfNeed(roomId) {
  return (dispatch, getState) => {
    const state = getState();

    if (state.order.get('orders').has(roomId)) {
      return false;
    }

    dispatch(findOrdersRequest());

    return Order.find({ where: { roomId }, data: { splitByDates: true } })
      .then(orders => dispatch(findOrdersSuccess(roomId, orders)))
      .catch(error => dispatch(findOrdersFailure(error)));
  };
}

export function findOrdersForDate(roomId, date) {
  return dispatch => {
    dispatch(findOrdersRequest());

    return Order.find({ where: { roomId, date } })
      .then(orders => dispatch(findOrdersSuccess(roomId, orders)))
      .catch(error => dispatch(findOrdersFailure(error)));
  };
}

/**
 * update start datetime of order
 * @param {string} id - room id
 * @param {Date} date - start date
 * @param {number} period - start period
 * @param {boolean} createdByUser - created user or manager
 * @return {{type: string, payload: {Object}}} - action
 * */
function updateOrderDatetimeStart(id, date, period, createdByUser = true) {
  return {
    type: UPDATE_ORDER_DATETIME_START,
    payload: {
      id,
      date,
      period,
      createdByUser,
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
 * get selected date and period of order. Perform this action twice for start and end
 * of order(startDate, endDate, startPeriod, endPeriod) see user-state for details.
 * after calculate sum for datetime order
 * @param {string} id - room id
 * @param {Date} date - date of start or end
 * @param {number} period - period id
 * @param {boolean} createdByUser - created by user or manager
 * @return {Function} - thunk function
 * */
export function selectOrder(id, date, period, createdByUser = true) {
  return (dispatch, getState) => {
    const state = getState();
    const order = state.order.get('order');

    if (isNull(order.getIn(['datetime', 'startDate']))) {
      dispatch(updateOrderDatetimeStart(id, date, period, createdByUser));
    } else {
      const endPeriod = createdByUser ? period : period + STEP;

      dispatch(updateOrderDatetimeEnd(date, endPeriod));

      const datetimeOrder = {
        startDate: order.getIn(['datetime', 'startDate']),
        startPeriod: order.getIn(['datetime', 'startPeriod']),
        endDate: date,
        endPeriod,
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
    const order = state.order.get('order');

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
    const order = state.order.get('order');

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
