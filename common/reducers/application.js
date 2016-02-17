import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { SET_CURRENT_DATE, SET_CURRENT_PERIOD } from '../../client/scripts/actions/application-actions';

export const initialState = fromJS({
  date: null,
  period: null
});

export const reducer = createReducer({
  [SET_CURRENT_DATE](state, action) {
    return state.set('date', action.payload.date);
  },
  [SET_CURRENT_PERIOD](state, action) {
    return state.set('period', action.payload.period);
  },
}, initialState);
