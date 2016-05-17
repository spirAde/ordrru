import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { FIND_ORDERS_REQUEST, FIND_ORDERS_SUCCESS, FIND_ORDERS_FAILURE,
	RESET_FULL_ORDER, RESET_DATETIME_ORDER,
	UPDATE_ORDER_DATETIME_START, UPDATE_ORDER_DATETIME_END, UPDATE_ORDER_SUM,
	CHECK_ORDER_REQUEST, CHECK_ORDER_SUCCESS, CHECK_ORDER_FAILURE,
	CHANGE_ORDER_STEP } from '../../client/scripts/actions/order-actions';

export const initialState = fromJS({
	orders: {},
	isFetching: false,
	error: null,
	order: { // new order created manager or user
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
		createdByUser: null,
	},
	shownOrder: null,
	steps: {
		choice: { valid: false, loading: false, error: null, active: true, },
		confirm: { valid: false, loading: false, error: null, active: false, },
		prepayment: { valid: false, loading: false, error: null, active: false, },
	},
});

export const reducer = createReducer({
	[FIND_ORDERS_REQUEST](state, action) {
		return state.set('isFetching', true);
	},
	[FIND_ORDERS_SUCCESS](state, action) {
		return state
			.update('orders', orders => orders.merge(fromJS({ [action.payload.id]: action.payload.orders })))
			.set('isFetching', false);
	},
	[FIND_ORDERS_FAILURE](state, action) {
		return state
			.set('isFetching')
			.set('error', action.payload.error);
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
			.setIn(['order', 'datetime', 'startPeriod'], action.payload.period)
			.setIn(['order', 'createdByUser'], action.payload.createdByUser);
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
}, initialState);
