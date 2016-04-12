import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';

import { connect } from 'react-redux';

import { changeUserViewport } from '../actions/user-actions';
import { initGlobalCurrentDateAndPeriod } from '../actions/application-actions';

/**
 * App - smart component, container, root
 * Smart components - all smart components
 * Dumb components - none
 * */
class App extends Component {

  componentDidMount() {
    this.initServiceWorker();
    this.initGlobalCurrentDateAndPeriod();

    this.props.changeUserViewport(this.getViewPort());
    window.addEventListener('resize', this.getViewPort);
  }

  getViewPort() {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    };
  }

  initServiceWorker() {
    if ('serviceWorker' in navigator && window.__FIRST_RENDER__) {
      console.log('service worker detect');
    }
  }

  initGlobalCurrentDateAndPeriod() {
    this.props.initGlobalCurrentDateAndPeriod(window.__REFERENCE_DATETIME__);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div>
        <Helmet
          title="Ordr.ru"
          titleTemplate="%s | Ordr.ru"
        />
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  initGlobalCurrentDateAndPeriod: PropTypes.func.isRequired,
  changeUserViewport: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    initGlobalCurrentDateAndPeriod: (datetime) =>
      dispatch(initGlobalCurrentDateAndPeriod(datetime)),
    changeUserViewport: (viewport) => dispatch(changeUserViewport(viewport)),
  };
}

export default connect(state => state, mapDispatchToProps)(App);
