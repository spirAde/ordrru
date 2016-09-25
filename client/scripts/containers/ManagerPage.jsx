import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import NotificationsStackComponent from '../components/NotificationsStack/index.jsx';
import { removeNotification } from '../actions/notification-actions';

import ManagerSelectors from '../selectors/ManagerSelectors';

/**
 * ManagerPage - main manager page
 * Smart components - none
 * Dumb components - none
 * */
class ManagerPage extends Component {
  constructor(props) {
    super(props);

    this.handleCloseNotification = this.handleCloseNotification.bind(this);
  }

	/**
	 * handleCloseNotification - handle uuid for notification
	 * */
  handleCloseNotification(uuid) {
    this.props.removeNotification(uuid);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { notifications } = this.props;

    return (
      <div>
        <Helmet
          titleTemplate="%s | Manager"
        />
        <NotificationsStackComponent
          notifications={notifications}
          onCloseNotification={this.handleCloseNotification}
        />
        {this.props.children}
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array|Object} children - children
 * @property {Array.<Object>} notifications - list of notifications
 * @property {Function} removeNotification - remove notification from list
 */
ManagerPage.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  notifications: ImmutablePropTypes.list.isRequired,
  removeNotification: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
export default connect(ManagerSelectors, {
  removeNotification,
})(ManagerPage);
