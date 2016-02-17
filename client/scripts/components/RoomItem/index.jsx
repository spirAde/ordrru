import { Map } from 'immutable';

import sample from 'lodash/sample';
import range from 'lodash/range';
import floor from 'lodash/floor';
import fill from 'lodash/fill';
import sortBy from 'lodash/sortBy';

import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Link } from 'react-router';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import SchedulePanelComponent from '../SchedulePanel/index.jsx';
import IconComponent from '../Icon/index.jsx';

import configs from '../../../../common/data/configs.json';

import './style.css';
import bathhouseImg from '../../../images/bathhouse.jpg';
import bathhouseImg1 from '../../../images/bathhouse1.jpg';
import bathhouseImg2 from '../../../images/bathhouse2.jpg';
import bathhouseImg3 from '../../../images/bathhouse3.jpg';
import bathhouseImg4 from '../../../images/bathhouse4.jpg';

/**
 * RoomItemComponent - dumb component, room box
 * Smart components - none
 * Dumb components - SchedulePanelComponent
 * */
class RoomItemComponent extends Component {

  /**
   * constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);

    /**
     * @type {object}
     * @property {Object} data
     * @property {boolean} data.scheduleIsOpen - opened or not schedule for room
     */
    this.state = {
      data: Map({
        scheduleIsOpen: false
      })
    };

