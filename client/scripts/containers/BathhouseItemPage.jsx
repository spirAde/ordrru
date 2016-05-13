import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';

/**
 * BathhouseItemPage - smart component, page of bathhouse
 * Smart components - none
 * Dumb components - none
 * */
class BathhouseItemPage extends Component {

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div>
        <Helmet title="Bathhouse" />
        <div>
          Bathhouse item page
        </div>
      </div>
    );
  }
}

export default connect(state => ({ routerState: state.router }))(BathhouseItemPage);
