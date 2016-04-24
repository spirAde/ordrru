import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { CHANGE_CITY, CHANGE_ORGANIZATION_TYPE,
  RESET_FULL_ORDER, RESET_DATETIME_ORDER,
  UPDATE_ORDER_DATETIME_START, UPDATE_ORDER_DATETIME_END, UPDATE_ORDER_SUM,
  CHECK_ORDER_REQUEST, CHECK_ORDER_SUCCESS, CHECK_ORDER_FAILURE,
  CHANGE_ORDER_STEP,
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../../client/scripts/actions/user-actions';

export const initialState = fromJS({
  cityId: null,
  organizationTypeId: null,
  order: {
    roomId: null,
    datetime: {
      startDate: null,
      startPeriod: null,
      endDate: null,
      endPeriod: null
    },
    services: [],
    sums: {
      datetime: 0,
      services: 0,
    },
    createdByUser: true,
  },
  steps: {
    choice: { valid: false, loading: false, error: null, active: true, },
    confirm: { valid: false, loading: false, error: null, active: false, },
    prepayment: { valid: false, loading: false, error: null, active: false, },
  },
  auth: {
    isFetching: false,
    isAuthenticated: false,
    error: false,
    phone: null,
    token: null,
  }
});

export const reducer = createReducer({
  [CHANGE_CITY](state, action) {
    return state.set('cityId', action.payload.cityId);
  },
  [CHANGE_ORGANIZATION_TYPE](state, action) {
    return state.set('organizationTypeId', action.payload.organizationTypeId);
  },
  [RESET_FULL_ORDER](state) {
    return state
      .set('order', initialState.get('order'))
      .set('steps', initialState.get('steps'))
      .setIn(['order', 'sums'], initialState.getIn(['order', 'sums']));
  },
  [RESET_DATETIME_ORDER](state) {
    return state
      .setIn(['order', 'datetime'], initialState.getIn(['order', 'datetime']))
      .setIn(['order', 'sums', 'datetime'], 0)
  },
  [UPDATE_ORDER_DATETIME_START](state, action) {
    return state
      .setIn(['order', 'roomId'], action.payload.id)
      .setIn(['order', 'datetime', 'startDate'], action.payload.date)
      .setIn(['order', 'datetime', 'startPeriod'], action.payload.period);
  },
  [UPDATE_ORDER_DATETIME_END](state, action) {
    return state
      .setIn(['order', 'datetime', 'endDate'], action.payload.date)
      .setIn(['order', 'datetime', 'endPeriod'], action.payload.period);
  },
  [UPDATE_ORDER_SUM](state, action) {
    return state.setIn(['order', 'sums', action.payload.type], action.payload.sum);
  },
  [CHANGE_ORDER_STEP](state, action) {
    return state
      .setIn(['steps', action.payload.currentStep, 'active'], false)
      .setIn(['steps', action.payload.nextStep, 'active'], true);
  },
  [CHECK_ORDER_REQUEST](state, action) {
    return state.setIn(['steps', 'choice', 'loading'], true);
  },
  [CHECK_ORDER_SUCCESS](state, action) {
    return state
      .setIn(['steps', 'choice', 'loading'], false)
      .setIn(['steps', 'choice', 'valid'], true);
  },
  [CHECK_ORDER_FAILURE](state, action) {
    return state
      .setIn(['steps', 'choice', 'loading'], false)
      .setIn(['steps', 'choice', 'valid'], false)
      .setIn(['steps', 'choice', 'error'], action.payload.error);
  },
  [LOGIN_REQUEST](state) {
    return state
      .setIn(['auth', 'isFetching'], true);
  },
  [LOGIN_SUCCESS](state, action) {
    return state
      .setIn(['auth', 'isFetching'], false)
      .setIn(['auth', 'token'], action.payload.token);
  },
  [LOGIN_FAILURE](state, action) {
    return state;
  },
  [LOGOUT_REQUEST](state) {
    return state
      .setIn(['auth', 'isFetching'], true);
  },
  [LOGOUT_SUCCESS](state, action) {
    return state;
  },
  [LOGOUT_FAILURE](state, action) {
    return state;
  },
}, initialState);
