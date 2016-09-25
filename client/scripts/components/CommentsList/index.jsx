import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import CommentsListSelectors from '../../selectors/CommentsListSelectors';

import CommentComponent from '../Comment/index.jsx';

import shallowEqualImmutable from '../../utils/shallowEqualImmutable';

import './style.css';

class CommentsListComponent extends Component {
  /**
   * shouldComponentUpdate
   * @return {boolean}
   * */
  shouldComponentUpdate(nextProps, nextState) {
    return !shallowEqualImmutable(this.props, nextProps) ||
      !shallowEqualImmutable(this.state, nextState);
  }

  renderComments() {
    const { comments } = this.props;

    return comments.map(comment => (
      <CommentComponent
        key={comment.get('id')}
        comment={comment}
      />
    ));
  }

  render() {
    const { isActive, commentsIsFetching } = this.props;

    if (isActive && !commentsIsFetching) {
      const commentsItems = this.renderComments();

      return (
        <div className="CommentsList">
          <div className="CommentsList-header">
            <FormattedMessage id="comments" />
          </div>
          <div className="CommentsList-list">
            {commentsItems}
          </div>
        </div>
      );
    }

    return null;
  }
}

CommentsListComponent.propTypes = {
  comments: ImmutablePropTypes.list,
  isActive: PropTypes.bool.isRequired,
  commentsIsFetching: PropTypes.bool.isRequired,
};

export default connect(CommentsListSelectors)(CommentsListComponent);
