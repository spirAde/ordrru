import { createStore, applyMiddleware, compose } from 'redux';
import { syncHistory } from 'react-router-redux';

export default function configureStore(history, data) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = syncHistory(history);

  const middleware = [reduxRouterMiddleware];

  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../client/scripts/containers/DevTools.jsx');
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      //window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      //persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(createStore);
  }

  const reducers = require('./reducers/index');
  const store = finalCreateStore(reducers.default, data);

  reduxRouterMiddleware.listenForReplays(store);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./reducers/index', () => {
      store.replaceReducer(require('./reducers/index'));
    });
  }

  return store;
}

/*
import { createStore as _createStore, applyMiddleware, compose } from 'redux';

import Immutable from 'immutable';

import { syncHistory } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';

export default function configureStore(history, data) {
  const reduxRouterMiddleware = syncHistory(history);
  const middleware = [thunkMiddleware, reduxRouterMiddleware];

  let finalCreateStore;

  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../client/scripts/containers/DevTools.jsx');
    const createLogger = require('redux-logger');

    // Immutable to plain JS
    const logger = createLogger({
      stateTransformer: (state) => {
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
    finalCreateStore = applyMiddleware(...middleware)(_createStore);
  }

  const reducer = require('./reducers/index');
  const store = finalCreateStore(reducer, data);

  reduxRouterMiddleware.listenForReplays(store);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./reducers/index', () => {
      store.replaceReducer(require('./reducers/index'));
    });
  }

  return store;
}
*/
