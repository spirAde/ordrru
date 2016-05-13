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
    const { children, active } = this.props;

    const backgroundDefaultStyle = {
      display: 'block',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 10,
    };

    const foregroundDefaultStyle = {
      display: 'table',
      width: '100%',
      height: '100%',
      textAlign: 'center',
      zIndex: 20,
      color: 'white',
    };

    const messageDefaultStyle = {
      display: 'table-cell',
      verticalAlign: 'middle',
    };

    const contentStyle = Object.assign({
      position: 'relative',
      opacity: 1,
    });

    const loaderStyle = { position: 'relative' };

    const classes = classNames({
      'loading-container': true,
    }, this.props.className);

    // use like overlay
    if (children) {
      return (
        <div style={loaderStyle}>
          <div className="Loader__content" style={contentStyle}>
            {children}
          </div>
          {
            active ?
              <div className="Loader__background" style={backgroundDefaultStyle}>
                <div className="Loader__foreground" style={foregroundDefaultStyle}>
                  <div className="Loader__message" style={messageDefaultStyle}>
                    <div className={classes}>
                      <div className="loading"></div>
                      <div className="loading-text">
                        <FormattedMessage id="loading" />
                      </div>
                    </div>
                  </div>
                </div>
              </div> : null
          }
        </div>
      );
    }

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
  children: PropTypes.array,
};

LoaderComponent.defaultProps = {
  active: true,
};

export default LoaderComponent;
