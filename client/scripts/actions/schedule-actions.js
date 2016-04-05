import moment from 'moment';
import { last, head, map, assign, range, omit, isNull } from 'lodash';

import { Schedule } from '../API';

import configs from '../../../common/data/configs.json';

import { splitScheduleByAvailability, findFirstOrLastDisablePeriod,
  getLeftAndRightClosestEnablePeriods,
  setIsForceDisable } from '../../../common/utils/schedule-helper';

export const FIND_ROOM_SCHEDULE_REQUEST = 'FIND_ROOM_SCHEDULE_REQUEST';
export const FIND_ROOM_SCHEDULE_SUCCESS = 'FIND_ROOM_SCHEDULE_SUCCESS';
export const FIND_ROOM_SCHEDULE_FAILURE = 'FIND_ROOM_SCHEDULE_FAILURE';

export const UPDATE_SCHEDULE = 'UPDATE_SCHEDULE';

const FIRST_PERIOD = 0;
const LAST_PERIOD = 144;
const STEP = 3;

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
    const currentDate = moment().toDate();

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
 * update schedule for room
 * @param {String} roomId - room id
 * @param {Array.<Object>} schedule - new schedule
 * @param {String} reason - reason of update data(socket, reset,
 *                          set disabled periods, cancel disabled periods)
 * */
function updateSchedule(roomId, schedule, reason) {
  return {
    type: UPDATE_SCHEDULE,
    payload: {
      roomId,
      schedule,
    },
    meta: {
      reason, // optional parameter
    },
  };
}

/**
 * reset schedule which is obtained by the user of the order
 * return {void}
 * */
export function resetOrderSchedule() {
  return (dispatch, getState) => {
    const state = getState();
    const order = state.user.get('order');
    const roomId = order.get('roomId');

    if (!roomId) return;

    const schedule = state.schedule.getIn(['schedules', roomId]).toJS();

    // update schedule, remove all status(isForceDisable, isOrder) from periods
    const redefineSchedule = map(schedule, date => assign({}, date, {
      periods: map(date.periods, period => omit(period, ['status'])),
    }));

    dispatch(updateSchedule(roomId, redefineSchedule, 'reset'));
  };
}

/**
 * It was chosen as the fastest and more readable
 * redefine/recalculate schedule for room, considering min duration for
 * current room and the presence of prohibited periods, and start or end of orders.
 * Add new periods to schedule store changes.
 *
 * We limit the available cells in the following cases:
 *  Always:
 *    - if a cell is placed in the distance is longer than the config in order for a
 *      maximum duration (eg daily) - maxOrderDuration
 *  Situation:
 *    - if the selected cell to the left or to the right there is another order, then we limit
 *      absolutely all the cells to the left or right for the current day, and previous or next
 *    - if the current day no orders left or right of the selected cell, we still have to check
 *      that the distance from the selected cell to the last / first cell in the previous / next day
 *      less than the minimum duration of the order. minDuration
 *
 * @param {string} id - room id
 * @param {Date} date - start or end date of order
 * @param {number} period - period id
 * @param {boolean} isStartOrder - start or end of order
 * @return {Function} thunk function
 * */
export function redefineRoomSchedule(id, date, period, isStartOrder) {
  return (dispatch, getState) => {
    const state = getState();
    const schedule = state.schedule.getIn(['schedules', id]).toJS();

    if (isStartOrder) {
      const settings = state.bathhouse.get('rooms')
        .find(room => room.get('id') === id).get('settings');
      const minDuration = settings.get('minDuration');
      const maxOrderDuration = configs.maxOrderDuration.bathhouse;

      let fixedLeftIntermediateSchedules = [];
      let fixedSelectedSchedule = [];
      let fixedRightIntermediateSchedules = [];

      const needFixPeriodsSelectedDate = [];

      const splittedSchedule = splitScheduleByAvailability(schedule, date, maxOrderDuration);

      const fixedLeftDisabledSchedules = map(
        splittedSchedule.unavailable.left,
        date => assign({}, date, { periods: setIsForceDisable(date.periods) })
      );

      const fixedRightDisabledSchedules = map(
        splittedSchedule.unavailable.right,
        date => assign({}, date, { periods: setIsForceDisable(date.periods) })
      );

      const closestEnablePeriods = getLeftAndRightClosestEnablePeriods(
        splittedSchedule.selected.periods, period
      );

      const needLeftMinDurationFix = closestEnablePeriods.left.length &&
        closestEnablePeriods.left.length < minDuration - 1 &&
        head(closestEnablePeriods.left) !== FIRST_PERIOD;

      const needRightMinDurationFix = closestEnablePeriods.right.length &&
        closestEnablePeriods.right.length < minDuration - 1 &&
        last(closestEnablePeriods.right) !== LAST_PERIOD;

      const allLeftPeriodsAreAvailable = head(closestEnablePeriods.left) === FIRST_PERIOD;
      const allRightPeriodsAreAvailable = last(closestEnablePeriods.right) === LAST_PERIOD;

      if (allLeftPeriodsAreAvailable) {
        const firstLeftDisablePeriod = findFirstOrLastDisablePeriod(
          splittedSchedule.available.left, 'left'
        );

        if (isNull(firstLeftDisablePeriod)) {
          //
        } else {
          //
        }
      } else {
        needFixPeriodsSelectedDate.concat(range(
          FIRST_PERIOD, head(closestEnablePeriods.left), STEP
        ));

        fixedLeftIntermediateSchedules = map(
          splittedSchedule.available.left,
          date => assign({}, date, { periods: setIsForceDisable(date.periods) })
        );
      }

      if (allRightPeriodsAreAvailable) {
        const firstRightDisablePeriod = findFirstOrLastDisablePeriod(
          splittedSchedule.available.right, 'right'
        );

        if (isNull(firstRightDisablePeriod)) {
          //
        } else {
          //
        }
      } else {
        needFixPeriodsSelectedDate.concat(range(
          last(closestEnablePeriods.right), LAST_PERIOD + STEP, STEP
        ));

        fixedRightIntermediateSchedules = map(
          splittedSchedule.available.right,
          date => assign({}, date, { periods: setIsForceDisable(date.periods) })
        );
      }

      if (needLeftMinDurationFix) {
        needFixPeriodsSelectedDate.concat(range(
          head(closestEnablePeriods.left), period, STEP
        ));
      }
      if (needRightMinDurationFix) {
        needFixPeriodsSelectedDate.concat(range(
          period + STEP, head(closestEnablePeriods.right) + STEP, STEP
        ));
      }

      fixedSelectedSchedule = assign({}, splittedSchedule.selected, {
        periods: setIsForceDisable(splittedSchedule.selected.periods, needFixPeriodsSelectedDate),
      });

      const fixedSchedule = [
        ...fixedLeftDisabledSchedules,
        ...fixedLeftIntermediateSchedules,
        fixedSelectedSchedule,
        ...fixedRightIntermediateSchedules,
        ...fixedRightDisabledSchedules,
      ];

      return dispatch(updateSchedule(id, fixedSchedule, 'set isForceDisable'));
    }

    const recoverSchedule = map(schedule, date => assign({}, date, {
      periods: map(date.periods, period => {
        assign({}, period, { status: omit(period.status, ['isForceDisable']) });
      }),
    }));

    return dispatch(updateSchedule(id, recoverSchedule, 'remove isForceDisable'));
  };
}
