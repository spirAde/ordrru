import { trim } from 'lodash';

import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import DebounceInput from 'react-debounce-input';

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

    this.handleChange = this.handleChange.bind(this);
  }

  /**
   * handle debounce value from input
   * */
  handleChange(event) {
    event.preventDefault();
    this.props.onSelect(trim(event.target.value));
  }

  /**
   * render
   * @return {XML} ReactElement
   */
  render() {
    const { value } = this.props;

    return (
      <div className="FilterSearchName">
        <div className="FilterSearchName-wrapper g-clear">
          <h3 className="FilterSearchName-heading">
            <FormattedMessage id="filters.searchName" />
          </h3>
          <DebounceInput
            className="FilterSearchName-input"
            onChange={this.handleChange}
            debounceTimeout={750}
            value={value.get('text') || ''}
          />
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
  onSelect: PropTypes.func.isRequired,
};

export default FilterSearchNameComponent;
