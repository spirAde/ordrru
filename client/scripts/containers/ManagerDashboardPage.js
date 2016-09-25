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

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _forEach = require('lodash/forEach');

var _forEach2 = _interopRequireDefault(_forEach);

var _ceil = require('lodash/ceil');

var _ceil2 = _interopRequireDefault(_ceil);

var _throttle = require('lodash/throttle');

var _throttle2 = _interopRequireDefault(_throttle);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _reactRedux = require('react-redux');

var _redial = require('redial');

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactKeyHandler = require('react-key-handler');

var _reactKeyHandler2 = _interopRequireDefault(_reactKeyHandler);

var _immutable = require('immutable');

var _bathhouseActions = require('../actions/bathhouse-actions');

var _scheduleActions = require('../actions/schedule-actions');

var _orderActions = require('../actions/order-actions');

var _managerActions = require('../actions/manager-actions');

var _shallowEqualImmutable = require('../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _index = require('../components/ManagerDashboardHeader/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('../components/DatePaginator/index.jsx');

var _index4 = _interopRequireDefault(_index3);

var _index5 = require('../components/ManagerSchedulePanelList/index.jsx');

var _index6 = _interopRequireDefault(_index5);

var _index7 = require('../components/OrderModal/index.jsx');

var _index8 = _interopRequireDefault(_index7);

var _dateHelper = require('../../../common/utils/date-helper');

var _scheduleHelper = require('../../../common/utils/schedule-helper');

var _ManagerDashboardSelectors = require('../selectors/ManagerDashboardSelectors');

var _ManagerDashboardSelectors2 = _interopRequireDefault(_ManagerDashboardSelectors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ESC_KEY = 27;

var SCROLL_STEP = 6; // TODO: future manager setting, quantity of scroll cells by 1 wheel time

// if order was splitting, because order more than 1 day duration, then concat parts of order
// find start date, start period, end date, end period of order
function concatOrderParts(orders) {
  var sortedParts = orders.sort(function (curr, prev) {
    return (0, _moment2.default)(curr.getIn(['datetime', 'startDate'])).isAfter(prev.getIn(['datetime', 'startDate']));
  });

  var firstPart = sortedParts.first();
  var lastPart = sortedParts.last();

  return firstPart.merge((0, _immutable.fromJS)({
    datetime: {
      startDate: firstPart.getIn(['datetime', 'startDate']),
      startPeriod: firstPart.getIn(['datetime', 'startPeriod']),
      endDate: lastPart.getIn(['datetime', 'endDate']),
      endPeriod: lastPart.getIn(['datetime', 'endPeriod'])
    }
  }));
}

var hooks = {
  fetch: function fetch(_ref) {
    var dispatch = _ref.dispatch;
    var getState = _ref.getState;

    var promises = [];
    var state = getState();
    var bathhouseId = state.manager.getIn(['manager', 'organizationId']);

    return new _promise2.default(function (resolve) {
      return dispatch((0, _bathhouseActions.findBathhouseAndRooms)(bathhouseId)).then(function (data) {
        (0, _forEach2.default)(data.payload.rooms, function (room) {
          promises.push(dispatch((0, _scheduleActions.findRoomScheduleIfNeed)(room.id, { left: false, right: true })));
          promises.push(dispatch((0, _orderActions.findOrdersIfNeed)(room.id)));
        });

        return resolve(_promise2.default.all(promises));
      });
    });
  }
};

/**
 * ManagerDashboardPage - manager dashboard
 * Smart components - none
 * Dumb components - none
 * */

var ManagerDashboardPage = function (_Component) {
  (0, _inherits3.default)(ManagerDashboardPage, _Component);

  function ManagerDashboardPage(props) {
    (0, _classCallCheck3.default)(this, ManagerDashboardPage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ManagerDashboardPage.__proto__ || (0, _getPrototypeOf2.default)(ManagerDashboardPage)).call(this, props));

    _this.state = {
      date: (0, _moment2.default)(props.date).format(_dateHelper.MOMENT_FORMAT),
      dx: 0,
      orderModalIsActive: false,
      shownOrder: null
    };

    _this.handleMouseWheelEvent = (0, _throttle2.default)(_this.handleMouseWheelEvent.bind(_this), 250);
    _this.handleLogout = _this.handleLogout.bind(_this);
    _this.handleSelectDate = _this.handleSelectDate.bind(_this);

    _this.handleShowOrder = _this.handleShowOrder.bind(_this);
    _this.handleCreateOrder = _this.handleCreateOrder.bind(_this);

    _this.handleClickCloseButton = _this.handleClickCloseButton.bind(_this);
    _this.handleClickCreateOrderButton = _this.handleClickCreateOrderButton.bind(_this);

    _this.handleKeyUpEscape = _this.handleKeyUpEscape.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(ManagerDashboardPage, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var manager = this.props.manager;

      var bathhouseId = manager.get('organizationId');

      this.props.addToSocketRoom(bathhouseId);

      var panelElement = _reactDom2.default.findDOMNode(this.refs.panel);
      panelElement.addEventListener('mousewheel', this.handleMouseWheelEvent, false);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.order.getIn(['datetime', 'endDate'])) {
        this.setState({
          orderModalIsActive: true
        });
      }
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
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var panelElement = _reactDom2.default.findDOMNode(this.refs.panel);
      panelElement.removeEventListener('mousewheel', this.handleMouseWheelEvent, false);
    }
  }, {
    key: 'handleClickCloseButton',
    value: function handleClickCloseButton() {
      this.props.resetFullOrder();

      this.setState({
        orderModalIsActive: false,
        shownOrder: null
      });
    }
  }, {
    key: 'handleClickCreateOrderButton',
    value: function handleClickCreateOrderButton() {
      this.props.sendOrder(true);
    }
  }, {
    key: 'handleKeyUpEscape',
    value: function handleKeyUpEscape() {
      this.props.resetFullOrder();

      this.setState({
        orderModalIsActive: false,
        shownOrder: null
      });
    }

    /**
     * handleMouseWheelEvent - scroll schedule panel and change datepaginator date, if
     * first period of date position becomes left visible
     * */

  }, {
    key: 'handleMouseWheelEvent',
    value: function handleMouseWheelEvent(event) {
      event.preventDefault();

      var _state = this.state;
      var dx = _state.dx;
      var date = _state.date;

      var newDate = date;
      var newDx = event.deltaY > 0 ? dx + SCROLL_STEP : dx - SCROLL_STEP;

      if (newDx % 48 === 0 && newDx < dx) {
        newDate = (0, _moment2.default)(date).add(1, 'days').format(_dateHelper.MOMENT_FORMAT);
      } else if (dx % 48 === 0 && newDx > dx) {
        newDate = (0, _moment2.default)(date).subtract(1, 'days').format(_dateHelper.MOMENT_FORMAT);
      }

      this.setState({
        date: newDate,
        dx: newDx
      });
    }
  }, {
    key: 'handleLogout',
    value: function handleLogout() {
      this.props.logout();
    }
  }, {
    key: 'handleSelectDate',
    value: function handleSelectDate(date) {
      var currentDate = (0, _moment2.default)();
      var fullDatesDiff = (0, _ceil2.default)((0, _moment2.default)(date).diff(currentDate, 'days', true));

      var cellsCount = (_scheduleHelper.LAST_PERIOD - _scheduleHelper.FIRST_PERIOD) / _scheduleHelper.STEP;
      var dx = fullDatesDiff * cellsCount;

      this.setState({
        date: date,
        dx: -dx
      });
    }
  }, {
    key: 'handleShowOrder',
    value: function handleShowOrder(roomId, orderId) {
      var orders = this.props.orders;

      var order = orders.get(roomId).filter(function (order) {
        return order.get('id') === orderId;
      });

      this.setState({
        shownOrder: order.size > 1 ? concatOrderParts(order) : order.first(),
        orderModalIsActive: true
      });
    }
  }, {
    key: 'handleCreateOrder',
    value: function handleCreateOrder(roomId, date, period) {
      this.props.selectOrder(roomId, date, period, false);
    }

    /**
     * render
     * @return {XML} - React element
     * */

  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var manager = _props.manager;
      var viewport = _props.viewport;

      if (!viewport) {
        return _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(_reactHelmet2.default, { title: 'Dashboard' }),
          _react2.default.createElement(_index2.default, {
            manager: manager,
            onSubmit: this.handleLogout
          })
        );
      }

      var _props2 = this.props;
      var rooms = _props2.rooms;
      var order = _props2.order;
      var orders = _props2.orders;
      var schedules = _props2.schedules;
      var ordersIsFetching = _props2.ordersIsFetching;
      var schedulesIsFetching = _props2.schedulesIsFetching;
      var _state2 = this.state;
      var dx = _state2.dx;
      var date = _state2.date;
      var orderModalIsActive = _state2.orderModalIsActive;
      var shownOrder = _state2.shownOrder;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_reactHelmet2.default, { title: 'Dashboard' }),
        _react2.default.createElement(_reactKeyHandler2.default, {
          keyEventName: _reactKeyHandler.KEYUP,
          keyCode: ESC_KEY,
          onKeyHandle: this.handleKeyUpEscape
        }),
        _react2.default.createElement(_index2.default, {
          manager: manager,
          onSubmit: this.handleLogout
        }),
        _react2.default.createElement(_index4.default, {
          width: viewport.get('width'),
          date: date,
          onSelectDate: this.handleSelectDate
        }),
        _react2.default.createElement(_index6.default, {
          ref: 'panel',
          rooms: rooms,
          orders: orders,
          isFetching: ordersIsFetching || schedulesIsFetching,
          schedules: schedules,
          dx: dx,
          onShowOrder: this.handleShowOrder,
          onCreateOrder: this.handleCreateOrder
        }),
        _react2.default.createElement(
          'div',
          null,
          shownOrder ? _react2.default.createElement(_index8.default, {
            order: shownOrder,
            active: orderModalIsActive,
            width: '50vw',
            onClickCloseButton: this.handleClickCloseButton,
            action: 'show'
          }) : null,
          order.getIn(['datetime', 'endDate']) ? _react2.default.createElement(_index8.default, {
            order: order,
            active: orderModalIsActive,
            width: '50vw',
            onClickCloseButton: this.handleClickCloseButton,
            onClickCreateOrderButton: this.handleClickCreateOrderButton,
            action: 'create'
          }) : null
        )
      );
    }
  }]);
  return ManagerDashboardPage;
}(_react.Component);

