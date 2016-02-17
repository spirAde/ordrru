import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { CHANGE_CITY, CHANGE_ORGANIZATION_TYPE,
  SET_USER_DEVICE, CHANGE_USER_VIEWPORT,
  RESET_ORDER,
  UPDATE_ORDER_DATETIME_START, UPDATE_ORDER_DATETIME_END } from '../../client/scripts/actions/user-actions';

export const initialState = fromJS({
  cityId: null,
  organizationTypeId: null,
  order: {
    roomId: null,
    date: {
      startDate: null,
      startPeriod: null,
      endDate: null,
      endPeriod: null
    },
    options: {},
    guests: null
  },
  device: {
    isMobile: false,
    viewport: {
      height: null,
      width: null
    },
  }
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
    return state.set('order', initialState.get('order'));
  },
  [UPDATE_ORDER_DATETIME_START](state, action) {
    return state
      .setIn(['order', 'roomId'], action.payload.id)
      .setIn(['order', 'date', 'startDate'], action.payload.date)
      .setIn(['order', 'date', 'startPeriod'], action.payload.period);
  },
  [UPDATE_ORDER_DATETIME_END](state, action) {
    return state
      .setIn(['order', 'date', 'endDate'], action.payload.date)
      .setIn(['order', 'date', 'endPeriod'], action.payload.period);
  }
}, initialState);
