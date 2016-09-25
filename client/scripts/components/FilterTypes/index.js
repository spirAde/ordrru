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
 * FilterTypeComponent - dumb component, types filter component.
 * Smart components - none
 * Dumb components - none
 * */

var FilterTypeComponent = function (_Component) {
  (0, _inherits3.default)(FilterTypeComponent, _Component);

  /**
   * constructor
   * @param {object} props
   */

  function FilterTypeComponent(props) {
    (0, _classCallCheck3.default)(this, FilterTypeComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(FilterTypeComponent).call(this, props));

    _this.handleChangeType = _this.handleChangeType.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(FilterTypeComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps);
    }

    /**
     * handleChangeType - handle change indexes. pass type and checked status to parent component
     * @param {Object} event - event object
     * */

  }, {
    key: 'handleChangeType',
    value: function handleChangeType(event) {
      event.preventDefault();

      var values = this.props.values;

      var element = event.target;

      while (element.tagName !== 'DIV') {
        element = element.parentElement;
      }

      var parentNode = element.parentNode;
      var typeIndex = (0, _lodash.indexOf)(parentNode.childNodes, element);
      var type = values.get(typeIndex);

      this.props.onSelect(type.set('checked', !type.get('checked')));
    }

    /**
     * renderTypes - render types
     * @param {Array.<Object>} types - list of types
     * @return {Array.<Element>} - types elements
     * */

  }, {
    key: 'renderTypes',
    value: function renderTypes(types) {
      var _this2 = this;

      return types.map(function (type, index) {
        var typeClasses = (0, _classnames2.default)('FilterType-field-type-name', {
          'FilterType-field-type-name-checked': type.get('checked')
        });

        var name = type.get('name');

        return _react2.default.createElement(
          'div',
          {
            className: 'FilterType-field FilterType-field-checkbox',
            onClick: _this2.handleChangeType,
            key: index
          },
          type.get('checked') ? _react2.default.createElement(_index2.default, {
            className: 'FilterType-icon-checkbox-checked',
            name: 'icon-checkbox-checked',
            color: '#18B2AE',
            rate: 1.25
          }) : _react2.default.createElement(_index2.default, {
            className: 'FilterType-icon-checkbox-unchecked',
            name: 'icon-checkbox-unchecked',
            color: '#BCC1C9',
            rate: 1.25
          }),
          _react2.default.createElement(
            'span',
            { className: typeClasses },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'bathhouseType.' + name })
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

      var types = this.renderTypes(values);

      return _react2.default.createElement(
        'div',
        { className: 'FilterType' },
        _react2.default.createElement(
          'div',
          { className: 'FilterType-wrapper g-clear' },
          _react2.default.createElement(
            'h3',
            { className: 'FilterType-heading' },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'filters.type' })
          ),
          _react2.default.createElement(
            'div',
            null,
            types
          )
        )
      );
    }
  }]);
  return FilterTypeComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Array.<Object>} values - list of types
 * @property {Function} onSelect - select type
 */

FilterTypeComponent.propTypes = {
  values: _reactImmutableProptypes2.default.list.isRequired,
  onSelect: _react.PropTypes.func.isRequired
};

exports.default = FilterTypeComponent;

//# sourceMappingURL=index.js.map