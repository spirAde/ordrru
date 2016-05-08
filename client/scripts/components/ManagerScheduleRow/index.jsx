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
        orderId: order.get('id'),
        text: `${order.get('startTime')} — ${order.get('endTime')}`,
        createdByUser: order.get('createdByUser'),
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

  renderRow() {
    const { cells, cellWidth, cellMargin, orders } = this.props;

    if (!orders.size) {
      return cells.map((cell, index) => {
        const cellTime = configs.periods[cell.get('period')];
        return (
          <div
            className="ManagerScheduleRow-cell"
            style={{
              width: cellWidth,
            }}
            key={index}
          >
            {cellTime}
          </div>
        );
      });
    }

    const orderPeriods = orders.map(order => {
      const startPeriod = order.getIn(['datetime', 'startPeriod']);
      const endPeriod = order.getIn(['datetime', 'endPeriod']);

      const fixStartPeriod = startPeriod === FIRST_PERIOD ? FIRST_PERIOD : startPeriod + STEP;
      const fixEndPeriod = endPeriod === LAST_PERIOD ? LAST_PERIOD : endPeriod - STEP;

      return fromJS({
        startPeriod: fixStartPeriod,
        endPeriod: fixEndPeriod,
        startTime: configs.periods[startPeriod],
        endTime: configs.periods[endPeriod],
        orderId: order.get('id'),
        periods: range(fixStartPeriod, fixEndPeriod + STEP, STEP),
      });
    });

    return recursiveEnumerationCells(cells, orderPeriods, List()).map((data, index) => {
      const classes = classNames({
        'ManagerScheduleRow-cell': true,
        'ManagerScheduleRow-cell--available': data.has('enable') && data.get('enable'),
        'ManagerScheduleRow-cell--disabled': data.has('enable') && !data.get('enable'),
        'ManagerScheduleRow-cell--manager': data.has('createdByUser') && !data.get('createdByUser'),
        'ManagerScheduleRow-cell--user': data.has('createdByUser') && data.get('createdByUser'),
      });

      return (
        <div
          className={classes}
          style={{
            width: data.get('length') === 1 ?
              cellWidth : data.get('length') * (cellWidth + cellMargin) - cellMargin,
          }}
          key={index}
        >
          {data.get('text')}
        </div>
      );
    });
  }

  render() {
    const renderedRow = this.renderRow();

    return (
      <div className="ManagerScheduleRow">
        {renderedRow}
      </div>
    );
  }
}

ManagerScheduleRowComponent.defaultProps = {
  cellWidth: 60,
  cellMargin: 10,
};

ManagerScheduleRowComponent.propTypes = {
  date: PropTypes.string.isRequired,
  orders: ImmutablePropTypes.list.isRequired,
  cells: ImmutablePropTypes.list.isRequired,

  cellWidth: PropTypes.number,
  cellMargin: PropTypes.number,
};

export default ManagerScheduleRowComponent;
