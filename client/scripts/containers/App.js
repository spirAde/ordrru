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

var _debounce = require('lodash/debounce');

var _debounce2 = _interopRequireDefault(_debounce);

var _applicationActions = require('../actions/application-actions');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * App - smart component, container, root
 * Smart components - all smart components
 * Dumb components - none
 * */

var App = function (_Component) {
  (0, _inherits3.default)(App, _Component);

  function App() {
    (0, _classCallCheck3.default)(this, App);
    return (0, _possibleConstructorReturn3.default)(this, (App.__proto__ || (0, _getPrototypeOf2.default)(App)).apply(this, arguments));
  }

  (0, _createClass3.default)(App, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.initServiceWorker();
      this.initGlobalCurrentDateAndPeriod();

      this.props.changeViewport(this.getViewPort());
      window.addEventListener('resize', (0, _debounce2.default)(this.props.changeViewport.bind(this, this.getViewPort()), 250));
    }
  }, {
    key: 'getViewPort',
    value: function getViewPort() {
      return {
        height: window.innerHeight,
        width: window.innerWidth
      };
    }
  }, {
    key: 'initServiceWorker',
    value: function initServiceWorker() {
      if ('serviceWorker' in navigator) {
        console.log('service worker detect');
      }
    }
  }, {
    key: 'initGlobalCurrentDateAndPeriod',
    value: function initGlobalCurrentDateAndPeriod() {
      this.props.initGlobalCurrentDateAndPeriod(window.__REFERENCE_DATETIME__);
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
        _react2.default.createElement(_reactHelmet2.default, {
          title: 'Ordr.ru',
          titleTemplate: '%s | Ordr.ru'
        }),
        this.props.children
      );
    }
  }]);
  return App;
}(_react.Component);

App.propTypes = {
  children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.object]).isRequired,
  initGlobalCurrentDateAndPeriod: _react.PropTypes.func.isRequired,
  changeViewport: _react.PropTypes.func.isRequired,
  setDevice: _react.PropTypes.func.isRequired
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
exports.default = (0, _reactRedux.connect)(function (state) {
  return state;
}, {
  initGlobalCurrentDateAndPeriod: _applicationActions.initGlobalCurrentDateAndPeriod,
  changeViewport: _applicationActions.changeViewport,
  setDevice: _applicationActions.setDevice
})(App);

//# sourceMappingURL=App.js.map