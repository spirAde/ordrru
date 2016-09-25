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

var _immutable = require('immutable');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactIntl = require('react-intl');

var _reactRedux = require('react-redux');

var _lodash = require('lodash');

var _RoomsListSelectors = require('../../selectors/RoomsListSelectors');

var _RoomsListSelectors2 = _interopRequireDefault(_RoomsListSelectors);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _bathhouseActions = require('../../actions/bathhouse-actions');

var _scheduleActions = require('../../actions/schedule-actions');

var _commentActions = require('../../actions/comment-actions');

var _orderActions = require('../../actions/order-actions');

var _index = require('../RoomItem/index.jsx');

var _index2 = _interopRequireDefault(_index);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * RoomsListComponent - dumb component, panel of room boxes
 * Smart components - none
 * Dumb components - RoomItemComponent
 * */

var RoomsListComponent = function (_Component) {
  (0, _inherits3.default)(RoomsListComponent, _Component);

  /**
   * constructor
   * @param {Object} props
   */

  function RoomsListComponent(props) {
    (0, _classCallCheck3.default)(this, RoomsListComponent);

    var _this = (0, _possibleConstructorReturn3.default)(this, (RoomsListComponent.__proto__ || (0, _getPrototypeOf2.default)(RoomsListComponent)).call(this, props));

    _this.handleChangeActiveRoom = _this.handleChangeActiveRoom.bind(_this);
    _this.handleSelectOrder = _this.handleSelectOrder.bind(_this);
    _this.handleResetDatetimeOrder = _this.handleResetDatetimeOrder.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(RoomsListComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var activeRoomId = this.props.activeRoomId;

      if (activeRoomId) {
        var activeRoomRef = 'room-' + activeRoomId;
        var activeRoomComponent = this.refs[activeRoomRef];

        if (activeRoomComponent) {
          var domNode = _reactDom2.default.findDOMNode(activeRoomComponent);
          var parentNode = _reactDom2.default.findDOMNode(this);

          var rectObject = domNode.getBoundingClientRect();

          var domNodeIndex = (0, _lodash.indexOf)(parentNode.childNodes, domNode);
          var domNodeOffsetY = (domNodeIndex - 1) * rectObject.height;

          console.log(domNodeOffsetY);

          window.scrollTo(0, domNodeOffsetY);
        }
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

    /**
     * handle change active room, active room box is open
     * if room is opened first time, then load data
     * if room was close, then reset order and cancel forceDisable periods
     * @param {string} id - room id or undefined
     * @return {void}
     */

  }, {
    key: 'handleChangeActiveRoom',
    value: function handleChangeActiveRoom(id) {
      this.props.changeActiveRoom(id);

      if (id) {
        this.props.findRoomScheduleIfNeed(id);
        this.props.findCommentsIfNeed(id);
      }

      if (!id) {
        this.props.resetFullOrder();
        this.props.resetOrderSchedule();
      }
    }

    /**
     * handle click reset datetime order
     * @return {void}
     * */

  }, {
    key: 'handleResetDatetimeOrder',
    value: function handleResetDatetimeOrder() {
      this.props.resetDatetimeOrder();
      this.props.resetOrderSchedule();
    }

    /**
     * handles selected cell twice. First for date and period of start order,
     * and other for end of order.
     * take into consideration, that need disabled nearby cells in min duration
     * of order less than room setting.
     * @param {string} id - room id
     * @param {Date} date - start or end date
     * @param {number} period - period id
     * @return {void}
     * */

  }, {
    key: 'handleSelectOrder',
    value: function handleSelectOrder(id, date, period) {
      this.props.selectOrder(id, date, period);
    }

    /**
     * renderRooms - render room item components
     * @param {Array.<Object>} bathhouses - list of bathhouses
     * @param {Array.<Object>} rooms - list of rooms
     * @param {Object.<string, Array>} schedules - schedules of rooms
     * @return {Array.<Element>} RoomItems - room boxes
     * */

  }, {
    key: 'renderRooms',
    value: function renderRooms(bathhouses, rooms, schedules) {
      var _this2 = this;

      var _props = this.props;
      var activeRoomId = _props.activeRoomId;
      var order = _props.order;
      var steps = _props.steps;

      return rooms.map(function (room) {
        var bathhouse = bathhouses.find(function (bathhouse) {
          return bathhouse.get('id') === room.get('bathhouseId');
        });
        var schedule = schedules.get(room.get('id'));
        var activeRoomOrder = order.get('roomId') === room.get('id') ? order : (0, _immutable.Map)();

        return _react2.default.createElement(_index2.default, {
          ref: 'room-' + room.get('id'),
          isOpen: activeRoomId === room.get('id'),
          room: room,
          bathhouse: bathhouse,
          schedule: schedule,
          order: activeRoomOrder,
          steps: steps,
          isClosable: false,
          onChangeActiveRoom: _this2.handleChangeActiveRoom,
          onSelectOrder: _this2.props.selectOrder,
          onCheckOrder: _this2.props.checkOrder,
          onSendOrder: _this2.props.sendOrder,
          onResetDatetimeOrder: _this2.handleResetDatetimeOrder,
          key: room.get('id')
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
      var style = _props2.style;
      var bathhouses = _props2.bathhouses;
      var rooms = _props2.rooms;
      var schedules = _props2.schedules;
      var isActive = _props2.isActive;

      var nothingToShow = !rooms.size;

      if (isActive) {
        var roomItems = this.renderRooms(bathhouses, rooms, schedules);

        return _react2.default.createElement(
          'div',
          { className: 'RoomsList', style: style },
          roomItems,
          nothingToShow ? _react2.default.createElement(
            'div',
            { className: 'RoomsList-empty-result' },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'emptyResultShowText' })
          ) : null
        );
      }

      return null;
    }
  }]);
  return RoomsListComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Object} style - parent passed styles
 * @property {string|undefined} activeRoomId - active room id, box with this id will be open
 * @property {Array.<Object>} bathhouses - list of bathhouses
 * @property {Array.<Object>} rooms - list of valid rooms
 * @property {Object.<string, Array>} schedules - original and changes of schedules
 * @property {boolean} isActive - room is open or close
 * @property {Object} order - selected order by user
 * @property {Object} steps - steps for order
 * @property {Function} resetFullOrder - reset selected user order
 * @property {Function} resetDatetimeOrder - reset datetime user order
 * @property {Function} changeActiveRoom - change active room id, if null then all rooms is closed
 * @property {Function} findRoomScheduleIfNeed - find room schedule if need
 * @property {Function} findCommentsIfNeed - find room comments if need
 * @property {Function} selectOrder - select order from room item
 * @property {Function} checkOrder - send order to validate
 * @property {Function} resetOrderSchedule - reset order schedule
 */

RoomsListComponent.propTypes = {
  style: _react.PropTypes.object.isRequired,
  activeRoomId: _react.PropTypes.string,
  bathhouses: _reactImmutableProptypes2.default.list.isRequired,
  rooms: _reactImmutableProptypes2.default.list.isRequired,
  schedules: _reactImmutableProptypes2.default.map,
  isActive: _react.PropTypes.bool.isRequired,
  order: _reactImmutableProptypes2.default.map,
  steps: _reactImmutableProptypes2.default.map,
  resetFullOrder: _react.PropTypes.func.isRequired,
  resetDatetimeOrder: _react.PropTypes.func.isRequired,
  changeActiveRoom: _react.PropTypes.func.isRequired,
  findRoomScheduleIfNeed: _react.PropTypes.func.isRequired,
  findCommentsIfNeed: _react.PropTypes.func.isRequired,
  selectOrder: _react.PropTypes.func.isRequired,
  checkOrder: _react.PropTypes.func.isRequired,
  sendOrder: _react.PropTypes.func.isRequired,
  resetOrderSchedule: _react.PropTypes.func.isRequired
};

exports.default = (0, _reactRedux.connect)(_RoomsListSelectors2.default, {
  resetFullOrder: _orderActions.resetFullOrder,
  resetDatetimeOrder: _orderActions.resetDatetimeOrder,
  changeActiveRoom: _bathhouseActions.changeActiveRoom,
  findRoomScheduleIfNeed: _scheduleActions.findRoomScheduleIfNeed,
  findCommentsIfNeed: _commentActions.findCommentsIfNeed,
  selectOrder: _orderActions.selectOrder,
  checkOrder: _orderActions.checkOrder,
  sendOrder: _orderActions.sendOrder,
  resetOrderSchedule: _scheduleActions.resetOrderSchedule
})(RoomsListComponent);

//# sourceMappingURL=index.js.map