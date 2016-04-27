import fill from 'lodash/fill';
import floor from 'lodash/floor';
import round from 'lodash/round';

import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';

import IconComponent from '../Icon/index.jsx';

import './style.css';

class CommentComponent extends Component {
  renderStars(rating) {
    const fullStarsCount = floor(rating / 2);
    const halfStarsCount = floor(rating - fullStarsCount * 2);
    const emptyStarsCount = floor(5 - fullStarsCount - halfStarsCount);

    const fullStars = fill(Array(fullStarsCount), 'icon-star-full');
    const halfStars = fill(Array(halfStarsCount), 'icon-star-half');
    const emptyStars = fill(Array(emptyStarsCount), 'icon-star-empty');

    return [...fullStars, ...halfStars, ...emptyStars].map((icon, index) => (
      <IconComponent name={icon} color="#F4740C" key={index} />
    ));
  }
  render() {
    const { comment } = this.props;
    const stars = this.renderStars(comment.get('evaluation'));

    return (
      <div className="Comment">
        <div className="Comment-top">
          <div className="Comment-user">Василий Пупкин</div>
          <div className="Comment-evaluation">
            {stars}
          </div>
        </div>
        <div className="Comment-bottom">
          <p className="Comment-text">
            {comment.get('text')}
          </p>
        </div>
      </div>
    );
  }
}

CommentComponent.propTypes = {
  comment: ImmutablePropTypes.map.isRequired,
};

export default CommentComponent;
