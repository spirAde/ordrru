import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import classNames from 'classnames';

import { List, Map } from 'immutable';

import { STEP } from '../../../../common/utils/schedule-helper';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import configs from '../../../../common/data/configs.json';

import './style.css';

function recursiveEnumerationCells(cells, orders, results) {
  if (!cells.size) return results;

  const currentCell = cells.first();
  const order = orders.find(
    order => order.getIn(['datetime', 'startPeriod']) === currentCell.get('period')
  );

  if (order) {
    const startPeriod = order.getIn(['datetime', 'startPeriod']);
    const endPeriod = order.getIn(['datetime', 'endPeriod']);

    const orderLength = (endPeriod - startPeriod) / STEP;

    return recursiveEnumerationCells(cells.skip(orderLength), orders.skip(1), results.push(Map({
      isOneDayOrder: order.get('isOneDayOrder'),
      length: orderLength,
      orderId: order.get('id'),
      createdByUser: order.get('createdByUser'),
    })));
  }

  return recursiveEnumerationCells(cells.skip(1), orders, results.push(Map({
    length: 1,
    enable: currentCell.get('enable'),
  })));
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

    return recursiveEnumerationCells(cells.skipLast(1), orders, List()).map((cell, index) => {
      const classes = classNames({
        'ManagerScheduleRow-cell': true,
        'ManagerScheduleRow-cell--available': cell.has('enable') && cell.get('enable'),
        'ManagerScheduleRow-cell--disabled': cell.has('enable') && !cell.get('enable'),
        'ManagerScheduleRow-cell--manager': cell.has('createdByUser') && !cell.get('createdByUser'),
        'ManagerScheduleRow-cell--user': cell.has('createdByUser') && cell.get('createdByUser'),
      });

      const isOrder = cell.has('orderId');

      let width = 0;
      let marginRight = 0;

      if (!isOrder) {
        width = cellWidth;
        marginRight = cellMargin;
      } else {
        const isOneDayOrder = cell.get('isOneDayOrder');
        const cellLength = cell.get('length');

        if (isOneDayOrder) {
          width = cellLength * (cellWidth + cellMargin) - cellMargin;
          marginRight = cellMargin;
        } else if (!isOneDayOrder) {
          const isRightOrderPart = index === 0;

          width = isRightOrderPart ?
            cellLength * (cellWidth + cellMargin) - cellMargin :
            cellLength * (cellWidth + cellMargin);

          marginRight = isRightOrderPart ? cellMargin : 0;
        }
      }

      return (
        <div
          className={classes}
          style={{ width, marginRight }}
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
