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

var _lodash = require('lodash');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactImmutableProptypes = require('react-immutable-proptypes');

var _reactImmutableProptypes2 = _interopRequireDefault(_reactImmutableProptypes);

var _reactRedux = require('react-redux');

var _MapSelector = require('../../selectors/MapSelector');

var _MapSelector2 = _interopRequireDefault(_MapSelector);

var _index = require('../RoomItem/index.jsx');

var _index2 = _interopRequireDefault(_index);

var _bathhouseActions = require('../../actions/bathhouse-actions');

var _shallowEqualImmutable = require('../../utils/shallowEqualImmutable');

var _shallowEqualImmutable2 = _interopRequireDefault(_shallowEqualImmutable);

var _configs = require('../../../../common/data/configs.json');

var _configs2 = _interopRequireDefault(_configs);

require('./style.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import whyDidYouUpdateMixin from '../../utils/whyDidYouUpdateMixin';

var Ps = undefined;
var L = undefined;

if (__CLIENT__) {
  Ps = require('perfect-scrollbar'); // eslint-disable-line global-require
  L = require('mapbox.js'); // eslint-disable-line global-require
}

var map = {};
var layer = {};

/**
 * MapComponent - dumb component, work with mapbox&&leaflet.
 * Smart components - none
 * Dumb components - none
 * */

var MapComponent = function (_Component) {
  (0, _inherits3.default)(MapComponent, _Component);

  /**
   * constructor
   * @param {Object} props
   * @return {void}
   */

  function MapComponent(props) {
    (0, _classCallCheck3.default)(this, MapComponent);

    /**
     * @type {object}
     * @property {string} selectedRoomId - selected room id
     */

    var _this = (0, _possibleConstructorReturn3.default)(this, (MapComponent.__proto__ || (0, _getPrototypeOf2.default)(MapComponent)).call(this, props));

    _this.state = {
      selectedRoomId: null
    };

    //this.componentDidUpdate = __DEVELOPMENT__ && whyDidYouUpdateMixin.componentDidUpdate.bind(this);

    _this.handleCloseRoom = _this.handleCloseRoom.bind(_this);
    return _this;
  }

  /**
   * componentDidMount - init mapbox and markers, if mode is map
   * @return {void}
   * */

  (0, _createClass3.default)(MapComponent, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var _props = this.props;
      var bathhouses = _props.bathhouses;
      var rooms = _props.rooms;
      var city = _props.city;
      var isActive = _props.isActive;

      L.mapbox.accessToken = _configs2.default.mapboxAccessToken;

      map = L.mapbox.map('Map', 'mapbox.streets', {
        center: [city.getIn(['center', 'lng']), city.getIn(['center', 'lat'])],
        zoom: 14,
        zoomControl: isActive,
        dragging: isActive,
        scrollWheelZoom: isActive,
        attributionControl: false
      });

      new L.control.attribution().addAttribution('<a href="https://www.mapbox.com/">Mapbox</a> - We love it =)').addTo(map);

      layer = L.mapbox.featureLayer().addTo(map);

      isActive ? layer.setGeoJSON(this.getMarkers(bathhouses, rooms)) : layer.setGeoJSON([]);

      layer.on('click', this.handleClickMarker.bind(this));

      var roomsContainerElement = undefined;

      map.on('popupopen', function (event) {
        Ps.initialize(event.popup._container);
        roomsContainerElement = document.querySelector('.Map-popup-rooms');
        roomsContainerElement.addEventListener('click', _this2.handleShowRoom.bind(_this2, event.popup._source.feature.properties.rooms));
      });

      map.on('popupclose', function (event) {
        Ps.destroy(event.popup._container);
        roomsContainerElement.removeEventListener('click', _this2.handleShowRoom.bind(_this2, event.popup._source.feature.properties.rooms));
      });
    }

    /**
     * componentWillReceiveProps - if mode is map, then active control, zoom, touch for map.
     * close all active popups
     * @param {object} nextProps
     * @return {void}
     * */

  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      nextProps.isActive ? map.dragging.enable() : map.dragging.disable();
      nextProps.isActive ? map.scrollWheelZoom.enable() : map.scrollWheelZoom.disable();
      nextProps.isActive ? map.doubleClickZoom.enable() : map.doubleClickZoom.disable();
      nextProps.isActive ? map.touchZoom.enable() : map.touchZoom.disable();
      nextProps.isActive ? layer.setGeoJSON(this.getMarkers(nextProps.bathhouses, nextProps.rooms)) : layer.setGeoJSON([]);

      map.closePopup();
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
     * getMarkers - get markers for every bathhouse
     * @param {Object} bathhouses - list of bathhouses
     * @param {Object} rooms - list of valid rooms
     * @return {Array.<Object>} - list of geojson markers
     * */

  }, {
    key: 'getMarkers',
    value: function getMarkers(bathhouses, rooms) {
      var markers = bathhouses.map(function (bathhouse) {
        var marker = undefined;
        var bathhouseValidRooms = rooms.filter(function (room) {
          return room.get('bathhouseId') === bathhouse.get('id');
        });

        var lat = bathhouse.getIn(['location', 'lat']);
        var lng = bathhouse.getIn(['location', 'lng']);

        if (bathhouseValidRooms.size > 0) {
          marker = {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lat, lng]
            },
            properties: {
              'marker-color': '#18B2AE',
              'marker-symbol': bathhouseValidRooms.size,
              name: bathhouse.get('name'),
              address: bathhouse.get('address'),
              rooms: bathhouseValidRooms
            }
          };
        } else {
          marker = false;
        }
        return marker;
      });

      return (0, _lodash.compact)(markers.toJS());
    }

    /**
     * getPopupContent - get complete popup for selected marker
     * @param {Object} properties - properties of marker
     * @return {XML} content - popup content
     * */

  }, {
    key: 'getPopupContent',
    value: function getPopupContent(properties) {
      var roomItems = properties.rooms.map(function (room, index) {
        return _react2.default.createElement(
          'div',
          { className: 'Map-popup-room', key: index },
          _react2.default.createElement(
            'h3',
            { className: 'Map-popup-room-name' },
            room.get('name')
          ),
          _react2.default.createElement(
            'p',
            { className: 'Map-popup-room-info' },
            _react2.default.createElement(
              'span',
              null,
              'Цена от р/час'
            ),
            _react2.default.createElement('br', null),
            _react2.default.createElement(
              'span',
              null,
              'до человек'
            )
          ),
          _react2.default.createElement(
            'a',
            { className: 'Map-popup-room-button' },
            'Подробнее'
          )
        );
      });

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'h2',
          { className: 'Map-popup-bathhouse-name' },
          properties.name
        ),
        _react2.default.createElement(
          'p',
          null,
          properties.address
        ),
        _react2.default.createElement(
          'div',
          { className: 'Map-popup-rooms' },
          roomItems
        )
      );
    }

    /**
     * Show room box
     * @param {Array} rooms - list of rooms
     * @param {Object} event - synthetic event
     * @return {void}
     * */

  }, {
    key: 'handleShowRoom',
    value: function handleShowRoom(rooms, event) {
      if (event.target.nodeName !== 'A') return false;

      var childNodes = event.target.parentNode.parentNode.childNodes;
      var roomIndex = (0, _lodash.indexOf)(childNodes, event.target.parentNode);
      var room = rooms.getIn([roomIndex]);

      this.props.changeActiveRoom(room.get('id'));

      return this.setState({
        selectedRoomId: room.get('id')
      });
    }

    /**
     * handleClickMarker - build popup and open
     * @param {object} event - SytheticEvent
     * @return {void}
     * */

  }, {
    key: 'handleClickMarker',
    value: function handleClickMarker(event) {
      var marker = event.layer;
      var properties = marker.feature.properties;
      var popupContent = _server2.default.renderToStaticMarkup(this.getPopupContent(properties));

      marker.bindPopup(popupContent).openPopup();
    }

    /**
     * handle close room, clicked by close icon
     * @param {Object} event - event
     * @return {void}
     * */

  }, {
    key: 'handleCloseRoom',
    value: function handleCloseRoom(event) {
      event.preventDefault();

      this.props.changeActiveRoom(this.state.selectedRoomId);

      return this.setState({
        selectedRoomId: null
      });
    }

    /**
     * render
     * @return {XML} ReactElement
     */

  }, {
    key: 'render',
    value: function render() {
      var _this3 = this;

      var selectedRoomId = this.state.selectedRoomId;

      var roomItem = null;

      if (selectedRoomId && this.props.isActive) {
        (function () {
          var _props2 = _this3.props;
          var rooms = _props2.rooms;
          var bathhouses = _props2.bathhouses;
          var order = _props2.order;
          var steps = _props2.steps;

          var room = rooms.find(function (room) {
            return room.get('id') === selectedRoomId;
          });
          var bathhouse = bathhouses.find(function (bathhouse) {
            return bathhouse.get('id') === room.get('bathhouseId');
          });

          roomItem = _react2.default.createElement(_index2.default, {
            isOpen: true,
            isClosable: true,
            room: room,
            bathhouse: bathhouse,
            onCloseRoom: _this3.handleCloseRoom,
            order: order,
            steps: steps
          });
        })();
      }

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement('div', {
          className: 'Map',
          id: 'Map',
          style: {
            bottom: 0,
            position: 'fixed',
            top: 0,
            width: '100%',
            height: '100%'
          }
        }),
        _react2.default.createElement(
          'div',
          { style: { position: 'relative', maxWidth: '1024px', zIndex: 12 } },
          roomItem
        )
      );
    }
  }]);
  return MapComponent;
}(_react.Component);

