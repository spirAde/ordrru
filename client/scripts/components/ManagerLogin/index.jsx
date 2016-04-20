import { fromJS } from 'immutable';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import isLength from 'validator/lib/isLength';

import forEach from 'lodash/forEach';
import trim from 'lodash/trim';
import partialRight from 'lodash/partialRight';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { FormattedMessage } from 'react-intl';
import KeyHandler, { KEYUP } from 'react-key-handler';

import classNames from 'classnames';

import './style.css';
import '../../../styles/notie.css';

import logoImg from '../../../images/logo.png';

const ENTER_KEY = 13;

let notie;

if (__CLIENT__) {
  notie = require('notie');
}

function validate(value, rules) {
  const errors = {
    instant: [],
    notInstant: [],
  };

  forEach(rules, rule => {
    if (!rule.func(value)) {
      rule.instant ?
        errors.instant.push(rule.messageId) :
        errors.notInstant.push(rule.messageId);
    }
  });

  return errors;
}

const usernameValidationRules = [
  { messageId: 'usernameIsAlphanumeric', func: isAlphanumeric, instant: true },
  { messageId: 'usernameIsLength', func: partialRight(isLength, { min: 3 }), instant: false },
];

const passwordValidationRules = [
  { messageId: 'passwordIsLength', func: partialRight(isLength, { min: 3 }), instant: false },
];

/**
 * ManagerLoginComponent - login form for managers
 * Smart components - none
 * Dumb components - none
 * */
class ManagerLoginComponent extends Component {
  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.state = {
      data: fromJS({
        usernameIsActive: false,
        passwordIsActive: false,

        username: '',
        password: '',

        usernameErrors: {
          instant: [],
          notInstant: [],
        },
        passwordErrors: {
          instant: [],
          notInstant: [],
        },
      }),
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleUsernameFocus = this.handleUsernameFocus.bind(this);
    this.handlePasswordFocus = this.handlePasswordFocus.bind(this);
    this.handleUsernameBlur = this.handleUsernameBlur.bind(this);
    this.handlePasswordBlur = this.handlePasswordBlur.bind(this);
    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);

