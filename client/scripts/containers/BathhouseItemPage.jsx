import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * BathhouseItemPage - smart component, page of bathhouse
 * Smart components - none
 * Dumb components - none
 * */
class BathhouseItemPage extends Component {

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
      <div>
        Bathhouse item page
      </div>
    );
  }
}

export default connect(state => ({ routerState: state.router }))(BathhouseItemPage);
