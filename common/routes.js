if (typeof require.ensure !== 'function') require.ensure = (defn, chunk) => chunk(require);

import { injectAsyncReducers } from './configure-store';

import App from '../client/scripts/containers/App.jsx';
import BathhouseItemPage from '../client/scripts/containers/BathhouseItemPage.jsx';

export default function createRoutes(store) {
  const HomeRoute = {
    path: '/',
    getComponents(nextState, callback) {
      require.ensure([], require => {
        const HomePage = require('../client/scripts/containers/HomePage.jsx');

        const cityReducer = require('./reducers/city');
        const userReducer = require('./reducers/user');

        injectAsyncReducers(store, {
          city: cityReducer.reducer,
          user: userReducer.reducer,
        });

        callback(null, HomePage)
      });
    },
  };

  const BathhousesRoute = {
    path: '/bathhouses',
    getComponents(nextState, callback) {
      require.ensure([], require => {
        const BathhousesListPage = require('../client/scripts/containers/BathhousesListPage.jsx');

        const bathhouseReducer = require('./reducers/bathhouse');
        const scheduleReducer = require('./reducers/schedule');
        const cityReducer = require('./reducers/city');
        const userReducer = require('./reducers/user');
        const filterReducer = require('./reducers/filter');

        injectAsyncReducers(store, {
          bathhouse: bathhouseReducer.reducer,
          schedule: scheduleReducer.reducer,
          city: cityReducer.reducer,
          user: userReducer.reducer,
          filter: filterReducer.reducer,
        });

        callback(null, BathhousesListPage);
      });
    },
  };

  const BathhouseRoute = {
    path: '/bathhouse/:id',
    component: BathhouseItemPage,
  };

  return {
    component: App,
    childRoutes: [
      HomeRoute,
      BathhousesRoute,
      BathhouseRoute,
    ],
  };
}
/*
import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { injectAsyncReducers } from './configure-store';

import App from '../client/scripts/containers/App.jsx';
import BathhouseItemPage from '../client/scripts/containers/BathhouseItemPage.jsx';
import NotFoundPage from '../client/scripts/containers/NotFoundPage.jsx';

export default function getRoutes(store) {
  return (
    <Route>
      <Route path="/" component={App}>
        <IndexRoute
          name="home"
          component={require('react-router-proxy?name=home!../client/scripts/containers/HomePage.jsx')}
          onEnter={(nextState, replace, callback) => {
            const cityReducer = require('./reducers/city');
            const userReducer = require('./reducers/user');

            injectAsyncReducers(store, {
              city: cityReducer.reducer,
              user: userReducer.reducer,
            });

            callback(null);
          }}
        />
        <Route
          path="bathhouses"
          name="bathhouses"
          component={require('react-router-proxy?name=bathhouses!../client/scripts/containers/BathhousesListPage.jsx')}
          onEnter={(nextState, replace, callback) => {
            const bathhouseReducer = require('./reducers/bathhouse');
            const scheduleReducer = require('./reducers/schedule');
            const cityReducer = require('./reducers/city');
            const userReducer = require('./reducers/user');
            const filterReducer = require('./reducers/filter');

            injectAsyncReducers(store, {
              bathhouse: bathhouseReducer.reducer,
              schedule: scheduleReducer.reducer,
              city: cityReducer.reducer,
              user: userReducer.reducer,
              filter: filterReducer.reducer,
            });

            callback(null);
          }}
        >
          <Route path=":id" component={BathhouseItemPage} name="bathhouse" />
        </Route>
        <Route path="manager" name="manager">
          <Route path="login" name="login" />
          <Route path="bathhouse" name="manager-bathhouse" />
          <Route path="carwash" name="manager-carwash" />
        </Route>
        <Route path="*" component={NotFoundPage} status={404} name="nothing" />
      </Route>
    </Route>
  );
}
*/
