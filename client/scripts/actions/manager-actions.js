import cookie from 'cookie';
import Cookies from 'js-cookie';

import omit from 'lodash/omit';

import { push, replace } from 'react-router-redux';

import { Manager } from '../API';
import { addNotification } from './notification-actions';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export const SET_IS_AUTHENTICATED = 'SET_IS_AUTHENTICATED';
export const SET_MANAGER = 'SET_MANAGER';

export function setIsAuthenticated(status) {
  return {
    type: SET_IS_AUTHENTICATED,
    payload: {
      status,
    },
  };
}

export function setManager(manager) {
  return {
    type: SET_MANAGER,
    payload: {
      manager,
    },
  };
}

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
    },
    error,
  };
}

export function login(credentials, redirect = '/manager/dashboard') {
  return dispatch => {
    dispatch(loginRequest());

    return Manager.login(credentials, 'user')
      .then((data) => {
        dispatch(loginSuccess(omit(data, 'user')));
        dispatch(setIsAuthenticated(true));
        dispatch(setManager(data.user));
        dispatch(push(redirect));
      })
      .catch(error => {
        dispatch(loginFailure(error));
        dispatch(addNotification({
          message: error.code,
          level: 'error',
        }));
      });
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
        dispatch(setIsAuthenticated(false));
        dispatch(replace(redirect));
      })
      .catch(error => dispatch(logoutFailure(error)));
  };
}

export function configureAuth(isServer, cookies, currentLocation) {
  return dispatch => {
    if (isServer) {
      const rawCookies = cookie.parse(cookies || '{}');
      const token = rawCookies.token && JSON.parse(rawCookies.token);
    } else {

    }
  };
}
