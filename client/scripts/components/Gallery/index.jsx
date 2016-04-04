import React, { Component, PropTypes } from 'react';

import './style.css';

class GalleryComponent extends Component {

  /**
   * render
   * @return {XML} - React element
   * */
  render() {
    return (
      <div className="Gallery">
        1
      </div>
    );
  }
}

/**
 * propTypes
 */
GalleryComponent.propTypes = {
  images: PropTypes.array.isRequired,
};

export default GalleryComponent;
