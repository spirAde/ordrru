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

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _index = require('../ManagerSchedulePanel/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('../Loader/index.jsx');

var _index4 = _interopRequireDefault(_index3);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ManagerSchedulePanelListComponent = function (_Component) {
  (0, _inherits3.default)(ManagerSchedulePanelListComponent, _Component);

  function ManagerSchedulePanelListComponent() {
    (0, _classCallCheck3.default)(this, ManagerSchedulePanelListComponent);
    return (0, _possibleConstructorReturn3.default)(this, (ManagerSchedulePanelListComponent.__proto__ || (0, _getPrototypeOf2.default)(ManagerSchedulePanelListComponent)).apply(this, arguments));
  }

  (0, _createClass3.default)(ManagerSchedulePanelListComponent, [{
    key: 'shouldComponentUpdate',

    /**
     * shouldComponentUpdate
     * @return {boolean}
     * */
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _shallowEqualImmutable2.default)(this.props, nextProps) || !(0, _shallowEqualImmutable2.default)(this.state, nextState);
    }
  }, {
    key: 'renderSchedulePanels',
    value: function renderSchedulePanels() {
      var _props = this.props;
      var rooms = _props.rooms;
      var orders = _props.orders;
      var schedules = _props.schedules;
      var dx = _props.dx;
      var onShowOrder = _props.onShowOrder;
      var onCreateOrder = _props.onCreateOrder;

      return rooms.map(function (room) {
        var roomSchedules = schedules.get(room.get('id'));
        var roomOrders = orders.get(room.get('id'));

        return _react2.default.createElement(_index2.default, {
          room: room,
          orders: roomOrders,
          schedules: roomSchedules,
          dx: dx,
          key: room.get('id'),
          onShowOrder: onShowOrder,
          onCreateOrder: onCreateOrder
        });
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var rooms = _props2.rooms;
      var isFetching = _props2.isFetching;

      var renderedSchedulePanels = rooms && rooms.size ? this.renderSchedulePanels() : (0, _immutable.List)();

      return _react2.default.createElement(
        'div',
        { className: 'ManagerSchedulePanelList' },
        _react2.default.createElement(
          _index4.default,
          { active: isFetching },
          renderedSchedulePanels
        )
      );
    }
  }]);
  return ManagerSchedulePanelListComponent;
}(_react.Component);

ManagerSchedulePanelListComponent.propTypes = {
  rooms: _reactImmutableProptypes2.default.list.isRequired,
  orders: _reactImmutableProptypes2.default.map.isRequired,
  schedules: _reactImmutableProptypes2.default.map.isRequired,
  dx: _react.PropTypes.number.isRequired,
  isFetching: _react.PropTypes.bool.isRequired,

  onShowOrder: _react.PropTypes.func.isRequired,
  onCreateOrder: _react.PropTypes.func.isRequired
};

exports.default = ManagerSchedulePanelListComponent;

//# sourceMappingURL=index.js.map