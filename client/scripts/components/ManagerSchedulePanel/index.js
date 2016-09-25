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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactIntl = require('react-intl');

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _index = require('../ManagerScheduleRow/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('../Icon/index.jsx');

var _index4 = _interopRequireDefault(_index3);

var _index5 = require('../Tooltip/index.jsx');

var _index6 = _interopRequireDefault(_index5);

require('./style.css');

var _scheduleHelper = require('../../../../common/utils/schedule-helper');

var _whyDidYouUpdateMixin = require('../../utils/whyDidYouUpdateMixin');

var _whyDidYouUpdateMixin2 = _interopRequireDefault(_whyDidYouUpdateMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ANIMATION_TRANSFORM_ENABLE = false; // TODO: future manager settings
var CELL_WIDTH = 60;
var CELL_MARGIN = 10;

var ManagerSchedulePanelComponent = function (_Component) {
  (0, _inherits3.default)(ManagerSchedulePanelComponent, _Component);

  function ManagerSchedulePanelComponent(props) {
    (0, _classCallCheck3.default)(this, ManagerSchedulePanelComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ManagerSchedulePanelComponent.__proto__ || (0, _getPrototypeOf2.default)(ManagerSchedulePanelComponent)).call(this, props));

    _this.state = {
      tooltipIsActive: false
    };

    _this.handleShowOrder = _this.handleShowOrder.bind(_this);
    _this.handleCreateOrder = _this.handleCreateOrder.bind(_this);

    _this.handleMouseOverTooltip = _this.handleMouseOverTooltip.bind(_this);
    _this.handleMouseLeaveTooltip = _this.handleMouseLeaveTooltip.bind(_this);
    return _this;
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */

  (0, _createClass3.default)(ManagerSchedulePanelComponent, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }

    /**
     * handle mouse over on question mark and open tooltip(development only)
     * */

  }, {
    key: 'handleMouseOverTooltip',
    value: function handleMouseOverTooltip(event) {
      event.preventDefault();

      this.setState({
        tooltipIsActive: true
      });
    }

    /**
     * handle mouse leave on question mark and open tooltip(development only)
     * */

  }, {
    key: 'handleMouseLeaveTooltip',
    value: function handleMouseLeaveTooltip(event) {
      event.preventDefault();

      this.setState({
        tooltipIsActive: false
      });
    }
  }, {
    key: 'handleShowOrder',
    value: function handleShowOrder(orderId) {
      var room = this.props.room;

      this.props.onShowOrder(room.get('id'), orderId);
    }
  }, {
    key: 'handleCreateOrder',
    value: function handleCreateOrder(date, period) {
      var room = this.props.room;

      this.props.onCreateOrder(room.get('id'), date, period);
    }
  }, {
    key: 'renderRows',
    value: function renderRows() {
      var _this2 = this;

      var _props = this.props;
      var orders = _props.orders;
      var schedules = _props.schedules;

      var schedulesLength = schedules.size;

      return schedules.map(function (schedule, index) {
        var dateOrders = orders.filter(function (order) {
          var startDate = order.getIn(['datetime', 'startDate']);

          return (0, _moment2.default)(startDate).isSame(schedule.get('date'));
        });

        var isFirst = index === 0;
        var isLast = index === schedulesLength;

        return _react2.default.createElement(_index2.default, {
          key: schedule.get('id'),
          date: schedule.get('date'),
          orders: dateOrders,
          cells: schedule.get('periods'),
          cellWidth: CELL_WIDTH,
          cellMargin: CELL_MARGIN,
          isFirst: isFirst,
          isLast: isLast,
          onShowOrder: _this2.handleShowOrder,
          onCreateOrder: _this2.handleCreateOrder
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var room = _props2.room;
      var schedules = _props2.schedules;
      var dx = _props2.dx;
      var tooltipIsActive = this.state.tooltipIsActive;

      if (schedules && schedules.size) {
        var periodsLength = (_scheduleHelper.LAST_PERIOD - _scheduleHelper.FIRST_PERIOD) / _scheduleHelper.STEP;
        var cellWidth = CELL_WIDTH + CELL_MARGIN;

        var translateX = dx * cellWidth;

        var styles = ANIMATION_TRANSFORM_ENABLE ? { transform: 'translate3d(' + translateX + 'px, 0px, 0px)', transition: 'all 0.25s ease 0s' } : { transform: 'translate(' + translateX + 'px, 0px)' };

        styles.width = cellWidth * schedules.size * periodsLength + 2 * CELL_MARGIN;

        var rows = this.renderRows();

        return _react2.default.createElement(
          'div',
          { className: 'ManagerSchedulePanel' },
          _react2.default.createElement(
            'div',
            { className: 'g-clear' },
            _react2.default.createElement(
              'h2',
              { className: 'ManagerSchedulePanel-header' },
              room.get('name')
            ),
            __DEVELOPMENT__ ? _react2.default.createElement(
              'div',
              { style: { float: 'left' } },
              _react2.default.createElement(_index4.default, {
                className: 'ManagerSchedulePanel-icon-devtool-question',
                id: room.get('id'),
                name: 'icon-question',
                rate: 1.5,
                onMouseOver: this.handleMouseOverTooltip,
                onMouseLeave: this.handleMouseLeaveTooltip
              }),
              tooltipIsActive ? _react2.default.createElement(
                _index6.default,
                null,
                _react2.default.createElement(
                  'div',
                  null,
                  'ID room: ',
                  room.get('id')
                ),
                _react2.default.createElement(
                  'div',
                  null,
                  'ID bathhouse: ',
                  room.get('bathhouseId')
                ),
                _react2.default.createElement(
                  'div',
                  null,
                  'Minimal order duration: ',
                  room.getIn(['settings', 'minOrderDuration'])
                )
              ) : null
            ) : null,
            _react2.default.createElement(
              'div',
              { className: 'ManagerSchedulePanel-help' },
              _react2.default.createElement(
                'span',
                {
                  className: 'ManagerSchedulePanel-help-item ManagerSchedulePanel-help-item--available'
                },
                _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'availableTime' })
              ),
              _react2.default.createElement(
                'span',
                {
                  className: 'ManagerSchedulePanel-help-item ManagerSchedulePanel-help-item--disabled'
                },
                _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'disabledTime' })
              ),
              _react2.default.createElement(
                'span',
                {
                  className: 'ManagerSchedulePanel-help-item ManagerSchedulePanel-help-item--manager'
                },
                _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'createdManagerTime' })
              ),
              _react2.default.createElement(
                'span',
                { className: 'ManagerSchedulePanel-help-item ManagerSchedulePanel-help-item--user' },
                _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'createdUserTime' })
              )
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'ManagerSchedulePanel-stage-outer' },
            _react2.default.createElement(
              'div',
              { className: 'ManagerSchedulePanel-stage', style: styles },
              rows
            )
          )
        );
      }

      return null;
    }
  }]);
  return ManagerSchedulePanelComponent;
}(_react.Component);

ManagerSchedulePanelComponent.defaultProps = {
  dx: 0
};

ManagerSchedulePanelComponent.propTypes = {
  room: _reactImmutableProptypes2.default.map.isRequired,
  orders: _reactImmutableProptypes2.default.list.isRequired,
  schedules: _reactImmutableProptypes2.default.list.isRequired,
  dx: _react.PropTypes.number,

  onShowOrder: _react.PropTypes.func.isRequired,
  onCreateOrder: _react.PropTypes.func.isRequired
};

exports.default = ManagerSchedulePanelComponent;

//# sourceMappingURL=index.js.map