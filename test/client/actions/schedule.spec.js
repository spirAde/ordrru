import chai from 'chai'
import chaiImmutable from 'chai-immutable';

import { List, Map, fromJS } from 'immutable';

import { applyMiddleware } from 'redux';
import configureStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';

import nock from 'nock';

import { initialState as defaultInitialState, reducer } from '../../../common/reducers/schedule';
import { findRoomScheduleIfNeed } from '../../../client/scripts/actions/schedule-actions';
import { FIND_ROOM_SCHEDULE_REQUEST, FIND_ROOM_SCHEDULE_SUCCESS,
  FIND_ROOM_SCHEDULE_FAILURE } from '../../../client/scripts/actions/schedule-actions';

const middlewares = [ thunkMiddleware ];
const mockStore = configureStore(middlewares);

const expect = chai.expect;

chai.use(chaiImmutable);

describe('schedule actions', () => {

  it('handles FIND_ROOM_SCHEDULE_SUCCESS when fetching schedules for room', (done) => {
    const roomId = '036ab322-ebfe-4767-aa76-2d3720c9cc02';
    nock('http://localhost:3000/')
      .get('/api/schedules?filter=%7B%22where%22:%7B%22roomId%22:%22036ab322-ebfe-4767-aa76-2d3720c9cc02%22%7D,%22order%22:%22date%20ASC%22%7D')
      .reply(200, [{ periods: [ {periodId: 0, enable: true}, {periodId: 3, enable: true}] }] );

    const expectedActions = [
      { type: FIND_ROOM_SCHEDULE_REQUEST, payload: {} },
      { type: FIND_ROOM_SCHEDULE_SUCCESS, payload: { schedule: [{ periods: [{periodId: 0, enable: true}, {periodId: 3, enable: true}] }], id: roomId } }
    ];

    const store = mockStore(defaultInitialState, expectedActions, done);
    store.dispatch(findRoomScheduleIfNeed(roomId));
  });

  it('handles FIND_ROOM_SCHEDULE_FAILURE when fetching schedules has been failed', (done) => {
    const roomId = '036ab322-ebfe-4767-aa76-2d3720c9cc02';
    nock('http://localhost:3000/')
      .get('/api/schedules?filter=%7B%22where%22:%7B%22roomId%22:%22036ab322-ebfe-4767-aa76-2d3720c9cc02%22%7D,%22order%22:%22date%20ASC%22%7D')
      .replyWithError({ error: new Error('request to http://localhost:3000/api/schedules failed') });

    const expectedActions = [
      { type: FIND_ROOM_SCHEDULE_REQUEST, payload: {} },
      { type: FIND_ROOM_SCHEDULE_FAILURE, payload: { error: new Error('request to http://localhost:3000/api/schedules failed') } }
    ];

    const store = mockStore(defaultInitialState, expectedActions, done);
    store.dispatch(findRoomScheduleIfNeed(roomId));
  });
});