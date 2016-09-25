import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import IconComponent from '../Icon/index.jsx';

import './style.css';

let timer = null;

/**
 * NotificationComponent - notifier component
 * Smart components - none
 * Dumb components - none
 * */
class NotificationComponent extends Component {
  constructor(props) {
    super(props);

    this.handleFinishTimeout = this.handleFinishTimeout.bind(this);
    this.handleClickCloseButton = this.handleClickCloseButton.bind(this);
  }

  componentDidMount() {
    const { notification } = this.props;

    if (notification.has('interval')) {
      timer = setTimeout(this.handleFinishTimeout, notification.get('interval') * 1000);
    }
  }

  componentWillUnmount() {
    if (timer) clearTimeout(timer);
  }

  handleFinishTimeout() {
    clearTimeout(timer);
  }

  handleClickCloseButton(event) {
    event.preventDefault();

    const { notification } = this.props;

    this.props.onCloseNotification(notification.get('uuid'));
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { notification, offset } = this.props;

    const notieClasses = classNames(`Notie Notie--active Notie-type-${notification.get('level')}`);

    return (
      <div className={notieClasses} style={{ marginTop: offset }}>
        <div className="Notie-inner">
          <div className="Notie-content">
            <FormattedMessage id={notification.get('message')} />
          </div>
          <div
            className="Notie-close-button"
            onClick={this.handleClickCloseButton}
          >
            <IconComponent
              name="icon-cancel"
              rate={1.5}
              color="#FFFFFF"
            />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Object} notification - notification object(message, interval, level)
 * @property {Number} offset - offset from top
 * @property {Function} onCloseNotification - event for close of notification
 */
NotificationComponent.propTypes = {
  notification: ImmutablePropTypes.map.isRequired,
  offset: PropTypes.number.isRequired,
  onCloseNotification: PropTypes.func.isRequired,
};

export default NotificationComponent;
