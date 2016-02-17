import debounce from 'lodash/debounce';

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import './style.css';

/**
 * FilterNameComponent - dumb component, room or bathhouse name filter component.
 * Smart components - none
 * Dumb components - none
 * */
class FilterSearchNameComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.handleKeyUp = debounce(this.handleKeyUp.bind(this), 750);
  }

  /**
   * handle keyup event and pass text value to parent component
   * {Object} event - SyntheticEvent
   * @return {void}
   * */
  handleKeyUp(event) {
    this.props.onSelect(event.target.value);
  }

  /**
   * render
   * @return {XML} ReactElement
   */
  render() {
    return (
      <div className="FilterSearchName">
        <div className="FilterSearchName-wrapper g-clear">
          <h3 className="FilterSearchName-heading">
            <FormattedMessage id="filters.searchName" />
          </h3>
          <input className="FilterSearchName-input" type="text" onKeyUp={this.handleKeyUp}/>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Object} value - searched text
 * @property {Function} onSelect - select searched text
 */
FilterSearchNameComponent.propTypes = {
  value: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterSearchNameComponent;
