import { createSelector } from 'reselect';

const loginErrorSelector = state => state.manager.get('loginError');

export const ManagerLoginSelectors = createSelector(
  loginErrorSelector,
  (loginError) => {
    return {
      loginError,
    };
  }
);
