'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _immutable = require('immutable');

var _isAlphanumeric = require('validator/lib/isAlphanumeric');

var _isAlphanumeric2 = _interopRequireDefault(_isAlphanumeric);

var _isLength = require('validator/lib/isLength');

var _isLength2 = _interopRequireDefault(_isLength);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _trim = require('lodash/trim');

var _trim2 = _interopRequireDefault(_trim);

var _partialRight = require('lodash/partialRight');

var _partialRight2 = _interopRequireDefault(_partialRight);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactIntl = require('react-intl');

var _reactKeyHandler = require('react-key-handler');

var _reactKeyHandler2 = _interopRequireDefault(_reactKeyHandler);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

require('./style.css');

var _logo = require('../../../images/logo.png');

var _logo2 = _interopRequireDefault(_logo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ENTER_KEY = 13;

function validate(value, rules) {
  var errors = {
    instant: [],
    notInstant: []
  };

  (0, _forEach2.default)(rules, function (rule) {
    if (!rule.func(value)) {
      rule.instant ? errors.instant.push(rule.messageId) : errors.notInstant.push(rule.messageId);
    }
  });

  return errors;
}

var usernameValidationRules = [{ messageId: 'usernameIsAlphanumeric', func: _isAlphanumeric2.default, instant: true }, { messageId: 'usernameIsLength', func: (0, _partialRight2.default)(_isLength2.default, { min: 3 }), instant: false }];

var passwordValidationRules = [{ messageId: 'passwordIsLength', func: (0, _partialRight2.default)(_isLength2.default, { min: 3 }), instant: false }];

/**
 * ManagerLoginComponent - login form for managers
 * Smart components - none
 * Dumb components - none
 * */

var ManagerLoginComponent = function (_Component) {
  (0, _inherits3.default)(ManagerLoginComponent, _Component);

  /**
   * constructor
   * @param {object} props
   */

  function ManagerLoginComponent(props) {
    (0, _classCallCheck3.default)(this, ManagerLoginComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ManagerLoginComponent).call(this, props));

    _this.state = {
      data: (0, _immutable.fromJS)({
        usernameIsActive: false,
        passwordIsActive: false,

        username: '',
        password: '',

        usernameErrors: {
          instant: [],
          notInstant: []
        },
        passwordErrors: {
          instant: [],
          notInstant: []
        }
      })
    };

    _this.handleSubmit = _this.handleSubmit.bind(_this);
    _this.handleUsernameFocus = _this.handleUsernameFocus.bind(_this);
    _this.handlePasswordFocus = _this.handlePasswordFocus.bind(_this);
    _this.handleUsernameBlur = _this.handleUsernameBlur.bind(_this);
    _this.handlePasswordBlur = _this.handlePasswordBlur.bind(_this);
    _this.handleChangeUsername = _this.handleChangeUsername.bind(_this);
    _this.handleChangePassword = _this.handleChangePassword.bind(_this);

    _this.checkFormIsValid = _this.checkFormIsValid.bind(_this);
    return _this;
  }

  /**
   * componentDidMount - autofocus to first field
   * */

  (0, _createClass3.default)(ManagerLoginComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      _reactDom2.default.findDOMNode(this.refs.username).focus();
    }

    /**
     * shouldComponentUpdate
     * @return {boolean}
     * */

  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }
  }, {
    key: 'checkFormIsValid',
    value: function checkFormIsValid() {
      var data = this.state.data;

      var dataIsEmpty = !data.get('username') || !data.get('password');
      var dataHasErrors = !dataIsEmpty && (data.getIn(['usernameErrors', 'instant']).size || data.getIn(['passwordErrors', 'instant']).size || data.getIn(['usernameErrors', 'notInstant']).size || data.getIn(['passwordErrors', 'notInstant']).size);

      return !dataIsEmpty && !dataHasErrors;
    }

    /**
     * handleLoginFocus - handle focus on login field
     * @return {void}
     * */

  }, {
    key: 'handleUsernameFocus',
    value: function handleUsernameFocus(event) {
      event.preventDefault();

      this.setState(function (_ref) {
        var data = _ref.data;
        return {
          data: data.set('usernameIsActive', true).set('passwordIsActive', false)
        };
      });
    }

    /**
     * handlePasswordFocus - handle focus on password field
     * @return {void}
     * */

  }, {
    key: 'handlePasswordFocus',
    value: function handlePasswordFocus(event) {
      event.preventDefault();

      this.setState(function (_ref2) {
        var data = _ref2.data;
        return {
          data: data.set('usernameIsActive', false).set('passwordIsActive', true)
        };
      });
    }
  }, {
    key: 'handleUsernameBlur',
    value: function handleUsernameBlur(event) {
      event.preventDefault();

      this.setState(function (_ref3) {
        var data = _ref3.data;
        return {
          data: data.set('usernameIsActive', false)
        };
      });
    }
  }, {
    key: 'handlePasswordBlur',
    value: function handlePasswordBlur(event) {
      event.preventDefault();

      this.setState(function (_ref4) {
        var data = _ref4.data;
        return {
          data: data.set('passwordIsActive', false)
        };
      });
    }
  }, {
    key: 'handleSubmit',
    value: function handleSubmit(event) {
      event.preventDefault();
      var data = this.state.data;

      var formIsValid = this.checkFormIsValid();

      if (!formIsValid) return false;

      return this.props.onSubmit({
        username: data.get('username'),
        password: data.get('password'),
        realm: 'bathhouse'
      });
    }
  }, {
    key: 'handleChangeUsername',
    value: function handleChangeUsername(event) {
      event.preventDefault();

      var value = (0, _trim2.default)(event.target.value);

      var errors = validate(value, usernameValidationRules);

      this.setState(function (_ref5) {
        var data = _ref5.data;
        return {
          data: data.set('username', value).set('usernameErrors', (0, _immutable.fromJS)(errors))
        };
      });
    }
  }, {
    key: 'handleChangePassword',
    value: function handleChangePassword(event) {
      event.preventDefault();

      var value = (0, _trim2.default)(event.target.value);

      var errors = validate(value, passwordValidationRules);

      this.setState(function (_ref6) {
        var data = _ref6.data;
        return {
          data: data.set('password', value).set('passwordErrors', (0, _immutable.fromJS)(errors))
        };
      });
    }
  }, {
    key: 'renderInstantErrors',
    value: function renderInstantErrors(field) {
      var data = this.state.data;

      var fieldName = field + 'Errors';
      return data.getIn([fieldName, 'instant']).map(function (error, index) {
        return _react2.default.createElement(
          'div',
          { className: 'ManagerLogin-field-error', key: index },
          _react2.default.createElement(_reactIntl.FormattedMessage, { id: error })
        );
      });
    }
  }, {
    key: 'renderNotInstantErrors',
    value: function renderNotInstantErrors(field) {
      var data = this.state.data;

      var fieldName = field + 'Errors';
      return data.getIn([fieldName, 'notInstant']).map(function (error, index) {
        return _react2.default.createElement(
          'div',
          { className: 'ManagerLogin-field-error', key: index },
          _react2.default.createElement(_reactIntl.FormattedMessage, { id: error })
        );
      });
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var data = this.state.data;

      var usernameFieldClasses = (0, _classnames2.default)('ManagerLogin-label', {
        'ManagerLogin-label--active': data.get('usernameIsActive') || data.get('username')
      });

      var passwordFieldClasses = (0, _classnames2.default)('ManagerLogin-label', {
        'ManagerLogin-label--active': data.get('passwordIsActive') || data.get('password')
      });

      var usernameInstantErrors = this.renderInstantErrors('username');
      var passwordInstantErrors = this.renderInstantErrors('password');

      var usernameNotInstantErrors = this.renderNotInstantErrors('username');
      var passwordNotInstantErrors = this.renderNotInstantErrors('password');

      var needShowInstantUsernameErrors = data.get('username') && data.getIn(['usernameErrors', 'instant']).size;
      var needShowInstantPasswordErrors = data.get('password') && data.getIn(['passwordErrors', 'instant']).size;

      var needShowNotInstantUsernameErrors = data.get('username') && !data.get('usernameIsActive') && data.getIn(['usernameErrors', 'notInstant']).size;
      var needShowNotInstantPasswordErrors = data.get('password') && !data.get('passwordIsActive') && data.getIn(['passwordErrors', 'notInstant']).size;

      var formIsValid = this.checkFormIsValid();

      var buttonClasses = (0, _classnames2.default)('ManagerLogin-submit', {
        'ManagerLogin-submit--disabled': !formIsValid
      });

      return _react2.default.createElement(
        'div',
        { className: 'ManagerLogin' },
        _react2.default.createElement(_reactKeyHandler2.default, {
          keyEventName: _reactKeyHandler.KEYUP,
          keyCode: ENTER_KEY,
          onKeyHandle: this.handleSubmit
        }),
        _react2.default.createElement(
          'form',
          { className: 'ManagerLogin-form', onSubmit: this.handleSubmit },
          _react2.default.createElement('img', { className: 'ManagerLogin-logo', src: _logo2.default, alt: '' }),
          _react2.default.createElement(
            'h1',
            { className: 'ManagerLogin-heading' },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'welcome' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'ManagerLogin-field' },
            _react2.default.createElement(
              'label',
              { className: usernameFieldClasses, htmlFor: 'username' },
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'username' })
            ),
            _react2.default.createElement('input', {
              className: 'ManagerLogin-input',
              id: 'username',
              ref: 'username',
              type: 'text',
              autoComplete: 'off',
              value: data.get('username'),
              onFocus: this.handleUsernameFocus,
              onBlur: this.handleUsernameBlur,
              onChange: this.handleChangeUsername
            }),
            needShowInstantUsernameErrors ? usernameInstantErrors : null,
            needShowNotInstantUsernameErrors ? usernameNotInstantErrors : null
          ),
          _react2.default.createElement(
            'div',
            { className: 'ManagerLogin-field' },
            _react2.default.createElement(
              'label',
              { className: passwordFieldClasses, htmlFor: 'password' },
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'password' })
            ),
            _react2.default.createElement('input', {
              className: 'ManagerLogin-input',
              id: 'password',
              type: 'password',
              autoComplete: 'off',
              value: data.get('password'),
              onFocus: this.handlePasswordFocus,
              onBlur: this.handlePasswordBlur,
              onChange: this.handleChangePassword
            }),
            needShowInstantPasswordErrors ? passwordInstantErrors : null,
            needShowNotInstantPasswordErrors ? passwordNotInstantErrors : null
          ),
          _react2.default.createElement(
            'button',
            { className: buttonClasses },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'entrance' })
          )
        )
      );
    }
  }]);
  return ManagerLoginComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Function} onSubmit - send user credentials
 */

ManagerLoginComponent.propTypes = {
  onSubmit: _react.PropTypes.func.isRequired
};

exports.default = ManagerLoginComponent;

//# sourceMappingURL=index.js.map