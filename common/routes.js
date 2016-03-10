import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from '../client/scripts/containers/App.jsx';
import HomePage from '../client/scripts/containers/HomePage.jsx';
import BathhouseListPage from '../client/scripts/containers/BathhousesListPage.jsx';
import BathhouseItemPage from '../client/scripts/containers/BathhouseItemPage.jsx';
import NotFoundPage from '../client/scripts/containers/NotFoundPage.jsx';

export default function getRoutes(store) {
  const requireLogin = (nextState, replace, cb) => {
    function checkAuth() {
      const { auth: { user }} = store.getState();
      if (!user) {
        replace('/');
      }
      cb();
    }
  };

  return (
    <Route>
      <Route path="/" component={App}>
        <IndexRoute component={HomePage} name="home" />
        <Route path="bathhouses" component={BathhouseListPage} name="bathhouses" />
        <Route path="bathhouses/:id" component={BathhouseItemPage} name="bathhouse" />
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
