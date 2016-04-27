import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { FIND_COMMENTS_REQUEST, FIND_COMMENTS_SUCCESS,
	FIND_COMMENTS_FAILURE } from '../../client/scripts/actions/comment-actions';

export const initialState = fromJS({
	isFetching: false,
	error: null,
	comments: {},
});

export const reducer = createReducer({
	[FIND_COMMENTS_REQUEST](state, action) {
		return state.set('isFetching', true);
	},
	[FIND_COMMENTS_SUCCESS](state, action) {
		return state
			.update('comments', comments => comments.merge(fromJS({ [action.payload.roomId]: action.payload.comments })))
			.set('isFetching', false);
	},
	[FIND_COMMENTS_FAILURE](state, action) {
		return state
			.set('isFetching')
			.set('error', action.payload.error);
	},
}, initialState);
