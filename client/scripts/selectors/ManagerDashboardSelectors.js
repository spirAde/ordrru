import { createSelector } from 'reselect';

const authSelector = state => state.manager.get('auth');

export const ManagerDashboardSelectors = createSelector(
  authSelector,
  (auth) => {
    return {
      auth,
    };
  }
);
