import React, { Component, PropTypes } from 'react';

import { connect } from 'react-redux';

import moment from 'moment';

import { changeUserViewport } from '../actions/user-actions';
import { setCurrentDate, setCurrentPeriod } from '../actions/application-actions';

/**
 * App - smart component, container, root
 * Smart components - all smart components
 * Dumb components - none
 * */
class App extends Component {

  /**
   * constructor
   * @param {Object} props
   */
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //this.initServiceWorker();
    this.initCurrentDateAndPeriod();

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
    if ('serviceWorker' in navigator) {
      console.log('service worker detect');
    }
  }

  initCurrentDateAndPeriod() {
    const currentMoment = moment();
    const currentDate = currentMoment.format('YYYY-MM-DD');
    const currentHour = currentMoment.format('HH');
    const currentMinutes = currentMoment.format('mm');
    const currentPeriod = (currentHour * 2 + (currentMinutes >= 30 ? 1 : 0)) * 3;

    this.props.setCurrentDate(currentDate);
    this.props.setCurrentPeriod(currentPeriod);
  }

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: PropTypes.object.isRequired,
  setCurrentDate: PropTypes.func.isRequired,
  setCurrentPeriod: PropTypes.func.isRequired,
  changeUserViewport: PropTypes.func.isRequired,
};

/**
 * pass method to props
 * @param {Function} dispatch
 * @return {Object} props - list of methods
 * */
function mapDispatchToProps(dispatch) {
  return {
    setCurrentDate: (date) => dispatch(setCurrentDate(date)),
    setCurrentPeriod: (period) => dispatch(setCurrentPeriod(period)),
    changeUserViewport: (viewport) => dispatch(changeUserViewport(viewport)),
  };
}

export default connect(state => state, mapDispatchToProps)(App);
