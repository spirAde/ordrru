import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

import { reducer as bathhouse } from './bathhouse';
import { reducer as city } from './city';
import { reducer as filter } from './filter';
import { reducer as schedule } from './schedule';
import { reducer as user } from './user';

const rootReducer = combineReducers({
  bathhouse,
  city,
  filter,
  schedule,
  user,
  router: routerStateReducer
});

export default rootReducer;
