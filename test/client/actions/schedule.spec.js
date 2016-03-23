import chai from 'chai'
import chaiImmutable from 'chai-immutable';

import { List, Map, fromJS } from 'immutable';

import { applyMiddleware } from 'redux';
import configureStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';

import moment from 'moment';

import { initialState as defaultInitialState, reducer } from '../../../common/reducers/schedule';
import { findRoomScheduleIfNeed } from '../../../client/scripts/actions/schedule-actions';
import { FIND_ROOM_SCHEDULE_REQUEST, FIND_ROOM_SCHEDULE_SUCCESS,
  FIND_ROOM_SCHEDULE_FAILURE } from '../../../client/scripts/actions/schedule-actions';

import { getModelDataFor } from '../../utils/index';

const middlewares = [ thunkMiddleware ];
const mockStore = configureStore(middlewares);

const expect = chai.expect;

chai.use(chaiImmutable);

describe('schedule actions', () => {

  it('handles FIND_ROOM_SCHEDULE_SUCCESS when fetching schedules for room', (done) => {
    const roomId = 'ae2c06b8-cdf7-48d1-aa6f-0a874aead443';

    const currentDate = moment.unix();
    const schedule = getModelDataFor('Schedule', { roomId });

    const expectedActions = [
      {
        type: FIND_ROOM_SCHEDULE_REQUEST,
        payload: {}
      },
      {
        type: FIND_ROOM_SCHEDULE_SUCCESS,
        payload: {
          schedule: schedule,
          id: roomId
        }
      }
    ];

    const store = mockStore(defaultInitialState);
    store.dispatch(findRoomScheduleIfNeed(roomId))
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).to.equal(expectedActions[0]);
        expect(actions[1].type).to.deep.equal(expectedActions[1].type);
        expect(actions[1].payload.schedule).to.deep.equal(expectedActions[1].payload.schedule);
        expect(actions[1].payload.id).to.deep.equal(expectedActions[1].payload.id);
      }).then(done).catch(done);
  });

  /*it('handles FIND_ROOM_SCHEDULE_FAILURE when fetching schedules has been failed', (done) => {
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
  });*/
});