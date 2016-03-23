import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';

import io from 'socket.io-client';

import thunk from 'redux-thunk';

import { Iterable } from 'immutable';

import createSocketMiddleware from './middlewares/socket-middleware';

export default function configureStore(history, initialState) {

  const middleware = [thunk, routerMiddleware(history)];

  let finalCreateStore;

  if (__CLIENT__) {
    const socket = io(`${__SOCKET_PROTOCOL__}://${__SOCKET_HOST__}:${__SOCKET_PORT__}`);
    const socketMiddleware = createSocketMiddleware(socket);

    middleware.push(socketMiddleware);
  }
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../client/scripts/containers/DevTools.jsx');
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
      DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(createStore);
  }

  const reducers = require('./reducers/index');
  const store = finalCreateStore(reducers, initialState);

  //reduxRouterMiddleware.listenForReplays(store);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./reducers/index', () => {
      store.replaceReducer(require('./reducers/index'));
    });
  }

  return store;
}
