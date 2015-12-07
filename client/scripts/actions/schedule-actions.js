import moment from 'moment';
import keys from 'lodash/object/keys';
import last from 'lodash/array/last';

import { Schedules } from '../API';

import configs from '../../../common/data/configs.json';

export const FIND_ROOM_SCHEDULE_REQUEST = 'FIND_ROOM_SCHEDULE_REQUEST';
export const FIND_ROOM_SCHEDULE_SUCCESS = 'FIND_ROOM_SCHEDULE_SUCCESS';
export const FIND_ROOM_SCHEDULE_FAILURE = 'FIND_ROOM_SCHEDULE_FAILURE';

export const ADD_SCHEDULE_CHANGES = 'ADD_SCHEDULE_CHANGES';
export const ADD_SCHEDULE_MIXED = 'ADD_SCHEDULE_MIXED';

function combineOriginalAndChanges(original, changes) {

  if (!changes) return original;
}

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

export function addMixSchedule(id, mixed) {
  return {
    type: ADD_SCHEDULE_MIXED,
    payload: {
      id,
      mixed
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
    return Schedules.find({ where: { roomId: roomId }, order: 'date ASC' })
      .then(response => response.json())
      .then(schedule => {
        const mixed = combineOriginalAndChanges(schedule, state.schedule.getIn(['changes', roomId]));

        dispatch(fetchRoomScheduleSuccess(roomId, schedule));
        dispatch(addMixSchedule(roomId, mixed));
      })
      .catch(error => dispatch(fetchRoomScheduleFailure(error)));
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
export function redefineRoomSchedule(id, date, period, isStartOrder) {
  return (dispatch, getState) => {
    const state = getState();

    const settings = state.bathhouse.get('rooms').find(room => room.get('id') === id).get('settings');
    const minDuration = settings.get('minDuration');

    const firstPeriod = 0;
    const lastPeriod = parseInt(last(keys(configs.periods)), 10);

    const dates = {
      prev: moment.max(moment(date).subtract(1, 'days'), moment()),
      curr: moment(date),
      next: moment.min(moment(date).add(1, 'days'), moment().add(30, 'days'))
    };

    const interval = [
      period - minDuration < 0 ? lastPeriod + period - minDuration : period - minDuration,
      period + minDuration > lastPeriod ? period + minDuration - lastPeriod : period + minDuration
    ];
  };
}

export function addScheduleChanges() {
  return (dispatch, getState) => {
    const state = getState();
    const room = state.bathhouse.get('rooms').find(room => room.get('id') === id);
  };
}
