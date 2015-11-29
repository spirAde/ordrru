import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import './style.css';

/**
 * FilterDateTimeComponent - dumb component, datetime filter component.
 * Smart components - none
 * Dumb components - none
 * */
class FilterDateTimeComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * render
   * @return {XML} ReactElement
   */
  render() {
    return (
      <div className="FilterDateTime">
        <div className="FilterDateTime-wrapper g-clear">
          <h3 className="FilterDateTime-heading">
            <FormattedMessage id="filters.datetime" />
          </h3>
          <div className="field field-datetime">
            Фильтр даты и времени
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Object} values - list of options
 * @property {Function} onSelect - select option
 */
FilterDateTimeComponent.propTypes = {
  values: ImmutablePropTypes.map.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterDateTimeComponent;
