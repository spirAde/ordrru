import { combineReducers } from 'redux';
import { routeReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect';

import { reducer as application } from './application';
import { reducer as bathhouse } from './bathhouse';
import { reducer as city } from './city';
import { reducer as filter } from './filter';
import { reducer as schedule } from './schedule';
import { reducer as user } from './user';

export default combineReducers({
  routing: routeReducer,
  reduxAsyncConnect,
  application,
  bathhouse,
  city,
  filter,
  schedule,
  user
});
