import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { FIND_ROOM_SCHEDULE_REQUEST, FIND_ROOM_SCHEDULE_SUCCESS,
  FIND_ROOM_SCHEDULE_FAILURE, UPDATE_SCHEDULE_BY_SOCKET } from '../../client/scripts/actions/schedule-actions';

export const initialState = fromJS({
  schedules: {},
  isFetching: false,
});

export const reducer = createReducer({
  [FIND_ROOM_SCHEDULE_REQUEST](state) {
    return state.set('isFetching', true);
  },
  [FIND_ROOM_SCHEDULE_SUCCESS](state, action) {
    return state
      .update('schedules', schedules => schedules.merge(fromJS({ [action.payload.id]: action.payload.schedule })))
      .set('isFetching', false);
  },
  [FIND_ROOM_SCHEDULE_FAILURE](state) {
    return state.set('isFetching', false);
  },
  [UPDATE_SCHEDULE_BY_SOCKET](state, action) {
    return state
      .updateIn(['schedules', action.payload.roomId], schedules => schedules.merge(fromJS(action.payload.schedule)));
  },
}, initialState);
