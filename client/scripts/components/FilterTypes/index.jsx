import { indexOf } from 'lodash';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import IconComponent from '../Icon/index.jsx';

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

    this.handleChangeType = this.handleChangeType.bind(this);
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
   * @param {Object} event - event object
   * */
  handleChangeType(event) {
    event.preventDefault();

    const { values } = this.props;

    let element = event.target;

    while (element.tagName !== 'DIV') {
      element = element.parentElement;
    }

    const parentNode = element.parentNode;
    const typeIndex = indexOf(parentNode.childNodes, element);
    const type = values.get(typeIndex);

    this.props.onSelect(type.set('checked', !type.get('checked')));
  }

  /**
   * renderTypes - render types
   * @param {Array.<Object>} types - list of types
   * @return {Array.<Element>} - types elements
   * */
  renderTypes(types) {
    return types.map((type, index) => {
      const typeClasses = classNames({
        'FilterType-field-type-name': true,
        'FilterType-field-type-name-checked': type.get('checked'),
      });
      const name = type.get('name');
      return (
        <div
          className="FilterType-field FilterType-field-checkbox"
          onClick={this.handleChangeType}
          key={index}
        >
          {
            type.get('checked') ?
              <IconComponent
                className="FilterType-icon-checkbox-checked"
                name="icon-checkbox-checked"
                color="#18B2AE"
                rate={1.25}
              /> :
              <IconComponent
                className="FilterType-icon-checkbox-unchecked"
                name="icon-checkbox-unchecked"
                color="#BCC1C9"
                rate={1.25}
              />
          }
          <span className={typeClasses}>
            <FormattedMessage id={`bathhouseType.${name}`} />
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
    const types = this.renderTypes(values);

    return (
      <div className="FilterType">
        <div className="FilterType-wrapper g-clear">
          <h3 className="FilterType-heading">
            <FormattedMessage id="filters.type" />
          </h3>
          <div>
            {types}
          </div>
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
  onSelect: PropTypes.func.isRequired,
};

export default FilterTypeComponent;
