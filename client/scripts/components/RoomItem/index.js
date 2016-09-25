'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactRouter = require('react-router');

var _reactIntl = require('react-intl');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _index = require('../SchedulePanel/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('../Icon/index.jsx');

var _index4 = _interopRequireDefault(_index3);

var _index5 = require('../Tooltip/index.jsx');

var _index6 = _interopRequireDefault(_index5);

var _index7 = require('../Loader/index.jsx');

var _index8 = _interopRequireDefault(_index7);

var _index9 = require('../Order/index.jsx');

var _index10 = _interopRequireDefault(_index9);

var _configs = require('../../../../common/data/configs.json');

var _configs2 = _interopRequireDefault(_configs);

require('./style.css');

var _bathhouse = require('../../../images/bathhouse.jpg');

var _bathhouse2 = _interopRequireDefault(_bathhouse);

var _bathhouse3 = require('../../../images/bathhouse1.jpg');

var _bathhouse4 = _interopRequireDefault(_bathhouse3);

var _bathhouse5 = require('../../../images/bathhouse3.jpg');

var _bathhouse6 = _interopRequireDefault(_bathhouse5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * RoomItemComponent - dumb component, room box
 * Smart components - none
 * Dumb components - SchedulePanelComponent, OrderComponent, IconComponent, LoaderComponent
 * */

var RoomItemComponent = function (_Component) {
  (0, _inherits3.default)(RoomItemComponent, _Component);

  /**
   * constructor
   * @param {Object} props
   */

  function RoomItemComponent(props) {
    (0, _classCallCheck3.default)(this, RoomItemComponent);

    /**
     * @type {object}
     * @property {Object} data
     * @property {boolean} data.scheduleIsOpen - opened or not schedule for room
     */
    // TODO: remove immutable, set just plain

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(RoomItemComponent).call(this, props));

    _this.state = {
      data: (0, _immutable.Map)({
        scheduleIsOpen: false,
        needResetOrderedPeriods: false,
        tooltipIsActive: false
      })
    };

    _this.handleSelectOrder = _this.handleSelectOrder.bind(_this);
    _this.handleOpenDescription = _this.handleOpenDescription.bind(_this);
    _this.handleOpenSchedule = _this.handleOpenSchedule.bind(_this);
    _this.handleClickCheckOrder = _this.handleClickCheckOrder.bind(_this);
    _this.handleResetDatetimeOrder = _this.handleResetDatetimeOrder.bind(_this);
    _this.handleResetOrderedPeriods = _this.handleResetOrderedPeriods.bind(_this);
    _this.handleMouseOverTooltip = _this.handleMouseOverTooltip.bind(_this);
    _this.handleMouseLeaveTooltip = _this.handleMouseLeaveTooltip.bind(_this);
    return _this;
  }

  /**
   * componentWillReceiveProps - if activeRoomId was change,
   * then close schedule for previous active room, and reset ordered periods
   * @return {void}
   * */

  (0, _createClass3.default)(RoomItemComponent, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var isOpen = this.props.isOpen;

      if (isOpen && !nextProps.isOpen) {
        this.setState(function (_ref) {
          var data = _ref.data;
          return {
            data: data.set('scheduleIsOpen', false).set('needResetOrderedPeriods', true)
          };
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

    /**
     * get humanize view of selected order datetime
     * @param {string} id - room id
     * @param {Object} order - selected user order
     * @return {string} - humanize view of datetime
     * */
    // TODO: check if user click on last period for date, then need change date
    // TODO: and period to next date and first period

  }, {
    key: 'getDatetimeValue',
    value: function getDatetimeValue(id, order) {
      var value = '';

      if (order.get('roomId') === id) {
        if (order.getIn(['datetime', 'startDate'])) {
          var startDate = order.getIn(['datetime', 'startDate']);
          var startPeriod = order.getIn(['datetime', 'startPeriod']);
          value += (0, _moment2.default)(startDate).format('Do MMMM') + ' ' + _configs2.default.periods[startPeriod] + ' — ';
        }
        if (order.getIn(['datetime', 'endDate'])) {
          var endDate = order.getIn(['datetime', 'endDate']);
          var endPeriod = order.getIn(['datetime', 'endPeriod']);
          value += (0, _moment2.default)(endDate).format('Do MMMM') + ' ' + _configs2.default.periods[endPeriod];
        }
      }

      return value;
    }

    /**
     * handleClickCheckOrder - handle check order click
     * @return {void}
     * */

  }, {
    key: 'handleClickCheckOrder',
    value: function handleClickCheckOrder(event) {
      event.preventDefault();

      var order = this.props.order;

      if (!order.getIn(['sums', 'datetime'])) return false;

      return this.props.onCheckOrder();
    }

    /**
     * handle mouse over on question mark and open tooltip(development only)
     * */

  }, {
    key: 'handleMouseOverTooltip',
    value: function handleMouseOverTooltip(event) {
      event.preventDefault();

      this.setState(function (_ref2) {
        var data = _ref2.data;
        return {
          data: data.set('tooltipIsActive', true)
        };
      });
    }

    /**
     * handle mouse leave on question mark and open tooltip(development only)
     * */

  }, {
    key: 'handleMouseLeaveTooltip',
    value: function handleMouseLeaveTooltip(event) {
      event.preventDefault();

      this.setState(function (_ref3) {
        var data = _ref3.data;
        return {
          data: data.set('tooltipIsActive', false)
        };
      });
    }

    /**
     * handleOpenDescription - handle open|close room box.
     * @return {void}
     * */

  }, {
    key: 'handleOpenDescription',
    value: function handleOpenDescription() {
      var _props = this.props;
      var room = _props.room;
      var isOpen = _props.isOpen;

      this.props.onChangeActiveRoom(isOpen ? undefined : room.get('id'));
    }

    /**
     * handle open|close schedule for room
     * */

  }, {
    key: 'handleOpenSchedule',
    value: function handleOpenSchedule(event) {
      event.preventDefault();

      this.setState(function (_ref4) {
        var data = _ref4.data;
        return {
          data: data.set('scheduleIsOpen', !data.get('scheduleIsOpen'))
        };
      });
    }

    /**
     * handle click on cancel datetime order and reset ordered periods in child
     * */

  }, {
    key: 'handleResetDatetimeOrder',
    value: function handleResetDatetimeOrder(event) {
      event.preventDefault();

      this.props.onResetDatetimeOrder();

      this.setState(function (_ref5) {
        var data = _ref5.data;
        return {
          data: data.set('needResetOrderedPeriods', true)
        };
      });
    }

    /**
     * handle that child was reset the ordered periods
     * */

  }, {
    key: 'handleResetOrderedPeriods',
    value: function handleResetOrderedPeriods() {
      this.setState(function (_ref6) {
        var data = _ref6.data;
        return {
          data: data.set('needResetOrderedPeriods', false)
        };
      });
    }

    /**
     * handle selected order
     * @param {Date} date - date of start or end of order
     * @param {number} period - period id
     * @return {void}
     * */

  }, {
    key: 'handleSelectOrder',
    value: function handleSelectOrder(date, period) {
      var _props2 = this.props;
      var room = _props2.room;
      var order = _props2.order;

      if (order.getIn(['datetime', 'startDate'])) {
        this.setState(function (_ref7) {
          var data = _ref7.data;
          return {
            data: data.set('scheduleIsOpen', false)
          };
        });
      }

      this.props.onSelectOrder(room.get('id'), date, period);
    }

    /**
     * render rating stars - full, half and empty stars
     * @param {number} rating - rating
     * @return {Array.<Element>}data
     * */

  }, {
    key: 'renderStars',
    value: function renderStars(rating) {
      var fullStarsCount = (0, _lodash.floor)(rating / 2);
      var halfStarsCount = rating - fullStarsCount * 2;
      var emptyStarsCount = 5 - fullStarsCount - halfStarsCount;

      var fullStars = (0, _lodash.fill)(Array(fullStarsCount), 'icon-star-full');
      var halfStars = (0, _lodash.fill)(Array(halfStarsCount), 'icon-star-half');
      var emptyStars = (0, _lodash.fill)(Array(emptyStarsCount), 'icon-star-empty');

      return [].concat((0, _toConsumableArray3.default)(fullStars), (0, _toConsumableArray3.default)(halfStars), (0, _toConsumableArray3.default)(emptyStars)).map(function (icon, index) {
        return _react2.default.createElement(_index4.default, { name: icon, color: '#F4740C', key: index });
      });
    }

    /**
     * renderOptions - render room options
     * @param {Array.<string>} options - list of options
     * @return {Array.<Element>} RoomItems - room boxes
     * */

  }, {
    key: 'renderOptions',
    value: function renderOptions(options) {
      return options.map(function (option, index) {
        var optionClass = 'RoomItem-service-type-' + option;
        var classes = (0, _classnames2.default)('RoomItem-service-type', 'g-icons', optionClass);

        return _react2.default.createElement(
          'div',
          { className: classes, key: index },
          _react2.default.createElement(
            'span',
            { className: 'RoomItem-option' },
            _react2.default.createElement(_index4.default, {
              name: 'icon-' + option,
              rate: 1.5
            })
          ),
          _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'options.' + option })
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
      var isOpen = _props3.isOpen;
      var room = _props3.room;
      var bathhouse = _props3.bathhouse;
      var schedule = _props3.schedule;
      var isClosable = _props3.isClosable;
      var order = _props3.order;
      var steps = _props3.steps;
      var data = this.state.data;

      var bathhouseUrl = '/bathhouse/' + bathhouse.get('id');

      var orderDatetimeValue = this.getDatetimeValue(room.get('id'), order);
      var orderSum = order && order.size ? order.getIn(['sums', 'datetime']) + order.getIn(['sums', 'services']) : 0;

      var options = this.renderOptions(room.get('options').concat(bathhouse.get('options')));
      var stars = this.renderStars(room.get('rating'));

      var infoClasses = (0, _classnames2.default)('RoomItem-info', {
        'RoomItem-info--opened': isOpen
      });

      var typesClasses = (0, _lodash.sortBy)(room.get('types').toJS()).join('-');

      var isOrder = steps.getIn(['confirm', 'active']) && steps.getIn(['choice', 'valid']) && order.get('roomId') === room.get('id');

      return _react2.default.createElement(
        'div',
        { className: 'RoomItem' },
        _react2.default.createElement(
          'div',
          { className: 'RoomItem-inner' },
          _react2.default.createElement(
            'div',
            { className: 'RoomItem-preview' },
            _react2.default.createElement(
              'div',
              { className: 'RoomItem-preview-top g-clear' },
              _react2.default.createElement(
                'h2',
                { className: 'RoomItem-name RoomItem-type-' + typesClasses },
                room.get('name')
              ),
              __DEVELOPMENT__ ? _react2.default.createElement(
                'div',
                { style: { float: 'left' } },
                _react2.default.createElement(_index4.default, {
                  className: 'RoomItem-icon-devtool-question',
                  id: room.get('id'),
                  name: 'icon-question',
                  rate: 1.5,
                  onMouseOver: this.handleMouseOverTooltip,
                  onMouseLeave: this.handleMouseLeaveTooltip
                }),
                data.get('tooltipIsActive') ? _react2.default.createElement(
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
                { className: 'RoomItem-stars g-clear' },
                stars
              ),
              _react2.default.createElement(
                'div',
                { onClick: this.props.onCloseRoom },
                isClosable ? _react2.default.createElement(_index4.default, {
                  className: 'RoomItem-icon-cancel',
                  name: 'icon-cancel',
                  rate: 2
                }) : null
              ),
              _react2.default.createElement(
                'p',
                { className: 'RoomItem-bathhouse-address g-icons' },
                _react2.default.createElement(_index4.default, {
                  className: 'RoomItem-icon-location-point-mapbox',
                  name: 'icon-location-point-mapbox',
                  color: '#F4740C'
                }),
                _react2.default.createElement(
                  _reactRouter.Link,
                  {
                    target: '_blank',
                    to: { pathname: bathhouseUrl },
                    className: 'RoomItem-bathhouse-address-text'
                  },
                  bathhouse.get('name')
                ),
                ' ',
                bathhouse.get('address')
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'RoomItem-preview-bottom g-clear' },
              _react2.default.createElement(
                'div',
                { className: 'RoomItem-photos' },
                _react2.default.createElement(
                  'a',
                  { className: 'RoomItem-photo' },
                  _react2.default.createElement('img', { width: '234', height: '140', alt: '', src: _bathhouse2.default })
                ),
                _react2.default.createElement(
                  'a',
                  { className: 'RoomItem-photo' },
                  _react2.default.createElement('img', { width: '234', height: '140', alt: '', src: _bathhouse4.default })
                ),
                _react2.default.createElement(
                  'a',
                  { className: 'RoomItem-photo' },
                  _react2.default.createElement('img', { width: '234', height: '140', alt: '', src: _bathhouse6.default })
                )
              ),
              _react2.default.createElement(
                'div',
                { className: 'RoomItem-more-info' },
                _react2.default.createElement(
                  'a',
                  { className: 'RoomItem-details-button', onClick: this.handleOpenDescription },
                  _react2.default.createElement(
                    'span',
                    { className: 'RoomItem-details-price' },
                    _react2.default.createElement(_reactIntl.FormattedMessage, {
                      id: 'priceFrom',
                      values: {
                        price: room.getIn(['price', 'min'])
                      }
                    })
                  ),
                  _react2.default.createElement(
                    'span',
                    { className: 'RoomItem-details-more' },
                    isOpen ? _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'hide' }) : _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'more' })
                  )
                )
              )
            )
          ),
          _react2.default.createElement(
            'div',
            { className: infoClasses },
            _react2.default.createElement(
              'div',
              { className: 'RoomItem-descriptions-services g-clear' },
              _react2.default.createElement(
                'div',
                { className: 'RoomItem-description' },
                _react2.default.createElement(
                  'p',
                  { className: 'RoomItem-description-text' },
                  room.get('description')
                )
              ),
              _react2.default.createElement(
                'div',
                { className: 'RoomItem-services g-clear' },
                options
              )
            ),
            isOrder ? _react2.default.createElement(_index10.default, {
              order: order,
              steps: steps,
              prepayment: room.getIn(['settings', 'prepayment']),
              onSendOrder: this.props.onSendOrder
            }) : _react2.default.createElement(
              'div',
              { className: 'RoomItem-booking' },
              _react2.default.createElement(
                'div',
                { className: 'RoomItem-booking-inner' },
                _react2.default.createElement(
                  'div',
                  { className: 'RoomItem-booking-step-1 g-clear' },
                  _react2.default.createElement(
                    'div',
                    { className: 'RoomItem-booking-left-fields' },
                    _react2.default.createElement(
                      'div',
                      { className: 'RoomItem-field-date-time g-field-date' },
                      _react2.default.createElement('input', {
                        type: 'text',
                        className: 'RoomItem-field-date-time-input',
                        value: orderDatetimeValue,
                        onClick: this.handleOpenSchedule
                      }),
                      order.getIn(['datetime', 'startDate']) ? _react2.default.createElement(
                        'span',
                        { onClick: this.handleResetDatetimeOrder },
                        _react2.default.createElement(_index4.default, {
                          className: 'RoomItem-datetime-icon-cancel',
                          name: 'icon-cancel',
                          rate: 1.5,
                          color: '#5A6B74'
                        })
                      ) : null
                    ),
                    _react2.default.createElement(
                      'div',
                      { className: 'RoomItem-field-select-services g-field-select' },
                      _react2.default.createElement(
                        'div',
                        { className: '' },
                        _react2.default.createElement(
                          'p',
                          { className: 'RoomItem-field-select-services-input' },
                          _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'additionalServicesIsEmpty' })
                        )
                      )
                    )
                  ),
                  _react2.default.createElement(
                    'div',
                    { className: 'RoomItem-booking-right-fields g-clear' },
                    _react2.default.createElement(
                      'div',
                      { className: 'RoomItem-select-guests' },
                      _react2.default.createElement(
                        'p',
                        { className: 'RoomItem-select-guests-text' },
                        _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'guestCount' })
                      ),
                      _react2.default.createElement('div', { className: 'field field-select-people' })
                    ),
                    _react2.default.createElement(
                      'div',
                      { className: 'RoomItem-next-step' },
                      _react2.default.createElement(
                        'a',
                        {
                          className: 'RoomItem-next-step-button',
                          onClick: this.handleClickCheckOrder
                        },
                        steps.getIn(['choice', 'loading']) ? _react2.default.createElement(_index8.default, null) : _react2.default.createElement(
                          'div',
                          null,
                          _react2.default.createElement(
                            'span',
                            { className: 'RoomItem-total-cost' },
                            orderSum,
                            ' руб'
                          ),
                          _react2.default.createElement(
                            'span',
                            { className: 'RoomItem-order-text' },
                            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'toOrder' })
                          )
                        )
                      )
                    )
                  )
                )
              ),
              _react2.default.createElement(_index2.default, {
                key: 'schedule-' + room.get('id'),
                schedule: schedule,
                prices: room.getIn(['price', 'chunks']),
                order: order,
                isOpen: data.get('scheduleIsOpen'),
                needResetOrderedPeriods: data.get('needResetOrderedPeriods'),
                onSelectOrder: this.handleSelectOrder,
                onResetOrderedPeriods: this.handleResetOrderedPeriods
              })
            )
          )
        )
      );
    }
  }]);
  return RoomItemComponent;
}(_react.Component);

