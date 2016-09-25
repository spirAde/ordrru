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

var _lodash = require('lodash');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactIntl = require('react-intl');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _index = require('../Icon/index.jsx');

var _index2 = _interopRequireDefault(_index);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * FilterOptionsComponent - dumb component, options filter component.
 * Smart components - none
 * Dumb components - none
 * */

var FilterOptionsComponent = function (_Component) {
  (0, _inherits3.default)(FilterOptionsComponent, _Component);

  /**
   * constructor
   * @param {object} props
   */

  function FilterOptionsComponent(props) {
    (0, _classCallCheck3.default)(this, FilterOptionsComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (FilterOptionsComponent.__proto__ || (0, _getPrototypeOf2.default)(FilterOptionsComponent)).call(this, props));

    _this.handleChangeOption = _this.handleChangeOption.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(FilterOptionsComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps);
    }

    /**
     * handleChangeOption - handle change options. pass option and checked status to parent component
     * @param {Object} option - option
     * @param {Object} event - event object
     * */

  }, {
    key: 'handleChangeOption',
    value: function handleChangeOption(option, event) {
      event.preventDefault();

      this.props.onSelect(option.set('checked', !option.get('checked')));
    }

    /**
     * renderOptions - render options
     * @param {Array.<Object>} options - list of options
     * @return {Array.<Element>} - option elements
     * */

  }, {
    key: 'renderOptions',
    value: function renderOptions(options) {
      var _this2 = this;

      return options.map(function (option, index) {
        var optionClasses = (0, _classnames2.default)('FilterOptions-field-option-name', {
          'FilterOptions-field-option-name-checked': option.get('checked')
        });

        var name = option.get('name');

        return _react2.default.createElement(
          'div',
          {
            className: 'FilterOptions-field FilterOptions-field-checkbox',
            onClick: _this2.handleChangeOption.bind(_this2, option),
            key: index
          },
          option.get('checked') ? _react2.default.createElement(_index2.default, {
            className: 'FilterOptions-icon-checkbox-checked',
            name: 'icon-checkbox-checked',
            color: '#18B2AE',
            rate: 1.25
          }) : _react2.default.createElement(_index2.default, {
            className: 'FilterOptions-icon-checkbox-unchecked',
            name: 'icon-checkbox-unchecked',
            color: '#BCC1C9',
            rate: 1.25
          }),
          _react2.default.createElement(
            'span',
            { className: optionClasses },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'options.' + name })
          )
        );
      });
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var values = this.props.values;

      var options = this.renderOptions(values);

      return _react2.default.createElement(
        'div',
        { className: 'FilterOptions-wrapper g-clear' },
        _react2.default.createElement(
          'h3',
          { className: 'FilterOptions-heading' },
          _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'filters.options' })
        ),
        _react2.default.createElement(
          'div',
          { className: 'FilterOptions-options' },
          options
        )
      );
    }
  }]);
  return FilterOptionsComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Array.<Object>} values - list of options
 * @property {Function} onSelect - select option
 */

FilterOptionsComponent.propTypes = {
  values: _reactImmutableProptypes2.default.list.isRequired,
  onSelect: _react.PropTypes.func.isRequired
};

exports.default = FilterOptionsComponent;

//# sourceMappingURL=index.js.map