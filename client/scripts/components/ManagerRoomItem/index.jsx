import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import ManagerSchedulePanelComponent from '../ManagerSchedulePanel/index.jsx';

import './style.css';
import '../../../styles/globals.css';

class ManagerRoomItemComponent extends Component {
  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }
  render() {
    const { room, orders, schedules } = this.props;

    return (
      <div className="ManagerRoom">
        <div className="g-clear">
          <h2 className="ManagerRoom-header">{room.get('name')}</h2>
          <div className="ManagerRoom-help">
            <span className="ManagerRoom-help-item ManagerRoom-help-item--available">
              <FormattedMessage id="availableTime" />
            </span>
            <span className="ManagerRoom-help-item ManagerRoom-help-item--disabled">
              <FormattedMessage id="disabledTime" />
            </span>
            <span className="ManagerRoom-help-item ManagerRoom-help-item--manager">
              <FormattedMessage id="createdManagerTime" />
            </span>
            <span className="ManagerRoom-help-item ManagerRoom-help-item--user">
              <FormattedMessage id="createdUserTime" />
            </span>
          </div>
        </div>
        <ManagerSchedulePanelComponent
          key={`schedule-${room.get('id')}`}
          orders={orders}
          schedules={schedules}
        />
      </div>
    );
  }
}

ManagerRoomItemComponent.propTypes = {
  room: ImmutablePropTypes.map.isRequired,
  orders: ImmutablePropTypes.list.isRequired,
  schedules: ImmutablePropTypes.list.isRequired,
};

export default ManagerRoomItemComponent;
