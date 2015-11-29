import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import './style.css';
import '../../../styles/nouislider.css';

let Nouislider;

if (__CLIENT__) {
  Nouislider = require('react-nouislider');
}

/**
 * FilterDistanceComponent - dumb component, distance filter component. Use third-party library nouislider
 * Smart components - none
 * Dumb components - none
 * */
class FilterDistanceComponent extends Component {

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
   * */
  handleChangePosition(value) {
    this.props.onSelect(value);
  }

  /**
   * render
   * @return {XML} ReactElement
   */
  render() {
    const { values } = this.props;

    return (
      <div className="FilterDistance g-clear">
        <div className="FilterDistance-wrapper g-clear">
          <h3 className="FilterDistance-heading">
            <FormattedMessage id="filters.distance" />
          </h3>
          <div className="FilterDistance-slider">
            {
              __CLIENT__ ?
                <Nouislider
                  range={{min: values.get('min'), max: values.get('max')}}
                  start={values.get('current')}
                  step={0.1}
                  connect={'lower'}
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
 * @property {Object} values - min, max and current values
 * @property {Function} onSelect - select distance value
 */
FilterDistanceComponent.propTypes = {
  values: ImmutablePropTypes.map.isRequired,
  onSelect: PropTypes.func.isRequired
};

export default FilterDistanceComponent;
