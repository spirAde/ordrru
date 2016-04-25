import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import classNames from 'classnames';

import './style.css';

import logoImg from '../../../images/logo.png';

/**
 * ManagerDashboardHeaderComponent - header of dashboard
 * Smart components - none
 * Dumb components - none
 * */
class ManagerDashboardHeaderComponent extends Component {
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
    const { manager } = this.props;
    const fullName = `${manager.get('secondName')} ${manager.get('firstName')}`;

    return (
      <div className="ManagerDashboardHeader">
        <div className="ManagerDashboardHeader-menu">
          <div className="ManagerDashboardHeader-logo-field">
            <img className="ManagerDashboardHeader-logo-image" src={logoImg} alt="" />
          </div>
          <div className="ManagerDashboardHeader-links">
            <a className="ManagerDashboardHeader-link ManagerDashboardHeader-link-history">
							История
						</a>
            <a className="ManagerDashboardHeader-link ManagerDashboardHeader-link-message">
							Сообщения
						</a>
          </div>
          <div className="ManagerDashboardHeader-user">
            <a className="ManagerDashboardHeader-username">
              {fullName}
            </a>
            <a className="ManagerDashboardHeader-logout icons" />
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Object} manager - manager data
 * @property {Function} onSubmit - send user credentials
 */
ManagerDashboardHeaderComponent.propTypes = {
  manager: ImmutablePropTypes.map.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ManagerDashboardHeaderComponent;
