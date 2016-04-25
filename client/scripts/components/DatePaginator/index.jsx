import map from 'lodash/map';
import floor from 'lodash/floor';
import { Map } from 'immutable';

import moment from 'moment';

import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';

import classNames from 'classnames';

import IconComponent from '../Icon/index.jsx';

import './style.css';

/**
 * DatePaginatorComponent - dates pagination
 * Smart components - none
 * Dumb components - none
 * */
class DatePaginatorComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: Map({
        selectedDate: moment(props.date).format(props.selectedDateFormat),
      }),
    };
  }
  renderItems(dates) {
    const { selectedItemWidth, itemWidth } = this.props;

    return map(dates, (date, index) => {
      const classes = classNames({
        'DatePaginator-item': true,
        'DatePaginator-item--selected': date.isSelected,
        'DatePaginator-item--today': date.isToday,
        'DatePaginator-item--off': date.isOffDay,
        'DatePaginator-item--divider': date.isStartOfWeek,
        'DatePaginator-item--no-selected': !date.isValid,
      });

      const cellWidth = date.isSelected ? selectedItemWidth : itemWidth;

      return (
        <li className="DatePaginator-item-outer" key={index}>
          <a className={classes} style={{ width: `${cellWidth}px` }}>
            <span dangerouslySetInnerHTML={{ __html: date.text }} />
          </a>
        </li>
      );
    });
  }
  render() {
    const { data } = this.state;
    const { width } = this.props;

    return (
      <div className="DatePaginator" ref="datepaginator">
        <div className="DatePaginator-wrapper">
          <div className="DatePaginator-datepaginator">
            <ul className="DatePaginator-pagination">
              <li className="DatePaginator-item-outer">
                <IconComponent
                  className="DatePaginator-nav-item"
                  name="icon-chevron-left"
                  rate={2}
                />
              </li>
              <li className="DatePaginator-item-outer">
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
  /*constructor(props) {
    super(props);

    this.state = {
      dates: [],
    };
  }

  componentDidMount() {
    this.initializeDates();
  }

  initializeDates() {
    const {
      selectedDate, selectedItemWidth, itemWidth, navItemWidth, selectedDateFormat,
      selectedItemText, itemText, offDays, offDaysFormat, startOfWeek, startOfWeekFormat,
    } = this.props;

    const datepaginatorElement = ReactDOM.findDOMNode(this.refs.datepaginator);
    const viewWidth = datepaginatorElement.offsetWidth -
      ((selectedItemWidth - itemWidth) + (navItemWidth * 2));
    const units = floor(viewWidth / itemWidth);
    const unitsPerSide = parseInt(units / 2, 10);

    const adjustedItemWidth = floor(viewWidth / units);
    const adjustedSelectedItemWidth = floor(
      selectedItemWidth + (viewWidth - (units * adjustedItemWidth))
    );

    const today = moment().startOf('day');
    const start = moment().clone().startOf('day').subtract(unitsPerSide, 'days');
    const end = moment().clone().startOf('day').add(units - unitsPerSide, 'days');

    const startDate = moment();
    const endDate = moment().add(30, 'days');

    const data = {
      isSelectedStartDate: moment(selectedDate).isSame(startDate),
      isSelectedEndDate: moment(selectedDate).isSame(endDate),
      items: [],
    };

    for (let momentMark = start; momentMark.isBefore(end); momentMark.add(1, 'days')) {
      const valid = ((momentMark.isSame(startDate.format(selectedDateFormat)) ||
      momentMark.isAfter(startDate)) &&
      (momentMark.isSame(startDate.format(selectedDateFormat)) || momentMark.isBefore(endDate)));

      data.items[data.items.length] = {
        m: momentMark.clone().format(selectedDateFormat),
        isValid: valid,
        isSelected: momentMark.isSame(selectedDate),
        isToday: momentMark.isSame(today),
        isOffDay: (offDays.split(',').indexOf(momentMark.format(offDaysFormat)) !== -1),
        isStartOfWeek: (
          startOfWeek.split(',').indexOf(momentMark.format(startOfWeekFormat)) !== -1
        ),
        text: (momentMark.isSame(selectedDate)) ?
          momentMark.format(selectedItemText) : momentMark.format(itemText),
        itemWidth: (momentMark.isSame(selectedDate)) ?
          adjustedSelectedItemWidth : adjustedItemWidth,
      };
    }

    this.setState({
      dates: data,
    });
  }

  renderItems(dates) {
    const { selectedItemWidth, itemWidth } = this.props;

    return map(dates, (date, index) => {
      const classes = classNames({
        'DatePaginator-item': true,
        'DatePaginator-item--selected': date.isSelected,
        'DatePaginator-item--today': date.isToday,
        'DatePaginator-item--off': date.isOffDay,
        'DatePaginator-item--divider': date.isStartOfWeek,
        'DatePaginator-item--no-selected': !date.isValid,
      });

      const cellWidth = date.isSelected ? selectedItemWidth : itemWidth;

      return (
        <li className="DatePaginator-item-outer" key={index}>
          <a className={classes} style={{ width: `${cellWidth}px` }}>
            <span dangerouslySetInnerHTML={{ __html: date.text }} />
          </a>
        </li>
      );
    });
  }

  /!**
   * render
   * @return {XML} - React element
   * *!/
  render() {
    const { dates } = this.state;
    const renderedItems = this.renderItems(dates.items);

    return (
      <div className="DatePaginator" ref="datepaginator">
        <div className="DatePaginator-wrapper">
          <div className="DatePaginator-datepaginator">
            <ul className="DatePaginator-pagination">
              <li className="DatePaginator-item-outer">
                <IconComponent
                  className="DatePaginator-nav-item"
                  name="icon-chevron-left"
                  rate={2}
                />
              </li>
              {renderedItems}
              <li className="DatePaginator-item-outer">
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
  }*/
}

DatePaginatorComponent.defaultProps = {
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
  width: PropTypes.number.isRequired,

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
