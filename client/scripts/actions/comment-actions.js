import { Comment } from '../API';

export const FIND_COMMENTS_REQUEST = 'FIND_COMMENTS_REQUEST';
export const FIND_COMMENTS_SUCCESS = 'FIND_COMMENTS_SUCCESS';
export const FIND_COMMENTS_FAILURE = 'FIND_COMMENTS_FAILURE';

function findCommentsRequest() {
  return {
    type: FIND_COMMENTS_REQUEST,
  };
}

function findCommentsSuccess(roomId, comments) {
  return {
    type: FIND_COMMENTS_SUCCESS,
    payload: {
      roomId,
      comments,
    },
  };
}

function findCommentsError(error) {
  return {
    type: FIND_COMMENTS_FAILURE,
    payload: {
      error: error.message,
    },
    error,
  };
}

export function findCommentsIfNeed(roomId) {
  return (dispatch, getState) => {
    const state = getState();

    if (state.comment.getIn(['comments', roomId])) return false;

    dispatch(findCommentsRequest());

    return Comment.find({ where: { roomId }, order: 'date ASC' })
      .then(comments => dispatch(findCommentsSuccess(roomId, comments)))
      .catch(error => dispatch(findCommentsError(error)));
  };
}
