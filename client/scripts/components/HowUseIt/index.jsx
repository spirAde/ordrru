import React, { Component } from 'react';

import './style.css';

import IconComponent from '../Icon/index.jsx';

/**
 * HowUseItComponent - how use it component
 * Smart components - none
 * Dumb components - none
 * */
class HowUseItComponent extends Component {

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
      <div className="HowUseIt">
        <div className="HowUseIt-inner">
          <h2 className="HowUseIt-heading">Как это работает</h2>
          <div className="g-clear">
            <div className="HowUseIt-item HowUseIt-item--first g-icons">
              <h3 className="HowUseIt-item-heading">Выбираете <br className="HowUseIt-item-break" />место</h3>
              <p className="HowUseIt-item-paragraph">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
              </p>
            </div>
            <div className="HowUseIt-item HowUseIt-item--middle g-icons">
              <h3 className="HowUseIt-item-heading">Заполняете <br className="HowUseIt-item-break" />форму</h3>
              <p className="HowUseIt-item-paragraph">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
              </p>
            </div>
            <div className="HowUseIt-item HowUseIt-item--last g-icons">
              <h3 className="HowUseIt-item-heading">Подтверждаете <br className="HowUseIt-item-break" />номер</h3>
              <p className="HowUseIt-item-paragraph">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default HowUseItComponent;
