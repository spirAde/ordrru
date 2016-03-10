import { fromJS } from 'immutable';
import isNull from 'lodash/isNull';

import createReducer from '../utils/create-reducer';

import configs from '../../common/data/configs.json';

import { CHANGE_ACTIVE_CITY } from '../../client/scripts/actions/city-actions';

export const initialState = fromJS({
  isFetching: false,
  activeCityId: null,
  cities: configs.cities,
});

export const reducer = createReducer({
  [CHANGE_ACTIVE_CITY](state, action) {
    return state.set('activeCityId', action.payload.id);
  },
}, initialState);
