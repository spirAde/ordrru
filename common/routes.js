import React from 'react';
import { Route } from 'react-router';

import HomePage from '../client/scripts/containers/HomePage.jsx';
import BathhouseListPage from '../client/scripts/containers/BathhousesListPage.jsx';
import BathhouseItemPage from '../client/scripts/containers/BathhouseItemPage.jsx';
import NotFoundPage from '../client/scripts/containers/NotFoundPage.jsx';

export default function getRoutes() {
  return (
    <Route>
      <Route path="/" component={HomePage} name="root" />
      <Route path="bathhouses" component={BathhouseListPage} name="bathhouses" />
      <Route path="bathhouses/:id" component={BathhouseItemPage} name="bathhouse" />
      /*<Route path="manager" name="manager">
        <Route path="login" name="login" />
        <Route path="bathhouse" name="manager-bathhouse" />
        <Route path="carwash" name="manager-carwash" />
      </Route>*/
      <Route path="*" component={NotFoundPage} status={404} name="nothing" />
    </Route>
  );
}