    this.checkFormIsValid = this.checkFormIsValid.bind(this);
  }

	/**
	 * componentDidMount - autofocus to first field
	 * */
  componentDidMount() {
    ReactDOM.findDOMNode(this.refs.username).focus();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.loginError.has('code')) {
      const errorMessage = this.context.intl.messages[nextProps.loginError.get('code')];
      notie.alert(3, errorMessage, 5);
    } else if (nextProps.loginError.has('error') && !nextProps.loginError.has('code')) {
      notie.alert(3, nextProps.loginError.get('error'), 5);
    }
  }

  checkFormIsValid() {
    const { data } = this.state;

    const dataIsEmpty = !data.get('username') || !data.get('password');
    const dataHasErrors = !dataIsEmpty && (
      data.getIn(['usernameErrors', 'instant']).size ||
      data.getIn(['passwordErrors', 'instant']).size ||
      data.getIn(['usernameErrors', 'notInstant']).size ||
      data.getIn(['passwordErrors', 'notInstant']).size
    );

    return !dataIsEmpty && !dataHasErrors;
  }

	/**
	 * handleLoginFocus - handle focus on login field
	 * @return {void}
	 * */
  handleUsernameFocus(event) {
    event.preventDefault();

    this.setState(({ data }) => ({
      data: data
        .set('usernameIsActive', true)
        .set('passwordIsActive', false),
    }));
  }

	/**
	 * handlePasswordFocus - handle focus on password field
	 * @return {void}
	 * */
  handlePasswordFocus(event) {
    event.preventDefault();

    this.setState(({ data }) => ({
      data: data
        .set('usernameIsActive', false)
        .set('passwordIsActive', true),
    }));
  }

  handleUsernameBlur(event) {
    event.preventDefault();

    this.setState(({ data }) => ({
      data: data
        .set('usernameIsActive', false),
    }));
  }

  handlePasswordBlur(event) {
    event.preventDefault();

    this.setState(({ data }) => ({
      data: data
        .set('passwordIsActive', false),
    }));
  }

  handleSubmit(event) {
    event.preventDefault();
    const { data } = this.state;

    const formIsValid = this.checkFormIsValid();

    if (!formIsValid) return false;

    return this.props.onSubmit({
      username: data.get('username'),
      password: data.get('password'),
      realm: 'bathhouse',
    });
  }

  handleChangeUsername(event) {
    event.preventDefault();

    const value = trim(event.target.value);

    const errors = validate(value, usernameValidationRules);

    this.setState(({ data }) => ({
      data: data
        .set('username', value)
        .set('usernameErrors', fromJS(errors)),
    }));
  }

  handleChangePassword(event) {
    event.preventDefault();

    const value = trim(event.target.value);

    const errors = validate(value, passwordValidationRules);

    this.setState(({ data }) => ({
      data: data
        .set('password', value)
        .set('passwordErrors', fromJS(errors)),
    }));
  }

  renderInstantErrors(field) {
    const { data } = this.state;

    const fieldName = `${field}Errors`;
    return data.getIn([fieldName, 'instant']).map((error, index) => (
      <div className="ManagerLogin-field-error" key={index}>
        <FormattedMessage id={error} />
      </div>
    ));
  }

  renderNotInstantErrors(field) {
    const { data } = this.state;

    const fieldName = `${field}Errors`;
    return data.getIn([fieldName, 'notInstant']).map((error, index) => (
      <div className="ManagerLogin-field-error" key={index}>
        <FormattedMessage id={error} />
      </div>
    ));
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { data } = this.state;

    const usernameFieldClasses = classNames({
      'ManagerLogin-label': true,
      'ManagerLogin-label--active': data.get('usernameIsActive') || data.get('username'),
    });

    const passwordFieldClasses = classNames({
      'ManagerLogin-label': true,
      'ManagerLogin-label--active': data.get('passwordIsActive') || data.get('password'),
    });

    const usernameInstantErrors = this.renderInstantErrors('username');
    const passwordInstantErrors = this.renderInstantErrors('password');

    const usernameNotInstantErrors = this.renderNotInstantErrors('username');
    const passwordNotInstantErrors = this.renderNotInstantErrors('password');

    const needShowInstantUsernameErrors = data.get('username') &&
      data.getIn(['usernameErrors', 'instant']).size;
    const needShowInstantPasswordErrors = data.get('password') &&
      data.getIn(['passwordErrors', 'instant']).size;

    const needShowNotInstantUsernameErrors = data.get('username') && !data.get('usernameIsActive')
      && data.getIn(['usernameErrors', 'notInstant']).size;
    const needShowNotInstantPasswordErrors = data.get('password') && !data.get('passwordIsActive')
      && data.getIn(['passwordErrors', 'notInstant']).size;

    const formIsValid = this.checkFormIsValid();

    const buttonClasses = classNames({
      'ManagerLogin-submit': true,
      'ManagerLogin-submit--disabled': !formIsValid,
    });

    return (
      <div className="ManagerLogin">
        <KeyHandler
          keyEventName={KEYUP}
          keyCode={ENTER_KEY}
          onKeyHandle={this.handleSubmit}
        />
        <form className="ManagerLogin-form" onSubmit={this.handleSubmit}>
          <img className="ManagerLogin-logo" src={logoImg} alt="" />
          <h1 className="ManagerLogin-heading">
            <FormattedMessage id="welcome" />
          </h1>
          <div className="ManagerLogin-field">
            <label className={usernameFieldClasses} htmlFor="username">
              <FormattedMessage id="username" />
            </label>
            <input
              className="ManagerLogin-input"
              id="username"
              ref="username"
              type="text"
              autoComplete="off"
              value={data.get('username')}
              onFocus={this.handleUsernameFocus}
              onBlur={this.handleUsernameBlur}
              onChange={this.handleChangeUsername}
            />
            {
              needShowInstantUsernameErrors ? usernameInstantErrors : null
            }
            {
              needShowNotInstantUsernameErrors ? usernameNotInstantErrors : null
            }
          </div>
          <div className="ManagerLogin-field">
            <label className={passwordFieldClasses} htmlFor="password">
              <FormattedMessage id="password" />
            </label>
            <input
              className="ManagerLogin-input"
              id="password"
              type="password"
              autoComplete="off"
              value={data.get('password')}
              onFocus={this.handlePasswordFocus}
              onBlur={this.handlePasswordBlur}
              onChange={this.handleChangePassword}
            />
            {
              needShowInstantPasswordErrors ? passwordInstantErrors : null
            }
            {
              needShowNotInstantPasswordErrors ? passwordNotInstantErrors : null
            }
          </div>
          <button className={buttonClasses}>
            <FormattedMessage id="entrance" />
          </button>
        </form>
      </div>
    );
  }
}

/**
 * contextTypes
 * @property {Object} router
 */
ManagerLoginComponent.contextTypes = {
  intl: PropTypes.object.isRequired,
};

/**
 * propTypes
 */
ManagerLoginComponent.propTypes = {
  loginError: ImmutablePropTypes.map.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default ManagerLoginComponent;
