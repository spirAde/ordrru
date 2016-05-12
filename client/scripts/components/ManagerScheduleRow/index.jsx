import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import classNames from 'classnames';

import { List, Map, fromJS } from 'immutable';
import range from 'lodash/range';

import { FIRST_PERIOD, LAST_PERIOD, STEP } from '../../../../common/utils/schedule-helper';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import configs from '../../../../common/data/configs.json';

import './style.css';

function recursiveEnumerationCells(cells, orderPeriods, results) {
  if (!cells.size) return results;

  const firstCell = cells.first();

  const order = orderPeriods.find(order => order.get('startPeriod') === firstCell.get('period'));

  if (order) {
    const orderLength = order.get('periods').size;

    return recursiveEnumerationCells(
      cells.skip(orderLength), orderPeriods.skip(1), results.push(Map({
        length: orderLength,
        orderId: order.get('orderId'),
        text: `${order.get('startTime')} — ${order.get('endTime')}`,
        createdByUser: order.get('createdByUser'),
        isOneDayOrder: order.get('isOneDayOrder'),
      }))
    );
  }

  const cellTime = configs.periods[firstCell.get('period')];

  return recursiveEnumerationCells(
    cells.skip(1), orderPeriods, results.push(Map({
      length: 1,
      text: cellTime,
      enable: firstCell.get('enable'),
    }))
  );
}

class ManagerScheduleRowComponent extends Component {
  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  renderTimeLineRow() {
    const { cells, cellWidth, cellMargin } = this.props;

    const width = cellWidth + cellMargin;

    return cells.skipLast(1).map((cell, index) => {
      const isEven = index % 2 === 0;
      const time = isEven ? configs.periods[cell.get('period')] : null;

      const classes = classNames({
        'ManagerScheduleRow-time-item': true,
        'ManagerScheduleRow-time-item--left': isEven,
        'ManagerScheduleRow-time-item--right': !isEven,
      });

      const styles = {
        width,
        marginLeft: isEven ? 0 : -1, // because border left has 1px width
      };

      return (
        <div
          className={classes}
          style={styles}
          key={index}
        >
          <div className="ManagerScheduleRow-time-item-text">
            {time}
          </div>
        </div>
      );
    });
  }

  renderRow() {
    const { cells, cellWidth, cellMargin, orders } = this.props;

    if (!orders.size) {
      // take without last period, because for manager schedule not need period with time 24:00
      return cells.skipLast(1).map((cell, index) => {
        const cellTime = configs.periods[cell.get('period')];

        const classes = classNames({
          'ManagerScheduleRow-cell': true,
          'ManagerScheduleRow-cell--available': cell.has('enable') && cell.get('enable'),
          'ManagerScheduleRow-cell--disabled': cell.has('enable') && !cell.get('enable'),
        });

        return (
          <div
            className={classes}
            style={{
              width: cellWidth,
              marginRight: cellMargin,
            }}
            key={index}
          >
            &nbsp;
          </div>
        );
      });
    }

    const orderPeriods = orders.map(order => {
      const startPeriod = order.getIn(['datetime', 'startPeriod']);
      const endPeriod = order.getIn(['datetime', 'endPeriod']);

      console.log(startPeriod);

      const fixStartPeriod = startPeriod === FIRST_PERIOD ? FIRST_PERIOD : startPeriod + STEP;
      const fixEndPeriod = endPeriod === LAST_PERIOD ? LAST_PERIOD : endPeriod - STEP;

      return fromJS({
        startPeriod: startPeriod,
        endPeriod: fixEndPeriod,
        startTime: configs.periods[startPeriod],
        endTime: configs.periods[endPeriod],
        orderId: order.get('id'),
        periods: range(startPeriod, endPeriod, STEP),
        createdByUser: order.get('createdByUser'),
        isOneDayOrder: order.get('isOneDayOrder'),
      });
    });

    // take without last period, because for manager schedule not need period with time 24:00
    return recursiveEnumerationCells(cells.skipLast(1), orderPeriods, List()).map((data, index) => {
      const classes = classNames({
        'ManagerScheduleRow-cell': true,
        'ManagerScheduleRow-cell--available': data.has('enable') && data.get('enable'),
        'ManagerScheduleRow-cell--disabled': data.has('enable') && !data.get('enable'),
        'ManagerScheduleRow-cell--manager': data.has('createdByUser') && !data.get('createdByUser'),
        'ManagerScheduleRow-cell--user': data.has('createdByUser') && data.get('createdByUser'),
      });

      const width = data.get('length') === 1 ?
          cellWidth : data.get('length') * (cellWidth + cellMargin) - cellMargin;

      if (data.has('orderId')) console.log(data.toJS());

      return (
        <div
          className={classes}
          style={{
            width: data.get('length') === 1 ?
              cellWidth : data.get('length') * (cellWidth + cellMargin) - cellMargin,
            marginRight: cellMargin,
          }}
          key={index}
        >
          &nbsp;
        </div>
      );
    });
  }

  render() {
    const { isFirst, isLast } = this.props;

    const renderedRow = this.renderRow();
    const renderedRowTimeline = this.renderTimeLineRow();

    const timelineRowClasses = classNames({
      'ManagerScheduleRow-timeline-row': true,
      'ManagerScheduleRow-timeline-row--first': isFirst,
      'ManagerScheduleRow-timeline-row--last': isLast,
    });

    const scheduleRowClasses = classNames({
      'ManagerScheduleRow-schedule-row': true,
      'ManagerScheduleRow-schedule-row--first': isFirst,
      'ManagerScheduleRow-schedule-row--last': isLast,
    });

    return (
      <div className="ManagerScheduleRow">
        <div className={timelineRowClasses}>
          {renderedRowTimeline}
        </div>
        <div className={scheduleRowClasses}>
          {renderedRow}
        </div>
      </div>
    );
  }
}

ManagerScheduleRowComponent.defaultProps = {
  cellWidth: 60,
  cellMargin: 10,

  isFirst: false,
  isLast: false,
};

ManagerScheduleRowComponent.propTypes = {
  date: PropTypes.string.isRequired,
  orders: ImmutablePropTypes.list.isRequired,
  cells: ImmutablePropTypes.list.isRequired,

  cellWidth: PropTypes.number,
  cellMargin: PropTypes.number,

  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
};

export default ManagerScheduleRowComponent;
