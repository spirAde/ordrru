'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _reactIntl = require('react-intl');

var _shallowEqual = require('../../utils/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * LoaderComponent - loading spinner component
 * Smart components - none
 * Dumb components - none
 * */

var LoaderComponent = function (_Component) {
  (0, _inherits3.default)(LoaderComponent, _Component);

  function LoaderComponent() {
    (0, _classCallCheck3.default)(this, LoaderComponent);
    return (0, _possibleConstructorReturn3.default)(this, (LoaderComponent.__proto__ || (0, _getPrototypeOf2.default)(LoaderComponent)).apply(this, arguments));
  }

  (0, _createClass3.default)(LoaderComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqual2.default)(this.props, nextProps) || !(0, _shallowEqual2.default)(this.state, nextState);
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var children = _props.children;
      var active = _props.active;

      var backgroundDefaultStyle = {
        display: 'block',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10
      };

      var foregroundDefaultStyle = {
        display: 'table',
        width: '100%',
        height: '100%',
        textAlign: 'center',
        zIndex: 20,
        color: 'white'
      };

      var messageDefaultStyle = {
        display: 'table-cell',
        verticalAlign: 'middle'
      };

      var contentStyle = (0, _assign2.default)({
        position: 'relative',
        opacity: 1
      });

      var loaderStyle = { position: 'relative' };

      var classes = (0, _classnames2.default)('loading-container', this.props.className);

      // use like overlay
      if (children) {
        return _react2.default.createElement(
          'div',
          { style: loaderStyle },
          _react2.default.createElement(
            'div',
            { className: 'Loader__content', style: contentStyle },
            children
          ),
          active ? _react2.default.createElement(
            'div',
            { className: 'Loader__background', style: backgroundDefaultStyle },
            _react2.default.createElement(
              'div',
              { className: 'Loader__foreground', style: foregroundDefaultStyle },
              _react2.default.createElement(
                'div',
                { className: 'Loader__message', style: messageDefaultStyle },
                _react2.default.createElement(
                  'div',
                  { className: classes },
                  _react2.default.createElement('div', { className: 'loading' }),
                  _react2.default.createElement(
                    'div',
                    { className: 'loading-text' },
                    _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'loading' })
                  )
                )
              )
            )
          ) : null
        );
      }

      return _react2.default.createElement(
        'div',
        { className: classes },
        _react2.default.createElement('div', { className: 'loading' }),
        _react2.default.createElement(
          'div',
          { className: 'loading-text' },
          _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'loading' })
        )
      );
    }
  }]);
  return LoaderComponent;
}(_react.Component);

/**
 * propTypes
 * @property {boolean} active - active
 */

LoaderComponent.propTypes = {
  active: _react.PropTypes.bool.isRequired,
  className: _react.PropTypes.string,
  children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.object]).isRequired
};

LoaderComponent.defaultProps = {
  active: true
};

exports.default = LoaderComponent;

//# sourceMappingURL=index.js.map