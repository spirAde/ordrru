import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { CHANGE_CITY, CHANGE_ORGANIZATION_TYPE,
  SET_USER_DEVICE, CHANGE_USER_VIEWPORT,
  RESET_ORDER, SET_SOCKET_ID,
  UPDATE_ORDER_DATETIME_START, UPDATE_ORDER_DATETIME_END, UPDATE_ORDER_SUM,
  CHECK_ORDER_REQUEST, CHECK_ORDER_SUCCESS, CHECK_ORDER_FAILURE,
  CHANGE_ORDER_STEP } from '../../client/scripts/actions/user-actions';

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
  device: {
    isMobile: false,
    viewport: {
      height: null,
      width: null
    },
  },
  socket: null,
});

export const reducer = createReducer({
  [CHANGE_CITY](state, action) {
    return state.set('cityId', action.payload.cityId);
  },
  [CHANGE_ORGANIZATION_TYPE](state, action) {
    return state.set('organizationTypeId', action.payload.organizationTypeId);
  },
  [SET_USER_DEVICE](state, action) {
    return state;
  },
  [CHANGE_USER_VIEWPORT](state, action) {
    return state
      .setIn(['device', 'viewport'], action.payload.viewport);
  },
  [RESET_ORDER](state) {
    return state
      .set('order', initialState.get('order'))
      .set('steps', initialState.get('steps'));
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
  [SET_SOCKET_ID](state, action) {
    return state.set('socket', action.payload.id);
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
}, initialState);
