import { Order } from '../API';

export const FIND_ORDERS_REQUEST = 'FIND_ORDERS_REQUEST';
export const FIND_ORDERS_SUCCESS = 'FIND_ORDERS_SUCCESS';
export const FIND_ORDERS_FAILURE = 'FIND_ORDERS_FAILURE';

function fetchOrdersRequest() {
  return {
    type: FIND_ORDERS_REQUEST,
    payload: {},
  };
}

function fetchOrdersSuccess(orders) {
  return {
    type: FIND_ORDERS_SUCCESS,
    payload: {
      orders,
    },
  };
}

function fetchOrdersFailure(error) {
  return {
    type: FIND_ORDERS_FAILURE,
    payload: {
      error,
    },
    error,
  };
}

export function findOrders() {
  return dispatch => {
    dispatch(fetchOrdersRequest());

    return Order.find()
      .then(data => dispatch(fetchOrdersSuccess(data)))
      .catch(error => dispatch(fetchOrdersFailure(error)));
  };
}