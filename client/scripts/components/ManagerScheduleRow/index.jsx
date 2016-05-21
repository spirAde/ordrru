import indexOf from 'lodash/indexOf';

import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import classNames from 'classnames';

import { STEP, LAST_PERIOD } from '../../../../common/utils/schedule-helper';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import configs from '../../../../common/data/configs.json';

import './style.css';

class ManagerScheduleRowComponent extends Component {
  constructor(props) {
    super(props);

    this.handleClickCreateOrder = this.handleClickCreateOrder.bind(this);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  handleClickShowOrder(orderId, event) {
    event.preventDefault();

    this.props.onShowOrder(orderId);
  }

  handleClickCreateOrder(event) {
    event.preventDefault();

    const { date, cells } = this.props;

    const parentNode = event.target.parentNode;
    const cellIndex = indexOf(parentNode.childNodes, event.target);
    const cell = cells.get(cellIndex);

    if (!cell.get('enable') || cell.getIn(['status', 'isForceDisable'])) return false;

    return this.props.onCreateOrder(date, cell.get('period'));
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

    return cells.skipLast(1).map((cell, index) => {
      const order = orders.find(
        order => order.getIn(['datetime', 'startPeriod']) <= cell.get('period') &&
          cell.get('period') < order.getIn(['datetime', 'endPeriod'])
      );

      const cellIsFree = cell.get('enable') && !cell.getIn(['status', 'isForceDisable']);
      const cellIsBusy = !cell.get('enable') || cell.getIn(['status', 'isForceDisable']);

      if (order) {
        const isEndOrder = order.getIn(['datetime', 'endPeriod']) === cell.get('period') + STEP;
        const isOneDayOrder = order.get('isOneDayOrder');
        const isLastPeriod = cell.get('period') + STEP === LAST_PERIOD;

        const classes = classNames({
          'ManagerScheduleRow-cell': true,
          'ManagerScheduleRow-cell--available': cellIsFree,
          'ManagerScheduleRow-cell--disabled': cellIsBusy,
          'ManagerScheduleRow-cell--manager': !order.get('createdByUser'),
          'ManagerScheduleRow-cell--user': order.get('createdByUser'),
        });

        let width = cellWidth + cellMargin;
        let marginRight = 0;

        // TODO: simplify
        if (isEndOrder && isOneDayOrder) {
          width -= cellMargin;
          marginRight = cellMargin;
        } else if (isEndOrder && !isOneDayOrder && !isLastPeriod) {
          width -= cellMargin;
          marginRight = cellMargin;
        }

        return (
          <div
            className={classes}
            style={{ width, marginRight }}
            onClick={this.handleClickShowOrder.bind(this, order.get('id'))}
            key={index}
          >
            &nbsp;
          </div>
        );
      }

      const classes = classNames({
        'ManagerScheduleRow-cell': true,
        'ManagerScheduleRow-cell--available': cellIsFree,
        'ManagerScheduleRow-cell--disabled': cellIsBusy,
        'ManagerScheduleRow-cell--manager': cell.has('createdByUser') && !cell.get('createdByUser'),
        'ManagerScheduleRow-cell--user': cell.has('createdByUser') && cell.get('createdByUser'),
      });

      return (
        <div
          className={classes}
          style={{
            width: cellWidth,
            marginRight: cellMargin,
          }}
          onClick={this.handleClickCreateOrder}
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

  onShowOrder: PropTypes.func.isRequired,
  onCreateOrder: PropTypes.func.isRequired,
};

export default ManagerScheduleRowComponent;
