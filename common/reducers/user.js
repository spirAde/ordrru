import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { CHANGE_CITY, CHANGE_ORGANIZATION_TYPE,
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../../client/scripts/actions/user-actions';

export const initialState = fromJS({
  cityId: null,
  organizationTypeId: null,
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
