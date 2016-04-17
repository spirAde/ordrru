import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import { reducer as application } from './application';

export default function configureReducers(asyncReducers) {
  return combineReducers({
    routing: routerReducer,
    application,
    ...asyncReducers,
  });
}
