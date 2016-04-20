import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import ManagerLoginComponent from '../components/ManagerLogin/index.jsx';

import { ManagerLoginSelectors } from '../selectors/ManagerLoginSelectors';

import { login } from '../actions/manager-actions';

/**
 * ManagerLoginPage - login page for manager
 * Smart components - none
 * Dumb components - none
 * */
class ManagerLoginPage extends Component {
  constructor(props) {
    super(props);

    this.handleSubmitLogin = this.handleSubmitLogin.bind(this);
  }

  handleSubmitLogin(credentials) {
    this.props.login(credentials);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { loginError } = this.props;

    return (
      <div>
        <Helmet title="Login" />
        <ManagerLoginComponent
          loginError={loginError}
          onSubmit={this.handleSubmitLogin}
        />
      </div>
    );
  }
}

/**
 * propTypes
 */
ManagerLoginPage.propTypes = {
  loginError: ImmutablePropTypes.map.isRequired,
  login: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    login: (credentials) => dispatch(login(credentials)),
  };
}

export default connect(ManagerLoginSelectors, mapDispatchToProps)(ManagerLoginPage);
