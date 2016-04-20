import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { UPDATE_NOTIFICATIONS_STACK } from '../../client/scripts/actions/notification-actions';

export const initialState = fromJS({
	notifications: [],
});

export const reducer = createReducer({
	[UPDATE_NOTIFICATIONS_STACK](state, action) {
		return state.set('notifications', action.payload.notifications);
	},
}, initialState);
