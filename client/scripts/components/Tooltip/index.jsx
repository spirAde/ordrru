import React, { Component, PropTypes } from 'react';

import './style.css';

/**
 * TooltipComponent - tooltip
 * Smart components - none
 * Dumb components - none
 * */
class TooltipComponent extends Component {

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div className="Tooltip">
				<div className="Tooltip-content">
					{this.props.children}
				</div>
      </div>
    );
  }
}

/**
 * propTypes
 */
TooltipComponent.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(React.PropTypes.node),
    PropTypes.node,
  ]),
};

export default TooltipComponent;
