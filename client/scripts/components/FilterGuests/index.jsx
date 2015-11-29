import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import './style.css';

/**
 * FilterGuestsComponent - dumb component, guests filter component. Use third-party library nouislider
 * Smart components - none
 * Dumb components - none
 * */
class FilterGuestsComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps) {
    return !shallowEqualImmutable(this.props, nextProps);
  }

  /**
   * render
   * @return {XML} ReactElement
   */
  render() {
    return (
      <div className="FilterGuests">
        <div className="FilterGuests-wrapper g-clear">
          <h3 className="FilterGuests-heading">
            <FormattedMessage id="filters.guests" />
          </h3>
          <div className="field field-range">
            Фильтр по количеству гостей
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Object} values - min, max and current values
 * @property {Function} onSelect - select guest count value
 */
FilterGuestsComponent.propTypes = {
  values: ImmutablePropTypes.map.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterGuestsComponent;
