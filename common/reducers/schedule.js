import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { FIND_ROOM_SCHEDULE_REQUEST, FIND_ROOM_SCHEDULE_SUCCESS, FIND_ROOM_SCHEDULE_FAILURE,
  ADD_SCHEDULE_CHANGES, ADD_SCHEDULE_MIXED } from '../../client/scripts/actions/schedule-actions';

export const initialState = fromJS({
  originals: {}, // unchangeable schedules of rooms
  changes: {}, // changes from sockets, contains manager changes, other users changes
  mixed: {}, // combine originals and changes for use in components
  isFetching: false
});

export const reducer = createReducer({
  [FIND_ROOM_SCHEDULE_REQUEST](state) {
    return state.set('isFetching', true);
  },
  [FIND_ROOM_SCHEDULE_SUCCESS](state, action) {
    return state
      .update('originals', originals => originals.merge(fromJS({ [action.payload.id]: action.payload.schedule })))
      .set('isFetching', false);
  },
  [FIND_ROOM_SCHEDULE_FAILURE](state) {
    return state.set('isFetching', false);
  },
  [ADD_SCHEDULE_CHANGES](state) {
    return state;
  },
  [ADD_SCHEDULE_MIXED](state, action) {
    return state
      .update('mixed', mixed => mixed.merge(fromJS({ [action.payload.id]: action.payload.mixed })))
  }
}, initialState);
