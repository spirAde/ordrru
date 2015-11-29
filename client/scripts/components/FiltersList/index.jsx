import { Map } from 'immutable';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import { resetRoomsByTag, updateRoomsByOptions, updateRoomsByDistance, updateRoomsByTypes, updateRoomsByPrepayment,
  updateRoomsByGuest, updateRoomsByPrice, updateRoomsBySearchName, updateRoomsByDateTime,
  updateRoomsBySorting } from '../../actions/bathhouse-actions';

import FilterDateTimeComponent from '../FilterDateTime/index.jsx';
import FilterDistanceComponent from '../FilterDistance/index.jsx';
import FilterGuestsComponent from '../FilterGuests/index.jsx';
import FilterOptionsComponent from '../FilterOptions/index.jsx';
import FilterPrepaymentComponent from '../FilterPrepayment/index.jsx';
import FilterPriceComponent from '../FilterPrice/index.jsx';
import FilterSearchNameComponent from '../FilterSearchName/index.jsx';
import FilterTypesComponent from '../FilterTypes/index.jsx';
import FilterSortingComponent from '../FilterSorting/index.jsx';

import IconComponent from '../Icon/index.jsx';

import './style.css';

let Ps;

let defaultBoxOffset = 0;

if (__CLIENT__) {
  Ps = require('perfect-scrollbar');
}

/**
 * FiltersListComponent - dumb component, list of different filter components
 * Smart components - none
 * Dumb components - FilterDateTimeComponent, FilterDistanceComponent, FilterGuestsComponent, FilterOptionsComponent,
 *                   FilterPrepaymentComponent, FilterPriceComponent, FilterNameComponent, FilterTypesComponent
 * */
class FiltersListComponent extends Component {

