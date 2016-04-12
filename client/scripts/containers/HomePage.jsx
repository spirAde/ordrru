import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { connect } from 'react-redux';

import { changeCity, changeOrganizationType } from '../actions/user-actions';

import FaceComponent from '../components/Face/index.jsx';
import HowUseItComponent from '../components/HowUseIt/index.jsx';
import TestimonialsComponent from '../components/Testimonials/index.jsx';
import InterestingComponent from '../components/Interesting/index.jsx';
import FooterComponent from '../components/Footer/index.jsx';

import configs from '../../../common/data/configs.json';

/**
 * HomePage - smart component, container, welcome page
 * Smart components - none
 * Dumb components - FaceComponent, HowUseItComponent, TestimonialsComponent,
 *                   InterestingComponent, FooterComponent
 * */
class HomePage extends Component {

  /**
   * constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    this.handleChangeCity = this.handleChangeCity.bind(this);
    this.handleChangeOrganizationType = this.handleChangeOrganizationType.bind(this);
  }

  componentDidMount() {
    this.props.changeCity(this.props.cities[0].id);
    this.props.changeOrganizationType(this.props.types[0].id);
  }

  /**
   * handle change selected city
   * @param {number} index - index of cities array
   */
  handleChangeCity(index) {
    this.props.changeCity(this.props.cities[index].id);
  }

  /**
   * handle change selected organization type(bathhouse or carwash)
   * @param {number} index - index of organization types array
   */
  handleChangeOrganizationType(index) {
    this.props.changeOrganizationType(this.props.types[index].id);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div>
        <Helmet title="Home" />
        <FaceComponent />
        <HowUseItComponent />
        <TestimonialsComponent />
        {/*<InterestingComponent
         onChangeCity={this.handleChangeCity}
         onChangeOrganizationType={this.handleChangeOrganizationType}
         cities={this.props.cities}
         types={this.props.types}
         />*/}
        <FooterComponent />
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} cities - list of cities
 * @property {Array.<Object>} types - list of organization types
 * @property {Function} changeCity - change selected city
 * @property {Function} changeOrganizationType - change selected organization type
 */
HomePage.propTypes = {
  cities: PropTypes.arrayOf(PropTypes.object).isRequired,
  types: PropTypes.arrayOf(PropTypes.object).isRequired,
  changeCity: PropTypes.func.isRequired,
  changeOrganizationType: PropTypes.func.isRequired
};

/**
 * pass state to props
 * @param {Object} state - current redux state
 * @return {Object} props - list of params
 * */
function mapStateToProps(state) {
  return {
    cities: state.city.get('cities').toJS(),
    types: configs.organizationType,
  };
}

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    changeCity: (city) => dispatch(changeCity(city)),
    changeOrganizationType: (type) => dispatch(changeOrganizationType(type))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
