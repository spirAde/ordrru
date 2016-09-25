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

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SingleSelectFieldComponent = function (_Component) {
  (0, _inherits3.default)(SingleSelectFieldComponent, _Component);

  function SingleSelectFieldComponent(props) {
    (0, _classCallCheck3.default)(this, SingleSelectFieldComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SingleSelectFieldComponent.__proto__ || (0, _getPrototypeOf2.default)(SingleSelectFieldComponent)).call(this, props));

    _this.state = {
      selectedIndex: props.index || 0,
      boxIsOpen: false
    };
    return _this;
  }

  (0, _createClass3.default)(SingleSelectFieldComponent, [{
    key: 'handleChange',
    value: function handleChange(index, event) {
      event.preventDefault();
      this.props.onChange(index);
      this.setState({
        selectedIndex: index,
        boxIsOpen: false
      });
    }
  }, {
    key: 'handleClickBox',
    value: function handleClickBox(event) {
      event.preventDefault();
      this.setState({
        boxIsOpen: !this.state.boxIsOpen
      });
    }
  }, {
    key: 'renderRows',
    value: function renderRows() {
      var _this2 = this;

      var _props = this.props;
      var options = _props.options;
      var name = _props.name;

      return options.map(function (option, index) {
        var classes = (0, _classnames2.default)('SingleSelectField-option', {
          'SingleSelectField-option--selected': _this2.state.selectedIndex === index,
          'SingleSelectField-option--first': index === 0,
          'SingleSelectField-option--last': index === _this2.props.options.length
        });

        return _react2.default.createElement(
          'li',
          { className: classes, key: index, onClick: _this2.handleChange.bind(_this2, index) },
          _react2.default.createElement(
            'label',
            null,
            _react2.default.createElement(
              'span',
              null,
              option[name]
            )
          )
        );
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var options = _props2.options;
      var name = _props2.name;

      var wrapperClasses = (0, _classnames2.default)({
        'SingleSelectField-options-wrapper': true,
        'SingleSelectField-options-wrapper--opened': this.state.boxIsOpen
      });

      var rows = this.renderRows();

      return _react2.default.createElement(
        'div',
        { className: 'SingleSelectField' },
        _react2.default.createElement(
          'p',
          { className: 'SingleSelectField-caption', onClick: this.handleClickBox.bind(this) },
          _react2.default.createElement(
            'span',
            null,
            options[this.state.selectedIndex][name]
          ),
          _react2.default.createElement(
            'label',
            null,
            _react2.default.createElement('i', null)
          )
        ),
        _react2.default.createElement(
          'div',
          { className: wrapperClasses },
          _react2.default.createElement(
            'ul',
            { className: 'SingleSelectField-options' },
            rows
          )
        )
      );
    }
  }]);
  return SingleSelectFieldComponent;
}(_react.Component);

SingleSelectFieldComponent.propTypes = {
  options: _react.PropTypes.array,
  name: _react.PropTypes.string,
  index: _react.PropTypes.number,
  onChange: _react.PropTypes.func.isRequired
};

exports.default = SingleSelectFieldComponent;

//# sourceMappingURL=index.js.map