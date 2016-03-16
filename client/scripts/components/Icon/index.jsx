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
    const height = this.props.rate;
    const width = this.props.rate;

    return (
      <svg
        className="Icon"
        style={{
          fill: this.props.color,
          height: `${height}em`,
          width: `${width}em`,
          ...this.props.style,
        }}
      >
        <use xlinkHref={`#${this.props.name}`}></use>
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
