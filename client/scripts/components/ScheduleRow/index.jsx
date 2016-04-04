import { Map } from 'immutable';

import { isNull } from 'lodash';

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

    /**
     * @type {object}
     * @property {Object} data
     * @property {Object|null} data.shownInterval - shown price interval, when user mouse over cell
     */
    this.state = {
      data: Map({ shownInterval: null }),
    };
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
   * @param {number} period - period id
   * @param {Object} event - SyntheticEvent
   * */
  handleClickCell(date, period, event) {
    event.preventDefault();

    const data = this.props.cells.find(cell => cell.get('period') === period);

    if (!data.get('enable') || data.getIn(['status', 'isForceDisable'])) return false;

    return this.props.onSelectOrder(date, period);
  }

  /**
   * handle if user leave mouse cursor beyond, than set shownInterval to null
   * @param {Object} event - SyntheticEvent
   * */
  handleMouseLeaveScheduleRow(event) {
    event.preventDefault();
    this.setState(({ data }) => ({
      data: data.set('shownInterval', null),
    }));
  }

  /**
   * handle if user mouse over cursor to cell, than set shownInterval current price interval
   * @param {number} period - selected period
   * @param {Object} event - SyntheticEvent
   * */
  handleMouseOverCell(period, event) {
    event.preventDefault();

    const { prices } = this.props;
    const interval = prices.find(
      chunk => chunk.get('startPeriod') <= period && period <= chunk.get('endPeriod')
    );

    this.setState(({ data }) => ({
      data: data.set('shownInterval', Map({
        start: configs.periods[interval.get('startPeriod')],
        end: configs.periods[interval.get('endPeriod')],
        price: interval.get('price'),
      })),
    }));
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
        'ScheduleRow-cell--free': cell.get('enable') && !cell.getIn(['status', 'isForceDisable']),
        'ScheduleRow-cell--busy': !cell.get('enable') || cell.getIn(['status', 'isForceDisable']),
      });
      const cellTime = configs.periods[cell.get('period')];

      return (
        <div
          className={classes}
          key={index}
          onClick={this.handleClickCell.bind(this, date, cell.get('period'))}
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
    const { cells, date, isLast } = this.props;

    const { data } = this.state;
    const renderCells = this.renderCells(date, cells);

    const classes = classNames({
      ScheduleRow: true,
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
              !isNull(data.get('shownInterval')) ?
                <FormattedMessage
                  id="priceOfInterval"
                  values={{
                    start: data.getIn(['shownInterval', 'start']),
                    end: data.getIn(['shownInterval', 'end']),
                    price: data.getIn(['shownInterval', 'price']),
                  }}
                /> : null
            }
          </div>
        </div>
        <div
          className="ScheduleRow-cells g-clear"
          onMouseLeave={::this.handleMouseLeaveScheduleRow}
        >
          {renderCells}
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {Array.<Object>} cells - cells of schedule for dates
 * @property {Array.<Object>} prices - prices for current day splitted by intervals
 * @property {string} date - date
 * @property {boolean} isLast - last row or not
 * @property {Function} onSelectOrder - select date and period of order
 * */
ScheduleRowComponent.propTypes = {
  cells: ImmutablePropTypes.list.isRequired,
  prices: ImmutablePropTypes.list.isRequired,
  date: PropTypes.string.isRequired,
  isLast: PropTypes.bool.isRequired,
  onSelectOrder: PropTypes.func.isRequired,
};

export default ScheduleRowComponent;
