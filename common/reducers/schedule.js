import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { FIND_ROOM_SCHEDULE_REQUEST, FIND_ROOM_SCHEDULE_SUCCESS, FIND_ROOM_SCHEDULE_FAILURE,
  CHANGE_SCHEDULE, ADD_SCHEDULE_CHANGES, CLEAR_SCHEDULE_CHANGES } from '../../client/scripts/actions/schedule-actions';

export const initialState = fromJS({
  originals: {}, // loaded schedule for room
  changes: {}, // changes from real time server
  schedules: {}, // combination between originals and changes
  isFetching: false,
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
  [CHANGE_SCHEDULE](state, action) {
    return state
      .update('schedules', schedules => schedules.merge(fromJS({ [action.payload.id]: action.payload.schedule })))
  },
  [ADD_SCHEDULE_CHANGES](state, action) {
    return state
      .updateIn(['changes', action.payload.id], changes => changes.push(fromJS(action.payload.changes)));
  },
  [CLEAR_SCHEDULE_CHANGES](state, action) {
    return state
      .updateIn(['changes', action.payload.id], changes => changes.clear());
  }
}, initialState);
