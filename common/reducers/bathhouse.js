import { fromJS } from 'immutable';

import configs from '../../common/data/configs.json';

import createReducer from '../utils/create-reducer';

import {
  FIND_BATHHOUSES_REQUEST, FIND_BATHHOUSES_SUCCESS, FIND_BATHHOUSES_FAILURE,
  FIND_BATHHOUSE_REQUEST, FIND_BATHHOUSE_SUCCESS, FIND_BATHHOUSE_FAILURE,
  CHANGE_ACTIVE_ROOM, UPDATE_ROOMS, SORT_ROOMS, UPDATE_ROOM_SCHEDULE } from '../../client/scripts/actions/bathhouse-actions';

export const initialState = fromJS({
  isFetching: false,
  bathhouses: null,
  rooms: [],
  valid: [],
  invalid: {
    distance: [],
    options: [],
    types: [],
    prepayment: [],
    searchName: [],
    price: [],
    datetime: [],
    guest: []
  },
  activeRoomId: undefined
});

export const reducer = createReducer({
  [FIND_BATHHOUSES_REQUEST](state) {
    return state.set('isFetching', true);
  },
  [FIND_BATHHOUSES_SUCCESS](state, action) {
    return state
      .set('bathhouses', action.payload.bathhouses)
      .set('rooms', action.payload.rooms)
      .set('valid', action.payload.rooms.map(room => room.get('id')))
      .set('isFetching', false);
  },
  [FIND_BATHHOUSES_FAILURE](state) {
    return state.set('isFetching', false);
  },
  [FIND_BATHHOUSE_REQUEST](state, action) {
    return state
      .set('isFetching', true);
  },
  [FIND_BATHHOUSE_SUCCESS](state, action) {
    return state
      .set('isFetching', false)
      .set('bathhouses', fromJS(action.payload.bathhouse))
      .set('rooms', fromJS(action.payload.rooms))
  },
  [FIND_BATHHOUSE_FAILURE](state, action) {
    return state;
  },
  [CHANGE_ACTIVE_ROOM](state, action) {
    return state
      .set('activeRoomId', action.payload.id);
  },
  [UPDATE_ROOMS](state, action) {
    return state
      .set('valid', action.payload.valid)
      .set('invalid', action.payload.invalid);
  },
  [SORT_ROOMS](state, action) {
    const sortedValid = action.payload.rooms
      .filter(room => state.get('valid').includes(room.get('id')))
      .map(room => room.get('id'));
    return state
      .set('rooms', action.payload.rooms)
      .set('valid', sortedValid);
  },
  [UPDATE_ROOM_SCHEDULE](state, action) {
    return state;
  }
}, initialState);
