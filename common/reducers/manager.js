import { fromJS, Map } from 'immutable';

import createReducer from '../utils/create-reducer';

import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
	LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE,
	SET_IS_AUTHENTICATED, SET_MANAGER,
} from '../../client/scripts/actions/manager-actions';

export const initialState = fromJS({
	isFetching: false,
	loginError: {},
	logoutError: {},
	token: null, // TODO: remove after tests, need to store only in cookies
	manager: {},
	isAuthenticated: false,
});

export const reducer = createReducer({
	[SET_IS_AUTHENTICATED](state, action) {
		return state.set('isAuthenticated', action.payload.status);
	},
	[SET_MANAGER](state, action) {
		return state.set('manager', action.payload.manager);
	},
	[LOGIN_REQUEST](state) {
		return state.set('isFetching', true);
	},
	[LOGIN_SUCCESS](state, action) {
		return state
			.set('isFetching', false)
			.set('token', fromJS(action.payload.token))
			.set('loginError', Map());
	},
	[LOGIN_FAILURE](state, action) {
		return state
			.set('isFetching', false)
			.set('loginError', fromJS(action.payload));
	},
	[LOGOUT_REQUEST](state, action) {
		return state.set('isFetching', true);
	},
	[LOGOUT_SUCCESS](state, action) {
		return state
			.set('isFetching', false)
			.set('token', Map())
			.set('manager', Map())
			.set('logoutError', Map());
	},
	[LOGOUT_FAILURE](state, action) {
		return state
			.set('isFetching', false)
			.set('logoutError', fromJS(action.payload));
	},
}, initialState);
