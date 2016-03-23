import { List, Map, fromJS } from 'immutable';
import { expect } from 'chai';

import { isNull, map, flatten, omit, keys } from 'lodash';

import { initialState as defaultInitialState, reducer } from '../../../common/reducers/bathhouse';

import { Bathhouses } from '../../../client/scripts/API';

import { FIND_BATHHOUSES_FAILURE, FIND_BATHHOUSES_REQUEST, FIND_BATHHOUSES_SUCCESS,
  CHANGE_ACTIVE_ROOM, UPDATE_ROOMS } from '../../../client/scripts/actions/bathhouse-actions';

import getSchedule from '../../fixtures/schedule';

describe('bathhouse reducer', () => {

  it('handles if type and action is empty', () => {
    const nextState = reducer(undefined, {});

    expect(nextState).to.equal(defaultInitialState);
  });

  it('handles INCORRECT type', () => {
    const initialState = Map();
    const action = {
      type: 'INCORRECT',
      payload: {}
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(Map());
  });

  it('handles FIND_BATHHOUSES_REQUEST', () => {
    const initialState = Map({
      isFetching: false
    });
    const action = {
      type: FIND_BATHHOUSES_REQUEST,
      payload: {}
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(Map({ isFetching: true }));
  });

  it('handles FIND_BATHHOUSES_SUCCESS', () => {
    const bathhouses = fromJS([{ "id": 1, "name": "smth1", "rooms": [ 1 ] }, { "id": 2, "name": "smth2", "rooms": [ 2 ] }]);
    const rooms = fromJS([{ "id": 2, "name": "smth2", "popularity": 6 }, { "id": 1, "name": "smth1", "popularity": 1 } ]);
    const initialState = fromJS({
      bathhouses: [],
      rooms: [],
      valid: [],
      isFetching: true
    });
    const action = {
      type: FIND_BATHHOUSES_SUCCESS,
      payload: {
        bathhouses,
        rooms
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      isFetching: false,
      bathhouses: bathhouses,
      rooms: rooms,
      valid: rooms.map(room => room.get('id'))
    }));
  });

  it('handles FIND_BATHHOUSES_FAILURE', () => {
    const initialState = Map({
      isFetching: true
    });
    const action = {
      type: FIND_BATHHOUSES_FAILURE,
      payload: {}
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(Map({ isFetching: false }));
  });

  it('handles FIND_ROOM_SCHEDULE_REQUEST', () => {
    const initialState = Map({
      isFetching: false
    });
    const action = {
      type: FIND_ROOM_SCHEDULE_REQUEST,
      payload: {}
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(Map({ isFetching: true }));
  });

  it('handles FIND_ROOM_SCHEDULE_SUCCESS', () => {
    const roomId = '036ab322-ebfe-4767-aa76-2d3720c9cc02';
    const schedule = getSchedule();

    const initialState = fromJS({
      isFetching: true,
      rooms: [{
        id: roomId
      }]
    });
    const action = {
      type: FIND_ROOM_SCHEDULE_SUCCESS,
      payload: {
        id: roomId,
        schedule
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      isFetching: false,
      rooms: [{
        id: roomId,
        schedule
      }]
    }));
  });

  it('handles FIND_ROOM_SCHEDULE_FAILURE', () => {
    const initialState = Map({
      isFetching: true
    });
    const action = {
      type: FIND_ROOM_SCHEDULE_FAILURE,
      payload: {}
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(Map({ isFetching: false }));
  });

  it('handles CHANGE_ACTIVE_ROOM', () => {
    const activeRoomId = '219c9b88-d798-4691-8e07-b67404bd222f';
    const initialState = fromJS({
      activeRoomId: undefined
    });
    const action = {
      type: CHANGE_ACTIVE_ROOM,
      payload: {
        id: activeRoomId
      }
    };
    let nextState = reducer(initialState, action);

    expect(nextState.get('activeRoomId')).to.equal(activeRoomId);

    nextState = reducer(nextState, action);

    expect(nextState.get('activeRoomId')).to.equal(undefined);
  });

  it('handles UPDATE_ROOMS', () => {
    const valid = List.of(1, 2, 3);
    const invalid = fromJS({
      distance: [4, 5, 6]
    });
    const initialState = fromJS({
      valid: [5, 6, 7],
      invalid: {
        distance: [1, 2, 3]
      }
    });
    const action = {
      type: UPDATE_ROOMS,
      payload: {
        valid,
        invalid
      }
    };
    let nextState = reducer(initialState, action);

    expect(nextState).to.equal(fromJS({
      valid,
      invalid
    }));
  });
});
