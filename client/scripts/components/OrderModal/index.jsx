import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import { FormattedMessage } from 'react-intl';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import moment from 'moment';

import { periodToTime, MOMENT_FORMAT } from '../../../../common/utils/date-helper';

import ModalComponent from '../Modal/index.jsx';

import './style.css';

class OrderModalComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: '',
    };

    this.handleChangeComment = this.handleChangeComment.bind(this);
    this.handleClickClose = this.handleClickClose.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  handleChangeComment(event) {
    event.preventDefault();

    this.setState({
      comment: event.target.value,
    });
  }

  handleClickClose(event) {
    event.preventDefault();

    this.props.onClose();
  }

  render() {
    const { action, order, active, width, height } = this.props;

    const datetime = order.get('datetime');
    const startDate = moment(datetime.get('startDate')).format(MOMENT_FORMAT);
    const endDate = moment(datetime.get('endDate')).format(MOMENT_FORMAT);
    const startTime = periodToTime(datetime.get('startPeriod'));
    const endTime = periodToTime(datetime.get('endPeriod'));

    const datetimeText = `${startDate} ${startTime} — ${endDate} ${endTime}`;

    if (action === 'show') {
      return (
        <div>
          <ModalComponent
            active={active}
            width={width}
            height={height}
          >
            <div className="OrderModal-header">
              <h2 className="OrderModal-order-id">
                <FormattedMessage id="dataOrder" />&nbsp;
                <span>№{order.get('id')}</span>
              </h2>
            </div>
            <div className="OrderModal-body">
              <div className="OrderModal-body-field">
                <p>
                  <FormattedMessage id="time" />:&nbsp;
                  <span>{datetimeText}</span>
                </p>
              </div>
              <div className="OrderModal-body-field">
                <p>
                  <FormattedMessage id="amountOfTime" />:&nbsp;
                  <span>{order.getIn(['sums', 'datetime'])}</span>
                </p>
              </div>
              <div className="OrderModal-body-field">
                <p>
                  <FormattedMessage id="comment" />:&nbsp;
                  <span>{order.get('comment')}</span>
                </p>
              </div>
            </div>
            <div className="OrderModal-footer">
              <a className="OrderModal-button" onClick={this.handleClickClose}>
                <FormattedMessage id="close" />
              </a>
            </div>
          </ModalComponent>
        </div>
      );
    }

    const { comment } = this.state;

    return (
      <div>
        <ModalComponent
          active={active}
          width={width}
          height={height}
        >
          <div className="OrderModal-header">
            <h2 className="OrderModal-order-id">
              <FormattedMessage id="createOrder" />
            </h2>
          </div>
          <div className="OrderModal-body">
            <div className="OrderModal-body-field">
              <p>
                <FormattedMessage id="time" />:&nbsp;
                <span>{datetimeText}</span>
              </p>
            </div>
            <div className="OrderModal-body-field">
              <p>
                <FormattedMessage id="amountOfTime" />:&nbsp;
                <span>{order.getIn(['sums', 'datetime'])}</span>
              </p>
            </div>
            <div className="OrderModal-body-field">
              <p>
                <FormattedMessage id="comment" />:&nbsp;
              </p>
              <p>
                <textarea
                  className="OrderModal-textarea"
                  name="comment"
                  value={comment}
                  onChange={this.handleChangeComment}
                />
              </p>
            </div>
          </div>
          <div className="OrderModal-footer">
            <a className="OrderModal-button" onClick={this.handleClickClose}>
              <FormattedMessage id="cancel" />
            </a>
          </div>
        </ModalComponent>
      </div>
    );
  }
}

OrderModalComponent.defaultProps = {
  action: 'show',
  width: 500,
  height: 0,
};

OrderModalComponent.propTypes = {
  action: PropTypes.oneOf(['create', 'show']).isRequired,
  order: ImmutablePropTypes.map.isRequired,
  active: PropTypes.bool.isRequired,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  onClose: PropTypes.func.isRequired,
};

export default OrderModalComponent;
