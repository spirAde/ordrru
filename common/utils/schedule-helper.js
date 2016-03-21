import util from 'util';
import moment from 'moment';

import { range, filter, map, has, difference, head, last, takeWhile, takeRightWhile,
	assign, slice, indexOf, findIndex, min, max, includes, reduce, merge, intersection, isEmpty } from 'lodash';
import { datesRange, isSameDate } from './date-helper';

const FIRST_PERIOD = 0;
const LAST_PERIOD = 144;
const STEP = 3;

/**
 * Use for server and client
 * */

/**
 * Split order interval on periods.
 * @param {Object} order - order
 * @param {String} order.startDate - start date of order
 * @param {String} order.endDate - end date of order
 * @param {Number} order.startPeriod - start period of order
 * @param {Number} order.endPeriod - end period of order
 * @param {Number} step - step interval between periods
 * @return {Array.<Object>}
 * */
export function splitOrderByDatesAndPeriods(order, step) {
	if (!has(order, 'startDate') || !has(order, 'endDate') || !has(order, 'startPeriod') || !has(order, 'endPeriod')) {
		throw new Error('incorrect data of order');
	}

	const dates = datesRange(order.startDate, order.endDate);

	return map(dates, date => {
		if (isSameDate(order.startDate, order.endDate)) {
			return { date, periods: range(order.startPeriod, order.endPeriod + step, step) };
		} else {
			if (isSameDate(date, dates[0])) {
				return { date, periods: range(order.startPeriod, LAST_PERIOD + step, step) };
			} else if (isSameDate(date, last(dates))) {
				return { date, periods: range(FIRST_PERIOD, order.endPeriod + step, step) };
			} else {
				return { date, periods: range(FIRST_PERIOD, LAST_PERIOD + step, step) };
			}
		}
	});
}

/**
 * Check intersection new order and current schedule. Returns true if valid.
 * @param {Array.<Object>} schedule - current schedule
 * @param {Array.<Number>} order - order periods
 * @return {Boolean} - valid or not
 * */
export function checkSchedulesIntersection(schedule, order) {
	const freeSchedulePeriods = map(
		filter(schedule, period => period.enable),
		period => parseInt(period.period, 10)
	);

	return !difference(order, freeSchedulePeriods).length;
}

/**
 * Recalculate schedule after creating order
 * @param {Array.<Object>} schedule
 * @param {Array.<Number>} order - order periods
 * @param {Number} minDuration - minimal order duration
 * */
export function recalculateSchedule(schedule, order, minDuration) {

	const allSchedulePeriods = map(schedule, period => parseInt(period.period, 10));

	const busyPeriods = map(
		filter(schedule, { enable: false }),
		period => parseInt(period.period, 10)
	);

	const start = head(order);
	const end = last(order);

	const startIndex = indexOf(allSchedulePeriods, start);
	const endIndex = indexOf(allSchedulePeriods, end);

	const leftChunkSchedule = slice(schedule, 0, startIndex);
	const rightChunkSchedule = slice(schedule, endIndex + 1);

	const closestLeftPeriods = map(takeRightWhile(leftChunkSchedule, 'enable'), 'period');
	const closestRightPeriods = map(takeWhile(rightChunkSchedule, 'enable'), 'period');

	const needLeftFix = closestLeftPeriods.length && closestLeftPeriods.length < minDuration - 1 &&
		head(closestLeftPeriods) !== FIRST_PERIOD;
	const needRightFix = closestRightPeriods.length && closestRightPeriods.length < minDuration - 1 &&
		last(closestRightPeriods) !== LAST_PERIOD;

	const leftFix = needLeftFix ? closestLeftPeriods : [];
	const rightFix = needRightFix ? closestRightPeriods : [];

	const fixedSchedule = [
		...leftFix,
		...order,
		...rightFix,
	];

	return map(allSchedulePeriods, period => {
		return {
			enable: !includes(fixedSchedule, period) && !includes(busyPeriods, period),
			period: period,
		}
	});
}

/**
 * Fix neighboring schedules. It means, that if previous schedule has last disable period 141,
 * and next schedule has first disable period 3, then subtract between them will be 6, and for example minDuration = 9
 * Then make period 144 and 0 disabled(enable = false)
 * @param {Array.<Object>} prev - previous schedule
 * @param {Array.<Object>} next - next schedule
 * @param {Number} minDuration - minimal order duration
 * @return {Array.<Object>}
 * */
