import { Map } from 'immutable';

import { floor, fill, sortBy } from 'lodash';

import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import SchedulePanelComponent from '../SchedulePanel/index.jsx';
import IconComponent from '../Icon/index.jsx';
import TooltipComponent from '../Tooltip/index.jsx';
import LoaderComponent from '../Loader/index.jsx';
import OrderComponent from '../Order/index.jsx';

import configs from '../../../../common/data/configs.json';

import './style.css';

import bathhouseImg from '../../../images/bathhouse.jpg';
import bathhouseImg1 from '../../../images/bathhouse1.jpg';
import bathhouseImg3 from '../../../images/bathhouse3.jpg';

/**
 * RoomItemComponent - dumb component, room box
 * Smart components - none
 * Dumb components - SchedulePanelComponent, OrderComponent, IconComponent, LoaderComponent
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
    // TODO: remove immutable, set just plain
    this.state = {
      data: Map({
        scheduleIsOpen: false,
        needResetOrderedPeriods: false,
        tooltipIsActive: false,
      }),
    };

    this.handleSelectOrder = this.handleSelectOrder.bind(this);
    this.handleOpenDescription = this.handleOpenDescription.bind(this);
    this.handleOpenSchedule = this.handleOpenSchedule.bind(this);
    this.handleClickCheckOrder = this.handleClickCheckOrder.bind(this);
    this.handleResetDatetimeOrder = this.handleResetDatetimeOrder.bind(this);
    this.handleResetOrderedPeriods = this.handleResetOrderedPeriods.bind(this);
    this.handleMouseOverTooltip = this.handleMouseOverTooltip.bind(this);
    this.handleMouseLeaveTooltip = this.handleMouseLeaveTooltip.bind(this);
  }

  /**
   * componentWillReceiveProps - if activeRoomId was change,
   * then close schedule for previous active room, and reset ordered periods
   * @return {void}
   * */
  componentWillReceiveProps(nextProps) {
    const { isOpen } = this.props;
    if (isOpen && !nextProps.isOpen) {
      this.setState(({ data }) => ({
        data: data
          .set('scheduleIsOpen', false)
          .set('needResetOrderedPeriods', true),
      }));
    }
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
   * get humanize view of selected order datetime
   * @param {string} id - room id
   * @param {Object} order - selected user order
   * @return {string} - humanize view of datetime
   * */
  // TODO: check if user click on last period for date, then need change date
  // TODO: and period to next date and first period
  getDatetimeValue(id, order) {
    let value = '';

    if (order.get('roomId') === id) {
      if (order.getIn(['datetime', 'startDate'])) {
        const startDate = order.getIn(['datetime', 'startDate']);
        const startPeriod = order.getIn(['datetime', 'startPeriod']);
        value += `${moment(startDate).format('Do MMMM')} ${configs.periods[startPeriod]} — `;
      }
      if (order.getIn(['datetime', 'endDate'])) {
        const endDate = order.getIn(['datetime', 'endDate']);
        const endPeriod = order.getIn(['datetime', 'endPeriod']);
        value += `${moment(endDate).format('Do MMMM')} ${configs.periods[endPeriod]}`;
      }
    }

    return value;
  }

  /**
   * handleClickCheckOrder - handle check order click
   * @return {void}
   * */
  handleClickCheckOrder(event) {
    event.preventDefault();

    const { order } = this.props;

    if (!order.getIn(['sums', 'datetime'])) return false;

    return this.props.onCheckOrder();
  }

  /**
   * handle mouse over on question mark and open tooltip(development only)
   * */
  handleMouseOverTooltip(event) {
    event.preventDefault();

    this.setState(({ data }) => ({
      data: data.set('tooltipIsActive', true),
    }));
  }

  /**
   * handle mouse leave on question mark and open tooltip(development only)
   * */
  handleMouseLeaveTooltip(event) {
    event.preventDefault();

    this.setState(({ data }) => ({
      data: data.set('tooltipIsActive', false),
    }));
  }

  /**
   * handleOpenDescription - handle open|close room box.
   * @return {void}
   * */
  handleOpenDescription() {
    const { room, isOpen } = this.props;
    this.props.onChangeActiveRoom(isOpen ? undefined : room.get('id'));
  }

  /**
   * handle open|close schedule for room
   * */
  handleOpenSchedule(event) {
    event.preventDefault();

    this.setState(({ data }) => ({
      data: data.set('scheduleIsOpen', !data.get('scheduleIsOpen')),
    }));
  }

  /**
   * handle click on cancel datetime order and reset ordered periods in child
   * */
  handleResetDatetimeOrder(event) {
    event.preventDefault();

    this.props.onResetDatetimeOrder();

    this.setState(({ data }) => ({
      data: data.set('needResetOrderedPeriods', true),
    }));
  }

  /**
   * handle that child was reset the ordered periods
   * */
  handleResetOrderedPeriods() {
    this.setState(({ data }) => ({
      data: data.set('needResetOrderedPeriods', false),
    }));
  }

  /**
   * handle selected order
   * @param {Date} date - date of start or end of order
   * @param {number} period - period id
   * @return {void}
   * */
  handleSelectOrder(date, period) {
    const { room, order } = this.props;

    if (order.getIn(['datetime', 'startDate'])) {
      this.setState(({ data }) => ({
        data: data.set('scheduleIsOpen', false),
      }));
    }

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

    return [...fullStars, ...halfStars, ...emptyStars].map((icon, index) => (
      <IconComponent name={icon} color="#F4740C" key={index} />
    ));
  }

  /**
   * renderOptions - render room options
   * @param {Array.<string>} options - list of options
   * @return {Array.<Element>} RoomItems - room boxes
   * */
  renderOptions(options) {
    return options.map((option, index) => {
      const optionClass = `RoomItem-service-type-${option}`;
      const classes = classNames('RoomItem-service-type', 'g-icons', optionClass);

      return (
        <div className={classes} key={index}>
          <span className="RoomItem-option">
            <IconComponent
              name={`icon-${option}`}
              rate={1.5}
            />
          </span>
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
    const { isOpen, room, bathhouse, schedule, isClosable, order, steps } = this.props;

    const { data } = this.state;

    const bathhouseUrl = `/bathhouse/${bathhouse.get('id')}`;

    const orderDatetimeValue = this.getDatetimeValue(room.get('id'), order);
    const orderSum = order && order.size ?
      order.getIn(['sums', 'datetime']) + order.getIn(['sums', 'services']) : 0;

    const options = this.renderOptions(room.get('options').concat(bathhouse.get('options')));
    const stars = this.renderStars(room.get('rating'));

    const infoClasses = classNames('RoomItem-info', {
      'RoomItem-info--opened': isOpen,
    });

    const typesClasses = sortBy(room.get('types').toJS()).join('-');

    const isOrder = steps.getIn(['confirm', 'active']) && steps.getIn(['choice', 'valid']) &&
        order.get('roomId') === room.get('id');

    return (
      <div className="RoomItem">
        <div className="RoomItem-inner">
          <div className="RoomItem-preview">
            <div className="RoomItem-preview-top g-clear">
              <h2 className={`RoomItem-name RoomItem-type-${typesClasses}`} >
                {room.get('name')}
              </h2>
              {
                __DEVELOPMENT__ ?
                  <div style={{ float: 'left' }}>
                    <IconComponent
                      className="RoomItem-icon-devtool-question"
                      id={room.get('id')}
                      name="icon-question"
                      rate={1.5}
                      onMouseOver={this.handleMouseOverTooltip}
                      onMouseLeave={this.handleMouseLeaveTooltip}
                    />
                    {
                      data.get('tooltipIsActive') ?
                        <TooltipComponent>
                          <div>ID room: {room.get('id')}</div>
                          <div>ID bathhouse: {room.get('bathhouseId')}</div>
                          <div>
                            Minimal order duration: {room.getIn(['settings', 'minOrderDuration'])}
                          </div>
                        </TooltipComponent> : null
                    }
                  </div> : null
              }
              <div className="RoomItem-stars g-clear">
                {stars}
              </div>
              <div onClick={this.props.onCloseRoom}>
                {
                  isClosable ?
                    <IconComponent
                      className="RoomItem-icon-cancel"
                      name="icon-cancel"
                      rate={2}
                    /> :
                    null
                }
              </div>
              <p className="RoomItem-bathhouse-address g-icons">
                <IconComponent
                  className="RoomItem-icon-location-point-mapbox"
                  name="icon-location-point-mapbox"
                  color="#F4740C"
                />
                <Link
                  target="_blank"
                  to={{ pathname: bathhouseUrl }}
                  className="RoomItem-bathhouse-address-text"
                >
                  {bathhouse.get('name')}
                </Link> {bathhouse.get('address')}
              </p>
            </div>
            <div className="RoomItem-preview-bottom g-clear">
              <div className="RoomItem-photos">
                <a className="RoomItem-photo">
                  <img width="234" height="140" alt="" src={bathhouseImg} />
                </a>
                <a className="RoomItem-photo">
                  <img width="234" height="140" alt="" src={bathhouseImg1} />
                </a>
                <a className="RoomItem-photo">
                  <img width="234" height="140" alt="" src={bathhouseImg3} />
                </a>
              </div>
              <div className="RoomItem-more-info">
                <a className="RoomItem-details-button" onClick={this.handleOpenDescription}>
                  <span className="RoomItem-details-price">
                    <FormattedMessage
                      id="priceFrom"
                      values={{
                        price: room.getIn(['price', 'min']),
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
            {
              isOrder ?
                <OrderComponent
                  order={order}
                  steps={steps}
                  prepayment={room.getIn(['settings', 'prepayment'])}
                  onSendOrder={this.props.onSendOrder}
                /> :
                <div className="RoomItem-booking">
                  <div className="RoomItem-booking-inner">
                    <div className="RoomItem-booking-step-1 g-clear">
                      <div className="RoomItem-booking-left-fields">
                        <div className="RoomItem-field-date-time g-field-date">
                          <input
                            type="text"
                            className="RoomItem-field-date-time-input"
                            value={orderDatetimeValue}
                            onClick={this.handleOpenSchedule}
                          />
                          {
                            order.getIn(['datetime', 'startDate']) ?
                              <span onClick={this.handleResetDatetimeOrder}>
                                <IconComponent
                                  className="RoomItem-datetime-icon-cancel"
                                  name="icon-cancel"
                                  rate={1.5}
                                  color="#5A6B74"
                                />
                              </span> : null
                          }
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
                          <a
                            className="RoomItem-next-step-button"
                            onClick={this.handleClickCheckOrder}
                          >
                            {
                              steps.getIn(['choice', 'loading']) ?
                                <LoaderComponent /> :
                                <div>
                                  <span className="RoomItem-total-cost">{orderSum} руб</span>
                                  <span className="RoomItem-order-text">
                                    <FormattedMessage id="toOrder" />
                                  </span>
                                </div>
                            }
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <SchedulePanelComponent
                    key={`schedule-${room.get('id')}`}
                    schedule={schedule}
                    prices={room.getIn(['price', 'chunks'])}
                    order={order}
                    isOpen={data.get('scheduleIsOpen')}
                    needResetOrderedPeriods={data.get('needResetOrderedPeriods')}
                    onSelectOrder={this.handleSelectOrder}
                    onResetOrderedPeriods={this.handleResetOrderedPeriods}
                  />
                </div>
            }
          </div>
        </div>
      </div>
    );
  }
}

RoomItemComponent.contextTypes = {
  intl: PropTypes.object.isRequired,
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
  isOpen: PropTypes.bool.isRequired,
  bathhouse: ImmutablePropTypes.map.isRequired,
  room: ImmutablePropTypes.map.isRequired,
  schedule: ImmutablePropTypes.list,
  order: ImmutablePropTypes.map,
  steps: ImmutablePropTypes.map,
  isClosable: PropTypes.bool.isRequired,
  onChangeActiveRoom: PropTypes.func,
  onCloseRoom: PropTypes.func,
  onSelectOrder: PropTypes.func,
  onCheckOrder: PropTypes.func,
  onSendOrder: PropTypes.func,
  onResetDatetimeOrder: PropTypes.func,
};

RoomItemComponent.defaultProps = {
  isClosable: false,
};

export default RoomItemComponent;
