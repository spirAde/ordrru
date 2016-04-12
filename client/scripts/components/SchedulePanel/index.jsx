import { fromJS, List, Map } from 'immutable';
import { range } from 'lodash';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import classNames from 'classnames';

import moment from 'moment';

import { STEP, FIRST_PERIOD, LAST_PERIOD } from '../../../../common/utils/schedule-helper';

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
        startOrderedDatePeriod: {},
        orderedPeriods: {},
        endOrderedDatePeriod: {},
      }),
    };

    this.handleSelectOrder = this.handleSelectOrder.bind(this);
    this.handleMouseOverCell = this.handleMouseOverCell.bind(this);
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
   * componentWillReceiveProps
   * check if need to reset ordered periods
   * @return {void}
   * */
  componentWillReceiveProps(nextProps) {
    if (nextProps.needResetOrderedPeriods) this.resetOrderedPeriods();
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
   * componentWillUnmount - destroy scrollbar
   * @return {void}
   * */
  componentWillUnmount() {
    Ps.destroy(this.refs.scroll);
  }

  /**
   * handle mouse over cell from rows. Paint ordered periods.
   * Skip if order wasn't begin. Skip if order complete.
   * If the mouse cursor is over a busy or unavailable periods, then restore the original state
   * @param {String} date - date of schedule row to which the period
   * @param {Number} period - selected period
   * @return {void}
   * */
  handleMouseOverCell(date, period) {
    const { data } = this.state;
    const { schedule } = this.props;

    const orderIsComplete = data.get('startOrderedDatePeriod').size &&
      data.get('endOrderedDatePeriod').size;

    if (!data.get('startOrderedDatePeriod').size || orderIsComplete) return false;

    const selectedRow = schedule.find(row => moment(row.get('date')).isSame(date));
    const selectedPeriod = selectedRow.getIn(['periods', period / STEP]);

    const startDate = data.getIn(['startOrderedDatePeriod', 'date']);
    const startPeriod = data.getIn(['startOrderedDatePeriod', 'period']);

    if (!selectedPeriod.get('enable') || selectedPeriod.getIn(['status', 'isForceDisable'])) {
      this.setState(({ data }) => ({
        data: data.set('orderedPeriods', fromJS({ [startDate]: [startPeriod] })),
      }));

      return false;
    }

    let newRangeOrderedPeriods = {};

    if (moment(startDate).isSame(date)) {
      if (startPeriod < period) {
        newRangeOrderedPeriods = { [date]: range(startPeriod, period + STEP, STEP) };
      } else {
        newRangeOrderedPeriods = { [date]: range(period, startPeriod + STEP, STEP) };
      }
    } else if (moment(startDate).isBefore(date)) {
      const startDatePeriodsRange = range(startPeriod, LAST_PERIOD + STEP, STEP);
      const newDatePeriodsRange = range(FIRST_PERIOD, period + STEP, STEP);

      newRangeOrderedPeriods = {
        [startDate]: startDatePeriodsRange,
        [date]: newDatePeriodsRange,
      };
    } else {
      const startDatePeriodsRange = range(FIRST_PERIOD, startPeriod + STEP, STEP);
      const newDatePeriodsRange = range(period, LAST_PERIOD + STEP, STEP);

      newRangeOrderedPeriods = {
        [startDate]: startDatePeriodsRange,
        [date]: newDatePeriodsRange,
      };
    }

    return this.setState(({ data }) => ({
      data: data.set('orderedPeriods', fromJS(newRangeOrderedPeriods)),
    }));
  }

  /**
   * handleSelectOrder - pass date and period of order to parent. And add ordered period to state
   * @param {String} date - selected date
   * @param {Number} period - selected period
   * @return {void}
   * */
  handleSelectOrder(date, period) {
    const { data } = this.state;

    this.props.onSelectOrder(date, period);

    const orderedPeriods = data.get('orderedPeriods');

    const newOrderedPeriods = orderedPeriods.has(date) ?
      orderedPeriods.update(date, periods => periods.push(period)) :
      orderedPeriods.merge(fromJS({ [date]: [period] }));

    const newStateData = fromJS({
      startOrderedDatePeriod: data.get('startOrderedDatePeriod').size ?
        data.get('startOrderedDatePeriod') : Map({ date, period }),
      orderedPeriods: newOrderedPeriods,
      endOrderedDatePeriod: data.get('startOrderedDatePeriod').size ? Map({ date, period }) : Map(),
    });

    this.setState({
      data: newStateData,
    });
  }

  /**
   * reset all state for ordered periods
   * @return {void}
   * */
  resetOrderedPeriods() {
    const newStateData = fromJS({
      startOrderedDatePeriod: {},
      orderedPeriods: {},
      endOrderedDatePeriod: {},
    });

    this.setState({
      data: newStateData,
    });

    this.props.onResetOrderedPeriods();
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
          onMouseOverCell={this.handleMouseOverCell}
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
 * @property {Array.<Object>} prices - prices for current day splitted by intervals
 * @property {boolean} isOpen - opened or not
 * @property {Function} onSelectOrder - select date and period of order
 * @property {Function} onResetOrderedPeriods - schedule send parent event, that periods were reset
 * */
SchedulePanelComponent.propTypes = {
  schedule: ImmutablePropTypes.list,
  prices: ImmutablePropTypes.list,
  isOpen: PropTypes.bool.isRequired,
  onSelectOrder: PropTypes.func.isRequired,
  onResetOrderedPeriods: PropTypes.func.isRequired,
};

export default SchedulePanelComponent;
