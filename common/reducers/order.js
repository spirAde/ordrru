import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { FIND_ORDERS_REQUEST, FIND_ORDERS_SUCCESS, FIND_ORDERS_FAILURE } from '../../client/scripts/actions/order-actions';

export const initialState = fromJS({
	isFetching: false,
	errors: [],
	orders: [],
});

export const reducer = createReducer({
	[FIND_ORDERS_REQUEST](state, action) {
		return state;
	},
	[FIND_ORDERS_SUCCESS](state, action) {
		return state;
	},
	[FIND_ORDERS_FAILURE](state, action) {
		return state;
	},
}, initialState);
