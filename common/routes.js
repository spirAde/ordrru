if (typeof require.ensure !== 'function') require.ensure = (defn, chunk) => chunk(require);

import App from '../client/scripts/containers/App.jsx';
import BathhouseItemPage from '../client/scripts/containers/BathhouseItemPage.jsx';

export default function createRoutes(store) {
  const HomeRoute = {
    path: '/',
    //component: HomePage,
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/HomePage.jsx'))
      });
    },
  };

  const BathhousesRoute = {
    path: '/bathhouses',
    //component: BathhousesListPage,
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/BathhousesListPage.jsx'));
      });
    },
  };

  const BathhouseRoute = {
    path: '/bathhouse/:id',
    component: BathhouseItemPage,
  };

  const ManagerLoginRoute = {
    path: 'login',
    //component: ManagerLoginPage,
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/ManagerLoginPage.jsx'));
      });
    },
  };

  const ManagerDashboardRoute = {
    path: 'dashboard',
    //component: ManagerDashboardPage,
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/ManagerDashboardPage.jsx'));
      });
    },
    onEnter(nextState, replace, callback) {
      const state = store.getState();
      if (!state.manager.get('isAuthenticated')) replace({ pathname: '/manager/login' });

      callback();
    },
  };

  const ManagerRoute = {
    path: 'manager',
    //component: ManagerPage,
    childRoutes: [
      ManagerLoginRoute,
      ManagerDashboardRoute
    ],
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/ManagerPage.jsx'));
      });
    },
  };

  return {
    component: App,
    childRoutes: [
      HomeRoute,
      BathhousesRoute,
      BathhouseRoute,

      ManagerRoute,
    ],
  };
}
