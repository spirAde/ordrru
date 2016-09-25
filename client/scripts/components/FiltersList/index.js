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

var _reactIntl = require('react-intl');

var _reactRedux = require('react-redux');

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _FiltersListSelectors = require('../../selectors/FiltersListSelectors');

var _FiltersListSelectors2 = _interopRequireDefault(_FiltersListSelectors);

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _bathhouseActions = require('../../actions/bathhouse-actions');

var _index = require('../FilterDateTime/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _index3 = require('../FilterDistance/index.jsx');

var _index4 = _interopRequireDefault(_index3);

var _index5 = require('../FilterGuests/index.jsx');

var _index6 = _interopRequireDefault(_index5);

var _index7 = require('../FilterOptions/index.jsx');

var _index8 = _interopRequireDefault(_index7);

var _index9 = require('../FilterPrepayment/index.jsx');

var _index10 = _interopRequireDefault(_index9);

var _index11 = require('../FilterPrice/index.jsx');

var _index12 = _interopRequireDefault(_index11);

var _index13 = require('../FilterSearchName/index.jsx');

var _index14 = _interopRequireDefault(_index13);

var _index15 = require('../FilterTypes/index.jsx');

var _index16 = _interopRequireDefault(_index15);

var _index17 = require('../FilterSorting/index.jsx');

var _index18 = _interopRequireDefault(_index17);

var _index19 = require('../Icon/index.jsx');

var _index20 = _interopRequireDefault(_index19);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Ps = undefined;

var DEFAULT_BOX_OFFSET = 444; // TODO: remove this magic value, calculate in componentDidMount

if (__CLIENT__) {
  Ps = require('perfect-scrollbar'); // eslint-disable-line global-require
}

/**
 * FiltersListComponent - dumb component, list of different filter components
 * Smart components - none
 * Dumb components - FilterDateTimeComponent, FilterDistanceComponent,
 *                   FilterGuestsComponent, FilterOptionsComponent,
 *                   FilterPrepaymentComponent, FilterPriceComponent,
 *                   FilterNameComponent, FilterTypesComponent
 * */

var FiltersListComponent = function (_Component) {
  (0, _inherits3.default)(FiltersListComponent, _Component);

  /**
   * constructor
   * @param {Object} props
   * @return {void}
   */

  function FiltersListComponent(props) {
    (0, _classCallCheck3.default)(this, FiltersListComponent);

    /**
     * @type {Object}
     * @property {Object} data
     * @property {boolean} data.isSticked - check if box is sticked
     * @property {boolean} data.topIsOpen - check if upper box of filters is open
     * @property {boolean} data.bottomIsOpen - check if lower box of filters is open
     * @property {Object} data.resets - pack of needResetSmth
     */

    var _this = (0, _possibleConstructorReturn3.default)(this, (FiltersListComponent.__proto__ || (0, _getPrototypeOf2.default)(FiltersListComponent)).call(this, props));

    _this.state = {
      data: (0, _immutable.Map)({
        isSticked: false,
        topIsOpen: true,
        bottomIsOpen: false
      })
    };

    _this.handleScroll = _this.handleScroll.bind(_this);
    _this.handleDateTimeFilter = _this.handleDateTimeFilter.bind(_this);
    _this.handleDistanceFilter = _this.handleDistanceFilter.bind(_this);
    _this.handleGuestsFilter = _this.handleGuestsFilter.bind(_this);
    _this.handleTypesFilter = _this.handleTypesFilter.bind(_this);
    _this.handleSearchNameFilter = _this.handleSearchNameFilter.bind(_this);
    _this.handleOptionsFilter = _this.handleOptionsFilter.bind(_this);
    _this.handlePrepaymentFilter = _this.handlePrepaymentFilter.bind(_this);
    _this.handlePriceFilter = _this.handlePriceFilter.bind(_this);
    _this.handleSortingFilter = _this.handleSortingFilter.bind(_this);
    _this.handleClickResetTag = _this.handleClickResetTag.bind(_this);
    _this.handleOpenFullFilters = _this.handleOpenFullFilters.bind(_this);
    _this.handleShowOffers = _this.handleShowOffers.bind(_this);
    return _this;
  }

  /**
   * componentDidMount - add listeners, determine box offset
   * @return {void}
   * */

  (0, _createClass3.default)(FiltersListComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      window.addEventListener('scroll', this.handleScroll, false);
      this.handleScroll();
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
     * componentWillUnmount - remove listeners
     * @return {void}
     * */

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      Ps.destroy(this.refs.scroll);
      window.removeEventListener('scroll', this.handleScroll, false);
    }

    /**
     * handleScroll - handle scroll, and check if need to attach box
     * @return {void}
     * */

  }, {
    key: 'handleScroll',
    value: function handleScroll() {
      var data = this.state.data;

      var isSticked = DEFAULT_BOX_OFFSET < window.pageYOffset;

      if (data.get('isSticked') !== isSticked) {
        this.props.onChangeFiltersStick(isSticked);
      }

      this.setState(function (_ref) {
        var data = _ref.data;
        return {
          data: data.set('isSticked', isSticked)
        };
      });
    }

    /**
     * handleOpenFullFilters - handle open full filters
     * @return {void}
     * */

  }, {
    key: 'handleOpenFullFilters',
    value: function handleOpenFullFilters(event) {
      event.preventDefault();

      Ps.initialize(this.refs.scroll, {
        suppressScrollX: true
      });
      this.setState(function (_ref2) {
        var data = _ref2.data;
        return {
          data: data.set('topIsOpen', true).set('bottomIsOpen', true)
        };
      });
    }

    /**
     * handleShowOffers - handle show offers
     * @return {void}
     * */

  }, {
    key: 'handleShowOffers',
    value: function handleShowOffers() {
      Ps.destroy(this.refs.scroll);
      this.setState(function (_ref3) {
        var data = _ref3.data;
        return {
          data: data.set('bottomIsOpen', false)
        };
      });
    }

    /**
     * handle changes in datetime filter
     * @param {Object.<string, string|number>} values
     * @param {string} values.startDate - start date
     * @param {number} values.startPeriod - start period
     * @param {string} values.endDate - end date
     * @param {number} values.endPeriod - end period
     * @return {void}
     */

  }, {
    key: 'handleDateTimeFilter',
    value: function handleDateTimeFilter(values) {
      this.props.updateRoomsByDateTime(values);
    }

    /**
     * handle changes in distance filter
     * @param {number} value - distance from center
     * @return {void}
     */

  }, {
    key: 'handleDistanceFilter',
    value: function handleDistanceFilter(value) {
      this.props.updateRoomsByDistance(value);
    }

    /**
     * handle changes in guests filter
     * @param {number} value - guests count
     * @return {void}
     */

  }, {
    key: 'handleGuestsFilter',
    value: function handleGuestsFilter(value) {
      this.props.updateRoomsByGuest(value);
    }

    /**
     * handle changes in types filter
     * @param {Object.<string, string|boolean>} value - type of filter
     * @return {void}
     */

  }, {
    key: 'handleTypesFilter',
    value: function handleTypesFilter(value) {
      this.props.updateRoomsByTypes(value);
    }

    /**
     * handle changes in search name filter
     * @param {string} value - searched text
     * @return {void}
     */

  }, {
    key: 'handleSearchNameFilter',
    value: function handleSearchNameFilter(value) {
      this.props.updateRoomsBySearchName(value);
    }

    /**
     * handle change in options filter
     * @param {Object.<string, string|boolean>} value - option
     * @return {void}
     */

  }, {
    key: 'handleOptionsFilter',
    value: function handleOptionsFilter(value) {
      this.props.updateRoomsByOptions(value);
    }

    /**
     * handle changes in prepayment filter
     * @param {Object.<string, boolean|null>} value - true | false = yes | no, and null is whatever
     * @return {void}
     */

  }, {
    key: 'handlePrepaymentFilter',
    value: function handlePrepaymentFilter(value) {
      this.props.updateRoomsByPrepayment(value);
    }

    /**
     * handle changes in price filter
     * @param {Object.<string, number>} values - price interval
     * @return {void}
     */

  }, {
    key: 'handlePriceFilter',
    value: function handlePriceFilter(values) {
      this.props.updateRoomsByPrice(values);
    }

    /**
     * handle changes sorting type or direction
     * @param {Object.<string, string|boolean>} value - value of type and direction
     * @return {void}
     * */

  }, {
    key: 'handleSortingFilter',
    value: function handleSortingFilter(value) {
      this.props.updateRoomsBySorting(value);
    }

    /**
     * handleClickResetTag - handle reset tag
     * @param {String} tag - tag name
     * @param {Object} event - SyntheticEvent
     * @return {void}
     * */

  }, {
    key: 'handleClickResetTag',
    value: function handleClickResetTag(tag, event) {
      event.preventDefault();

      this.props.resetRoomsByTag(tag);
    }

    /**
     * renderTags - render tags
     * @return {Array.<Element>} - tag elements
     * */

  }, {
    key: 'renderTags',
    value: function renderTags(tags) {
      var _this2 = this;

      return tags.map(function (tag, index) {
        return _react2.default.createElement(
          'a',
          {
            className: 'FiltersList-tags-anchor',
            key: index,
            onClick: _this2.handleClickResetTag.bind(_this2, tag)
          },
          _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'tags.' + tag }),
          _react2.default.createElement(_index20.default, {
            className: 'FiltersList-icon-cancel',
            name: 'icon-cancel',
            rate: 2
          })
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
      var _props = this.props;
      var offersCount = _props.offersCount;
      var tags = _props.tags;
      var datetime = _props.datetime;
      var distance = _props.distance;
      var guest = _props.guest;
      var prepayment = _props.prepayment;
      var price = _props.price;
      var searchName = _props.searchName;
      var sorting = _props.sorting;
      var options = _props.options;
      var types = _props.types;
      var data = this.state.data;

      var tagsItems = this.renderTags(tags);

      var fullFiltersClasses = (0, _classnames2.default)('FiltersList', {
        'FiltersList--opened': data.get('topIsOpen') && data.get('bottomIsOpen')
      });

      var topFiltersClasses = (0, _classnames2.default)('FiltersList-top', {
        'FiltersList-top--opened': data.get('topIsOpen')
      });

      var bottomFiltersClasses = (0, _classnames2.default)('FiltersList-bottom', {
        'FiltersList-bottom--opened': data.get('bottomIsOpen')
      });

      var optionsClasses = (0, _classnames2.default)('FiltersList-options', 'g-clear', {
        'FiltersList-options--opened': !data.get('bottomIsOpen'),
        'FiltersList-options--sticked': data.get('isSticked')
      });

      var showContentClasses = (0, _classnames2.default)('FiltersList-show-content', {
        'FiltersList-show-content--opened': data.get('topIsOpen') && data.get('bottomIsOpen')
      });

      return _react2.default.createElement(
        'div',
        { className: fullFiltersClasses },
        _react2.default.createElement(
          'div',
          { className: 'FiltersList-wrapper', ref: 'scroll' },
          _react2.default.createElement(
            'div',
            { className: topFiltersClasses },
            _react2.default.createElement(_index2.default, {
              values: datetime,
              onSelect: this.handleDateTimeFilter
            }),
            _react2.default.createElement(_index8.default, {
              values: options,
              onSelect: this.handleOptionsFilter
            }),
            _react2.default.createElement(_index16.default, {
              values: types,
              onSelect: this.handleTypesFilter
            }),
            _react2.default.createElement(_index10.default, {
              values: prepayment,
              onSelect: this.handlePrepaymentFilter
            }),
            _react2.default.createElement(_index18.default, {
              values: sorting,
              onSelect: this.handleSortingFilter
            })
          ),
          _react2.default.createElement(
            'div',
            { className: bottomFiltersClasses },
            _react2.default.createElement(_index14.default, {
              value: searchName,
              onSelect: this.handleSearchNameFilter
            }),
            _react2.default.createElement(_index4.default, {
              values: distance,
              onSelect: this.handleDistanceFilter
            }),
            _react2.default.createElement(_index12.default, {
              values: price,
              onSelect: this.handlePriceFilter
            }),
            _react2.default.createElement(_index6.default, {
              values: guest,
              onSelect: this.handleGuestsFilter
            })
          )
        ),
        _react2.default.createElement(
          'div',
          { className: optionsClasses, ref: 'box' },
          _react2.default.createElement(
            'div',
            { className: 'FiltersList-more' },
            _react2.default.createElement(
              'a',
              { className: 'FiltersList-more-anchor', onClick: this.handleOpenFullFilters },
              data.get('isSticked') ? _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'showFilters' }) : _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'moreFilters' })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'FiltersList-tags' },
            tagsItems
          ),
          _react2.default.createElement(
            'div',
            { className: 'FiltersList-total-offers' },
            _react2.default.createElement(_reactIntl.FormattedMessage, {
              id: 'offersCount',
              values: {
                offersCount: offersCount
              }
            })
          )
        ),
        _react2.default.createElement(
          'div',
          { className: showContentClasses },
          _react2.default.createElement(
            'a',
            { className: 'FiltersList-show-offers-anchor', onClick: this.handleShowOffers },
            _react2.default.createElement(_reactIntl.FormattedMessage, { id: 'showOffers' })
          )
        )
      );
    }
  }]);
  return FiltersListComponent;
}(_react.Component);

