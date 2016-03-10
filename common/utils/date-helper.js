import moment from 'moment';

const MOMENT_FORMAT = 'YYYY-MM-DD';

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