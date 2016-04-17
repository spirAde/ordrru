import { has, map, filter, keys, assign, forEach } from 'lodash';

import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';

import io from 'socket.io-client';
import thunk from 'redux-thunk';

import { Iterable } from 'immutable';

import configureReducers from './reducers/index';
import createSocketMiddleware from './middlewares/socket-middleware';

export function configureStore(history, initialState = {}) {

  const middleware = [thunk, routerMiddleware(history)];

  let finalCreateStore;

  if (__CLIENT__) {
    const socket = io(`${__SOCKET_PROTOCOL__}://${__SOCKET_HOST__}:${__SOCKET_PORT__}`);
    const socketMiddleware = createSocketMiddleware(socket);

    middleware.push(socketMiddleware);
  }
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../client/scripts/components/DevTools/index.jsx');
    const createLogger = require('redux-logger');

    // Immutable to plain JS
    const logger = createLogger({
      stateTransformer: (state) => {
        if (Iterable.isIterable(state)) return state.toJS();
        else return state;
      },
    });

    finalCreateStore = compose(
      applyMiddleware(...middleware, logger),
      window.devToolsExtension ? window.devToolsExtension() : f => f,
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(createStore);
  }

  const reducers = configureReducers();
  const store = finalCreateStore(reducers, initialState);

  store.asyncReducers = {};

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./reducers/index', () => {
      store.replaceReducer(require('./reducers/index'));
    });
  }

  return store;
}

export function injectAsyncReducers(store, asyncReducers) {
  console.log('injectAsyncReducers', __SERVER__);

  const state = store.getState();

  forEach(
    filter(keys(asyncReducers), name => !has(state, name)),
    name => {
      store.asyncReducers[name] = asyncReducers[name];
    }
  );

  // TODO: add module hot accept
  store.replaceReducer(configureReducers(store.asyncReducers));
}