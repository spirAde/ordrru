import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, FormattedDate } from 'react-intl';
import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import configs from '../../../../common/data/configs.json';

import './style.css';

/**
 * ScheduleRowComponent - dumb component, panel of periods for day
 * Smart components - none
 * Dumb components - none
 * */
class ScheduleRowComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps) {
    return !shallowEqualImmutable(this.props, nextProps);
  }

  /**
   * handle click on cell
   * @param {number} period - period id
   * @param {Object} event - SyntheticEvent
   * */
  handleClickCell(date, period, event) {
    event.preventDefault();
    this.props.onSelectOrder(date, period);
  }

  /**
   * render cells
   * @param {Date} date - date of row
   * @param {Array.<Object>} cells - cells
   * @return {Array.<Element>} rendered cells
   * */
  renderCells(date, cells) {
    return cells.map((cell, index) => {
      const classes = classNames({
        'ScheduleRow-cell': true,
        'ScheduleRow-cell--odd': index % 2 === 1,
        'ScheduleRow-cell--disabled': !cell.get('enable')
      });
      const cellTime = configs.periods[cell.get('periodId')];

      return (
        <div className={classes} key={index} onClick={this.handleClickCell.bind(this, date, cell.get('periodId'))}>
          {cellTime}
        </div>
      );
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { cells, date } = this.props;
    const renderCells = this.renderCells(date, cells);

    return (
      <div className="ScheduleRow">
        <div className="ScheduleRow-info g-clear">
          <div className="ScheduleRow-date">
            <FormattedDate
              value={date}
              day="numeric"
              month="long"
              year="numeric"
            />
          </div>
          <div className="ScheduleRow-types">
            <div className="ScheduleRow-type ScheduleRow-type--ordered">
              <FormattedMessage id="ordered-time" />
            </div>
            <div className="ScheduleRow-type ScheduleRow-type--free">
              <FormattedMessage id="free-time" />
            </div>
            <div className="ScheduleRow-type ScheduleRow-type--selected">
              <FormattedMessage id="selected-time" />
            </div>
          </div>
        </div>
        <div className="ScheduleRow-cells g-clear">
          {renderCells}
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} cells - cells of schedule for dates
 * @property {string} date - date
 * @property {Function} onSelectOrder - select date and period of order
 * */
ScheduleRowComponent.propTypes = {
  cells: ImmutablePropTypes.list.isRequired,
  date: PropTypes.string.isRequired,
  onSelectOrder: PropTypes.func.isRequired
};

export default ScheduleRowComponent;
