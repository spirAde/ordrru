import { indexOf } from 'lodash';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import IconComponent from '../Icon/index.jsx';

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

    this.handleChangeOption = this.handleChangeOption.bind(this);
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
   * @param {Object} option - option
   * @param {Object} event - event object
   * */
  handleChangeOption(option, event) {
    event.preventDefault();

    console.log(option.toJS());
    this.props.onSelect(option.set('checked', !option.get('checked')));
  }

  /**
   * renderOptions - render options
   * @param {Array.<Object>} options - list of options
   * @return {Array.<Element>} - option elements
   * */
  renderOptions(options) {
    return options.map((option, index) => {
      const optionClasses = classNames({
        'FilterOptions-field-option-name': true,
        'FilterOptions-field-option-name-checked': option.get('checked'),
      });
      const name = option.get('name');
      return (
        <div
          className="FilterOptions-field FilterOptions-field-checkbox"
          onClick={this.handleChangeOption.bind(this, option)}
          key={index}
        >
          {
            option.get('checked') ?
              <IconComponent
                name="icon-checkbox-checked"
                color="#18B2AE"
                style={{ marginRight: '10px', marginTop: '5px' }}
                rate={1.25}
              /> :
              <IconComponent
                name="icon-checkbox-unchecked"
                color="#BCC1C9"
                style={{ marginRight: '10px', marginTop: '5px' }}
                rate={1.25}
              />
          }
          <span className={optionClasses}>
            <FormattedMessage id={`options.${name}`} />
          </span>
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
      <div className="FilterOptions-wrapper g-clear">
        <h3 className="FilterOptions-heading">
          <FormattedMessage id="filters.options" />
        </h3>
        <div className="FilterOptions-options">
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
  onSelect: PropTypes.func.isRequired,
};

export default FilterOptionsComponent;
