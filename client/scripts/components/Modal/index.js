'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

require('./style.css');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModalComponent = function ModalComponent(_ref) {
  var children = _ref.children;
  var active = _ref.active;
  var width = _ref.width;
  var height = _ref.height;

  var maskClasses = (0, _classnames2.default)('Modal-mask', {
    'Modal-mask--active': active
  });

  var panelClasses = (0, _classnames2.default)('Modal-panel', {
    'Modal-panel--hidden': !active
  });

  return _react2.default.createElement(
    'div',
    { className: 'Modal' },
    _react2.default.createElement('div', { className: maskClasses }),
    _react2.default.createElement(
      'div',
      { className: panelClasses, style: { width: width, height: height } },
      children
    )
  );
};

ModalComponent.defaultProps = {
  active: false,
  width: 500,
  height: 500
};

ModalComponent.propTypes = {
  active: _react.PropTypes.bool,
  children: _react.PropTypes.array.isRequired,
  width: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.number]),
  height: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.number])
};

exports.default = ModalComponent;

//# sourceMappingURL=index.js.map