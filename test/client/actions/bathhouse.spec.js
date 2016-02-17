import chai from 'chai'
import chaiImmutable from 'chai-immutable';

import { List, Map, fromJS } from 'immutable';
import pluck from 'lodash/collection/pluck';

import { applyMiddleware } from 'redux';
import configureStore from 'redux-mock-store';
import thunkMiddleware from 'redux-thunk';

import nock from 'nock';

import { initialState as defaultInitialState, reducer } from '../../../common/reducers/bathhouse';
import { findBathhousesAndRooms, updateRooms, changeActiveRoom } from '../../../client/scripts/actions/bathhouse-actions';
import { FIND_BATHHOUSES_FAILURE, FIND_BATHHOUSES_REQUEST, FIND_BATHHOUSES_SUCCESS,
  CHANGE_ACTIVE_ROOM, UPDATE_ROOMS } from '../../../client/scripts/actions/bathhouse-actions';

import { CHANGE_DATETIME_FILTER_VALUES, CHANGE_DISTANCE_FILTER_VALUE, CHANGE_GUEST_FILTER_VALUE,
  CHANGE_SEARCH_NAME_FILTER_VALUE, CHANGE_OPTIONS_FILTER_VALUE, CHANGE_PREPAYMENT_FILTER_VALUE,
  CHANGE_PRICE_FILTER_VALUES, CHANGE_TYPES_FILTER_VALUE } from '../../../client/scripts/actions/filter-actions';

import configs from '../../../common/data/configs.json';

const middlewares = [ thunkMiddleware ];
const mockStore = configureStore(middlewares);

const expect = chai.expect;

chai.use(chaiImmutable);

const defaultCityId = pluck(configs.cities, 'id')[0];

describe('bathhouse actions', () => {

  afterEach(() => {
    nock.cleanAll();
  });

  it('handles FIND_BATHHOUSES_SUCCESS when fetching bathhouses has been done', (done) => {
    nock('http://localhost:3000/')
      .get('/api/bathhouses?filter=%7B%22include%22:%22rooms%22,%22where%22:%7B%22cityId%22:%22' + defaultCityId + '%22,%22isActive%22:true%7D%7D')
      .reply(200, [
        { id: 1, name: 'smth1', rooms: [{ id: 1, name: 'smth1', popularity: 1 }] },
        { id: 2, name: 'smth2', rooms: [{ id: 2, name: 'smth2', popularity: 6 }] }
      ]);

    const initialState = {
      filter: fromJS({
        filters: {
          sorting: [{ name: 'popularity', checked: true, isDesc: true }]
        }
      })
    };

    const expectedActions = [
      { type: FIND_BATHHOUSES_REQUEST, payload: {} },
      { type: FIND_BATHHOUSES_SUCCESS, payload: {
        bathhouses: fromJS([
          { id: 1, name: 'smth1', rooms: [1] },
          { id: 2, name: 'smth2', rooms: [2] }
        ]),
        rooms: fromJS([
          { id: 2, name: 'smth2', popularity: 6 },
          { id: 1, name: 'smth1', popularity: 1 }
        ])
      }}
    ];

    const store = mockStore(initialState, expectedActions, done);
    store.dispatch(findBathhousesAndRooms(defaultCityId));
  });

  it('handles FIND_BATHHOUSES_FAILURE when fetching bathhouses has been failed', (done) => {
    nock('http://localhost:3000/')
      .get('/api/bathhouses?filter=%7B%22include%22:%22rooms%22,%22where%22:%7B%22cityId%22:%22' + defaultCityId + '%22,%22isActive%22:true%7D%7D')
      .replyWithError({ error: new Error('request to http://localhost:3000/api/bathhouses failed') });

    const expectedActions = [
      { type: FIND_BATHHOUSES_REQUEST, payload: {} },
      { type: FIND_BATHHOUSES_FAILURE, payload: { error: new Error('request to http://localhost:3000/api/bathhouses failed') } }
    ];

    const store = mockStore(defaultInitialState, expectedActions, done);
    store.dispatch(findBathhousesAndRooms(defaultCityId));
  });

  it('handles UPDATE_ROOMS rooms', () => {
    const valid = List.of('1a1a1f58-1078-4bca-a2d4-bc00c3948002', '06277a33-446e-4929-b197-1ccdae31f8bc', '41a8f37a-ce06-4735-bbf1-cc127db45278');
    const invalid = fromJS({
      distance: ['23bc75a7-d4f7-43cf-acc1-d842ea239cd2']
    });
    const expectedAction = {
      type: UPDATE_ROOMS,
      payload: {
        valid,
        invalid
      }
    };
    expect(updateRooms(valid, invalid)).to.deep.equal(expectedAction);
  });

  it('handles CHANGE_ACTIVE_ROOM change active room id', () => {
    const id = '219c9b88-d798-4691-8e07-b67404bd222f';
    const expectedAction = {
      type: CHANGE_ACTIVE_ROOM,
      payload: {
        id
      }
    };
    expect(changeActiveRoom(id)).to.deep.equal(expectedAction);
  });
});