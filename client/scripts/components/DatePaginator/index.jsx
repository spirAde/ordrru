import map from 'lodash/map';
import floor from 'lodash/floor';

import moment from 'moment';

import React, { Component, PropTypes } from 'react';

import classNames from 'classnames';

import { MOMENT_FORMAT } from '../../../../common/utils/date-helper';

import shallowEqual from '../../utils/shallowEqual';

import IconComponent from '../Icon/index.jsx';

import './style.css';

/**
 * DatePaginatorComponent - dates pagination
 * Smart components - none
 * Dumb components - none
 * */
class DatePaginatorComponent extends Component {
  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState);
  }

  getDates() {
    const { date } = this.props;
    const { width, selectedItemWidth, itemWidth, navItemWidth,
      selectedDateFormat, selectedItemText, itemText, offDays, startOfWeek,
      offDaysFormat, startOfWeekFormat } = this.props;

    const itemsCount = floor((width - selectedItemWidth - 2 * navItemWidth) / itemWidth);
    const sideRangeDateValue = floor(itemsCount / 2);

    const start = moment(date).subtract(sideRangeDateValue, 'days');
    const end = moment(date).add(sideRangeDateValue, 'days');

    const today = moment();

    const dates = [];

    for (let momentMark = start; momentMark.isBefore(end); momentMark.add(1, 'days')) {
      dates[dates.length] = {
        m: momentMark.clone().format(selectedDateFormat),
        isSelected: momentMark.isSame(date),
        isToday: momentMark.isSame(today),
        isOffDay: offDays.split(',').indexOf(momentMark.format(offDaysFormat)) !== -1,
        isStartOfWeek:
          startOfWeek.split(',').indexOf(momentMark.format(startOfWeekFormat)) !== -1,
        text: momentMark.isSame(date) ?
          momentMark.format(selectedItemText) : momentMark.format(itemText),
        formatted: momentMark.format(MOMENT_FORMAT),
      };
    }

    return dates;
  }
  handleClickDate(date, event) {
    event.preventDefault();

    this.props.onSelectDate(date);
  }
  handleClickNavigation(direction, event) {
    event.preventDefault();

    const { selectedDate } = this.state;

    const newDate = direction === 'left' ?
        moment(selectedDate).subtract(1, 'days').format(MOMENT_FORMAT) :
        moment(selectedDate).add(1, 'days').format(MOMENT_FORMAT);

    this.props.onSelectDate(newDate);
  }
  renderDates(dates) {
    const { selectedItemWidth, itemWidth } = this.props;

    return map(dates, (date, index) => {
      const classes = classNames({
        'DatePaginator-item': true,
        'DatePaginator-item--selected': date.isSelected,
        'DatePaginator-item--today': date.isToday,
        'DatePaginator-item--off': date.isOffDay,
        'DatePaginator-item--divider': date.isStartOfWeek,
      });

      const cellWidth = date.isSelected ? selectedItemWidth : itemWidth;

      return (
        <li
          className="DatePaginator-item-outer"
          onClick={this.handleClickDate.bind(this, date.formatted)}
          key={index}
        >
          <a className={classes} style={{ width: `${cellWidth}px` }}>
            <span dangerouslySetInnerHTML={{ __html: date.text }} />
          </a>
        </li>
      );
    });
  }
  render() {
    const dates = this.getDates();
    const renderedDates = this.renderDates(dates);

    return (
      <div className="DatePaginator" ref="datepaginator">
        <div className="DatePaginator-wrapper">
          <div className="DatePaginator-datepaginator">
            <ul className="DatePaginator-pagination">
              <li
                className="DatePaginator-item-outer"
                onClick={this.handleClickNavigation.bind(this, 'left')}
              >
                <IconComponent
                  className="DatePaginator-nav-item"
                  name="icon-chevron-left"
                  rate={2}
                />
              </li>
              {renderedDates}
              <li
                className="DatePaginator-item-outer"
                onClick={this.handleClickNavigation.bind(this, 'right')}
              >
                <IconComponent
                  className="DatePaginator-nav-item"
                  name="icon-chevron-right"
                  rate={2}
                />
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

DatePaginatorComponent.defaultProps = {
  width: 0,

  format: 'Do MMM',

  selectedDate: moment().clone().startOf('day'),
  selectedDateFormat: 'YYYY-MM-DD',
  selectedItemWidth: 140,
  selectedItemText: 'dddd<br/>Do, MMMM YYYY',

  itemDateFormat: 'Do MMM',
  itemWidth: 75,
  itemText: 'ddd<br/>Do',

  navItemWidth: 20,

  offDays: 'сб,вс',
  offDaysFormat: 'ddd',

  startOfWeek: 'пн',
  startOfWeekFormat: 'ddd',
};

/**
 * propTypes
 */
DatePaginatorComponent.propTypes = {
  date: PropTypes.string.isRequired,
  width: PropTypes.number,
  onSelectDate: PropTypes.func.isRequired,

  format: PropTypes.string,

  selectedDateFormat: PropTypes.string,
  selectedItemWidth: PropTypes.number,
  selectedItemText: PropTypes.string,

  itemDateFormat: PropTypes.string,
  itemWidth: PropTypes.number,
  itemText: PropTypes.string,

  navItemWidth: PropTypes.number,

  offDays: PropTypes.string,
  offDaysFormat: PropTypes.string,

  startOfWeek: PropTypes.string,
  startOfWeekFormat: PropTypes.string,
};

export default DatePaginatorComponent;
