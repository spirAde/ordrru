import Cookies from 'js-cookie';

import { Manager } from '../API';
import { push, replace } from 'react-router-redux';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

function loginRequest() {
  return {
    type: LOGIN_REQUEST,
  };
}

export function loginSuccess(token) {
  Cookies.set('token', token);

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
      code: error.code,
    },
    error,
  };
}

export function login(credentials, redirect = '/manager/dashboard') {
  return dispatch => {
    dispatch(loginRequest());

    return Manager.login(credentials)
      .then((token) => {
        dispatch(loginSuccess(token));
        dispatch(push(redirect));
      })
      .catch(error => dispatch(loginFailure(error)));
  };
}

function logoutRequest() {
  return {
    type: LOGOUT_REQUEST,
  };
}

function logoutSuccess() {
  Cookies.remove('token');

  return {
    type: LOGOUT_SUCCESS,
  };
}

function logoutFailure(error) {
  return {
    type: LOGOUT_FAILURE,
    payload: {
      error: error.message,
      code: error.code,
    },
    error,
  };
}

export function logout(token, redirect = '/manager/login') {
  return dispatch => {
    dispatch(logoutRequest());

    return Manager.logout(token)
      .then(() => {
        dispatch(logoutSuccess());
        dispatch(replace(redirect));
      })
      .catch(error => dispatch(logoutFailure(error)));
  };
}
