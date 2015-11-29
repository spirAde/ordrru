import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import classNames from 'classnames';

import './style.css';

/**
 * FilterOptionsComponent - dumb component, options filter component.
 * Smart components - none
 * Dumb components - none
 * */
class FilterOptionsComponent extends Component {

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
   * handleChangeOption - handle change options. pass option and checked status to parent component
   * @param {Object} value - option
   * @param {Object} event - event object
   * */
  handleChangeOption(value, event) {
    event.preventDefault();
    this.props.onSelect(value.set('checked', !value.get('checked')));
  }

  /**
   * renderOptions - render options
   * @param {Array.<Object>} options - list of options
   * @return {Array.<Element>} - option elements
   * */
  renderOptions(options) {
    return options.map((option, index) => {
      const classes = classNames({
        'FilterOptions-field-label': true,
        'FilterOptions-field-label--checked': option.get('checked')
      });
      const name = option.get('name');
      return (
        <div
          className="FilterOptions-field FilterOptions-field-checkbox"
          onClick={this.handleChangeOption.bind(this, option)}
          key={index}
        >
          <input id={`service-${name}`} className="FilterOptions-field-input" type="checkbox" />
          <label className={classes} htmlFor={`service-${name}`}>
            <FormattedMessage id={`options.${name}`} />
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
    const options = this.renderOptions(values);
    return (
      <div className="FilterOptions">
        <div className="FilterOptions-wrapper g-clear">
          <h3 className="FilterOptions-heading">
            <FormattedMessage id="filters.options" />
          </h3>
          {options}
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} values - list of options
 * @property {Function} onSelect - select option
 */
FilterOptionsComponent.propTypes = {
  values: ImmutablePropTypes.list.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterOptionsComponent;
