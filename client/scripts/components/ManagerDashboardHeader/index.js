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

require('./style.css');

var _index = require('../Icon/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _logo = require('../../../images/logo.png');

var _logo2 = _interopRequireDefault(_logo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ManagerDashboardHeaderComponent - header of dashboard
 * Smart components - none
 * Dumb components - none
 * */

var ManagerDashboardHeaderComponent = function (_Component) {
  (0, _inherits3.default)(ManagerDashboardHeaderComponent, _Component);

  /**
   * constructor
   * @param {object} props
   */

  function ManagerDashboardHeaderComponent(props) {
    (0, _classCallCheck3.default)(this, ManagerDashboardHeaderComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ManagerDashboardHeaderComponent).call(this, props));

    _this.handleClickLogout = _this.handleClickLogout.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(ManagerDashboardHeaderComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }
  }, {
    key: 'handleClickLogout',
    value: function handleClickLogout(event) {
      event.preventDefault();

      this.props.onSubmit();
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var manager = this.props.manager;

      var fullName = manager.get('secondName') + ' ' + manager.get('firstName');

      return _react2.default.createElement(
        'div',
        { className: 'ManagerDashboardHeader' },
        _react2.default.createElement(
          'div',
          { className: 'ManagerDashboardHeader-menu' },
          _react2.default.createElement(
            'div',
            { className: 'ManagerDashboardHeader-logo-field' },
            _react2.default.createElement('img', { className: 'ManagerDashboardHeader-logo-image', src: _logo2.default, alt: '' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'ManagerDashboardHeader-links' },
            _react2.default.createElement(
              'a',
              { className: 'ManagerDashboardHeader-link ManagerDashboardHeader-link-history' },
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'history' })
            ),
            _react2.default.createElement(
              'a',
              { className: 'ManagerDashboardHeader-link ManagerDashboardHeader-link-message' },
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'messages' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'ManagerDashboardHeader-user' },
            _react2.default.createElement(
              'a',
              { className: 'ManagerDashboardHeader-username' },
              fullName
            ),
            _react2.default.createElement(
              'a',
              { className: 'ManagerDashboardHeader-logout icons', onClick: this.handleClickLogout },
              _react2.default.createElement(_index2.default, {
                name: 'icon-exit',
                rate: 1.5
              })
            )
          )
        )
      );
    }
  }]);
  return ManagerDashboardHeaderComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Object} manager - manager data
 * @property {Function} onSubmit - send user credentials
 */

ManagerDashboardHeaderComponent.propTypes = {
  manager: _reactImmutableProptypes2.default.map.isRequired,
  onSubmit: _react.PropTypes.func.isRequired
};

exports.default = ManagerDashboardHeaderComponent;

//# sourceMappingURL=index.js.map