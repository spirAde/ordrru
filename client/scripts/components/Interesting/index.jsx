import React, { Component, PropTypes } from 'react';

import SingleSelectFieldComponent from '../SingleSelectField/index.jsx';

import './style.css';

/**
 * InterestingComponent
 * Smart components - none
 * Dumb components - none
 * */
class InterestingComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div className="Interesting">
        <div className="Interesting-wrapper">
          <h2 className="Interesting-heading">Интересно?</h2>
          <div className="g-clear">
            <div className="Interesting-field field-select">
              <SingleSelectFieldComponent
                options={this.props.cities}
                index="1"
                name="name"
                onChange={this.props.onChangeCity}
              />
            </div>
            <div className="Interesting-field field-select">
              <SingleSelectFieldComponent
                options={this.props.types}
                name="type"
                onChange={this.props.onChangeOrganizationType}
              />
            </div>
            <div className="Interesting-field g-buttons">
              <a className="Interesting-anchor">Перейти</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {array<object>} cities - list of cities
 * @property {array<object>} types - list of types
 * @property {function} onChangeCity - change selected city
 * @property {function} onChangeOrganizationType - change selected organization type
 * */
InterestingComponent.propTypes = {
  cities: PropTypes.arrayOf(PropTypes.object).isRequired,
  types: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChangeCity: PropTypes.func.isRequired,
  onChangeOrganizationType: PropTypes.func.isRequired
};

export default InterestingComponent;
