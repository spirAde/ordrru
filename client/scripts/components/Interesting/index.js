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

var _index = require('../SingleSelectField/index.jsx');

var _index2 = _interopRequireDefault(_index);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * InterestingComponent
 * Smart components - none
 * Dumb components - none
 * */

var InterestingComponent = function (_Component) {
  (0, _inherits3.default)(InterestingComponent, _Component);

  function InterestingComponent() {
    (0, _classCallCheck3.default)(this, InterestingComponent);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(InterestingComponent).apply(this, arguments));
  }

  (0, _createClass3.default)(InterestingComponent, [{
    key: 'render',

    /**
     * render
     * @return {XML} - React element
     * */
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'Interesting' },
        _react2.default.createElement(
          'div',
          { className: 'Interesting-wrapper' },
          _react2.default.createElement(
            'h2',
            { className: 'Interesting-heading' },
            'Интересно?'
          ),
          _react2.default.createElement(
            'div',
            { className: 'g-clear' },
            _react2.default.createElement(
              'div',
              { className: 'Interesting-field field-select' },
              _react2.default.createElement(_index2.default, {
                options: this.props.cities,
                index: '1',
                name: 'name',
                onChange: this.props.onChangeCity
              })
            ),
            _react2.default.createElement(
              'div',
              { className: 'Interesting-field field-select' },
              _react2.default.createElement(_index2.default, {
                options: this.props.types,
                name: 'type',
                onChange: this.props.onChangeOrganizationType
              })
            ),
            _react2.default.createElement(
              'div',
              { className: 'Interesting-field g-buttons' },
              _react2.default.createElement(
                'a',
                { className: 'Interesting-anchor' },
                'Перейти'
              )
            )
          )
        )
      );
    }
  }]);
  return InterestingComponent;
}(_react.Component);

/**
 * propTypes
 * @property {array<object>} cities - list of cities
 * @property {array<object>} types - list of types
 * @property {function} onChangeCity - change selected city
 * @property {function} onChangeOrganizationType - change selected organization type
 * */

InterestingComponent.propTypes = {
  cities: _react.PropTypes.arrayOf(_react.PropTypes.object).isRequired,
  types: _react.PropTypes.arrayOf(_react.PropTypes.object).isRequired,
  onChangeCity: _react.PropTypes.func.isRequired,
  onChangeOrganizationType: _react.PropTypes.func.isRequired
};

exports.default = InterestingComponent;

//# sourceMappingURL=index.js.map