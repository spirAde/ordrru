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

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * FilterPrepaymentComponent - dumb component, prepayment filter component.
 * Smart components - none
 * Dumb components - none
 * */

var FilterPrepaymentComponent = function (_Component) {
  (0, _inherits3.default)(FilterPrepaymentComponent, _Component);

  /**
   * constructor
   * @param {object} props
   */

  function FilterPrepaymentComponent(props) {
    (0, _classCallCheck3.default)(this, FilterPrepaymentComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (FilterPrepaymentComponent.__proto__ || (0, _getPrototypeOf2.default)(FilterPrepaymentComponent)).call(this, props));

    _this.handleClick = _this.handleClick.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(FilterPrepaymentComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps);
    }

    /**
     * handleClick - handle select index of prepayment types. pass
     *               checked prepayment type to parent component
     * @param {object} type - checked index
     * @param {object} event - event object
     * */

  }, {
    key: 'handleClick',
    value: function handleClick(event) {
      event.preventDefault();

      var values = this.props.values;

      var element = event.target;

      while (element.tagName !== 'LI') {
        element = element.parentElement;
      }

      var parentNode = element.parentNode;
      var typeIndex = (0, _lodash.indexOf)(parentNode.childNodes, element);
      var type = values.get(typeIndex);

      if (type.get('checked')) return false;

      return this.props.onSelect(type);
    }

    /**
     * renderPrepaymentTypes - render prepayment types
     * @param {Array.<Object>} types - list of prepayment types
     * @return {Array.<Element>} - prepayment types elements
     * */

  }, {
    key: 'renderPrepaymentTypes',
    value: function renderPrepaymentTypes(types) {
      var _this2 = this;

      return types.map(function (type, index) {
        var id = (0, _lodash.isNull)(type.get('isRequired')) ? 'prepayment.whatever' : type.get('isRequired') ? 'prepayment.yes' : 'prepayment.no';

        var labelClasses = (0, _classnames2.default)('FilterPrepayment-button-label', {
          'FilterPrepayment-button-label--checked': type.get('checked')
        });

        var checkClasses = (0, _classnames2.default)('FilterPrepayment-button-check', {
          'FilterPrepayment-button-check--checked': type.get('checked')
        });

        var insideClasses = (0, _classnames2.default)({
          'FilterPrepayment-button-inside': type.get('checked')
        });

        return _react2.default.createElement(
          'li',
          { className: 'FilterPrepayment-button', key: index, onClick: _this2.handleClick },
          _react2.default.createElement('input', { className: 'FilterPrepayment-button-input', type: 'checkbox' }),
          _react2.default.createElement(
            'label',
            { className: labelClasses },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: id })
          ),
          _react2.default.createElement(
            'div',
            { className: checkClasses },
            _react2.default.createElement('div', { className: insideClasses })
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

      var types = this.renderPrepaymentTypes(values);

      return _react2.default.createElement(
        'div',
        { className: 'FilterPrepayment' },
        _react2.default.createElement(
          'div',
          { className: 'FilterPrepayment-wrapper g-clear' },
          _react2.default.createElement(
            'h3',
            { className: 'FilterPrepayment-heading' },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'filters.prepayment' })
          ),
          _react2.default.createElement(
            'ul',
            { className: 'FilterPrepayment-buttons' },
            types
          )
        )
      );
    }
  }]);
  return FilterPrepaymentComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Array.<Object>} values - list of prepayment types
 * @property {function} onSelect - select prepayment type
 */

FilterPrepaymentComponent.propTypes = {
  values: _reactImmutableProptypes2.default.list.isRequired,
  onSelect: _react.PropTypes.func.isRequired
};

exports.default = FilterPrepaymentComponent;

//# sourceMappingURL=index.js.map