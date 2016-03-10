import React, { Component, PropTypes } from 'react';
import { IndexLink, Link } from 'react-router';

import IconComponent from '../Icon/index.jsx';

import './style.css';

import logoImage from '../../../images/logo.png';

/**
 * FaceComponent - welcome component
 * Smart components - none
 * Dumb components - none
 * */
class FaceComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div className="Face">
        <div className="Face-inner">
          <div className="Face-header">
            <div className="Face-logo">
              <IndexLink to="/">
                <img src={logoImage} />
              </IndexLink>
            </div>
          </div>
          <div className="Face-info">
            <h1 className="Face-text-heading">Банный отдых</h1>
            <p className="Face-text-branding">Планируйте свое время правильно! Бронируйте бани,<br />автомойки и другие уникальные услуги. </p>
            <Link className="Face-next-page-button g-icons" to={{ pathname: '/bathhouses', query: { city: 'mgn', mode: 'list' } }}>
              <span>Подобрать</span>
              <IconComponent name="icon-chevron-right" style={{ margin: '0 -14px -4px 5px' }}/>
            </Link>
          </div>
          <div className="Face-select-city">
            <div className="Face-current-city">
              <div className="field field-select icons">
                1
              </div>
            </div>
            <div className="Face-total-offers">
              Всего <span className="Face-total-offers-count">100</span> предложений
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FaceComponent;
