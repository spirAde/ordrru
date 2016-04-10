import { fromJS, List } from 'immutable';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import classNames from 'classnames';

import moment from 'moment';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import ScheduleRowComponent from '../ScheduleRow/index.jsx';

import './style.css';

let Ps;

if (__CLIENT__) {
  Ps = require('perfect-scrollbar');
}

/**
 * SchedulePanelComponent - dumb component, schedule panel for current 30 days
 * Smart components - none
 * Dumb components - ScheduleRowComponent
 * */
class SchedulePanelComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      data: fromJS({
        orderedPeriods: {},
        startOrderedPeriod: null,
        endOrderedPeriod: null,
      }),
    };

    this.handleSelectOrder = this.handleSelectOrder.bind(this);
  }

  /**
   * Initialize scrollbar for panel
   * @return {void}
   * */
  componentDidMount() {
    Ps.initialize(this.refs.scroll, {
      wheelPropagation: true,
      suppressScrollX: true,
    });
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps) {
    return !shallowEqualImmutable(this.props, nextProps);
  }

  /**
   * componentWillUnmount - destroy scrollbar
   * @return {void}
   * */
  componentWillUnmount() {
    Ps.destroy(this.refs.scroll);
  }

  /**
   * handleSelectOrder - pass date and period of order to parent. And add ordered period to state
   * @param {String} date - selected date
   * @param {Number} period - selected period
   * @return {void}
   * */
  handleSelectOrder(date, period) {
    this.props.onSelectOrder(date, period);

    this.setState(({ data }) => ({
      data: data
        .set('startOrderedPeriod', data.get('startOrderedPeriod') || date)
        .set('endOrderedPeriod', data.get('startOrderedPeriod') ? date : null)
        .set('orderedPeriods', fromJS({ [date]: [period] })),
    }));
  }

  /**
   * render schedule rows for all retrieved dates
   * @param {Array.<Object>} schedules - schedules for room
   * @param {Array.<Object>} prices - prices by chunks
   * @return {Array.<Element>} - schedule rows element
   * */
  renderScheduleRows(schedule, prices) {
    const { data } = this.state;

    return schedule.map((row, index) => {
      const orderedCells = data.getIn(['orderedPeriods', row.get('date')]) || List();
      return (
        <ScheduleRowComponent
          cells={row.get('periods')}
          orderedCells={orderedCells}
          prices={prices.get(moment(row.get('date')).day())}
          date={row.get('date')}
          isLast={index === schedule.size - 1}
          key={row.get('id')}
          onSelectOrder={this.handleSelectOrder}
        />
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { schedule, prices, isOpen } = this.props;

    const rows = schedule ? this.renderScheduleRows(schedule, prices) : null;

    const classes = classNames({
      SchedulePanel: true,
      'SchedulePanel--active': isOpen,
    });

    return (
      <div className={classes}>
        <div className="SchedulePanel-wrapper">
          <div className="SchedulePanel-scroll" ref="scroll">
            {rows}
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} schedules - room schedules
 * @property {Boolean} needResetOrderedPeriods - if order was canceled, then reset ordered periods
 * @property {Array.<Object>} prices - prices for current day splitted by intervals
 * @property {boolean} isOpen - opened or not
 * @property {string} notifier - notify text, if order was cancel or reserve
 * @property {Function} onSelectOrder - select date and period of order
 * */
SchedulePanelComponent.propTypes = {
  schedule: ImmutablePropTypes.list,
  needResetOrderedPeriods: PropTypes.bool.isRequired,
  prices: ImmutablePropTypes.list,
  isOpen: PropTypes.bool.isRequired,
  notifier: PropTypes.string,
  onSelectOrder: PropTypes.func.isRequired,
};

export default SchedulePanelComponent;
