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
 * FilterSortingComponent - dumb component, sorting rooms by popularity, distance, price.
 * Smart components - none
 * Dumb components - none
 * */

var FilterSortingComponent = function (_Component) {
  (0, _inherits3.default)(FilterSortingComponent, _Component);

  /**
   * constructor
   * @param {object} props
   */

  function FilterSortingComponent(props) {
    (0, _classCallCheck3.default)(this, FilterSortingComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (FilterSortingComponent.__proto__ || (0, _getPrototypeOf2.default)(FilterSortingComponent)).call(this, props));

    _this.handleClickSortingType = _this.handleClickSortingType.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(FilterSortingComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps);
    }

    /**
     * handle sorting type click
     * @param {Object} event - SytheticEvent
     * @return {void}
     * */

  }, {
    key: 'handleClickSortingType',
    value: function handleClickSortingType(event) {
      event.preventDefault();

      var values = this.props.values;

      var element = event.target;

      while (element.tagName !== 'DIV') {
        element = element.parentElement;
      }

      var parentNode = element.parentNode;
      var typeIndex = (0, _lodash.indexOf)(parentNode.childNodes, element);
      var type = values.get(typeIndex);

      var currentSortingType = values.find(function (sortingType) {
        return sortingType.get('checked');
      });

      // TODO: need fix
      if (currentSortingType.get('name') === type.get('name')) {
        this.props.onSelect(currentSortingType.set('isDesc', !currentSortingType.get('isDesc')));
      } else {
        this.props.onSelect(type.set('checked', true));
      }
    }

    /**
     * render sorting type boxes
     * @param {Array.<Object>} types - list of types
     * @return {Array.<Element>}
     * */

  }, {
    key: 'renderSortingType',
    value: function renderSortingType(types) {
      var _this2 = this;

      return types.map(function (type, index) {
        var classes = (0, _classnames2.default)('FilterSorting-button', {
          'FilterSorting-button--active': type.get('checked')
        });

        var icon = undefined;

        if (type.get('checked') && !type.get('isDesc')) {
          icon = _react2.default.createElement(_index2.default, {
            className: 'FilterSorting-icon-chevron-up',
            name: 'icon-chevron-up',
            color: '#18B2AE'
          });
        } else if (type.get('checked') && type.get('isDesc')) {
          icon = _react2.default.createElement(_index2.default, {
            className: 'FilterSorting-icon-chevron-down',
            name: 'icon-chevron-down',
            color: '#18B2AE'
          });
        }

        return _react2.default.createElement(
          'div',
          { className: 'FilterSorting-field', key: index, onClick: _this2.handleClickSortingType },
          _react2.default.createElement(
            'a',
            { className: classes },
            icon,
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'sorting.' + type.get('name') })
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

      var renderedTypes = this.renderSortingType(values);

      return _react2.default.createElement(
        'div',
        { className: 'FilterSorting' },
        _react2.default.createElement(
          'div',
          { className: 'FilterSorting-wrapper g-clear' },
          _react2.default.createElement(
            'h3',
            { className: 'FilterSorting-heading' },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'filters.sorting' })
          ),
          _react2.default.createElement(
            'div',
            null,
            renderedTypes
          )
        )
      );
    }
  }]);
  return FilterSortingComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Array.<Object>} values - list of options
 * @property {Function} onSelect - select option
 */

FilterSortingComponent.propTypes = {
  values: _reactImmutableProptypes2.default.list.isRequired,
  onSelect: _react.PropTypes.func.isRequired
};

exports.default = FilterSortingComponent;

//# sourceMappingURL=index.js.map