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

var _indexOf = require('lodash/indexOf');

var _indexOf2 = _interopRequireDefault(_indexOf);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _scheduleHelper = require('../../../../common/utils/schedule-helper');

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _configs = require('../../../../common/data/configs.json');

var _configs2 = _interopRequireDefault(_configs);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ManagerScheduleRowComponent = function (_Component) {
  (0, _inherits3.default)(ManagerScheduleRowComponent, _Component);

  function ManagerScheduleRowComponent(props) {
    (0, _classCallCheck3.default)(this, ManagerScheduleRowComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ManagerScheduleRowComponent.__proto__ || (0, _getPrototypeOf2.default)(ManagerScheduleRowComponent)).call(this, props));

    _this.handleClickCreateOrder = _this.handleClickCreateOrder.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(ManagerScheduleRowComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }
  }, {
    key: 'handleClickShowOrder',
    value: function handleClickShowOrder(orderId, event) {
      event.preventDefault();

      this.props.onShowOrder(orderId);
    }
  }, {
    key: 'handleClickCreateOrder',
    value: function handleClickCreateOrder(event) {
      event.preventDefault();

      var _props = this.props;
      var date = _props.date;
      var cells = _props.cells;

      var parentNode = event.target.parentNode;
      var cellIndex = (0, _indexOf2.default)(parentNode.childNodes, event.target);
      var cell = cells.get(cellIndex);

      if (!cell.get('enable') || cell.getIn(['status', 'isForceDisable'])) return false;

      return this.props.onCreateOrder(date, cell.get('period'));
    }
  }, {
    key: 'renderTimeLineRow',
    value: function renderTimeLineRow() {
      var _props2 = this.props;
      var cells = _props2.cells;
      var cellWidth = _props2.cellWidth;
      var cellMargin = _props2.cellMargin;

      var width = cellWidth + cellMargin;

      return cells.skipLast(1).map(function (cell, index) {
        var isEven = index % 2 === 0;
        var time = isEven ? _configs2.default.periods[cell.get('period')] : null;

        var classes = (0, _classnames2.default)('ManagerScheduleRow-time-item', {
          'ManagerScheduleRow-time-item--left': isEven,
          'ManagerScheduleRow-time-item--right': !isEven
        });

        var styles = {
          width: width,
          marginLeft: isEven ? 0 : -1 };

        // because border left has 1px width
        return _react2.default.createElement(
          'div',
          {
            className: classes,
            style: styles,
            key: index
          },
          _react2.default.createElement(
            'div',
            { className: 'ManagerScheduleRow-time-item-text' },
            time
          )
        );
      });
    }
  }, {
    key: 'renderRow',
    value: function renderRow() {
      var _this2 = this;

      var _props3 = this.props;
      var cells = _props3.cells;
      var cellWidth = _props3.cellWidth;
      var cellMargin = _props3.cellMargin;
      var orders = _props3.orders;

      return cells.skipLast(1).map(function (cell, index) {
        var order = orders.find(function (order) {
          return order.getIn(['datetime', 'startPeriod']) <= cell.get('period') && cell.get('period') < order.getIn(['datetime', 'endPeriod']);
        });

        var cellIsFree = cell.get('enable') && !cell.getIn(['status', 'isForceDisable']);
        var cellIsBusy = !cell.get('enable') || cell.getIn(['status', 'isForceDisable']);

        if (order) {
          var isEndOrder = order.getIn(['datetime', 'endPeriod']) === cell.get('period') + _scheduleHelper.STEP;
          var isOneDayOrder = order.get('isOneDayOrder');
          var isLastPeriod = cell.get('period') + _scheduleHelper.STEP === _scheduleHelper.LAST_PERIOD;

          var _classes = (0, _classnames2.default)('ManagerScheduleRow-cell', {
            'ManagerScheduleRow-cell--available': cellIsFree,
            'ManagerScheduleRow-cell--disabled': cellIsBusy,
            'ManagerScheduleRow-cell--manager': !order.get('createdByUser'),
            'ManagerScheduleRow-cell--user': order.get('createdByUser')
          });

          var width = cellWidth + cellMargin;
          var marginRight = 0;

          // TODO: simplify
          if (isEndOrder && isOneDayOrder) {
            width -= cellMargin;
            marginRight = cellMargin;
          } else if (isEndOrder && !isOneDayOrder && !isLastPeriod) {
            width -= cellMargin;
            marginRight = cellMargin;
          }

          return _react2.default.createElement(
            'div',
            {
              className: _classes,
              style: { width: width, marginRight: marginRight },
              onClick: _this2.handleClickShowOrder.bind(_this2, order.get('id')),
              key: index
            },
            ' '
          );
        }

        var classes = (0, _classnames2.default)('ManagerScheduleRow-cell', {
          'ManagerScheduleRow-cell--available': cellIsFree,
          'ManagerScheduleRow-cell--disabled': cellIsBusy,
          'ManagerScheduleRow-cell--manager': cell.has('createdByUser') && !cell.get('createdByUser'),
          'ManagerScheduleRow-cell--user': cell.has('createdByUser') && cell.get('createdByUser')
        });

        return _react2.default.createElement(
          'div',
          {
            className: classes,
            style: {
              width: cellWidth,
              marginRight: cellMargin
            },
            onClick: _this2.handleClickCreateOrder,
            key: index
          },
          ' '
        );
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props4 = this.props;
      var isFirst = _props4.isFirst;
      var isLast = _props4.isLast;

      var renderedRow = this.renderRow();
      var renderedRowTimeline = this.renderTimeLineRow();

      var timelineRowClasses = (0, _classnames2.default)('ManagerScheduleRow-timeline-row', {
        'ManagerScheduleRow-timeline-row--first': isFirst,
        'ManagerScheduleRow-timeline-row--last': isLast
      });

      var scheduleRowClasses = (0, _classnames2.default)('ManagerScheduleRow-schedule-row', {
        'ManagerScheduleRow-schedule-row--first': isFirst,
        'ManagerScheduleRow-schedule-row--last': isLast
      });

      return _react2.default.createElement(
        'div',
        { className: 'ManagerScheduleRow' },
        _react2.default.createElement(
          'div',
          { className: timelineRowClasses },
          renderedRowTimeline
        ),
        _react2.default.createElement(
          'div',
          { className: scheduleRowClasses },
          renderedRow
        )
      );
    }
  }]);
  return ManagerScheduleRowComponent;
}(_react.Component);

ManagerScheduleRowComponent.defaultProps = {
  cellWidth: 60,
  cellMargin: 10,

  isFirst: false,
  isLast: false
};

ManagerScheduleRowComponent.propTypes = {
  date: _react.PropTypes.string.isRequired,
  orders: _reactImmutableProptypes2.default.list.isRequired,
  cells: _reactImmutableProptypes2.default.list.isRequired,

  cellWidth: _react.PropTypes.number,
  cellMargin: _react.PropTypes.number,

  isFirst: _react.PropTypes.bool,
  isLast: _react.PropTypes.bool,

  onShowOrder: _react.PropTypes.func.isRequired,
  onCreateOrder: _react.PropTypes.func.isRequired
};

exports.default = ManagerScheduleRowComponent;

//# sourceMappingURL=index.js.map