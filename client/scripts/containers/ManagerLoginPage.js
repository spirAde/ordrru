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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _reactRedux = require('react-redux');

var _index = require('../components/ManagerLogin/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _ManagerLoginSelectors = require('../selectors/ManagerLoginSelectors');

var _ManagerLoginSelectors2 = _interopRequireDefault(_ManagerLoginSelectors);

var _managerActions = require('../actions/manager-actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ManagerLoginPage - login page for manager
 * Smart components - none
 * Dumb components - none
 * */

var ManagerLoginPage = function (_Component) {
  (0, _inherits3.default)(ManagerLoginPage, _Component);

  function ManagerLoginPage(props) {
    (0, _classCallCheck3.default)(this, ManagerLoginPage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ManagerLoginPage.__proto__ || (0, _getPrototypeOf2.default)(ManagerLoginPage)).call(this, props));

    _this.handleSubmitLogin = _this.handleSubmitLogin.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(ManagerLoginPage, [{
    key: 'handleSubmitLogin',
    value: function handleSubmitLogin(credentials) {
      this.props.login(credentials);
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_reactHelmet2.default, { title: 'Login' }),
        _react2.default.createElement(_index2.default, {
          onSubmit: this.handleSubmitLogin
        })
      );
    }
  }]);
  return ManagerLoginPage;
}(_react.Component);

/**
 * propTypes
 * @property {Function} login - login request
 */

ManagerLoginPage.propTypes = {
  login: _react.PropTypes.func.isRequired
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
exports.default = (0, _reactRedux.connect)(_ManagerLoginSelectors2.default, {
  login: _managerActions.login
})(ManagerLoginPage);

//# sourceMappingURL=ManagerLoginPage.js.map