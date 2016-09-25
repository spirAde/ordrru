import { createSelector } from 'reselect';

const activeRoomIdSelector = state => state.bathhouse.get('activeRoomId');
const commentsSelector = state => state.comment.get('comments');
const commentsIsFetchingSelector = state => state.comment.get('isFetching');

const CommentsListSelectors = createSelector(
  activeRoomIdSelector,
  commentsSelector,
  commentsIsFetchingSelector,
  (activeRoomId, comments, commentsIsFetching) => ({
    commentsIsFetching,
    comments: comments.get(activeRoomId),
  })
);

export { CommentsListSelectors as default };
