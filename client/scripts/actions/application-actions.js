import moment from 'moment-timezone';

import { setDisablePeriod, removeAllFirstSchedules } from './schedule-actions';

import { periodToTime, MOMENT_FORMAT } from '../../../common/utils/date-helper';
import { LAST_PERIOD } from '../../../common/utils/schedule-helper';

export const SET_CURRENT_DATE = 'SET_CURRENT_DATE';
export const SET_CURRENT_PERIOD = 'SET_CURRENT_PERIOD';
export const SET_SOCKET_ID = 'SET_SOCKET_ID';

export const SET_DEVICE = 'SET_DEVICE';
export const CHANGE_VIEWPORT = 'CHANGE_VIEWPORT';

/**
 * Set reference date for application
 * @param {String} date
 * @return {Function} - thunk action
 * */
export function setCurrentDate(date) {
  return {
    type: SET_CURRENT_DATE,
    payload: {
      date,
    },
  };
}

/**
 * Set reference period for application
 * @param {Number} period
 * @return {Function} - thunk action
 * */
export function setCurrentPeriod(period) {
  return {
    type: SET_CURRENT_PERIOD,
    payload: {
      period,
    },
  };
}

/**
 * Init global reference date and period for application, use reference datetime from server
 * @param {String} datetime
 * @return {Function} - thunk action
 * */
export function initGlobalCurrentDateAndPeriod(datetime) {
  return (dispatch, getState) => {
    const state = getState();

    if (state.application.get('date') && state.application.get('period')) {
      return false;
    }

    const currentMoment = moment(datetime);
    const currentDate = currentMoment.format(MOMENT_FORMAT);
    const currentHour = currentMoment.format('HH');
    const currentMinutes = currentMoment.format('mm');
    const currentPeriod = ((currentHour * 2) + (currentMinutes >= 30 ? 1 : 0)) * 3;

    dispatch(setCurrentDate(currentDate));
    return dispatch(setCurrentPeriod(currentPeriod));
  };
}

/**
 * change global date and period depending on the cityId, or just change move current period
 * to new period each X time.
 * @param {String|undefined} cityId - city id
 * return {void}
 * */
export function changeGlobalCurrentDateAndPeriod(cityId) {
  return (dispatch, getState) => {
    const state = getState();

    const currentDate = state.application.get('date');
    const currentPeriod = state.application.get('period');

    if (cityId) {
      const cities = state.city.get('cities');
      const currentCity = cities.find(city => city.get('id') === cityId);
      const timezone = currentCity.get('timezone');

      const currentTime = periodToTime(currentPeriod);
      const currentDatetime = new Date(`${currentDate} ${currentTime}:00`);
      const currentMomentDatetimeOffset = moment(currentDatetime).tz(timezone);

      const newDate = currentMomentDatetimeOffset.format(MOMENT_FORMAT);
      const newHour = currentMomentDatetimeOffset.format('HH');
      const newMinutes = currentMomentDatetimeOffset.format('mm');
      const newPeriod = ((newHour * 2) + (newMinutes >= 30 ? 1 : 0)) * 3;

      dispatch(setCurrentDate(newDate));
      return dispatch(setCurrentPeriod(newPeriod));
    }

    const newPeriod = currentPeriod === LAST_PERIOD ? 0 : currentPeriod + 3;
    const newDate = currentPeriod === LAST_PERIOD ?
      moment(currentDate).add(1, 'days').format(MOMENT_FORMAT) : currentDate;

    if (currentPeriod === LAST_PERIOD) dispatch(removeAllFirstSchedules());

    dispatch(setCurrentDate(newDate));
    dispatch(setCurrentPeriod(newPeriod));

    return dispatch(setDisablePeriod(newDate, newPeriod));
  };
}


/**
 * set device viewport
 * @param {Object} viewport - height, width
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function changeViewport(viewport) {
  return {
    type: CHANGE_VIEWPORT,
    payload: {
      viewport,
    },
  };
}


/**
 * set device
 * @param {String} device - device
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function setDevice(device) {
  return {
    type: SET_DEVICE,
    payload: {
      device,
    },
  };
}
