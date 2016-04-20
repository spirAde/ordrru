import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { ManagerDashboardSelectors } from '../selectors/ManagerDashboardSelectors';

/**
 * ManagerLoginPage - login page for manager
 * Smart components - none
 * Dumb components - none
 * */
class ManagerDashboardPage extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div>
        <Helmet title="Dashboard" />
        Manager Dashboard
      </div>
    );
  }
}

/**
 * propTypes
 */
ManagerDashboardPage.propTypes = {
  auth: ImmutablePropTypes.map.isRequired,
};

export default connect(ManagerDashboardSelectors)(ManagerDashboardPage);
