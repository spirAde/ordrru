'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * IconComponent - component for render svg
 * Smart components - none
 * Dumb components - none
 * */

var IconComponent = function (_Component) {
  (0, _inherits3.default)(IconComponent, _Component);

  function IconComponent() {
    (0, _classCallCheck3.default)(this, IconComponent);
    return (0, _possibleConstructorReturn3.default)(this, (IconComponent.__proto__ || (0, _getPrototypeOf2.default)(IconComponent)).apply(this, arguments));
  }

  (0, _createClass3.default)(IconComponent, [{
    key: 'shouldComponentUpdate',

    /**
     * shouldComponentUpdate
     * @return {boolean}
     * */
    value: function shouldComponentUpdate(nextProps, nextState) {
      return (0, _reactAddonsShallowCompare2.default)(this, nextProps, nextState);
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var rate = _props.rate;
      var name = _props.name;
      var color = _props.color;
      var className = _props.className;
      var otherProps = (0, _objectWithoutProperties3.default)(_props, ['rate', 'name', 'color', 'className']);

      var classes = (0, _classnames2.default)(className, 'Icon');

      return _react2.default.createElement(
        'svg',
        (0, _extends3.default)({
          className: classes,
          style: {
            fill: color,
            height: rate + 'em',
            width: rate + 'em'
          }
        }, otherProps),
        _react2.default.createElement('use', { xlinkHref: '#' + name })
      );
    }
  }]);
  return IconComponent;
}(_react.Component);

/**
 * propTypes
 * @property {string} name - name of svg icon
 * @property {string} color - color fill
 */

IconComponent.propTypes = {
  name: _react.PropTypes.string,
  color: _react.PropTypes.string,
  rate: _react.PropTypes.number,
  className: _react.PropTypes.string
};

IconComponent.defaultProps = {
  rate: 1
};

exports.default = IconComponent;

//# sourceMappingURL=index.js.map