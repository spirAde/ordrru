import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import classNames from 'classnames';

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
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * Initialize scrollbar for panel
   * @return {void}
   * */
  componentDidMount() {
    Ps.initialize(this.refs.scroll, {
      wheelPropagation: true,
      suppressScrollX: true
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
   * @return {Array.<Element>} - schedule rows element
   * */
  renderScheduleRows(schedule) {
    return schedule.map((day, index) => {
      return (
        <ScheduleRowComponent
          cells={day.get('periods')}
          date={day.get('date')}
          key={index}
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
    const { schedule, isOpen } = this.props;
    const rows = schedule ? this.renderScheduleRows(schedule) : null;

    const classes = classNames({
      'SchedulePanel': true,
      'SchedulePanel--active': isOpen
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
 * @property {boolean} isOpen - opened or not
 * @property {Function} onSelectOrder - select date and period of order
 * */
SchedulePanelComponent.propTypes = {
  schedule: ImmutablePropTypes.list,
  isOpen: PropTypes.bool.isRequired,
  onSelectOrder: PropTypes.func.isRequired
};

export default SchedulePanelComponent;
