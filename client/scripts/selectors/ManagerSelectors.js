import { createSelector } from 'reselect';

const notificationsSelector = state => state.notification.get('notifications');

const ManagerSelectors = createSelector(
  notificationsSelector,
  notifications => ({
    notifications,
  })
);

export { ManagerSelectors as default };