    this.handleSelectOrder = this.handleSelectOrder.bind(this);
  }

  /**
   * componentWillReceiveProps - if activeRoomId was change, then close schedule for previous active room
   * @return {void}
   * */
  componentWillReceiveProps(nextProps) {
    if (this.props.isOpen && !nextProps.isOpen) {
      this.setState(({data}) => ({
        data: data.set('scheduleIsOpen', false)
      }));
    }
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }

  /**
   * get humanize view of selected order datetime
   * @param {string} id - room id
   * @param {Object} order - selected user order
   * @return {string} - humanize view of datetime
   * */
  getDatetimeValue(id, order) {
    let value = '';

    if (order.get('roomId') === id) {
      if (order.getIn(['date', 'startDate'])) {
        const startDate = order.getIn(['date', 'startDate']);
        const startPeriod = order.getIn(['date', 'startPeriod']);
        value += `${moment(startDate).format('Do MMMM')} ${configs.periods[startPeriod]} - `;
      }
      if (order.getIn(['date', 'endDate'])) {
        const endDate = order.getIn(['date', 'endDate']);
        const endPeriod = order.getIn(['date', 'endPeriod']);
        value += `${moment(endDate).format('Do MMMM')} ${configs.periods[endPeriod]}`;
      }
    }

    return value;
  }

  /**
   * handleOpenDescription - handle open|close room box.
   * @return {void}
   * */
  handleOpenDescription() {
    const { room } = this.props;
    this.props.onChangeActiveRoom(room.get('id'));
  }

  /**
   * handle open|close schedule for room
   * */
  handleOpenSchedule() {
    this.setState(({data}) => ({
      data: data.set('scheduleIsOpen', !data.get('scheduleIsOpen'))
    }));
  }

  /**
   * handle selected order
   * @param {Date} date - date of start or end of order
   * @param {number} period - period id
   * @return {void}
   * */
  handleSelectOrder(date, period) {
    const { room } = this.props;
    this.props.onSelectOrder(room.get('id'), date, period);
  }

  /**
   * render rating stars - full, half and empty stars
   * @param {number} rating - rating
   * @return {Array.<Element>}data
   * */
  renderStars(rating) {
    const fullStarsCount = floor(rating / 2);
    const halfStarsCount = rating - fullStarsCount * 2;
    const emptyStarsCount = 5 - fullStarsCount - halfStarsCount;

    const fullStars = fill(Array(fullStarsCount), 'icon-star-full');
    const halfStars = fill(Array(halfStarsCount), 'icon-star-half');
    const emptyStars = fill(Array(emptyStarsCount), 'icon-star-empty');

    return [...fullStars, ...halfStars, ...emptyStars].map((icon, index) => {
      return (
        <IconComponent name={icon} color="#F4740C" key={index} />
      );
    });
  }

  /**
   * renderOptions - render room options
   * @param {Array.<string>} options - list of options
   * @return {Array.<Element>} RoomItems - room boxes
   * */
  renderOptions(options) {
    return options.map((option, index) => {
      const optionClass = `RoomItem-service-type-${option}`;
      const classes = classNames({
        'RoomItem-service-type': true,
        'g-icons': true,
        [optionClass]: true
      });
      return (
        <div className={classes} key={index}>
          <IconComponent name={`icon-${option}`} rate={1.5} style={{ marginRight: '10px', marginBottom: '-5px' }} />
          <FormattedMessage id={`options.${option}`} />
        </div>
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { isOpen, room, bathhouse, schedule, isClosable, order } = this.props;
    const { formatMessage } = this.props.intl;

    const orderDatetimeValue = this.getDatetimeValue(room.get('id'), order);

    const { data } = this.state;

    const options = this.renderOptions(room.get('options').concat(bathhouse.get('options')));
    const stars = this.renderStars(room.get('rating'));

    const infoClasses = classNames({
      'RoomItem-info': true,
      'RoomItem-info--opened': isOpen
    });

    const typesClasses = sortBy(room.get('types').toJS()).join('-');

    return (
      <div className="RoomItem">
        <div className="RoomItem-inner">
          <div className="RoomItem-preview">
            <div className="RoomItem-preview-top g-clear">
              <h2 className={`RoomItem-name RoomItem-type-${typesClasses}`}>
                {room.get('name')}
              </h2>
              <div className="RoomItem-stars g-clear">
                {stars}
              </div>
              <div onClick={this.props.onCloseRoom}>
                {
                  isClosable ?
                    <IconComponent
                      name="icon-cancel"
                      rate={3}
                      style={{
                        margin: '-7px',
                        fillOpacity: '.5',
                        float: 'right'
                      }}
                    /> :
                    null
                }
              </div>
              <p className="RoomItem-bathhouse-address g-icons">
                <IconComponent
                  name="icon-location-point-mapbox"
                  color="#F4740C"
                  style={{ marginBottom: '-2px', marginRight: '5px' }}
                />
                <Link to={`/bathhouse/${bathhouse.get('id')}`} className="RoomItem-bathhouse-address-text">
                  {bathhouse.get('name')}
                </Link> {bathhouse.get('address')}
              </p>
            </div>
            <div className="RoomItem-preview-bottom g-clear">
              <div className="RoomItem-photos">
                <a className="RoomItem-photo">
                  <img width="234" height="140" src={bathhouseImg} />
                </a>
                <a className="RoomItem-photo">
                  <img width="234" height="140" src={bathhouseImg1} />
                </a>
                <a className="RoomItem-photo">
                  <img width="234" height="140" src={bathhouseImg3} />
                </a>
              </div>
              <div className="RoomItem-more-info">
                <a className="RoomItem-details-button" onClick={this.handleOpenDescription.bind(this)}>
                  <span className="RoomItem-details-price">
                    <FormattedMessage
                      id="priceFrom"
                      values={{
                        price: room.getIn(['price', 'min'])
                      }}
                    />
                  </span>
                  <span className="RoomItem-details-more">
                    {
                      isOpen ?
                        <FormattedMessage id="hide" /> :
                        <FormattedMessage id="more" />
                    }
                  </span>
                </a>
              </div>
            </div>
          </div>
          <div className={infoClasses}>
            <div className="RoomItem-descriptions-services g-clear">
              <div className="RoomItem-description">
                <p className="RoomItem-description-text">{room.get('description')}</p>
              </div>
              <div className="RoomItem-services g-clear">
                {options}
              </div>
            </div>
            <div className="RoomItem-booking">
              <div className="RoomItem-booking-inner">
                <div className="RoomItem-booking-step-1 g-clear">
                  <div className="RoomItem-booking-left-fields">
                    <div className="RoomItem-field-date-time g-field-date">
                      <input
                        className="RoomItem-field-date-time-input"
                        placeholder={formatMessage({ id: 'selectTime' })}
                        onClick={this.handleOpenSchedule.bind(this)}
                        value={orderDatetimeValue}
                      />
                    </div>
                    <div className="RoomItem-field-select-services g-field-select">
                      <div className="">
                        <p className="RoomItem-field-select-services-input">
                          <FormattedMessage id="additionalServicesIsEmpty" />
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="RoomItem-booking-right-fields g-clear">
                    <div className="RoomItem-select-guests">
                      <p className="RoomItem-select-guests-text">
                        <FormattedMessage id="guestCount" />
                      </p>
                      <div className="field field-select-people">
                      </div>
                    </div>
                    <div className="RoomItem-next-step">
                      <a className="RoomItem-next-step-button">
                        <span className="RoomItem-total-cost">0 руб</span>
                        <span className="RoomItem-order-text">
                          <FormattedMessage id="toOrder" />
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <SchedulePanelComponent
                schedule={schedule}
                prices={room.getIn(['price', 'chunks'])}
                isOpen={data.get('scheduleIsOpen')}
                onSelectOrder={this.handleSelectOrder}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {boolean} isOpen - box is opened or not
 * @property {Object} bathhouse - bathhouse data
 * @property {Object} room - room data
 * @property {Array} schedule - room schedule
 * @property {Object} order - selected user order
 * @property {boolean} isClosable - if closable, then room box has close icon in right-top angle
 * @property {Object} intl - intl shape
 * @property {Function} onChangeActiveRoom - change data about active room
 * @property {Function} onCloseRoom - close room by clicked on cancel icon
 * @property {Function} onSelectOrder - select date and period of order
 */
RoomItemComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  bathhouse: ImmutablePropTypes.map.isRequired,
  room: ImmutablePropTypes.map.isRequired,
  schedule: ImmutablePropTypes.list,
  order: ImmutablePropTypes.map,
  isClosable: PropTypes.bool,
  intl: intlShape.isRequired,
  onChangeActiveRoom: PropTypes.func.isRequired,
  onCloseRoom: PropTypes.func,
  onSelectOrder: PropTypes.func.isRequired
};

RoomItemComponent.defaultProps = {
  isClosable: false
};

export default injectIntl(RoomItemComponent);
