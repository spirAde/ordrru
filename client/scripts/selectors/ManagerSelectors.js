import { createSelector } from 'reselect';

const notificationsSelector = state => state.notification.get('notifications');

export const ManagerSelectors = createSelector(
  notificationsSelector,
  (notifications) => {
    return {
      notifications,
    };
  }
);
