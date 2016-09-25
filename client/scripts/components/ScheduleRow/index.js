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

var _scheduleHelper = require('../../../../common/utils/schedule-helper');

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _configs = require('../../../../common/data/configs.json');

var _configs2 = _interopRequireDefault(_configs);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * ScheduleRowComponent - dumb component, panel of periods for day
 * Smart components - none
 * Dumb components - none
 * */

var ScheduleRowComponent = function (_Component) {
  (0, _inherits3.default)(ScheduleRowComponent, _Component);

  /**
   * constructor
   * @param {object} props
   */

  function ScheduleRowComponent(props) {
    (0, _classCallCheck3.default)(this, ScheduleRowComponent);

    /**
     * @type {object}
     * @property {Object|null} shownInterval - shown price interval, when user mouse over cell
     */

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(ScheduleRowComponent).call(this, props));

    _this.state = {
      shownInterval: null
    };

    _this.handleClickCell = _this.handleClickCell.bind(_this);
    _this.handleMouseLeaveScheduleRow = _this.handleMouseLeaveScheduleRow.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(ScheduleRowComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }

    /**
     * handle click on cell, if period is disable or has status lock, that skip clicking
     * @param {Object} event - SyntheticEvent
     * */

  }, {
    key: 'handleClickCell',
    value: function handleClickCell(event) {
      event.preventDefault();

      var _props = this.props;
      var date = _props.date;
      var cells = _props.cells;

      var parentNode = event.target.parentNode;
      var cellIndex = (0, _lodash.indexOf)(parentNode.childNodes, event.target);
      var period = cells.get(cellIndex);

      if (!period.get('enable') || period.getIn(['status', 'isForceDisable'])) return false;

      return this.props.onSelectOrder(date, period.get('period'));
    }

    /**
     * handle if user leave mouse cursor beyond, than set shownInterval to null
     * @param {Object} event - SyntheticEvent
     * */

  }, {
    key: 'handleMouseLeaveScheduleRow',
    value: function handleMouseLeaveScheduleRow(event) {
      event.preventDefault();

      this.setState({
        shownInterval: null
      });
    }

    /**
     * handle if user mouse over cursor to cell, than set shownInterval current price interval
     * @param {Object} event - SyntheticEvent
     * */

  }, {
    key: 'handleMouseOverCell',
    value: function handleMouseOverCell(period, event) {
      event.preventDefault();

      var _props2 = this.props;
      var prices = _props2.prices;
      var date = _props2.date;
      var orderIsStarted = _props2.orderIsStarted;

      var fixedPeriod = !orderIsStarted && period !== _scheduleHelper.LAST_PERIOD ? period + _scheduleHelper.STEP : period;

      var interval = prices.find(function (chunk) {
        return chunk.get('startPeriod') <= fixedPeriod && fixedPeriod <= chunk.get('endPeriod');
      });

      this.setState({
        shownInterval: {
          start: _configs2.default.periods[interval.get('startPeriod')],
          end: _configs2.default.periods[interval.get('endPeriod')],
          price: interval.get('price')
        }
      });

      this.props.onMouseOverCell(date, period);
    }

    /**
     * render cells
     * @param {Date} date - date of row
     * @param {Array.<Object>} cells - cells
     * @return {Array.<Element>} rendered cells
     * */

  }, {
    key: 'renderCells',
    value: function renderCells(date, cells, orderedCells) {
      var _this2 = this;

      return cells.map(function (cell, index) {
        var cellIsFree = cell.get('enable') && !cell.getIn(['status', 'isForceDisable']) && !orderedCells.includes(cell.get('period'));
        var cellIsBusy = !cell.get('enable') || cell.getIn(['status', 'isForceDisable']);
        var cellIsOrdered = orderedCells.includes(cell.get('period'));

        var classes = (0, _classnames2.default)('ScheduleRow-cell', {
          'ScheduleRow-cell--odd': index % 2 === 1,
          'ScheduleRow-cell--free': cellIsFree,
          'ScheduleRow-cell--busy': cellIsBusy,
          'ScheduleRow-cell--ordered': cellIsOrdered
        });

        var cellTime = _configs2.default.periods[cell.get('period')];

        return _react2.default.createElement(
          'div',
          {
            className: classes,
            key: index,
            onClick: _this2.handleClickCell,
            onMouseOver: _this2.handleMouseOverCell.bind(_this2, cell.get('period'))
          },
          cellTime
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
      var _props3 = this.props;
      var cells = _props3.cells;
      var orderedCells = _props3.orderedCells;
      var date = _props3.date;
      var isLast = _props3.isLast;
      var shownInterval = this.state.shownInterval;

      var renderedCells = this.renderCells(date, cells, orderedCells);

      var classes = (0, _classnames2.default)('ScheduleRow', {
        'ScheduleRow--last': isLast
      });

      return _react2.default.createElement(
        'div',
        { className: classes },
        _react2.default.createElement(
          'div',
          { className: 'ScheduleRow-info g-clear' },
          _react2.default.createElement(
            'div',
            { className: 'ScheduleRow-date' },
            _react2.default.createElement(_reactIntl.FormattedDate, {
              value: date,
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          ),
          _react2.default.createElement(
            'div',
            { className: 'ScheduleRow-types' },
            _react2.default.createElement(
              'div',
              { className: 'ScheduleRow-type ScheduleRow-type--ordered' },
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'ordered-time' })
            ),
            _react2.default.createElement(
              'div',
              { className: 'ScheduleRow-type ScheduleRow-type--free' },
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'free-time' })
            ),
            _react2.default.createElement(
              'div',
              { className: 'ScheduleRow-type ScheduleRow-type--selected' },
              _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'selected-time' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'ScheduleRow-price-interval' },
            !(0, _lodash.isNull)(shownInterval) ? _react2.default.createElement(_reactIntl.FormattedMessage, {
              id: 'priceOfInterval',
              values: {
                start: shownInterval.start,
                end: shownInterval.end,
                price: shownInterval.price
              }
            }) : null
          )
        ),
        _react2.default.createElement(
          'div',
          {
            className: 'ScheduleRow-cells g-clear',
            onMouseLeave: this.handleMouseLeaveScheduleRow
          },
          renderedCells
        )
      );
    }
  }]);
  return ScheduleRowComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Array.<Object>} cells - cells of schedule for dates
 * @property {Array.<Object>} orderedCells - ordered cells in current date
 * @property {Boolean} orderIsStarted - if user select start date and period
 * @property {Array.<Object>} prices - prices for current day splitted by intervals
 * @property {string} date - date
 * @property {boolean} isLast - last row or not
 * @property {Function} onSelectOrder - select date and period of order
 * @property {Function} onMouseOverCell - pass to parent date and period mouseover cell
 * */

ScheduleRowComponent.propTypes = {
  cells: _reactImmutableProptypes2.default.list.isRequired,
  orderedCells: _reactImmutableProptypes2.default.list.isRequired,
  orderIsStarted: _react.PropTypes.bool.isRequired,
  prices: _reactImmutableProptypes2.default.list.isRequired,
  date: _react.PropTypes.string.isRequired,
  isLast: _react.PropTypes.bool.isRequired,
  onSelectOrder: _react.PropTypes.func.isRequired,
  onMouseOverCell: _react.PropTypes.func.isRequired
};

exports.default = ScheduleRowComponent;

//# sourceMappingURL=index.js.map