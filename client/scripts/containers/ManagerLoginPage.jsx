import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

import ManagerLoginComponent from '../components/ManagerLogin/index.jsx';

import ManagerLoginSelectors from '../selectors/ManagerLoginSelectors';

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
    return (
      <div>
        <Helmet title="Login" />
        <ManagerLoginComponent
          onSubmit={this.handleSubmitLogin}
        />
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Function} login - login request
 */
ManagerLoginPage.propTypes = {
  login: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
export default connect(ManagerLoginSelectors, {
  login,
})(ManagerLoginPage);
