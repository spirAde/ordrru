import { Map } from 'immutable';
import assign from 'lodash/assign';

import uuid from 'uuid';

export const UPDATE_NOTIFICATIONS_STACK = 'UPDATE_NOTIFICATIONS_STACK';

function updateNotificationsStack(notifications) {
  return {
    type: UPDATE_NOTIFICATIONS_STACK,
    payload: {
      notifications,
    },
  };
}

export function addNotification(notification) {
  return (dispatch, getState) => {
    const state = getState();
    const notifications = state.notification.get('notifications');

    return dispatch(updateNotificationsStack(
			notifications.push(Map(assign({}, notification, { uuid: uuid.v4() })))
		));
  };
}

export function removeNotification(uuid) {
  return (dispatch, getState) => {
    const state = getState();
    const notifications = state.notification.get('notifications');
    const fixedNotifications = notifications.filter(
      notification => notification.get('uuid') !== uuid
    );

    return dispatch(updateNotificationsStack(fixedNotifications));
  };
}
