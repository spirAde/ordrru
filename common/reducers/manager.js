import { fromJS, Map } from 'immutable';

import createReducer from '../utils/create-reducer';

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
	LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE } from '../../client/scripts/actions/manager-actions';

export const initialState = fromJS({
	isFetching: false,
	loginError: {},
	logoutError: {},
	token: null,
	auth: {
		isAuthenticated: false,
	},
});

export const reducer = createReducer({
	[LOGIN_REQUEST](state) {
		return state.set('isFetching', true);
	},
	[LOGIN_SUCCESS](state, action) {
		return state
			.set('isFetching', false)
			.set('token', fromJS(action.payload.token))
			.set('loginError', Map())
			.setIn(['auth', 'isAuthenticated'], true);
	},
	[LOGIN_FAILURE](state, action) {
		return state
			.set('isFetching', false)
			.set('loginError', fromJS(action.payload));
	},
}, initialState);
