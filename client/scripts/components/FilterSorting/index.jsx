import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import IconComponent from '../Icon/index.jsx';

import './style.css';

/**
 * FilterSortingComponent - dumb component, sorting rooms by popularity, distance, price.
 * Smart components - none
 * Dumb components - none
 * */
class FilterSortingComponent extends Component {

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
   * handle sorting type click
   * @param {Object.<string, string|boolean>} type - type of sorting
   * @param {Object} event - SytheticEvent
   * @return {void}
   * */
  handleClickSortingType(type, event) {
    event.preventDefault();

    const currentSortingType = this.props.values.find(sortingType => sortingType.get('checked'));

    if (currentSortingType.get('name') === type.get('name')) {
      this.props.onSelect(currentSortingType.set('isDesc', !currentSortingType.get('isDesc')));
    } else {
      this.props.onSelect(type.set('checked', true));
    }
  }

  /**
   * render sorting type boxes
   * @param {Array.<Object>} types - list of types
   * @return {Array.<Element>}
   * */
  renderSortingType(types) {
    return types.map((type, index) => {
      const classes = classNames({
        'FilterSorting-button': true,
        'FilterSorting-button--active': type.get('checked')
      });

      let icon;

      if (type.get('checked') && !type.get('isDesc')) {
        icon = (<IconComponent name="icon-chevron-up" color="#18B2AE" style={{ margin: '0 15px -3px -30px' }} />);
      } else if (type.get('checked') && type.get('isDesc')) {
        icon = (<IconComponent name="icon-chevron-down" color="#18B2AE" style={{ margin: '0 15px -3px -30px' }} />);
      }

      return (
        <div className="FilterSorting-field" key={index} onClick={this.handleClickSortingType.bind(this, type)}>
          <a className={classes}>
            {icon}
            <FormattedMessage id={`sorting.${type.get('name')}`} />
          </a>
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
    const renderedTypes = this.renderSortingType(values);

    return (
      <div className="FilterSorting">
        <div className="FilterSorting-wrapper g-clear">
          <h3 className="FilterSorting-heading">
            <FormattedMessage id="filters.sorting" />
          </h3>
          {renderedTypes}
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
FilterSortingComponent.propTypes = {
  values: ImmutablePropTypes.list.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterSortingComponent;
