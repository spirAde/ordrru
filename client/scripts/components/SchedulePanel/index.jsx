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
   * render schedule rows for all retrieved dates
   * @param {Array.<Object>} schedules - schedules for room
   * @param {Array.<Object>} prices - prices by chunks
   * @return {Array.<Element>} - schedule rows element
   * */
  renderScheduleRows(schedule, prices) {
    return schedule.map((row, index) => {
      return (
        <ScheduleRowComponent
          cells={row.get('periods')}
          prices={prices.get(moment(row.get('date')).day())}
          date={row.get('date')}
          isLast={index === schedule.size - 1}
          key={row.get('id')}
          onSelectOrder={this.props.onSelectOrder}
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
 * @property {string} notifier - notify text, if order was cancel or reserve
 * @property {Function} onSelectOrder - select date and period of order
 * */
SchedulePanelComponent.propTypes = {
  schedule: ImmutablePropTypes.list,
  prices: ImmutablePropTypes.list,
  isOpen: PropTypes.bool.isRequired,
  notifier: PropTypes.string,
  onSelectOrder: PropTypes.func.isRequired,
};

export default SchedulePanelComponent;
