import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import classNames from 'classnames';

import { HeaderSelectors } from '../../selectors/HeaderSelectors';

import IconComponent from '../Icon/index.jsx';

import './style.css';
import logoImg from '../../../images/logo.png';

/**
 * HeaderComponent - dumb component, component for change page mode;
 * Smart components - none
 * Dumb components - none
 * */
class HeaderComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);

    this.handleChangeMode = this.handleChangeMode.bind(this);
  }

  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps) {
    return nextProps.mode !== this.props.mode;
  }

  /**
   * handleChangeMode - handle change mode of page. pass mode to parent component
   * @param {String} selectedMode - mode
   * @param {Object} event - SyntheticEvent
   * */
  handleChangeMode(selectedMode, event) {
    event.preventDefault();

    const { mode } = this.props;

    if (mode === selectedMode) {
      return false;
    }

    return this.context.router.push(`/bathhouses?city=mgn&mode=${selectedMode}`);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const { mode } = this.props;
    const isListMode = mode === 'list';

    const listButtonClasses = classNames({
      'Header-anchor': true,
      'Header-anchor-mode-list': true,
      'Header-anchor--first': true,
      'Header-anchor--active': isListMode,
    });

    const mapButtonClasses = classNames({
      'Header-anchor': true,
      'Header-anchor-mode-map': true,
      'Header-anchor--last': true,
      'Header-anchor--active': !isListMode,
    });

    return (
      <div className="Header">
        <div className="Header-wrapper g-clear">
          <div className="Header-logo">
            <Link to={{ pathname: '/' }}>
              <img src={logoImg} alt="" width="130" height="40" />
            </Link>
          </div>

          <div className="Header-select-city">
            Магнитогорск
          </div>

          <div className="Header-mode">
            <a className={listButtonClasses} onClick={this.handleChangeMode.bind(this, 'list')}>
              <IconComponent
                name="icon-list"
                rate={1.5}
                style={{ margin: '0 10px -5px -15px' }}
              />
              <FormattedMessage id="mode.list" />
            </a>
            <a className={mapButtonClasses} onClick={this.handleChangeMode.bind(this, 'map')}>
              <IconComponent
                name="icon-location-point-mapbox"
                rate={1.5}
                style={{ margin: '0 10px -5px -15px' }}
              />
              <FormattedMessage id="mode.map" />
            </a>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * propTypes
 * @property {string} mode - current mode of page
 * @property {Function} changeMode - change url params and change mode of page
 */
HeaderComponent.propTypes = {
  mode: PropTypes.oneOf(['list', 'map']),
};

/**
 * contextTypes
 * @property {Object} router
 */
HeaderComponent.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default connect(HeaderSelectors)(HeaderComponent);
