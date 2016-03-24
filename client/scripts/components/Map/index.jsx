import { Map } from 'immutable';

import compact from 'lodash/compact';
import indexOf from 'lodash/indexOf';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom/server';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { MapSelector } from '../../selectors/MapSelector';

import RoomItemComponent from '../RoomItem/index.jsx';

import { changeActiveRoom } from '../../actions/bathhouse-actions';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import configs from '../../../../common/data/configs.json';

import './style.css';

let Ps;

if (__CLIENT__) {
  Ps = require('perfect-scrollbar');
}

let map = {};
let layer = {};

/**
 * MapComponent - dumb component, work with mapbox&&leaflet.
 * Smart components - none
 * Dumb components - none
 * */
class MapComponent extends Component {

  /**
   * constructor
   * @param {Object} props
   * @return {void}
   */
  constructor(props) {
    super(props);

    /**
     * @type {object}
     * @property {object} data
     * @property {string} data.selectedRoomId - selected room id
     */
    this.state = {
      data: Map({ selectedRoomId: null }),
    };
  }

  /**
   * componentDidMount - init mapbox and markers, if mode is map
   * @return {void}
   * */
  componentDidMount() {
    const { bathhouses, rooms, city, isActive } = this.props;

    L.mapbox.accessToken = configs.mapboxAccessToken;

    map = L.mapbox.map('Map', 'mapbox.streets', {
      center: [city.getIn(['center', 'lng']), city.getIn(['center', 'lat'])],
      zoom: 14,
      zoomControl: isActive,
      dragging: isActive,
      scrollWheelZoom: isActive,
      attributionControl: false,
    });

    new L.control.attribution().addAttribution('<a href="https://www.mapbox.com/">Mapbox</a> - We love it =)').addTo(map);

    layer = L.mapbox.featureLayer().addTo(map);

    isActive ? layer.setGeoJSON(this.getMarkers(bathhouses, rooms)) : layer.setGeoJSON([]);

    layer.on('click', this.handleClickMarker.bind(this));

    let roomsContainerElement;

    map.on('popupopen', (event) => {
      Ps.initialize(event.popup._container);
      roomsContainerElement = document.querySelector('.Map-popup-rooms');
      roomsContainerElement.addEventListener(
        'click',
        this.handleShowRoom.bind(this, event.popup._source.feature.properties.rooms)
      );
    });

    map.on('popupclose', (event) => {
      Ps.destroy(event.popup._container);
      roomsContainerElement.removeEventListener(
        'click',
        this.handleShowRoom.bind(this, event.popup._source.feature.properties.rooms)
      );
    });
  }