RoomItemComponent.contextTypes = {
  intl: _react.PropTypes.object.isRequired
};

/**
 * propTypes
 * @property {boolean} isOpen - box is opened or not
 * @property {Object} bathhouse - bathhouse data
 * @property {Object} room - room data
 * @property {Array} schedule - room schedule
 * @property {Object} order - selected user order
 * @property {boolean} isClosable - if closable, then room box has close icon in right-top angle
 * @property {Function} onChangeActiveRoom - change data about active room
 * @property {Function} onCloseRoom - close room by clicked on cancel icon
 * @property {Function} onSelectOrder - select date and period of order
 * @property {Function} onResetDatetimeOrder - reset datetime order
 */
RoomItemComponent.propTypes = {
  isOpen: _react.PropTypes.bool.isRequired,
  bathhouse: _reactImmutableProptypes2.default.map.isRequired,
  room: _reactImmutableProptypes2.default.map.isRequired,
  schedule: _reactImmutableProptypes2.default.list,
  order: _reactImmutableProptypes2.default.map,
  steps: _reactImmutableProptypes2.default.map,
  isClosable: _react.PropTypes.bool.isRequired,
  onChangeActiveRoom: _react.PropTypes.func,
  onCloseRoom: _react.PropTypes.func,
  onSelectOrder: _react.PropTypes.func,
  onCheckOrder: _react.PropTypes.func,
  onSendOrder: _react.PropTypes.func,
  onResetDatetimeOrder: _react.PropTypes.func
};

RoomItemComponent.defaultProps = {
  isClosable: false
};

exports.default = RoomItemComponent;

//# sourceMappingURL=index.js.map