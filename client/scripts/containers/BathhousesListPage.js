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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactHelmet = require('react-helmet');

var _reactHelmet2 = _interopRequireDefault(_reactHelmet);

var _reactRedux = require('react-redux');

var _redial = require('redial');

var _trim = require('lodash/trim');

var _trim2 = _interopRequireDefault(_trim);

var _escape = require('lodash/escape');

var _escape2 = _interopRequireDefault(_escape);

var _immutable = require('immutable');

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

var _later = require('later');

var _later2 = _interopRequireDefault(_later);

var _BathhousesListSelectors = require('../selectors/BathhousesListSelectors');

var _BathhousesListSelectors2 = _interopRequireDefault(_BathhousesListSelectors);

var _shallowEqualImmutable = require('../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _bathhouseActions = require('../actions/bathhouse-actions');

var _cityActions = require('../actions/city-actions');

var _filterActions = require('../actions/filter-actions');

var _userActions = require('../actions/user-actions');

var _scheduleActions = require('../actions/schedule-actions');

var _applicationActions = require('../actions/application-actions');

var _index = require('../components/Header/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('../components/FiltersList/index.jsx');

var _index4 = _interopRequireDefault(_index3);

var _index5 = require('../components/RoomsList/index.jsx');

var _index6 = _interopRequireDefault(_index5);

var _index7 = require('../components/Map/index.jsx');

var _index8 = _interopRequireDefault(_index7);

var _index9 = require('../components/CommentsList/index.jsx');

var _index10 = _interopRequireDefault(_index9);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var globalCheckCurrentPeriodInterval = null;

var hooks = {
  fetch: function fetch(_ref) {
    var dispatch = _ref.dispatch;
    var getState = _ref.getState;

    var promises = [];
    var state = getState();
    var params = state.routing.locationBeforeTransitions.query;
    var city = (0, _cityActions.getCityBySlug)(state, params.city);

    _momentTimezone2.default.tz.setDefault(city.timezone);

    if ((0, _cityActions.shouldChangeActiveCity)(state, city.get('id'))) {
      dispatch((0, _cityActions.changeActiveCity)(city.get('id')));
    }

    if ((0, _filterActions.shouldSetFilters)(state, city.get('id'))) {
      dispatch((0, _filterActions.setFiltersData)(city.get('id')));
    }

    if ((0, _bathhouseActions.shouldFetchBathhousesForCity)(state)) {
      promises.push(dispatch((0, _bathhouseActions.findBathhousesAndRooms)(city.get('id'))));
    }

    if (params.room) {
      var roomId = (0, _escape2.default)((0, _trim2.default)(params.room));
      dispatch((0, _bathhouseActions.changeActiveRoom)(roomId));
      promises.push(dispatch((0, _scheduleActions.findRoomScheduleIfNeed)(roomId)));
    }

    return _promise2.default.all(promises);
  }
};

/**
 * BathhouseListPage - smart component, container of rooms and bathhouses, map and filters
 * Smart components - none
 * Dumb components - HeaderComponent, FiltersListComponent, RoomsListComponent, MapComponent
 * */

var BathhouseListPage = function (_Component) {
  (0, _inherits3.default)(BathhouseListPage, _Component);

  function BathhouseListPage(props) {
    (0, _classCallCheck3.default)(this, BathhouseListPage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (BathhouseListPage.__proto__ || (0, _getPrototypeOf2.default)(BathhouseListPage)).call(this, props));

    _this.state = {
      data: (0, _immutable.Map)({
        isSticked: false
      })
    };

    _this.handleChangeFilterStick = _this.handleChangeFilterStick.bind(_this);
    return _this;
  }

  /**
   * componentDidMount
   * send city id by socket, added to socket room. Add interval for global date and period
   * @return {void}
   * */

  (0, _createClass3.default)(BathhouseListPage, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var activeCityId = this.props.activeCityId;

      this.props.addToSocketRoom(activeCityId);
      this.props.changeGlobalCurrentDateAndPeriod(activeCityId);

      var globalCheckCurrentPeriod = _later2.default.parse.text('every 30 minutes');

      globalCheckCurrentPeriodInterval = _later2.default.setInterval(function () {
        _this2.props.changeGlobalCurrentDateAndPeriod();
      }, globalCheckCurrentPeriod);
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
     * componentWillUnmount - clear time interval
     * @return {void}
     * */

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      window.clearInterval(globalCheckCurrentPeriodInterval);
    }
  }, {
    key: 'handleChangeFilterStick',
    value: function handleChangeFilterStick(isSticked) {
      this.setState(function (_ref2) {
        var data = _ref2.data;
        return {
          data: data.set('isSticked', isSticked)
        };
      });
    }

    /**
     * render
     * @return {XML} ReactElement
     * */

  }, {
    key: 'render',
    value: function render() {
      var _props = this.props;
      var mode = _props.mode;
      var activeRoomId = _props.activeRoomId;
      var data = this.state.data;

      var isListMode = mode === 'list';
      var commentsIsActive = !!activeRoomId;

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_reactHelmet2.default, { title: 'Bathhouses' }),
        _react2.default.createElement(_index2.default, { mode: mode }),
        _react2.default.createElement(_index4.default, {
          onChangeFiltersStick: this.handleChangeFilterStick
        }),
        _react2.default.createElement(_index10.default, { isActive: commentsIsActive }),
        _react2.default.createElement(_index6.default, {
          style: {
            marginTop: data.get('isSticked') ? 69 : 0
          },
          isActive: isListMode
        }),
        _react2.default.createElement(_index8.default, { isActive: !isListMode })
      );
    }
  }]);
  return BathhouseListPage;
}(_react.Component);

/**
 * propTypes
 * @property {string} mode - current mode of page(list or map)
 */

BathhouseListPage.propTypes = {
  mode: _react.PropTypes.oneOf(['list', 'map']),
  activeRoomId: _react.PropTypes.string,
  activeCityId: _react.PropTypes.string,
  addToSocketRoom: _react.PropTypes.func.isRequired,
  changeGlobalCurrentDateAndPeriod: _react.PropTypes.func.isRequired
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
exports.default = (0, _redial.provideHooks)(hooks)((0, _reactRedux.connect)(_BathhousesListSelectors2.default, {
  addToSocketRoom: _userActions.addToSocketRoom,
  changeActiveRoom: _bathhouseActions.changeActiveRoom,
  findRoomScheduleIfNeed: _scheduleActions.findRoomScheduleIfNeed,
  changeGlobalCurrentDateAndPeriod: _applicationActions.changeGlobalCurrentDateAndPeriod
})(BathhouseListPage));

//# sourceMappingURL=BathhousesListPage.js.map