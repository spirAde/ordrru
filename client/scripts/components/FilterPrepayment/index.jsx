import isNull from 'lodash/isNull';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import './style.css';

/**
 * FilterPrepaymentComponent - dumb component, prepayment filter component.
 * Smart components - none
 * Dumb components - none
 * */
class FilterPrepaymentComponent extends Component {

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
   * handleClick - handle select index of prepayment types. pass checked prepayment type to parent component
   * @param {object} type - checked index
   * @param {object} event - event object
   * */
  handleClick(type, event) {
    event.preventDefault();

    if (type.get('checked')) return false;

    this.props.onSelect(type);
  }

  /**
   * renderPrepaymentTypes - render prepayment types
   * @param {Array.<Object>} types - list of prepayment types
   * @return {Array.<Element>} - prepayment types elements
   * */
  renderPrepaymentTypes(types) {
    return types.map((type, index) => {
      const id = isNull(type.get('isRequired')) ? 'prepayment.whatever' :
        type.get('isRequired') ? 'prepayment.yes' : 'prepayment.no';

      const labelClasses = classNames({
        'FilterPrepayment-button-label': true,
        'FilterPrepayment-button-label--checked': type.get('checked')
      });

      const checkClasses = classNames({
        'FilterPrepayment-button-check': true,
        'FilterPrepayment-button-check--checked': type.get('checked')
      });

      const insideClasses = classNames({
        'FilterPrepayment-button-inside': type.get('checked')
      });

      return (
        <li className="FilterPrepayment-button" key={index} onClick={this.handleClick.bind(this, type)}>
          <input className="FilterPrepayment-button-input" type="checkbox"/>
          <label className={labelClasses}>
            <FormattedMessage id={id} />
          </label>
          <div className={checkClasses}>
            <div className={insideClasses}></div>
          </div>
        </li>
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { values } = this.props;
    const types = this.renderPrepaymentTypes(values);

    return (
      <div className="FilterPrepayment">
        <div className="FilterPrepayment-wrapper g-clear">
          <h3 className="FilterPrepayment-heading">
            <FormattedMessage id="filters.prepayment" />
          </h3>
          <ul className="FilterPrepayment-buttons">
            {types}
          </ul>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} values - list of prepayment types
 * @property {function} onSelect - select prepayment type
 */
FilterPrepaymentComponent.propTypes = {
  values: ImmutablePropTypes.list.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterPrepaymentComponent;
