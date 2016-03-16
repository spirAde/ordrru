import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import './style.css';

/**
 * LoaderComponent - loading spinner component
 * Smart components - none
 * Dumb components - none
 * */
class LoaderComponent extends Component {

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const classes = classNames({
      'loading-container': true,
    }, this.props.className);

    return (
      <div className={classes}>
        <div className="loading"></div>
        <div className="loading-text">
          <FormattedMessage id="loading" />
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {boolean} active - active
 */
LoaderComponent.propTypes = {
  active: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

LoaderComponent.defaultProps = {
  active: true,
};

export default LoaderComponent;
