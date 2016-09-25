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

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _floor = require('lodash/floor');

var _floor2 = _interopRequireDefault(_floor);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _dateHelper = require('../../../../common/utils/date-helper');

var _shallowEqual = require('../../utils/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _index = require('../Icon/index.jsx');

var _index2 = _interopRequireDefault(_index);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * DatePaginatorComponent - dates pagination
 * Smart components - none
 * Dumb components - none
 * */

var DatePaginatorComponent = function (_Component) {
  (0, _inherits3.default)(DatePaginatorComponent, _Component);

  function DatePaginatorComponent() {
    (0, _classCallCheck3.default)(this, DatePaginatorComponent);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DatePaginatorComponent).apply(this, arguments));
  }

  (0, _createClass3.default)(DatePaginatorComponent, [{
    key: 'shouldComponentUpdate',

    /**
     * shouldComponentUpdate
     * @return {boolean}
     * */
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqual2.default)(this.props, nextProps) || !(0, _shallowEqual2.default)(this.state, nextState);
    }
  }, {
    key: 'getDates',
    value: function getDates() {
      var date = this.props.date;
      var _props = this.props;
      var width = _props.width;
      var selectedItemWidth = _props.selectedItemWidth;
      var itemWidth = _props.itemWidth;
      var navItemWidth = _props.navItemWidth;
      var selectedDateFormat = _props.selectedDateFormat;
      var selectedItemText = _props.selectedItemText;
      var itemText = _props.itemText;
      var offDays = _props.offDays;
      var startOfWeek = _props.startOfWeek;
      var offDaysFormat = _props.offDaysFormat;
      var startOfWeekFormat = _props.startOfWeekFormat;

      var itemsCount = (0, _floor2.default)((width - selectedItemWidth - 2 * navItemWidth) / itemWidth);
      var sideRangeDateValue = (0, _floor2.default)(itemsCount / 2);

      var start = (0, _moment2.default)(date).subtract(sideRangeDateValue, 'days');
      var end = (0, _moment2.default)(date).add(sideRangeDateValue, 'days');

      var today = (0, _moment2.default)();

      var dates = [];

      for (var momentMark = start; momentMark.isBefore(end); momentMark.add(1, 'days')) {
        dates[dates.length] = {
          m: momentMark.clone().format(selectedDateFormat),
          isSelected: momentMark.isSame(date),
          isToday: momentMark.isSame(today),
          isOffDay: offDays.split(',').indexOf(momentMark.format(offDaysFormat)) !== -1,
          isStartOfWeek: startOfWeek.split(',').indexOf(momentMark.format(startOfWeekFormat)) !== -1,
          text: momentMark.isSame(date) ? momentMark.format(selectedItemText) : momentMark.format(itemText),
          formatted: momentMark.format(_dateHelper.MOMENT_FORMAT)
        };
      }

      return dates;
    }
  }, {
    key: 'handleClickDate',
    value: function handleClickDate(date, event) {
      event.preventDefault();

      this.props.onSelectDate(date);
    }
  }, {
    key: 'handleClickNavigation',
    value: function handleClickNavigation(direction, event) {
      event.preventDefault();

      var selectedDate = this.state.selectedDate;

      var newDate = direction === 'left' ? (0, _moment2.default)(selectedDate).subtract(1, 'days').format(_dateHelper.MOMENT_FORMAT) : (0, _moment2.default)(selectedDate).add(1, 'days').format(_dateHelper.MOMENT_FORMAT);

      this.props.onSelectDate(newDate);
    }
  }, {
    key: 'renderDates',
    value: function renderDates(dates) {
      var _this2 = this;

      var _props2 = this.props;
      var selectedItemWidth = _props2.selectedItemWidth;
      var itemWidth = _props2.itemWidth;

      return (0, _map2.default)(dates, function (date, index) {
        var classes = (0, _classnames2.default)('DatePaginator-item', {
          'DatePaginator-item--selected': date.isSelected,
          'DatePaginator-item--today': date.isToday,
          'DatePaginator-item--off': date.isOffDay,
          'DatePaginator-item--divider': date.isStartOfWeek
        });

        var cellWidth = date.isSelected ? selectedItemWidth : itemWidth;

        return _react2.default.createElement(
          'li',
          {
            className: 'DatePaginator-item-outer',
            onClick: _this2.handleClickDate.bind(_this2, date.formatted),
            key: index
          },
          _react2.default.createElement(
            'a',
            { className: classes, style: { width: cellWidth + 'px' } },
            _react2.default.createElement('span', { dangerouslySetInnerHTML: { __html: date.text } })
          )
        );
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var dates = this.getDates();
      var renderedDates = this.renderDates(dates);

      return _react2.default.createElement(
        'div',
        { className: 'DatePaginator', ref: 'datepaginator' },
        _react2.default.createElement(
          'div',
          { className: 'DatePaginator-wrapper' },
          _react2.default.createElement(
            'div',
            { className: 'DatePaginator-datepaginator' },
            _react2.default.createElement(
              'ul',
              { className: 'DatePaginator-pagination' },
              _react2.default.createElement(
                'li',
                {
                  className: 'DatePaginator-item-outer',
                  onClick: this.handleClickNavigation.bind(this, 'left')
                },
                _react2.default.createElement(_index2.default, {
                  className: 'DatePaginator-nav-item',
                  name: 'icon-chevron-left',
                  rate: 2
                })
              ),
              renderedDates,
              _react2.default.createElement(
                'li',
                {
                  className: 'DatePaginator-item-outer',
                  onClick: this.handleClickNavigation.bind(this, 'right')
                },
                _react2.default.createElement(_index2.default, {
                  className: 'DatePaginator-nav-item',
                  name: 'icon-chevron-right',
                  rate: 2
                })
              )
            )
          )
        )
      );
    }
  }]);
  return DatePaginatorComponent;
}(_react.Component);

DatePaginatorComponent.defaultProps = {
  width: 0,

  format: 'Do MMM',

  selectedDate: (0, _moment2.default)().clone().startOf('day'),
  selectedDateFormat: 'YYYY-MM-DD',
  selectedItemWidth: 140,
  selectedItemText: 'dddd<br/>Do, MMMM YYYY',

  itemDateFormat: 'Do MMM',
  itemWidth: 75,
  itemText: 'ddd<br/>Do',

  navItemWidth: 20,

  offDays: 'сб,вс',
  offDaysFormat: 'ddd',

  startOfWeek: 'пн',
  startOfWeekFormat: 'ddd'
};

/**
 * propTypes
 */
DatePaginatorComponent.propTypes = {
  date: _react.PropTypes.string.isRequired,
  width: _react.PropTypes.number,
  onSelectDate: _react.PropTypes.func.isRequired,

  format: _react.PropTypes.string,

  selectedDateFormat: _react.PropTypes.string,
  selectedItemWidth: _react.PropTypes.number,
  selectedItemText: _react.PropTypes.string,

  itemDateFormat: _react.PropTypes.string,
  itemWidth: _react.PropTypes.number,
  itemText: _react.PropTypes.string,

  navItemWidth: _react.PropTypes.number,

  offDays: _react.PropTypes.string,
  offDaysFormat: _react.PropTypes.string,

  startOfWeek: _react.PropTypes.string,
  startOfWeekFormat: _react.PropTypes.string
};

exports.default = DatePaginatorComponent;

//# sourceMappingURL=index.js.map