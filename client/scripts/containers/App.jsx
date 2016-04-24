import React, { Component, PropTypes } from 'react';
import Helmet from 'react-helmet';

import { connect } from 'react-redux';

import { initGlobalCurrentDateAndPeriod, changeViewport, setDevice,
} from '../actions/application-actions';

/**
 * App - smart component, container, root
 * Smart components - all smart components
 * Dumb components - none
 * */
class App extends Component {

  componentDidMount() {
    this.initServiceWorker();
    this.initGlobalCurrentDateAndPeriod();

    this.props.changeViewport(this.getViewPort());
    window.addEventListener('resize', () => {
      this.props.changeViewport(this.getViewPort());
    });
  }

  getViewPort() {
    return {
      height: window.innerHeight,
      width: window.innerWidth,
    };
  }

  initServiceWorker() {
    if ('serviceWorker' in navigator) {
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
  changeViewport: PropTypes.func.isRequired,
  setDevice: PropTypes.func.isRequired,
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
    changeViewport: (viewport) => dispatch(changeViewport(viewport)),
    setDevice: (device) => dispatch(setDevice(device)),
  };
}

export default connect(state => state, mapDispatchToProps)(App);
