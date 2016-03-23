import moment from 'moment';
import keys from 'lodash/keys';
import last from 'lodash/last';

import { Schedule } from '../API';

import configs from '../../../common/data/configs.json';

export const FIND_ROOM_SCHEDULE_REQUEST = 'FIND_ROOM_SCHEDULE_REQUEST';
export const FIND_ROOM_SCHEDULE_SUCCESS = 'FIND_ROOM_SCHEDULE_SUCCESS';
export const FIND_ROOM_SCHEDULE_FAILURE = 'FIND_ROOM_SCHEDULE_FAILURE';

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

    return Schedule.find({ where: { roomId, date: { gte: currentDate } }, order: 'date ASC' })
      .then(schedule => {
        dispatch(fetchRoomScheduleSuccess(roomId, schedule));
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

    const settings = state.bathhouse.get('rooms')
      .find(room => room.get('id') === id).get('settings');
    const minDuration = settings.get('minDuration');
    const limitOrderDuration = configs.limitOrderDuration.bathhouse;

    const firstPeriod = 0;
    const lastPeriod = parseInt(last(keys(configs.periods)), 10);

    const dates = {
      prev: moment.max(moment(date).subtract(limitOrderDuration, 'days'), moment()).toDate(),
      curr: moment(date).toDate(),
      next: moment.min(moment(date).add(limitOrderDuration, 'days'), moment().add(30, 'days')).toDate(),
    };

    const interval = {
      left: period - minDuration < firstPeriod ?
        lastPeriod + period - minDuration : period - minDuration,
      right: period + minDuration > lastPeriod ?
        period + minDuration - lastPeriod : period + minDuration,
    };

    console.log(dates);
    console.log(interval);
    //
  };
}