/**
 * propTypes
 * @property {Object.<string, string|Object>} city - selected city
 * @property {string} activeRoomId - active room id
 * @property {Array.<Object>} bathhouses - list of bathhouses
 * @property {Array.<Object>} rooms - list of valid rooms
 * @property {Array.<Object>} schedules - list of schedules
 * @property {boolean} isActive - active map or not
 * @property {Object} order - selected order by user
 * @property {Object} steps - steps for order
 * @property {Function} changeActiveRoom - change active room id, if null then all rooms is closed
 */

MapComponent.propTypes = {
  city: _reactImmutableProptypes2.default.map.isRequired,
  activeRoomId: _react.PropTypes.string,
  bathhouses: _reactImmutableProptypes2.default.list.isRequired,
  rooms: _reactImmutableProptypes2.default.list.isRequired,
  schedules: _reactImmutableProptypes2.default.map,
  isActive: _react.PropTypes.bool.isRequired,
  order: _reactImmutableProptypes2.default.map,
  steps: _reactImmutableProptypes2.default.map,
  changeActiveRoom: _react.PropTypes.func.isRequired
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    changeActiveRoom: function changeActiveRoom(id) {
      return dispatch((0, _bathhouseActions.changeActiveRoom)(id));
    }
  };
}

exports.default = (0, _reactRedux.connect)(_MapSelector2.default, mapDispatchToProps)(MapComponent);

//# sourceMappingURL=index.js.map