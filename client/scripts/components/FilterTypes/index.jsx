import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import classNames from 'classnames';

import './style.css';

/**
 * FilterTypeComponent - dumb component, types filter component.
 * Smart components - none
 * Dumb components - none
 * */
class FilterTypeComponent extends Component {

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
   * handleChangeType - handle change indexes. pass type and checked status to parent component
   * @param {Object} value - type object
   * @param {Object} event - event object
   * */
  handleChangeType(value, event) {
    event.preventDefault();
    this.props.onSelect(value.set('checked', !value.get('checked')));
  }

  /**
   * renderTypes - render types
   * @param {Array.<Object>} types - list of types
   * @return {Array.<Element>} - types elements
   * */
  renderTypes(types) {
    return types.map((type, index) => {
      const classes = classNames({
        'FilterType-field-label': true,
        'FilterType-field-label--checked': type.get('checked')
      });
      const name = type.get('name');
      return (
        <div
          className="FilterType-field FilterType-field-checkbox"
          onClick={this.handleChangeType.bind(this, type)}
          key={index}
        >
          <input id={`type-${name}`} className="FilterType-field-input" type="checkbox" />
          <label className={classes} htmlFor={`type-${name}`}>
            <FormattedMessage id={`bathhouseType.${name}`} />
          </label>
        </div>
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { values } = this.props;
    const types = this.renderTypes(values);

    return (
      <div className="FilterType">
        <div className="FilterType-wrapper g-clear">
          <h3 className="FilterType-heading">
            <FormattedMessage id="filters.type" />
          </h3>
          {types}
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} values - list of types
 * @property {Function} onSelect - select type
 */
FilterTypeComponent.propTypes = {
  values: ImmutablePropTypes.list.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterTypeComponent;
