import { isInteger, toInteger } from 'lodash';
import moment from 'moment-timezone';

export const MOMENT_FORMAT = 'YYYY-MM-DD';

const LAST_PERIOD = 144;

/**
 * Returns all dates between start and end.
 * @param {String} start - start of date interval
 * @param {String} end - end of date interval
 * @return {Array.<String>}
 * */
export function datesRange(start, end) {
	let datesRange = [];

	start = moment.isMoment(start) ?
		start.format(MOMENT_FORMAT) : moment(start).format(MOMENT_FORMAT);
	end = moment.isMoment(end) ?
		end.add(1, 'days').format(MOMENT_FORMAT) : moment(end).add(1, 'days').format(MOMENT_FORMAT);

	if (moment(start).isAfter(end)) return [];

	while (start !== end) {
		datesRange.push(moment(start).format(MOMENT_FORMAT));
		start = moment(start).add(1, 'days').format(MOMENT_FORMAT);
	}

	return datesRange;
}

/**
 * isSame of moment, just check type of dates
 * @param {Object|String} start - start date
 * @param {Object|String} end - end date
 * @return {Boolean}
 * */
export function isSameDate(start, end) {
	start = moment.isMoment(start) ? start.format(MOMENT_FORMAT) : moment(start).format(MOMENT_FORMAT);
	end = moment.isMoment(end) ? end.format(MOMENT_FORMAT) : moment(end).format(MOMENT_FORMAT);

	return moment(start).isSame(end);
}

export function timeToPeriod(time) {
	const currentHour = moment(time).format('HH');
	const currentMinutes = moment(time).format('mm');
	return (currentHour * 2 + (currentMinutes >= 30 ? 1 : 0)) * 3;
}

export function periodToTime(period) {
	const rate = period * 24 / LAST_PERIOD;

	if (isInteger(rate)) {
		const time = rate < 10 ? `0${rate}` : `${rate}`;
		return `${time}:00`;
	}

	const fixedRate = toInteger(rate);
	const time = fixedRate < 10 ? `0${fixedRate}` : `${fixedRate}`;

	return `${time}:30`;
}

/**
 * getCityDateAndPeriod - get current date and period for city timezone excluding browser user time and etc.
 * @param {String} serverTime - current server time
 * @param {String} timezone - timezone
 * @return {Object} result
 * @return {String} result.date
 * @return {Number} result.period
 * */
export function getCityDateAndPeriod(serverTime, timezone) {
	const currentMoment = moment(serverTime);
	const currentDate = currentMoment.format(MOMENT_FORMAT);
	const currentHour = currentMoment.format('HH');
	const currentMinutes = currentMoment.format('mm');
	const currentPeriod = (currentHour * 2 + (currentMinutes >= 30 ? 1 : 0)) * 3;

	const currentTime = periodToTime(currentPeriod);
	const currentDatetime = new Date(`${currentDate} ${currentTime}:00`);
	const currentMomentDatetimeOffset = moment(currentDatetime).tz(timezone);

	const newDate = currentMomentDatetimeOffset.format(MOMENT_FORMAT);
	const newHour = currentMomentDatetimeOffset.format('HH');
	const newMinutes = currentMomentDatetimeOffset.format('mm');
	const newPeriod = (newHour * 2 + (newMinutes >= 30 ? 1 : 0)) * 3;

	return { date: newDate, period: newPeriod };
}