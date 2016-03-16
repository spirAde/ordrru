import util from 'util';
import moment from 'moment';

import { range, filter, map, has, difference, head, last, takeWhile, takeRightWhile,
	assign, slice, indexOf, min, max, includes, reduce, intersection } from 'lodash';
import { datesRange, isSameDate } from './date-helper';

const FIRST_PERIOD = 0;
const LAST_PERIOD = 144;

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
export function recalculateSchedule(schedule, order, minDuration, step) {

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
export function fixNeighboringSchedules(prev, next, minDuration, step) {
	const lastEnablePeriods = prev ? takeRightWhile(prev, { enable: false }) : [];
	const firstEnablePeriods = next ? takeWhile(next, { enable: false }) : [];

	const between = [...lastEnablePeriods, ...firstEnablePeriods];

	if (between.length > minDuration * step) return { prev, next };

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
		prev: prev ? mergeSchedules(prev, fixedPrev) : [],
		next: next ? mergeSchedules(next, fixedNext) : [],
	}
}

/**
 * Merge schedules, second may be part of schedule. Second schedule rewrite first.
 * @param {Array.<Object>} first - first schedule
 * @param {Array.<Object>} second - second schedule
 * @param {Boolean} afterCreating - after creating or after deleting order
 * */
export function mergeSchedules(first, second, afterCreating = true) {

	if (!first.length) {
		throw new Error('don\'t merge schedules, because first is empty');
	} else if (!second.length) {
		return first;
	}

	return first.map((period, index) => {
		let enable = false;

		if (includes(second, period.period)) {
			if (afterCreating) {
				enable = period.enable && !second[index].enable ? false : period.enable;
			} else {
				enable = !period.enable && second[index].enable ? true : period.enable;
			}
			return {
				enable,
				period: period.period,
			}
		}

		return period;
	});
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
 * deep console.log for schedule, look period level
 * @param {Any} data
 * @returns void
 * */
export function clog(data) {
	console.log(util.inspect(data, false, null));
}