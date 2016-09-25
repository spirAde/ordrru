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

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactIntl = require('react-intl');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _index = require('../Icon/index.jsx');

var _index2 = _interopRequireDefault(_index);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var timer = null;

/**
 * NotificationComponent - notifier component
 * Smart components - none
 * Dumb components - none
 * */

var NotificationComponent = function (_Component) {
  (0, _inherits3.default)(NotificationComponent, _Component);

  function NotificationComponent(props) {
    (0, _classCallCheck3.default)(this, NotificationComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(NotificationComponent).call(this, props));

    _this.handleFinishTimeout = _this.handleFinishTimeout.bind(_this);
    _this.handleClickCloseButton = _this.handleClickCloseButton.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(NotificationComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var notification = this.props.notification;

      if (notification.has('interval')) {
        timer = setTimeout(this.handleFinishTimeout, notification.get('interval') * 1000);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (timer) clearTimeout(timer);
    }
  }, {
    key: 'handleFinishTimeout',
    value: function handleFinishTimeout() {
      clearTimeout(timer);
    }
  }, {
    key: 'handleClickCloseButton',
    value: function handleClickCloseButton(event) {
      event.preventDefault();

      var notification = this.props.notification;

      this.props.onCloseNotification(notification.get('uuid'));
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var notification = _props.notification;
      var offset = _props.offset;

      var notieClasses = (0, _classnames2.default)('Notie Notie--active Notie-type-' + notification.get('level'));

      return _react2.default.createElement(
        'div',
        { className: notieClasses, style: { marginTop: offset } },
        _react2.default.createElement(
          'div',
          { className: 'Notie-inner' },
          _react2.default.createElement(
            'div',
            { className: 'Notie-content' },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: notification.get('message') })
          ),
          _react2.default.createElement(
            'div',
            {
              className: 'Notie-close-button',
              onClick: this.handleClickCloseButton
            },
            _react2.default.createElement(_index2.default, {
              name: 'icon-cancel',
              rate: 1.5,
              color: '#FFFFFF'
            })
          )
        )
      );
    }
  }]);
  return NotificationComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Object} notification - notification object(message, interval, level)
 * @property {Number} offset - offset from top
 * @property {Function} onCloseNotification - event for close of notification
 */

NotificationComponent.propTypes = {
  notification: _reactImmutableProptypes2.default.map.isRequired,
  offset: _react.PropTypes.number.isRequired,
  onCloseNotification: _react.PropTypes.func.isRequired
};

exports.default = NotificationComponent;

//# sourceMappingURL=index.js.map