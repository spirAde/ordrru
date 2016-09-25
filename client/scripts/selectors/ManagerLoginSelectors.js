import { createSelector } from 'reselect';

const notificationsSelector = state => state.notification.get('notifications');

const ManagerLoginSelectors = createSelector(
  notificationsSelector,
  notifications => ({
    notifications,
  })
);

export { ManagerLoginSelectors as default };
