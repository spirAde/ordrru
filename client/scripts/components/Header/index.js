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

var _reactRouter = require('react-router');

var _reactIntl = require('react-intl');

var _reactRedux = require('react-redux');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _HeaderSelectors = require('../../selectors/HeaderSelectors');

var _HeaderSelectors2 = _interopRequireDefault(_HeaderSelectors);

require('./style.css');

var _index = require('../Icon/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _logo = require('../../../images/logo.png');

var _logo2 = _interopRequireDefault(_logo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * HeaderComponent - dumb component, component for change page mode;
 * Smart components - none
 * Dumb components - none
 * */

var HeaderComponent = function (_Component) {
  (0, _inherits3.default)(HeaderComponent, _Component);

  /**
   * constructor
   * @param {object} props
   */

  function HeaderComponent(props) {
    (0, _classCallCheck3.default)(this, HeaderComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (HeaderComponent.__proto__ || (0, _getPrototypeOf2.default)(HeaderComponent)).call(this, props));

    _this.handleChangeMode = _this.handleChangeMode.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(HeaderComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return nextProps.mode !== this.props.mode;
    }

    /**
     * handleChangeMode - handle change mode of page. pass mode to parent component
     * @param {String} selectedMode - mode
     * @param {Object} event - SyntheticEvent
     * */

  }, {
    key: 'handleChangeMode',
    value: function handleChangeMode(selectedMode, event) {
      event.preventDefault();

      var mode = this.props.mode;

      if (mode === selectedMode) {
        return false;
      }

      return this.context.router.push('/bathhouses?city=mgn&mode=' + selectedMode);
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var mode = this.props.mode;

      var isListMode = mode === 'list';

      var listButtonClasses = (0, _classnames2.default)('Header-anchor Header-anchor-mode-list Header-anchor--first', {
        'Header-anchor--active': isListMode
      });

      var mapButtonClasses = (0, _classnames2.default)('Header-anchor Header-anchor-mode-map Header-anchor--last', {
        'Header-anchor--active': !isListMode
      });

      return _react2.default.createElement(
        'div',
        { className: 'Header' },
        _react2.default.createElement(
          'div',
          { className: 'Header-wrapper g-clear' },
          _react2.default.createElement(
            'div',
            { className: 'Header-logo' },
            _react2.default.createElement(
              _reactRouter.Link,
              { to: { pathname: '/' } },
              _react2.default.createElement('img', { src: _logo2.default, alt: '', width: '130', height: '40' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'Header-select-city' },
            'Магнитогорск'
          ),
          _react2.default.createElement(
            'div',
            { className: 'Header-mode' },
            _react2.default.createElement(
              'a',
              { className: listButtonClasses, onClick: this.handleChangeMode.bind(this, 'list') },
              _react2.default.createElement(_index2.default, {
                className: 'Header-icon',
                name: 'icon-list',
                rate: 1.5
              }),
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'mode.list' })
            ),
            _react2.default.createElement(
              'a',
              { className: mapButtonClasses, onClick: this.handleChangeMode.bind(this, 'map') },
              _react2.default.createElement(_index2.default, {
                className: 'Header-icon',
                name: 'icon-location-point-mapbox',
                rate: 1.5
              }),
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'mode.map' })
            )
          )
        )
      );
    }
  }]);
  return HeaderComponent;
}(_react.Component);

/**
 * propTypes
 * @property {string} mode - current mode of page
 * @property {Function} changeMode - change url params and change mode of page
 */

HeaderComponent.propTypes = {
  mode: _react.PropTypes.oneOf(['list', 'map'])
};

/**
 * contextTypes
 * @property {Object} router
 */
HeaderComponent.contextTypes = {
  router: _react.PropTypes.object.isRequired
};

exports.default = (0, _reactRedux.connect)(_HeaderSelectors2.default)(HeaderComponent);

//# sourceMappingURL=index.js.map