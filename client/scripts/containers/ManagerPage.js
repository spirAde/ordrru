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

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _index = require('../components/NotificationsStack/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _notificationActions = require('../actions/notification-actions');

var _ManagerSelectors = require('../selectors/ManagerSelectors');

var _ManagerSelectors2 = _interopRequireDefault(_ManagerSelectors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ManagerPage - main manager page
 * Smart components - none
 * Dumb components - none
 * */

var ManagerPage = function (_Component) {
  (0, _inherits3.default)(ManagerPage, _Component);

  function ManagerPage(props) {
    (0, _classCallCheck3.default)(this, ManagerPage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ManagerPage.__proto__ || (0, _getPrototypeOf2.default)(ManagerPage)).call(this, props));

    _this.handleCloseNotification = _this.handleCloseNotification.bind(_this);
    return _this;
  }

  /**
   * handleCloseNotification - handle uuid for notification
   * */

  (0, _createClass3.default)(ManagerPage, [{
    key: 'handleCloseNotification',
    value: function handleCloseNotification(uuid) {
      this.props.removeNotification(uuid);
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var notifications = this.props.notifications;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_reactHelmet2.default, {
          titleTemplate: '%s | Manager'
        }),
        _react2.default.createElement(_index2.default, {
          notifications: notifications,
          onCloseNotification: this.handleCloseNotification
        }),
        this.props.children
      );
    }
  }]);
  return ManagerPage;
}(_react.Component);

/**
 * propTypes
 * @property {Array|Object} children - children
 * @property {Array.<Object>} notifications - list of notifications
 * @property {Function} removeNotification - remove notification from list
 */

ManagerPage.propTypes = {
  children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.object]).isRequired,
  notifications: _reactImmutableProptypes2.default.list.isRequired,
  removeNotification: _react.PropTypes.func.isRequired
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
exports.default = (0, _reactRedux.connect)(_ManagerSelectors2.default, {
  removeNotification: _notificationActions.removeNotification
})(ManagerPage);

//# sourceMappingURL=ManagerPage.js.map