  /**
   * componentWillReceiveProps - if mode is map, then active control, zoom, touch for map.
   * close all active popups
   * @param {object} nextProps
   * @return {void}
   * */
  componentWillReceiveProps(nextProps) {
    nextProps.isActive ? map.dragging.enable() : map.dragging.disable();
    nextProps.isActive ? map.scrollWheelZoom.enable() : map.scrollWheelZoom.disable();
    nextProps.isActive ? map.doubleClickZoom.enable() : map.doubleClickZoom.disable();
    nextProps.isActive ? map.touchZoom.enable() : map.touchZoom.disable();
    nextProps.isActive ? layer.setGeoJSON(this.getMarkers(nextProps.bathhouses, nextProps.rooms))
      : layer.setGeoJSON([]);

    map.closePopup();
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  /**
   * getMarkers - get markers for every bathhouse
   * @param {Object} bathhouses - list of bathhouses
   * @param {Object} rooms - list of valid rooms
   * @return {Array.<Object>} - list of geojson markers
   * */
  getMarkers(bathhouses, rooms) {
    const markers = bathhouses.map(bathhouse => {
      let marker;
      const bathhouseValidRooms = rooms.filter(
        room => room.get('bathhouseId') === bathhouse.get('id')
      );

      const lat = bathhouse.getIn(['location', 'lat']);
      const lng = bathhouse.getIn(['location', 'lng']);

      if (bathhouseValidRooms.size > 0) {
        marker = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lat, lng],
          },
          properties: {
            'marker-color': '#18B2AE',
            'marker-symbol': bathhouseValidRooms.size,
            name: bathhouse.get('name'),
            address: bathhouse.get('address'),
            rooms: bathhouseValidRooms,
          },
        };
      } else {
        marker = false;
      }
      return marker;
    });

    return compact(markers.toJS());
  }

  /**
   * getPopupContent - get complete popup for selected marker
   * @param {Object} properties - properties of marker
   * @return {XML} content - popup content
   * */
  getPopupContent(properties) {
    const roomItems = properties.rooms.map((room, index) =>
      (
        <div className="Map-popup-room" key={index}>
          <h3 className="Map-popup-room-name">{room.get('name')}</h3>
          <p className="Map-popup-room-info">
            <span>Цена от р/час</span><br />
            <span>до человек</span>
          </p>
          <a className="Map-popup-room-button">
            Подробнее
          </a>
        </div>
      )
    );

    return (
      <div>
        <h2 className="Map-popup-bathhouse-name">{properties.name}</h2>
        <p>{properties.address}</p>
        <div className="Map-popup-rooms">
          {roomItems}
        </div>
      </div>
    );
  }

  /**
   * Show room box
   * @param {Array} rooms - list of rooms
   * @param {Object} event - synthetic event
   * @return {void}
   * */
  handleShowRoom(rooms, event) {
    if (event.target.nodeName !== 'A') return false;

    const childNodes = event.target.parentNode.parentNode.childNodes;
    const roomIndex = indexOf(childNodes, event.target.parentNode);
    const room = rooms.getIn([roomIndex]);

    this.props.changeActiveRoom(room.get('id'));

    return this.setState(({ data }) => ({
      data: data.set('selectedRoomId', room.get('id')),
    }));
  }

  /**
   * handleClickMarker - build popup and open
   * @param {object} event - SytheticEvent
   * @return {void}
   * */
  handleClickMarker(event) {
    const marker = event.layer;
    const properties = marker.feature.properties;
    const popupContent = ReactDOM.renderToStaticMarkup(this.getPopupContent(properties));

    marker.bindPopup(popupContent).openPopup();
  }

  /**
   * handle close room, clicked by close icon
   * @param {Object} event - event
   * @return {void}
   * */
  handleCloseRoom(event) {
    event.preventDefault();

    this.props.changeActiveRoom(this.state.data.get('selectedRoomId'));

    this.setState(({ data }) => ({
      data: data.set('selectedRoomId', null),
    }));
  }

  /**
   * render
   * @return {XML} ReactElement
   */
  render() {
    let roomItem = null;

    if (this.state.data.get('selectedRoomId') && this.props.isActive) {
      const { rooms, bathhouses, order, steps } = this.props;
      const room = rooms.find(room => room.get('id') === this.state.data.get('selectedRoomId'));
      const bathhouse = bathhouses.find(
        bathhouse => bathhouse.get('id') === room.get('bathhouseId')
      );

      roomItem = (
        <RoomItemComponent
          isOpen={true}
          isClosable={true}
          room={room}
          bathhouse={bathhouse}
          onCloseRoom={::this.handleCloseRoom}
          order={order}
          steps={steps}
        />
      );
    }

    return (
      <div>
        <div className="Map" id="Map"></div>
        <div style={{ position: 'relative', maxWidth: '1024px', zIndex: 12 }}>
          {roomItem}
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} bathhouses - list of bathhouses
 * @property {Array.<Object>} rooms - list of valid rooms
 * @property {Object.<string, string|Object>} city - selected city
 * @property {boolean} isActive - active map or not
 * @property {Function} changeActiveRoom - change active room id, if null then all rooms is closed
 */
MapComponent.propTypes = {
  city: ImmutablePropTypes.map.isRequire,
  activeRoomId: PropTypes.string,
  bathhouses: ImmutablePropTypes.list.isRequired,
  rooms: ImmutablePropTypes.list.isRequired,
  schedules: ImmutablePropTypes.map,
  isActive: PropTypes.bool.isRequired,
  order: ImmutablePropTypes.map,
  steps: ImmutablePropTypes.map,
  changeActiveRoom: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    changeActiveRoom: (id) => dispatch(changeActiveRoom(id)),
  };
}

export default connect(MapSelector, mapDispatchToProps)(MapComponent);
