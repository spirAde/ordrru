import { Order } from '../API';

export const FIND_ORDERS_REQUEST = 'FIND_ORDERS_REQUEST';
export const FIND_ORDERS_SUCCESS = 'FIND_ORDERS_SUCCESS';
export const FIND_ORDERS_FAILURE = 'FIND_ORDERS_FAILURE';

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
