import { fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { SET_CURRENT_DATE, SET_CURRENT_PERIOD, CHANGE_VIEWPORT,
  SET_DEVICE } from '../../client/scripts/actions/application-actions';

export const initialState = fromJS({
  date: null,
  period: null,
  socket: null,
  device: {
    isMobile: false,
    viewport: {
      height: null,
      width: null
    },
  },
});

export const reducer = createReducer({
  [SET_CURRENT_DATE](state, action) {
    return state.set('date', action.payload.date);
  },
  [SET_CURRENT_PERIOD](state, action) {
    return state.set('period', action.payload.period);
  },
  [CHANGE_VIEWPORT](state, action) {
    return state
      .setIn(['device', 'viewport'], fromJS(action.payload.viewport));
  },
  [SET_DEVICE](state, action) {
    return state;
  },
}, initialState);
