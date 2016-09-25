import { isNull, indexOf } from 'lodash';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, FormattedDate } from 'react-intl';

import classNames from 'classnames';

import { LAST_PERIOD, STEP } from '../../../../common/utils/schedule-helper';

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

    /**
     * @type {object}
     * @property {Object|null} shownInterval - shown price interval, when user mouse over cell
     */
    this.state = {
      shownInterval: null,
    };

    this.handleClickCell = this.handleClickCell.bind(this);
    this.handleMouseLeaveScheduleRow = this.handleMouseLeaveScheduleRow.bind(this);
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
   * handle click on cell, if period is disable or has status lock, that skip clicking
   * @param {Object} event - SyntheticEvent
   * */
  handleClickCell(event) {
    event.preventDefault();

    const { date, cells } = this.props;

    const parentNode = event.target.parentNode;
    const cellIndex = indexOf(parentNode.childNodes, event.target);
    const period = cells.get(cellIndex);

    if (!period.get('enable') || period.getIn(['status', 'isForceDisable'])) return false;

    return this.props.onSelectOrder(date, period.get('period'));
  }

  /**
   * handle if user leave mouse cursor beyond, than set shownInterval to null
   * @param {Object} event - SyntheticEvent
   * */
  handleMouseLeaveScheduleRow(event) {
    event.preventDefault();

    this.setState({
      shownInterval: null,
    });
  }

  /**
   * handle if user mouse over cursor to cell, than set shownInterval current price interval
   * @param {Object} event - SyntheticEvent
   * */
  handleMouseOverCell(period, event) {
    event.preventDefault();

    const { prices, date, orderIsStarted } = this.props;

    const fixedPeriod = !orderIsStarted && period !== LAST_PERIOD ?
      period + STEP : period;

    const interval = prices.find(
      chunk => chunk.get('startPeriod') <= fixedPeriod && fixedPeriod <= chunk.get('endPeriod')
    );

    this.setState({
      shownInterval: {
        start: configs.periods[interval.get('startPeriod')],
        end: configs.periods[interval.get('endPeriod')],
        price: interval.get('price'),
      },
    });

    this.props.onMouseOverCell(date, period);
  }

  /**
   * render cells
   * @param {Date} date - date of row
   * @param {Array.<Object>} cells - cells
   * @return {Array.<Element>} rendered cells
   * */
  renderCells(date, cells, orderedCells) {
    return cells.map((cell, index) => {
      const cellIsFree = cell.get('enable') && !cell.getIn(['status', 'isForceDisable']) &&
        !orderedCells.includes(cell.get('period'));
      const cellIsBusy = !cell.get('enable') || cell.getIn(['status', 'isForceDisable']);
      const cellIsOrdered = orderedCells.includes(cell.get('period'));

      const classes = classNames('ScheduleRow-cell', {
        'ScheduleRow-cell--odd': index % 2 === 1,
        'ScheduleRow-cell--free': cellIsFree,
        'ScheduleRow-cell--busy': cellIsBusy,
        'ScheduleRow-cell--ordered': cellIsOrdered,
      });

      const cellTime = configs.periods[cell.get('period')];

      return (
        <div
          className={classes}
          key={index}
          onClick={this.handleClickCell}
          onMouseOver={this.handleMouseOverCell.bind(this, cell.get('period'))}
        >
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
    const { cells, orderedCells, date, isLast } = this.props;

    const { shownInterval } = this.state;
    const renderedCells = this.renderCells(date, cells, orderedCells);

    const classes = classNames('ScheduleRow', {
      'ScheduleRow--last': isLast,
    });

    return (
      <div className={classes}>
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
          <div className="ScheduleRow-price-interval">
            {
              !isNull(shownInterval) ?
                <FormattedMessage
                  id="priceOfInterval"
                  values={{
                    start: shownInterval.start,
                    end: shownInterval.end,
                    price: shownInterval.price,
                  }}
                /> : null
            }
          </div>
        </div>
        <div
          className="ScheduleRow-cells g-clear"
          onMouseLeave={this.handleMouseLeaveScheduleRow}
        >
          {renderedCells}
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} cells - cells of schedule for dates
 * @property {Array.<Object>} orderedCells - ordered cells in current date
 * @property {Boolean} orderIsStarted - if user select start date and period
 * @property {Array.<Object>} prices - prices for current day splitted by intervals
 * @property {string} date - date
 * @property {boolean} isLast - last row or not
 * @property {Function} onSelectOrder - select date and period of order
 * @property {Function} onMouseOverCell - pass to parent date and period mouseover cell
 * */
ScheduleRowComponent.propTypes = {
  cells: ImmutablePropTypes.list.isRequired,
  orderedCells: ImmutablePropTypes.list.isRequired,
  orderIsStarted: PropTypes.bool.isRequired,
  prices: ImmutablePropTypes.list.isRequired,
  date: PropTypes.string.isRequired,
  isLast: PropTypes.bool.isRequired,
  onSelectOrder: PropTypes.func.isRequired,
  onMouseOverCell: PropTypes.func.isRequired,
};

export default ScheduleRowComponent;
