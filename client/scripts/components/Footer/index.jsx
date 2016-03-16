import React, { Component } from 'react';
import moment from 'moment';

import './style.css';

/**
 * FooterComponent
 * Smart components - none
 * Dumb components - none
 * */
class FooterComponent extends Component {

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    const nowYear = moment().format('YYYY');

    return (
      <div className="Footer">
        <div className="Footer-wrapper">
          <div className="g-clear">
            <div className="Footer-images">
              <a href="#">
                <img src="/build/images/logo-2.png" />
              </a>
            </div>
            <div className="Footer-links">
              <ul>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Пригласить друзей</a>
                </li>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Мобильная версия</a>
                </li>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Карта сайта</a>
                </li>
              </ul>
            </div>
            <div className="Footer-links">
              <ul>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Мы в Вконтакте</a>
                </li>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Мы в Фейсбуке</a>
                </li>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Мы в Гугл+</a>
                </li>
              </ul>
            </div>
            <div className="Footer-links">
              <ul>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">О проекте</a>
                </li>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Правила</a>
                </li>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Вопросы и ответы</a>
                </li>
                <li className="Footer-item">
                  <a className="Footer-anchor" href="#">Конфиденциальность</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="Footer-copy">© {nowYear} «Ordr.ru»</div>
        </div>
      </div>
    );
  }
}

export default FooterComponent;
