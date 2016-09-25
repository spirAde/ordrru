'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _immutable = require('immutable');

var _lodash = require('lodash');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _scheduleHelper = require('../../../../common/utils/schedule-helper');

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _index = require('../ScheduleRow/index.jsx');

var _index2 = _interopRequireDefault(_index);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Ps = undefined;

if (__CLIENT__) {
  Ps = require('perfect-scrollbar'); // eslint-disable-line global-require
}

/**
 * SchedulePanelComponent - dumb component, schedule panel for current 30 days
 * Smart components - none
 * Dumb components - ScheduleRowComponent
 * */

var SchedulePanelComponent = function (_Component) {
  (0, _inherits3.default)(SchedulePanelComponent, _Component);

  function SchedulePanelComponent(props) {
    (0, _classCallCheck3.default)(this, SchedulePanelComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SchedulePanelComponent.__proto__ || (0, _getPrototypeOf2.default)(SchedulePanelComponent)).call(this, props));

    _this.state = {
      data: (0, _immutable.fromJS)({
        orderedPeriods: {}
      })
    };

    _this.handleSelectOrder = _this.handleSelectOrder.bind(_this);
    _this.handleMouseOverCell = _this.handleMouseOverCell.bind(_this);
    return _this;
  }

  /**
   * Initialize scrollbar for panel
   * @return {void}
   * */

  (0, _createClass3.default)(SchedulePanelComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      Ps.initialize(this.refs.scroll, {
        wheelPropagation: true,
        suppressScrollX: true
      });
    }

    /**
     * componentWillReceiveProps
     * check if need to reset ordered periods
     * @return {void}
     * */

  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.needResetOrderedPeriods) this.resetOrderedPeriods();
    }

    /**
     * shouldComponentUpdate
     * @return {boolean}
     * */

  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }

    /**
     * componentWillUnmount - destroy scrollbar
     * @return {void}
     * */

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      Ps.destroy(this.refs.scroll);
    }

    /**
     * handle mouse over cell from rows. Paint ordered periods.
     * Skip if order wasn't begin. Skip if order complete.
     * If the mouse cursor is over a busy or unavailable periods, then restore the original state
     * @param {String} date - date of schedule row to which the period
     * @param {Number} period - selected period
     * @return {void}
     * */

  }, {
    key: 'handleMouseOverCell',
    value: function handleMouseOverCell(date, period) {
      var _props = this.props;
      var schedule = _props.schedule;
      var order = _props.order;

      var orderIsComplete = order.getIn(['datetime', 'startDate']) && order.getIn(['datetime', 'endDate']);

      if (!order.getIn(['datetime', 'startDate']) || orderIsComplete) return false;

      var selectedRow = schedule.find(function (row) {
        return (0, _moment2.default)(row.get('date')).isSame(date);
      });
      var selectedPeriod = selectedRow.getIn(['periods', period / _scheduleHelper.STEP]);

      var startDate = order.getIn(['datetime', 'startDate']);
      var startPeriod = order.getIn(['datetime', 'startPeriod']);

      if (!selectedPeriod.get('enable') || selectedPeriod.getIn(['status', 'isForceDisable'])) {
        this.setState(function (_ref) {
          var data = _ref.data;
          return {
            data: data.set('orderedPeriods', (0, _immutable.fromJS)((0, _defineProperty3.default)({}, startDate, [startPeriod])))
          };
        });

        return false;
      }

      var newRangeOrderedPeriods = {};

      if ((0, _moment2.default)(startDate).isSame(date)) {
        if (startPeriod < period) {
          newRangeOrderedPeriods = (0, _defineProperty3.default)({}, date, (0, _lodash.range)(startPeriod, period + _scheduleHelper.STEP, _scheduleHelper.STEP));
        } else {
          newRangeOrderedPeriods = (0, _defineProperty3.default)({}, date, (0, _lodash.range)(period, startPeriod + _scheduleHelper.STEP, _scheduleHelper.STEP));
        }
      } else if ((0, _moment2.default)(startDate).isBefore(date)) {
        var _newRangeOrderedPerio3;

        var startDatePeriodsRange = (0, _lodash.range)(startPeriod, _scheduleHelper.LAST_PERIOD + _scheduleHelper.STEP, _scheduleHelper.STEP);
        var newDatePeriodsRange = (0, _lodash.range)(_scheduleHelper.FIRST_PERIOD, period + _scheduleHelper.STEP, _scheduleHelper.STEP);

        newRangeOrderedPeriods = (_newRangeOrderedPerio3 = {}, (0, _defineProperty3.default)(_newRangeOrderedPerio3, startDate, startDatePeriodsRange), (0, _defineProperty3.default)(_newRangeOrderedPerio3, date, newDatePeriodsRange), _newRangeOrderedPerio3);
      } else {
        var _newRangeOrderedPerio4;

        var _startDatePeriodsRange = (0, _lodash.range)(_scheduleHelper.FIRST_PERIOD, startPeriod + _scheduleHelper.STEP, _scheduleHelper.STEP);
        var _newDatePeriodsRange = (0, _lodash.range)(period, _scheduleHelper.LAST_PERIOD + _scheduleHelper.STEP, _scheduleHelper.STEP);

        newRangeOrderedPeriods = (_newRangeOrderedPerio4 = {}, (0, _defineProperty3.default)(_newRangeOrderedPerio4, startDate, _startDatePeriodsRange), (0, _defineProperty3.default)(_newRangeOrderedPerio4, date, _newDatePeriodsRange), _newRangeOrderedPerio4);
      }

      return this.setState(function (_ref2) {
        var data = _ref2.data;
        return {
          data: data.set('orderedPeriods', (0, _immutable.fromJS)(newRangeOrderedPeriods))
        };
      });
    }

    /**
     * handleSelectOrder - pass date and period of order to parent. And add ordered period to state
     * @param {String} date - selected date
     * @param {Number} period - selected period
     * @return {void}
     * */

  }, {
    key: 'handleSelectOrder',
    value: function handleSelectOrder(date, period) {
      var data = this.state.data;

      this.props.onSelectOrder(date, period);

      var orderedPeriods = data.get('orderedPeriods');

      var newOrderedPeriods = orderedPeriods.has(date) ? orderedPeriods.update(date, function (periods) {
        return periods.push(period);
      }) : orderedPeriods.merge((0, _immutable.fromJS)((0, _defineProperty3.default)({}, date, [period])));

      this.setState(function (_ref3) {
        var data = _ref3.data;
        return {
          data: data.set('orderedPeriods', (0, _immutable.fromJS)(newOrderedPeriods))
        };
      });
    }

    /**
     * reset all state for ordered periods
     * @return {void}
     * */

  }, {
    key: 'resetOrderedPeriods',
    value: function resetOrderedPeriods() {
      this.setState({
        data: (0, _immutable.fromJS)({ orderedPeriods: {} })
      });

      this.props.onResetOrderedPeriods();
    }

    /**
     * render schedule rows for all retrieved dates
     * @param {Array.<Object>} schedules - schedules for room
     * @param {Array.<Object>} prices - prices by chunks
     * @param {Boolean} orderIsStarted - if user select start date and period
     * @return {Array.<Element>} - schedule rows element
     * */

  }, {
    key: 'renderScheduleRows',
    value: function renderScheduleRows(schedule, prices, orderIsStarted) {
      var _this2 = this;

      var data = this.state.data;

      return schedule.map(function (row, index) {
        var orderedCells = data.getIn(['orderedPeriods', row.get('date')]) || (0, _immutable.List)();
        return _react2.default.createElement(_index2.default, {
          cells: row.get('periods'),
          orderedCells: orderedCells,
          orderIsStarted: orderIsStarted,
          prices: prices.get((0, _moment2.default)(row.get('date')).day()),
          date: row.get('date'),
          isLast: index === schedule.size - 1,
          key: row.get('id'),
          onSelectOrder: _this2.handleSelectOrder,
          onMouseOverCell: _this2.handleMouseOverCell
        });
      });
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var schedule = _props2.schedule;
      var prices = _props2.prices;
      var isOpen = _props2.isOpen;
      var order = _props2.order;

      var orderIsStarted = !(0, _lodash.isNull)(order.getIn(['datetime', 'startDate'])) && !(0, _lodash.isNull)(order.getIn(['datetime', 'startPeriod']));

      var rows = schedule && schedule.size ? this.renderScheduleRows(schedule, prices, orderIsStarted) : null;

      var classes = (0, _classnames2.default)('SchedulePanel', {
        'SchedulePanel--active': isOpen
      });

      return _react2.default.createElement(
        'div',
        { className: classes },
        _react2.default.createElement(
          'div',
          { className: 'SchedulePanel-wrapper' },
          _react2.default.createElement(
            'div',
            { className: 'SchedulePanel-scroll', ref: 'scroll' },
            rows
          )
        )
      );
    }
  }]);
  return SchedulePanelComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Array.<Object>} schedules - room schedules
 * @property {Array.<Object>} prices - prices for current day splitted by intervals
 * @property {Object} order - selected user order
 * @property {boolean} isOpen - opened or not
 * @property {Function} onSelectOrder - select date and period of order
 * @property {Function} onResetOrderedPeriods - schedule send parent event, that periods were reset
 * */

SchedulePanelComponent.propTypes = {
  schedule: _reactImmutableProptypes2.default.list,
  prices: _reactImmutableProptypes2.default.list,
  order: _reactImmutableProptypes2.default.map,
  isOpen: _react.PropTypes.bool.isRequired,
  onSelectOrder: _react.PropTypes.func.isRequired,
  onResetOrderedPeriods: _react.PropTypes.func.isRequired
};

exports.default = SchedulePanelComponent;

//# sourceMappingURL=index.js.map