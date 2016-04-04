import React, {Component} from 'react';

/**
 * NotFoundPage - smart component, not found page
 * Smart components - none
 * Dumb components - none
 * */
class NotFoundPage extends Component {

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div className="container">
        <h1>Doh! 404!</h1>
        <p>These are <em>not</em> the droids you are looking for!</p>
      </div>
    );
  }
}

export default NotFoundPage;