  /**
   * constructor
   * @param {Object} props
   * @return {void}
   */
  constructor(props) {
    super(props);

    /**
     * @type {Object}
     * @property {Object} data
     * @property {boolean} data.isSticked - check if box is sticked
     * @property {boolean} data.topIsOpen - check if upper box of filters is open
     * @property {boolean} data.bottomIsOpen - check if lower box of filters is open
     * @property {Object} data.resets - pack of needResetSmth
     */
    this.state = {
      data: Map({
        isSticked: false,
        topIsOpen: true,
        bottomIsOpen: false
      })
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.handleDateTimeFilter = this.handleDateTimeFilter.bind(this);
    this.handleDistanceFilter = this.handleDistanceFilter.bind(this);
    this.handleGuestsFilter = this.handleGuestsFilter.bind(this);
    this.handleTypesFilter = this.handleTypesFilter.bind(this);
    this.handleSearchNameFilter = this.handleSearchNameFilter.bind(this);
    this.handleOptionsFilter = this.handleOptionsFilter.bind(this);
    this.handlePrepaymentFilter = this.handlePrepaymentFilter.bind(this);
    this.handlePriceFilter = this.handlePriceFilter.bind(this);
    this.handleSortingFilter = this.handleSortingFilter.bind(this);
    this.handleClickResetTag = this.handleClickResetTag.bind(this);
  }

  /**
   * componentDidMount - add listeners, determine box offset
   * @return {void}
   * */
  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll, false);
    defaultBoxOffset = this.refs.box.offsetTop;
    this.handleScroll();
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) || !shallowEqualImmutable(this.state, nextState);
  }

  /**
   * componentWillUnmount - remove listeners
   * @return {void}
   * */
  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll, false);
  }

  /**
   * handleScroll - handle scroll, and check if need to attach box
   * @return {void}
   * */
  handleScroll() {
    const isSticked = defaultBoxOffset < window.pageYOffset;

    this.setState(({ data }) => ({
      data: data.set('isSticked', isSticked)
    }));
  }

  /**
   * handleOpenFullFilters - handle open full filters
   * @return {void}
   * */
  handleOpenFullFilters() {
    Ps.initialize(this.refs.scroll, {
      suppressScrollX: true
    });
    this.setState(({ data }) => ({
      data: data.set('topIsOpen', true).set('bottomIsOpen', true)
    }));
  }

  /**
   * handleShowOffers - handle show offers
   * @return {void}
   * */
  handleShowOffers() {
    Ps.destroy(this.refs.scroll);
    this.setState(({ data }) => ({
      data: data.set('bottomIsOpen', false)
    }));
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
  handleDateTimeFilter(values) {
    this.props.updateRoomsByDateTime(values);
  }

  /**
   * handle changes in distance filter
   * @param {number} value - distance from center
   * @return {void}
   */
  handleDistanceFilter(value) {
    this.props.updateRoomsByDistance(value);
  }

  /**
   * handle changes in guests filter
   * @param {number} value - guests count
   * @return {void}
   */
  handleGuestsFilter(value) {
    this.props.updateRoomsByGuest(value);
  }

  /**
   * handle changes in types filter
   * @param {Object.<string, string|boolean>} value - type of filter
   * @return {void}
   */
  handleTypesFilter(value) {
    this.props.updateRoomsByTypes(value);
  }

  /**
   * handle changes in search name filter
   * @param {string} value - searched text
   * @return {void}
   */
  handleSearchNameFilter(value) {
    this.props.updateRoomsBySearchName(value);
  }

  /**
   * handle change in options filter
   * @param {Object.<string, string|boolean>} value - option
   * @return {void}
   */
  handleOptionsFilter(value) {
    this.props.updateRoomsByOptions(value);
  }

  /**
   * handle changes in prepayment filter
   * @param {Object.<string, boolean|null>} value - true | false = yes | no, and null is whatever
   * @return {void}
   */
  handlePrepaymentFilter(value) {
    this.props.updateRoomsByPrepayment(value);
  }

  /**
   * handle changes in price filter
   * @param {Object.<string, number>} values - price interval
   * @return {void}
   */
  handlePriceFilter(values) {
    this.props.updateRoomsByPrice(values);
  }

  /**
   * handle changes sorting type or direction
   * @param {Object.<string, string|boolean>} value - value of type and direction
   * @return {void}
   * */
  handleSortingFilter(value) {
    this.props.updateRoomsBySorting(value);
  }

  /**
   * handleClickResetTag - handle reset tag
   * @return {void}
   * */
  handleClickResetTag(tag) {
    this.props.resetRoomsByTag(tag);
  }

  /**
   * renderTags - render tags
   * @return {Array.<Element>} - tag elements
   * */
  renderTags(tags) {
    return tags.map((tag, index) => {
      return (
        <a className="FiltersList-tags-anchor" key={index} onClick={this.handleClickResetTag.bind(this, tag)}>
          <FormattedMessage id={`tags.${tag}`} />
          <IconComponent name="icon-cancel" rate={2} style={{ margin: '-5px -30px', float: 'right' }} />
        </a>
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { offersCount, tags, filters } = this.props;
    const { data } = this.state;

    const tagsItems = this.renderTags(tags);

    const fullFiltersClasses = classNames({
      'FiltersList': true,
      'FiltersList--opened': data.get('topIsOpen') && data.get('bottomIsOpen')
    });

    const topFiltersClasses = classNames({
      'FiltersList-top': true,
      'FiltersList-top--opened': data.get('topIsOpen')
    });

    const bottomFiltersClasses = classNames({
      'FiltersList-bottom': true,
      'FiltersList-bottom--opened': data.get('bottomIsOpen')
    });

    const optionsClasses = classNames({
      'FiltersList-options': true,
      'FiltersList-options--opened': !data.get('bottomIsOpen'),
      'FiltersList-options--sticked': data.get('isSticked'),
      'g-clear': true
    });

    const showContentClasses = classNames({
      'FiltersList-show-content': true,
      'FiltersList-show-content--opened': data.get('topIsOpen') && data.get('bottomIsOpen')
    });

    return (
      <div className={fullFiltersClasses}>
        <div className="FiltersList-wrapper" ref="scroll">
          <div className={topFiltersClasses}>
            <FilterDateTimeComponent
              values={filters.get('datetime')}
              onSelect={this.handleDateTimeFilter}
            />
            <FilterOptionsComponent
              values={filters.get('options')}
              onSelect={this.handleOptionsFilter}
            />
            <FilterTypesComponent
              values={filters.get('types')}
              onSelect={this.handleTypesFilter}
            />
            <FilterPrepaymentComponent
              values={filters.get('prepayment')}
              onSelect={this.handlePrepaymentFilter}
            />
            <FilterSortingComponent
              values={filters.get('sorting')}
              onSelect={this.handleSortingFilter}
            />
          </div>
          <div className={bottomFiltersClasses}>
            <FilterDistanceComponent
              values={filters.get('distance')}
              onSelect={this.handleDistanceFilter}
            />
            <FilterPriceComponent
              values={filters.get('price')}
              onSelect={this.handlePriceFilter}
            />
            <FilterGuestsComponent
              values={filters.get('guest')}
              onSelect={this.handleGuestsFilter}
            />
            <FilterSearchNameComponent
              value={filters.get('searchName')}
              onSelect={this.handleSearchNameFilter}
            />
          </div>
        </div>
        <div className={optionsClasses} ref="box">
          <div className="FiltersList-more">
            <a className="FiltersList-more-anchor" onClick={this.handleOpenFullFilters.bind(this)}>
              {
                data.get('isSticked') ?
                  <FormattedMessage id="showFilters" /> :
                  <FormattedMessage id="moreFilters" />
              }
            </a>
          </div>
          <div className="FiltersList-tags">
            {tagsItems}
          </div>
          <div className="FiltersList-total-offers">
            <FormattedMessage
              id="offersCount"
              values={{
                offersCount: offersCount
              }}
            />
          </div>
        </div>
        <div className={showContentClasses}>
          <a className="FiltersList-show-offers-anchor" onClick={this.handleShowOffers.bind(this)}>
            <FormattedMessage id="showOffers" />
          </a>
        </div>
      </div>
    );
  }
}

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
 */
FiltersListComponent.propTypes = {
  offersCount: PropTypes.number.isRequired,
  tags: ImmutablePropTypes.list.isRequired,
  filters: ImmutablePropTypes.shape({
    datetime: ImmutablePropTypes.map.isRequired,
    distance: ImmutablePropTypes.map.isRequired,
    guest: ImmutablePropTypes.map.isRequired,
    options: ImmutablePropTypes.list.isRequired,
    prepayment: ImmutablePropTypes.list.isRequired,
    price: ImmutablePropTypes.map.isRequired,
    types: ImmutablePropTypes.list.isRequired
  }),
  updateRoomsByDateTime: PropTypes.func.isRequired,
  updateRoomsByDistance: PropTypes.func.isRequired,
  updateRoomsByGuest: PropTypes.func.isRequired,
  updateRoomsByTypes: PropTypes.func.isRequired,
  updateRoomsBySearchName: PropTypes.func.isRequired,
  updateRoomsByOptions: PropTypes.func.isRequired,
  updateRoomsByPrepayment: PropTypes.func.isRequired,
  updateRoomsByPrice: PropTypes.func.isRequired,
  updateRoomsBySorting: PropTypes.func.isRequired,
  resetRoomsByTag: PropTypes.func.isRequired
};

/**
 * pass state to props
 * @param {Object} state - current redux state
 * @return {Object.<string, string|number|Array|Object>} props - list of params
 * */
function mapStateToProps(state) {
  return {
    tags: state.filter.get('tags'),
    offersCount: state.bathhouse.get('valid').size,
    filters: state.filter.get('filters')
  };
}

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    updateRoomsByDateTime: (values) => dispatch(updateRoomsByDateTime(values)),
    updateRoomsByDistance: (value) => dispatch(updateRoomsByDistance(value)),
    updateRoomsByGuest: (value) => dispatch(updateRoomsByGuest(value)),
    updateRoomsByTypes: (value) => dispatch(updateRoomsByTypes(value)),
    updateRoomsBySearchName: (value) => dispatch(updateRoomsBySearchName(value)),
    updateRoomsByOptions: (value) => dispatch(updateRoomsByOptions(value)),
    updateRoomsByPrepayment: (value) => dispatch(updateRoomsByPrepayment(value)),
    updateRoomsByPrice: (values) => dispatch(updateRoomsByPrice(values)),
    updateRoomsBySorting: (value) => dispatch(updateRoomsBySorting(value)),
    resetRoomsByTag: (tag) => dispatch(resetRoomsByTag(tag))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FiltersListComponent);
