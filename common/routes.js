if (typeof require.ensure !== 'function') require.ensure = (defn, chunk) => chunk(require);

import App from '../client/scripts/containers/App.jsx';
import BathhouseItemPage from '../client/scripts/containers/BathhouseItemPage.jsx';

export default function createRoutes(store) {
  const HomeRoute = {
    path: '/',
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/HomePage.jsx'))
      });
    },
  };

  const BathhousesRoute = {
    path: '/bathhouses',
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
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/ManagerLoginPage.jsx'));
      });
    },
  };

  const ManagerDashboardRoute = {
    path: 'dashboard',
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/ManagerDashboardPage.jsx'));
      });
    },
  };

  const ManagerRoute = {
    path: 'manager',
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
