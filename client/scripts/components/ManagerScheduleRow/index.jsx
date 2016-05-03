import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import configs from '../../../../common/data/configs.json';

import './style.css';

class ManagerScheduleRowComponent extends Component {
  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  renderCells() {
    const { cells } = this.props;

    return cells.map((cell, index) => {
      const cellTime = configs.periods[cell.get('period')];
      return (
        <div
          className="ManagerScheduleRow-cell"
          style={{
            width: 75,
          }}
          key={index}
        >
          {cellTime}
        </div>
      );
    });
  }

  render() {
    const { orders, cells } = this.props;
    const renderedCells = this.renderCells();

    return (
      <div className="ManagerScheduleRow">
        {renderedCells}
      </div>
    );
  }
}

ManagerScheduleRowComponent.propTypes = {
  orders: ImmutablePropTypes.list.isRequired,
  cells: ImmutablePropTypes.list.isRequired,
};

export default ManagerScheduleRowComponent;