/**
 * propTypes
 * @property {Object} manager - data about manager
 * @property {Object} bathhouse - bathhouse data
 * @property {Array.<Object>} rooms - bathhouse rooms data
 * @property {Object} order - current created manager order
 * @property {Object.<Object>} orders - orders for each room
 * @property {Object.<Object>} schedules - schedules for each room
 * @property {Object} interval - start and end of schedules date
 * @property {Object} viewport - viewport of device
 * @property {String} date - current application date(taken from server)
 * @property {Boolean} ordersIsFetching - if find orders is fetching
 * @property {Boolean} schedulesIsFetching - if find schedules is fetching
 */

ManagerDashboardPage.propTypes = {
  manager: _reactImmutableProptypes2.default.map.isRequired,
  bathhouse: _reactImmutableProptypes2.default.map.isRequired,
  rooms: _reactImmutableProptypes2.default.list.isRequired,
  order: _reactImmutableProptypes2.default.map.isRequired,
  orders: _reactImmutableProptypes2.default.map.isRequired,
  schedules: _reactImmutableProptypes2.default.map.isRequired,
  interval: _reactImmutableProptypes2.default.map.isRequired,
  viewport: _reactImmutableProptypes2.default.map.isRequired,
  date: _react.PropTypes.string.isRequired,
  ordersIsFetching: _react.PropTypes.bool.isRequired,
  schedulesIsFetching: _react.PropTypes.bool.isRequired,

  logout: _react.PropTypes.func.isRequired,
  findRoomScheduleForDatesIfNeed: _react.PropTypes.func.isRequired,
  findOrdersForDatesIfNeed: _react.PropTypes.func.isRequired,
  resetFullOrder: _react.PropTypes.func.isRequired,
  resetDatetimeOrder: _react.PropTypes.func.isRequired,
  selectOrder: _react.PropTypes.func.isRequired,
  checkOrder: _react.PropTypes.func.isRequired,
  sendOrder: _react.PropTypes.func.isRequired,
  resetOrderSchedule: _react.PropTypes.func.isRequired,
  addToSocketRoom: _react.PropTypes.func.isRequired
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
exports.default = (0, _redial.provideHooks)(hooks)((0, _reactRedux.connect)(_ManagerDashboardSelectors2.default, {
  resetFullOrder: _orderActions.resetFullOrder,
  resetDatetimeOrder: _orderActions.resetDatetimeOrder,
  selectOrder: _orderActions.selectOrder,
  checkOrder: _orderActions.checkOrder,
  sendOrder: _orderActions.sendOrder,
  resetOrderSchedule: _scheduleActions.resetOrderSchedule,
  logout: _managerActions.logout,
  findRoomScheduleForDatesIfNeed: _scheduleActions.findRoomScheduleForDatesIfNeed,
  findOrdersForDatesIfNeed: _orderActions.findOrdersForDatesIfNeed,
  addToSocketRoom: _managerActions.addToSocketRoom
})(ManagerDashboardPage));

//# sourceMappingURL=ManagerDashboardPage.js.map