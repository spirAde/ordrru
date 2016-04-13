import React, { Component, PropTypes } from 'react';

import './style.css';

/**
 * IconComponent - component for render svg
 * Smart components - none
 * Dumb components - none
 * */
class IconComponent extends Component {

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { rate, name, style, color, ...otherProps } = this.props;

    return (
      <svg
        className="Icon"
        style={{
          fill: color,
          height: `${rate}em`,
          width: `${rate}em`,
          ...style,
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
  style: PropTypes.object,
};

IconComponent.defaultProps = {
  rate: 1,
};

export default IconComponent;
