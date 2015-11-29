import { createStore, applyMiddleware, compose } from 'redux';

import Immutable from 'immutable';

import thunkMiddleware from 'redux-thunk';
import transitionMiddleware from './middlewares/transition-middleware';

export default function configureStore(reduxReactRouter, getRoutes, createHistory, data) {
  const middleware = [transitionMiddleware, thunkMiddleware];

  let finalCreateStore;

  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../client/scripts/containers/DevTools.jsx');
    const createLogger = require('redux-logger');

    // Immutable to plain JS
    const logger = createLogger({
      transformer: (state) => {
        const newState = {};
        for (const key of Object.keys(state)) {
          if (Immutable.Iterable.isIterable(state[key])) {
            newState[key] = state[key].toJS();
          } else {
            newState[key] = state[key];
          }
        }
        return newState;
      }
    });

    finalCreateStore = compose(
      applyMiddleware(...middleware, logger),
      DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(createStore);
  }

  finalCreateStore = reduxReactRouter({ getRoutes, createHistory })(finalCreateStore);

  const reducer = require('./reducers/index');
  const store = finalCreateStore(reducer, data);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./reducers/index', () => {
      store.replaceReducer(require('./reducers/index'));
    });
  }

  return store;
}
