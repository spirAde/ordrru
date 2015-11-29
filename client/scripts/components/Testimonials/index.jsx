import React, { Component } from 'react';

import './style.css';

/**
 * TestimonialsComponent - components of reviews
 * Smart components - none
 * Dumb components - none
 * */
class TestimonialsComponent extends Component {

  /**
   * constructor
   * @param {object} props
   */
  constructor(props) {
    super(props);

    /**
     * @type {object}
     * @property {string} activeTab - name of active tab
     */
    this.state = {
      activeTab: 'comments'
    };
  }

  /**
   * handle change active tab
   * @param {string} tabName - tab name
   * */
  handleChangeTab(tabName) {
    if (this.state.activeTab === tabName) return false;

    this.setState({
      activeTab: tabName
    });
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div className="Testimonials">
        <div className="Testimonials-wrapper">
          <div className="Testimonials-tabs">
            <a
              className="Testimonials-tab Testimonials-tab--active Testimonials-tab--first g-icons"
              onClick={this.handleChangeTab.bind(this, 'comments')} >
              Комментарии
            </a>
            <a
              className="Testimonials-tab Testimonials-tab--last"
              onClick={this.handleChangeTab.bind(this, 'media')}>
              Пресса о нас
            </a>
          </div>
          <div className="Testimonials-items">
            <div className="Testimonials-item">
              <p className="Testimonials-item-paragraph">
                Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation
              </p>
              <div className="Testimonials-people">
                <div className="Testimonials-people-name">Василий Пупкин</div>
                <div className="Testimonials-people-position">Студент</div>
              </div>
            </div>
          </div>
          <div className="Testimonials-navigation">
            <a className="Testimonials-navigation-anchor" href="#">
              <img className="Testimonials-navigation-image" src="/build/images/people/1.png" />
            </a>
            <a className="Testimonials-navigation-anchor" href="#">
              <img className="Testimonials-navigation-image Testimonials-navigation-image--active" src="/build/images/people/1.png" />
            </a>
            <a className="Testimonials-navigation-anchor" href="#">
              <img className="Testimonials-navigation-image" src="/build/images/people/1.png" />
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default TestimonialsComponent;
