import { User } from '../API';

export const CHANGE_ORGANIZATION_TYPE = 'CHANGE_ORGANIZATION_TYPE';
export const CHANGE_CITY = 'CHANGE_CITY';

export const ADD_TO_SOCKET_ROOM = 'ADD_TO_SOCKET_ROOM';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export const REGISTRATION_REQUEST = 'REGISTRATION_REQUEST';
export const REGISTRATION_SUCCESS = 'REGISTRATION_SUCCESS';
export const REGISTRATION_FAILURE = 'REGISTRATION_FAILURE';

export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
export const RESET_PASSWORD_FAILURE = 'RESET_PASSWORD_FAILURE';

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

function loginRequest() {
  return {
    type: LOGIN_REQUEST,
  };
}

function loginSuccess(token) {
  return {
    type: LOGIN_SUCCESS,
    payload: {
      token,
    },
  };
}

function loginFailure(error) {
  return {
    type: LOGIN_FAILURE,
    payload: {
      error: error.message,
    },
    error,
  };
}

export function login(credentials) {
  return dispatch => {
    dispatch(loginRequest());

    return User.login(credentials)
      .then((token) => dispatch(loginSuccess(token)))
      .catch(error => dispatch(loginFailure(error)));
  };
}

function logoutRequest() {
  return {
    type: LOGOUT_REQUEST,
  };
}

function logoutSuccess() {
  return {
    type: LOGOUT_SUCCESS,
  };
}

function logoutFailure(error) {
  return {
    type: LOGOUT_FAILURE,
    payload: {
      error: error.message,
    },
    error,
  };
}

export function logout(token) {
  return dispatch => {
    dispatch(logoutRequest());

    return User.logout(token)
      .then(() => dispatch(logoutSuccess()))
      .catch(error => dispatch(logoutFailure(error)));
  };
}
