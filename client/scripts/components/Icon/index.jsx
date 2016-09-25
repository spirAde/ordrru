import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';

import shallowCompare from 'react-addons-shallow-compare';

import './style.css';

/**
 * IconComponent - component for render svg
 * Smart components - none
 * Dumb components - none
 * */
class IconComponent extends Component {
  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { rate, name, color, className, ...otherProps } = this.props;

    const classes = classNames(className, 'Icon');

    return (
      <svg
        className={classes}
        style={{
          fill: color,
          height: `${rate}em`,
          width: `${rate}em`,
        }}
        {...otherProps}
      >
        <use xlinkHref={`#${name}`} />
      </svg>
    );
  }
}

/**
 * propTypes
 * @property {string} name - name of svg icon
 * @property {string} color - color fill
 */
IconComponent.propTypes = {
  name: PropTypes.string,
  color: PropTypes.string,
  rate: PropTypes.number,
  className: PropTypes.string,
};

IconComponent.defaultProps = {
  rate: 1,
};

export default IconComponent;