/**
 * propTypes
 * @property {number} offersCount - count valid rooms
 * @property {Array.<string>} tags - list of tags
 * @property {Object} filters - all filter types
 * @property {Function} updateRoomsByDateTime - filter rooms by datetime
 * @property {Function} updateRoomsByDistance - filter rooms by distance
 * @property {Function} updateRoomsByGuest - filter rooms by guests count
 * @property {Function} updateRoomsByTypes - filter rooms by types(bathhouse, sauna, etc...)
 * @property {Function} updateRoomsBySearchName - filter rooms by room name or bathhouse name
 * @property {Function} updateRoomsByOptions - filter rooms by options of room or bathhouse
 * @property {Function} updateRoomsByPrepayment - filter rooms by prepayment
 * @property {Function} updateRoomsByPrice - filter rooms by price
 * @property {Function} updateRoomsBySorting - filter sorting rooms
 * @property {Function} resetRoomsByTag - clear rooms in invalid, and cancel tag
 * @property {Function} onChangeFiltersStick - check if filters box change isSticked value
 */

FiltersListComponent.propTypes = {
  offersCount: _react.PropTypes.number.isRequired,
  tags: _reactImmutableProptypes2.default.list.isRequired,
  datetime: _reactImmutableProptypes2.default.map.isRequired,
  distance: _reactImmutableProptypes2.default.map.isRequired,
  guest: _reactImmutableProptypes2.default.map.isRequired,
  options: _reactImmutableProptypes2.default.list.isRequired,
  prepayment: _reactImmutableProptypes2.default.list.isRequired,
  price: _reactImmutableProptypes2.default.map.isRequired,
  types: _reactImmutableProptypes2.default.list.isRequired,
  searchName: _reactImmutableProptypes2.default.map.isRequired,
  sorting: _reactImmutableProptypes2.default.list.isRequired,
  updateRoomsByDateTime: _react.PropTypes.func.isRequired,
  updateRoomsByDistance: _react.PropTypes.func.isRequired,
  updateRoomsByGuest: _react.PropTypes.func.isRequired,
  updateRoomsByTypes: _react.PropTypes.func.isRequired,
  updateRoomsBySearchName: _react.PropTypes.func.isRequired,
  updateRoomsByOptions: _react.PropTypes.func.isRequired,
  updateRoomsByPrepayment: _react.PropTypes.func.isRequired,
  updateRoomsByPrice: _react.PropTypes.func.isRequired,
  updateRoomsBySorting: _react.PropTypes.func.isRequired,
  resetRoomsByTag: _react.PropTypes.func.isRequired,
  onChangeFiltersStick: _react.PropTypes.func.isRequired
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
exports.default = (0, _reactRedux.connect)(_FiltersListSelectors2.default, {
  updateRoomsByDateTime: _bathhouseActions.updateRoomsByDateTime,
  updateRoomsByDistance: _bathhouseActions.updateRoomsByDistance,
  updateRoomsByGuest: _bathhouseActions.updateRoomsByGuest,
  updateRoomsByTypes: _bathhouseActions.updateRoomsByTypes,
  updateRoomsBySearchName: _bathhouseActions.updateRoomsBySearchName,
  updateRoomsByOptions: _bathhouseActions.updateRoomsByOptions,
  updateRoomsByPrepayment: _bathhouseActions.updateRoomsByPrepayment,
  updateRoomsByPrice: _bathhouseActions.updateRoomsByPrice,
  updateRoomsBySorting: _bathhouseActions.updateRoomsBySorting,
  resetRoomsByTag: _bathhouseActions.resetRoomsByTag
})(FiltersListComponent);

//# sourceMappingURL=index.js.map