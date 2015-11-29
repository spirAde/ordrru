import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import './style.css';

let Nouislider;

if (__CLIENT__) {
  Nouislider = require('react-nouislider');
}

/**
 * FilterPriceComponent - dumb component, price filter component.
 * Smart components - none
 * Dumb components - none
 * */
class FilterPriceComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.handleChangePosition = this.handleChangePosition.bind(this);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps) {
    return !shallowEqualImmutable(this.props, nextProps);
  }

  /**
   * handleChangePosition - handle change position of slider, and pass params to parent component
   * @param {Array.<string>} values - min and max values
   * @return {void}
   * */
  handleChangePosition(values) {
    this.props.onSelect(values);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { values } = this.props;

    return (
      <div className="FilterPrice">
        <div className="FilterPrice-wrapper g-clear">
          <h3 className="FilterPrice-heading">
            <FormattedMessage id="filters.price" />
          </h3>
          <div className="FilterPrice-slider">
            {
              __CLIENT__ ?
                <Nouislider
                  range={{min: values.get('min'), max: values.get('max')}}
                  start={[values.getIn(['current', 'start']), values.getIn(['current', 'end'])]}
                  step={100}
                  connect={true}
                  onChange={this.handleChangePosition}
                /> : <div></div>
            }
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Object} values - min, max, current
 * @property {Function} onSelect - select values
 * */
FilterPriceComponent.propTypes = {
  values: ImmutablePropTypes.map.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterPriceComponent;
