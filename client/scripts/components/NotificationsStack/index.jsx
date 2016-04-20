import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import NotificationComponent from '../Notification/index.jsx';

/**
 * NotificationsStackComponent - parent for all notification components
 * Smart components - none
 * Dumb components - none
 * */
class NotificationsStackComponent extends Component {
  constructor(props) {
    super(props);

    this.handleCloseNotification = this.handleCloseNotification.bind(this);
  }

  handleCloseNotification(uuid) {
    this.props.onCloseNotification(uuid);
  }

  renderNotificationItems() {
    const { notifications, visibleCount } = this.props;

    return notifications.take(visibleCount).map((notification, index) => {
      const topOffset = index * 70; // TODO: calculate automatically
      return (
        <NotificationComponent
          key={notification.get('uuid')}
          notification={notification}
          offset={topOffset}
          onCloseNotification={this.handleCloseNotification}
        />
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const notificationItems = this.renderNotificationItems();

    return (
      <div>
        {notificationItems}
      </div>
    );
  }
}

NotificationsStackComponent.defaultProps = {
  visibleCount: 3,
};

/**
 * propTypes
 * @property {Array.<Object>} notifications - list of notifications
 * @property {Number} visibleCount - count visible elements
 * @property {Function} onCloseNotification - close notification event
 */
NotificationsStackComponent.propTypes = {
  notifications: ImmutablePropTypes.list.isRequired,
  visibleCount: PropTypes.number,
  onCloseNotification: PropTypes.func.isRequired,
};

export default NotificationsStackComponent;
