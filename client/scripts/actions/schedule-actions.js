import { Schedules } from '../API';

export const FIND_ROOM_SCHEDULE_REQUEST = 'FIND_ROOM_SCHEDULE_REQUEST';
export const FIND_ROOM_SCHEDULE_SUCCESS = 'FIND_ROOM_SCHEDULE_SUCCESS';
export const FIND_ROOM_SCHEDULE_FAILURE = 'FIND_ROOM_SCHEDULE_FAILURE';

export const ADD_SCHEDULE_CHANGES = 'ADD_SCHEDULE_CHANGES';

/**
 * Request fetching schedule
 * @return {{type: string, payload: {}}}
 * */
function fetchRoomScheduleRequest() {
  return {
    type: FIND_ROOM_SCHEDULE_REQUEST,
    payload: {}
  };
}

/**
 * Success fetching schedule
 * @param {string} id - room id
 * @param {Array.<Object>} schedule - list of schedule
 * @return {{type: string, payload: {schedule: Array.<Object>}}}
 * */
function fetchRoomScheduleSuccess(id, schedule) {
  return {
    type: FIND_ROOM_SCHEDULE_SUCCESS,
    payload: {
      id,
      schedule
    }
  };
}

/**
 * Failure fetching schedule
 * @param {Object} error
 * @return {{type: string, payload: {error: Object}}}
 * */
function fetchRoomScheduleFailure(error) {
  return {
    type: FIND_ROOM_SCHEDULE_FAILURE,
    payload: {
      error
    }
  };
}

/**
 * Fetch schedule for room if need
 * @param {string} roomId - room id
 * @return {Function} - thunk action
 * */
export function findRoomScheduleIfNeed(roomId) {
  return (dispatch, getState) => {
    const state = getState();

    if (state.schedule.get('originals').has(roomId) || state.schedule.get('isFetching')) {
      return false;
    }

    dispatch(fetchRoomScheduleRequest());
    return Schedules.find({where: {roomId: roomId}, order: 'date ASC'})
      .then(response => response.json())
      .then(schedule => dispatch(fetchRoomScheduleSuccess(roomId, schedule)))
      .catch(error => dispatch(fetchRoomScheduleFailure(error)));
  };
}

export function redefineRoomSchedule(id, date, period) {
  return (dispatch, getState) => {

  };
}

/**
 * redefine/recalculate schedule for room, considering min duration for current room and the presence
 * of prohibited periods, and start or end of orders. Add new periods to schedule store changes
 * @param {string} id - room id
 * @param {Date} date - start or end date of order
 * @param {number} period - period id
 * @param {boolean} isStartOrder - start or end of order
 * @return {Function} thunk function
 * */
export function addScheduleChanges() {
  return (dispatch, getState) => {
    const state = getState();
    const room = state.bathhouse.get('rooms').find(room => room.get('id') === id);
  };
}
