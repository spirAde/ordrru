import moment from 'moment';
import keys from 'lodash/keys';
import last from 'lodash/last';

import { Schedule } from '../API';

import configs from '../../../common/data/configs.json';

export const FIND_ROOM_SCHEDULE_REQUEST = 'FIND_ROOM_SCHEDULE_REQUEST';
export const FIND_ROOM_SCHEDULE_SUCCESS = 'FIND_ROOM_SCHEDULE_SUCCESS';
export const FIND_ROOM_SCHEDULE_FAILURE = 'FIND_ROOM_SCHEDULE_FAILURE';

export const CHANGE_SCHEDULE = 'CHANGE_SCHEDULE';

export const ADD_SCHEDULE_CHANGES = 'ADD_SCHEDULE_CHANGES';
export const CLEAR_SCHEDULE_CHANGES = 'CLEAR_SCHEDULE_CHANGES';

export const PERIOD_STATUSES = {
  FREE: 'FREE',
  BUSY: 'BUSY',
  LOCK: 'LOCK',
};

/**
 * Request fetching schedule
 * @return {{type: string, payload: {}}}
 * */
function fetchRoomScheduleRequest() {
  return {
    type: FIND_ROOM_SCHEDULE_REQUEST,
    payload: {},
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
      schedule,
    },
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
      message: error.message,
    },
    error,
  };
}

/**
 * change schedule for room, as result as combination between original and changes
 * @param {string} id - room id
 * @param {Array<Object>} schedule - list of periods
 * @return {{type: string, payload: {error: Object}}}
 * */
function changeSchedule(id, schedule) {
  return {
    type: CHANGE_SCHEDULE,
    payload: {
      id,
      schedule,
    },
  };
}

/**
 * clear all changes in schedule for room
 * @param {string} id - room id
 * @return {{type: string, payload: {error: Object}}}
 * */
function clearScheduleChanges(roomId) {
  return {
    type: CLEAR_SCHEDULE_CHANGES,
    payload: {
      id: roomId,
    },
  };
}

/**
 * create combination between originals and changes in schedule for room
 * @param {string} roomId - room id
 * @param {Array<Object>} original - original schedule for room
 * @param {Array<Object>} changes - changes of schedule for room
 * @param {number} minDuration - min duration for order for current room
 * @return {Array<Object>} - combined schedule between original and changes
 * */
function combineOriginalAndChangesSchedule(roomId, original, changes, minDuration) {
  return original;
}

export function addScheduleChanges(roomId, changes) {
  return {
    type: ADD_SCHEDULE_CHANGES,
    payload: {
      id: roomId,
      changes,
    },
  };
}

export function receiveScheduleChanges(roomId, changes) {
  return (dispatch, getState) => {
    const state = getState();

    if (state.schedule.hasIn(['originals', roomId])) {
      const original = state.schedule.getIn(['originals', roomId]);
      const settings = state.bathhouse.get('rooms').find(room => room.get('id') === roomId).get('settings');
      const minDuration = settings.get('minDuration');
      const combinedSchedule = combineOriginalAndChangesSchedule(roomId, original, changes, minDuration);

      dispatch(changeSchedule(roomId, combinedSchedule));
    } else {
      dispatch(addScheduleChanges(roomId, changes));
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
    const currentDate = state.application.get('date');

    if (state.schedule.get('schedules').has(roomId) || state.schedule.get('isFetching')) {
      return false;
    }

    dispatch(fetchRoomScheduleRequest());

    return Schedule.find({ where: { roomId: roomId, date: { gte: currentDate } }, order: 'date ASC' })
      .then(schedule => {
        dispatch(fetchRoomScheduleSuccess(roomId, schedule));
        if (state.schedule.hasIn(['changes', roomId])) {
          const changes = state.schedule.getIn(['changes', roomId]);
          const settings = state.bathhouse.get('rooms').find(room => room.get('id') === roomId).get('settings');
          const minDuration = settings.get('minDuration');
          const combinedSchedule = combineOriginalAndChangesSchedule(roomId, schedule, changes, minDuration);

          dispatch(changeSchedule(roomId, combinedSchedule));
          dispatch(clearScheduleChanges(roomId));
        } else {
          dispatch(changeSchedule(roomId, schedule));
        }
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

    //
  };
}
