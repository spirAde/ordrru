import { combineReducers } from 'redux';

import { routerReducer } from 'react-router-redux';
import { reducer as application } from './application';

import { reducer as city } from './city';
import { reducer as filter } from './filter';
import { reducer as bathhouse } from './bathhouse';
import { reducer as schedule } from './schedule';
import { reducer as user } from './user';

import { reducer as manager } from './manager';
import { reducer as order } from './order';
import { reducer as notification } from './notification';

export default function configureReducers() {
  return combineReducers({
    routing: routerReducer,
    application,
    city,
    filter,
    bathhouse,
    schedule,
    user,
  });
}

export default function configureManagerReducers() {
  return combineReducers({
    routing: routerReducer,
    application,
    bathhouse,
    schedule,
    order,
    manager,
    notification,
  });
}