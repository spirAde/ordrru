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

  const ManagerRoute = {
    path: '/manager',
  };

  const ManagerLoginRoute = {
    path: '/manager/login',
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/ManagerLoginPage.jsx'));
      });
    },
  };

  const ManagerDashboardRoute = {
    path: '/manager/dashboard',
    getComponents(nextState, callback) {
      require.ensure([], require => {
        callback(null, require('../client/scripts/containers/ManagerDashboardPage.jsx'));
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
      ManagerLoginRoute,
      ManagerDashboardRoute,
    ],
  };
}
