import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import classNames from 'classnames';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import './style.css';

/**
 * OrderComponent - dumb component, order details box, confirm phone
 * Smart components - none
 * Dumb components - SchedulePanelComponent
 * */
class OrderComponent extends Component {

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
		const { order, steps, prepayment } = this.props;

    return (
      <div className="Order">
        <div className="Order-inner g-clear">
          <div className="Order-details">
            <div className="Order-details-inner">
              <p className="Order-details-datetime">
								27.08 c 13:00 до 15:00 и 28.08 c 13:00 до 15:00
							</p>
              <table cellSpacing="0" cellPadding="0" className="Order-details-list">
                <tbody>
                  <tr>
                    <td>Сауна х 4 часа</td>
                    <td>1600 рублей</td>
                  </tr>
                  <tr>
                    <td>Сауна х 4 часа</td>
                    <td>1600 рублей</td>
                  </tr>
                  <tr>
                    <td>Сауна х 4 часа</td>
                    <td>1600 рублей</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="Order-phone">
            <div className="Order-phone-inner g-clear">
              <p className="Order-phone-description">
								Для подтверждения заказа введите номер телефона
							</p>
              <div className="form clear">
                <div className="Order-phone-input-field">
                  <input type="text" placeholder="+7" className="Order-phone-input" />
                </div>
                <div className="Order-send-sms-button-field">
                  <button
                    className="Order-send-sms-button"
                    onClick={this.props.onSendOrder}
                  >
                    Отправить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {boolean} isOpen - box is opened or not
 */
OrderComponent.propTypes = {
  prepayment: PropTypes.bool.isRequired,
  order: ImmutablePropTypes.map.isRequired,
  steps: ImmutablePropTypes.map.isRequired,
  onSendOrder: PropTypes.func.isRequired,
};

export default OrderComponent;