export function fixNeighboringSchedules(prev, next, minDuration) {

	if (isEmpty(prev)) throw new Error('previous schedule is empty');
	if (isEmpty(next)) throw new Error('next schedule is empty');

	const lastEnablePeriods = takeRightWhile(prev, { enable: true });
	const firstEnablePeriods = takeWhile(next, { enable: true });

	const between = [...lastEnablePeriods, ...firstEnablePeriods];

	if (!between.length || between.length > minDuration - 1) return { prev, next };

	const fixedPrev = map(lastEnablePeriods, period => {
		return {
			enable: false,
			period: period.period,
		}
	});

	const fixedNext = map(firstEnablePeriods, period => {
		return {
			enable: false,
			period: period.period,
		}
	});

	return {
		prev: mergeSchedules(prev, fixedPrev),
		next: mergeSchedules(next, fixedNext),
	}
}

/**
 * Merge schedules(see lodash/merge). Second schedule overwrite first.
 * Second schedule maybe a part.
 * @param {Array.<Object>} first - first schedule will be overwriting
 * @param {Array.<Object>} second - second schedule
 * @returns {Array.<Object>} merged schedule
 * */
export function mergeSchedules(first, second) {
	if (isEmpty(first)) throw new Error('first schedule is empty');
	if (isEmpty(second)) return first;

	if (first.length === second.length) return merge(first, second);

	const startIndex = findIndex(first, period => period.period === head(second).period);
	const endIndex = findIndex(first, period => period.period === last(second).period);

	const changedSecond = [
		...slice(first, 0, startIndex),
		...second,
		...slice(first, endIndex + 1)
	];

	return merge(first, changedSecond);
}

/**
 * calculate sum of datetime order, i.e. sum of every hour of order
 * @param {Object} order
 * @param {String} order.startDate - start date of order
 * @param {Number} order.startPeriod - start period of order
 * @param {String} order.endDate - end date of order
 * @param {Number} order.endPeriod - end period of order
 * @param {Array.<Array>} prices - prices splitted by day(index of week, 0 - Sunday),
 * 	and nested arrays split by period interval with price
 * @returns {Number} sum - sum of order
 * */
export function calculateDatetimeOrderSum(order, prices) {
	const splittedOrder = splitOrderByDatesAndPeriods(order, 3);

	return reduce(splittedOrder, (sum, chunk) => {
		const dayIndex = moment(chunk.date).day();
		const dayPrices = prices[dayIndex];

		return sum + reduce(dayPrices, (sum, curr) => {
				const currPeriods = range(curr.startPeriod, curr.endPeriod + 3, 3);
				const intersect = intersection(currPeriods, chunk.periods);
				return intersect.length ? sum + ((intersect.length - 1) * curr.price) / 2 : sum;
			}, 0);
	}, 0);
}

/**
 * Fix endpoints periods for each order in schedule.
 * example: schedule(disable periods) - [12, 15, 18, 21, 33, 36, 39, 42, 45], after use fixOrderEndpoints result
 * will be: [15, 18, 36, 39, 42]
 * @param {Array.<Object>} schedule
 * @return {Array.<Object>} new schedule
 * */
export function fixOrderEndpoints(schedule) {
	const busyPeriods = map(
		filter(schedule, { enable: false }),
		period => parseInt(period.period, 10)
	);

	if (!busyPeriods.length) return schedule;

	const fixedPeriods = filter(busyPeriods, (period, index) => {
		if (period && period !== LAST_PERIOD) {
			if (index === 0 || index === busyPeriods.length - 1) return period;
			if (busyPeriods[index + 1] !== period + STEP) return period;
			if (busyPeriods[index - 1] !== period - STEP) return period;
		}
	});

	return map(schedule, period => {
		return includes(fixedPeriods, period.period) ? { period: period.period, enable: true } : period;
	});
}

/**
 * deep console.log for schedule, open period level
 * @param {Any} data
 * @returns void
 * */
export function clog(data) {
	console.log(util.inspect(data, false, null));
}