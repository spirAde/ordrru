import chai from 'chai'

import { map, find, includes, slice, filter, range, assign } from 'lodash';

import { splitOrderByDatesAndPeriods, recalculateSchedule,
	checkSchedulesIntersection, fixNeighboringSchedules, mergeSchedules,
	fixOrderEndpoints, splitScheduleByAvailability, findFirstOrLastDisablePeriod,
	getLeftAndRightClosestEnablePeriods, setIsForceDisable } from '../../../common/utils/schedule-helper';
import { isSameDate, datesRange, MOMENT_FORMAT } from '../../../common/utils/date-helper';

import getSchedule from '../../fixtures/schedule';

const expect = chai.expect;

function generateSchedule(schedule, busyPeriods) {
	return map(schedule, period => {
		return {
			period: period.period,
			enable: !includes(busyPeriods, period.period) && period.enable,
		}
	});
}

function generateSchedules(startDate, endDate) {
	return map(datesRange(startDate, endDate), date => {
		return {
			date,
			periods: getSchedule(),
		}
	});
}

function getSchedulesByDates(schedule, dates) {
	return filter(schedule, row => includes(dates, row.date));
}

describe('schedule helpers', () => {


	describe('checkSchedulesIntersection', () => {

		describe('valid intersection', () => {

			it('empty order', () => {
				const order = [];
				const schedule = getSchedule();

				expect(checkSchedulesIntersection(schedule, order)).to.be.true;
			});

			it('order is full day', () => {
				const schedule = getSchedule();
				const order = map(schedule, period => parseInt(period.period, 10));

				expect(checkSchedulesIntersection(schedule, order)).to.be.true;
			});

			it('schedule is not empty and order is empty', () => {
				const order = [];
				const schedule = getSchedule();
				const orderedSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15]);

				expect(checkSchedulesIntersection(orderedSchedule, order)).to.be.true;
			});

			it('schedule|order are not empty', () => {
				const order = [12, 15, 18, 21, 24, 27];
				const schedule = getSchedule();
				const orderedSchedule = generateSchedule(schedule, [30, 33, 36, 39, 42]);

				expect(checkSchedulesIntersection(orderedSchedule, order)).to.be.true;
			});
		});

		describe('invalid intersection', () => {

			it('check first period', () => {
				const order = [0];
				const schedule = getSchedule();
				const orderedSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12]);

				expect(checkSchedulesIntersection(orderedSchedule, order)).to.be.false;
			});

			it('check last period', () => {
				const order = [144];
				const schedule = getSchedule();
				const orderedSchedule = generateSchedule(schedule, [132, 135, 138, 141, 144]);

				expect(checkSchedulesIntersection(orderedSchedule, order)).to.be.false;
			});

			it('order and schedule has intersection by left period', () => {
				const order = [33, 36, 39, 42, 45, 48];
				const schedule = getSchedule();
				const orderedSchedule = generateSchedule(schedule, [18, 21, 24, 27, 30, 33]);

				expect(checkSchedulesIntersection(orderedSchedule, order)).to.be.false;
			});

			it('order and schedule has intersection by right period', () => {
				const order = [33, 36, 39, 42, 45, 48];
				const schedule = getSchedule();
				const orderedSchedule = generateSchedule(schedule, [48, 51, 54, 57, 60]);

				expect(checkSchedulesIntersection(orderedSchedule, order)).to.be.false;
			});

			it('order and schedule has intersection more then 1 period', () => {
				const order = [33, 36, 39, 42, 45, 48];
				const schedule = getSchedule();
				const orderedSchedule = generateSchedule(schedule, [42, 45, 48, 51, 54, 57, 60]);

				expect(checkSchedulesIntersection(orderedSchedule, order)).to.be.false;
			});
		});
	});


	describe('splitOrderByDatesAndPeriods', () => {

		it('check split order incorrect order', () => {
			const order = {};
			const step = 3;

			const splittedOrder = [];

			expect(splitOrderByDatesAndPeriods.bind(order, step)).to.throw('incorrect data of order');
		});

		it('check split order for 1 day', () => {
			const order = {
				startDate: '2016-03-15',
				startPeriod: 12,
				endDate: '2016-03-15',
				endPeriod: 24,
			};
			const step = 3;

			const splittedOrder = [
				{ date: '2016-03-15', periods: [12, 15, 18, 21, 24] }
			];

			expect(splitOrderByDatesAndPeriods(order, step)).to.deep.equal(splittedOrder);
		});

		it('check split order for 2 day', () => {
			const order = {
				startDate: '2016-03-15',
				startPeriod: 132,
				endDate: '2016-03-16',
				endPeriod: 12,
			};
			const step = 3;

			const splittedOrder = [
				{ date: '2016-03-15', periods: [132, 135, 138, 141, 144] },
				{ date: '2016-03-16', periods: [0, 3, 6, 9, 12] },
			];

			expect(splitOrderByDatesAndPeriods(order, step)).to.deep.equal(splittedOrder);
		});

		it('check split order for 2 day with last period for first date', () => {
			const order = {
				startDate: '2016-03-15',
				startPeriod: 144,
				endDate: '2016-03-16',
				endPeriod: 12,
			};
			const step = 3;

			const splittedOrder = [
				{ date: '2016-03-15', periods: [144] },
				{ date: '2016-03-16', periods: [0, 3, 6, 9, 12] },
			];

			expect(splitOrderByDatesAndPeriods(order, step)).to.deep.equal(splittedOrder);
		});

		it('check split order for 2 day with first period for second date', () => {
			const order = {
				startDate: '2016-03-15',
				startPeriod: 132,
				endDate: '2016-03-16',
				endPeriod: 0,
			};
			const step = 3;

			const splittedOrder = [
				{ date: '2016-03-15', periods: [132, 135, 138, 141, 144] },
				{ date: '2016-03-16', periods: [0] },
			];

			expect(splitOrderByDatesAndPeriods(order, step)).to.deep.equal(splittedOrder);
		});
	});


	describe('recalculateSchedule', () => {

		it('for empty schedule', () => {
			const schedule = getSchedule();
			const order = [132, 135, 138, 141, 144];
			const minDuration = 4;

			const expectedSchedule = generateSchedule(schedule, order);

			expect(recalculateSchedule(schedule, order, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for empty schedule and full day order', () => {
			const schedule = getSchedule();
			const order = map(schedule, period => parseInt(period, 10));
			const minDuration = 4;

			const expectedSchedule = generateSchedule(schedule, order);

			expect(recalculateSchedule(schedule, order, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order left', () => {
			const schedule = getSchedule();
			const existedOrder = [6, 9, 12, 15, 18, 21, 24];
			const minDuration = 4;

			const newOrder = [102, 105, 108, 111, 114, 117];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...existedOrder, ...newOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order right', () => {
			const schedule = getSchedule();
			const existedOrder = [102, 105, 108, 111, 114, 117];
			const minDuration = 4;

			const newOrder = [6, 9, 12, 15, 18, 21, 24];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...newOrder, ...existedOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order left and duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrder = [6, 9, 12, 15, 18, 21];
			const minDuration = 4;

			const newOrder = [30, 33, 36, 39, 42, 45, 48];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...existedOrder, 24, 27, ...newOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order right and duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrder = [30, 33, 36, 39, 42, 45, 48];
			const minDuration = 4;

			const newOrder = [6, 9, 12, 15, 18, 21];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...newOrder, 24, 27, ...existedOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order left and duration equals minimal', () => {

			const schedule = getSchedule();
			const existedOrder = [6, 9, 12, 15, 18, 21];
			const minDuration = 4;

			const newOrder = [33, 36, 39, 42, 45, 48];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...existedOrder, ...newOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order right and duration equals minimal', () => {

			const schedule = getSchedule();
			const existedOrder = [33, 36, 39, 42, 45, 48];
			const minDuration = 4;

			const newOrder = [6, 9, 12, 15, 18, 21];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...newOrder, ...existedOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty and existed order left|right and duration more then minimal', () => {

			const schedule = getSchedule();
			const existedOrderLeft = [33, 36, 39, 42, 45, 48];
			const existedOrderRight = [102, 105, 108, 111, 114];
			const minDuration = 4;

			const newOrder = [63, 66, 69, 72, 75];

			const existedLeftSchedule = generateSchedule(schedule, existedOrderLeft);
			const existedSchedule = generateSchedule(existedLeftSchedule, existedOrderRight);

			const expectedSchedule = generateSchedule(schedule, [...existedOrderLeft, ...newOrder, ...existedOrderRight]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty and existed order left|right and left duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrderLeft = [33, 36, 39, 42, 45, 48, 51];
			const existedOrderRight = [102, 105, 108, 111, 114];
			const minDuration = 4;

			const newOrder = [60, 63, 66, 69, 72, 75];

			const existedLeftSchedule = generateSchedule(schedule, existedOrderLeft);
			const existedSchedule = generateSchedule(existedLeftSchedule, existedOrderRight);

			const expectedSchedule = generateSchedule(schedule, [...existedOrderLeft, 54, 57, ...newOrder, ...existedOrderRight]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty and existed order left|right and right duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrderLeft = [33, 36, 39, 42, 45, 48];
			const existedOrderRight = [90, 93, 96, 99, 102, 105, 108, 111, 114];
			const minDuration = 4;

			const newOrder = [63, 66, 69, 72, 75, 78, 81];

			const existedLeftSchedule = generateSchedule(schedule, existedOrderLeft);
			const existedSchedule = generateSchedule(existedLeftSchedule, existedOrderRight);

			const expectedSchedule = generateSchedule(schedule, [...existedOrderLeft, ...newOrder, 84, 87, ...existedOrderRight]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});

		it('for not empty and existed order left|right and left|right duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrderLeft = [33, 36, 39, 42, 45, 48];
			const existedOrderRight = [90, 93, 96, 99, 102, 105, 108, 111, 114];
			const minDuration = 4;

			const newOrder = [57, 60, 63, 66, 69, 72, 75, 78, 81];

			const existedLeftSchedule = generateSchedule(schedule, existedOrderLeft);
			const existedSchedule = generateSchedule(existedLeftSchedule, existedOrderRight);

			const expectedSchedule = generateSchedule(schedule, [...existedOrderLeft, 51, 54, ...newOrder, 84, 87, ...existedOrderRight]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration)).to.deep.equal(expectedSchedule);
		});
	});


	describe('mergeSchedules', () => {

		it('first schedule is empty', () => {
			const firstSchedule = [];
			const secondSchedule = getSchedule();

			expect(mergeSchedules.bind(this, firstSchedule, secondSchedule)).to.throw('irst schedule is empty');
		});

		it('second schedule is empty', () => {
			const schedule = getSchedule();
			const firstSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12]);
			const secondSchedule = [];

			const expectedSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12]);

			expect(mergeSchedules(firstSchedule, secondSchedule)).to.deep.equal(expectedSchedule);
		});

		it('first and second schedules has same length', () => {
			const schedule = getSchedule();
			const firstSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12]);
			const secondSchedule = generateSchedule(schedule, [9, 12, 15, 18, 21]);

			const expectedSchedule = generateSchedule(schedule, [9, 12, 15, 18, 21]);

			expect(mergeSchedules(firstSchedule, secondSchedule)).to.deep.equal(expectedSchedule);
		});

		it('second schedule has a part(right only) of schedule not intersection with orders in first schedule', () => {
			const schedule = getSchedule();
			const firstSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15]);
			const secondSchedule = generateSchedule(schedule, [120, 123, 126, 129, 132]);
			const secondChunkSchedule = slice(secondSchedule, 30);

			const expectedSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15, 120, 123, 126, 129, 132]);

			expect(mergeSchedules(firstSchedule, secondChunkSchedule)).to.deep.equal(expectedSchedule);
		});

		it('second schedule has a part(right only) of schedule with intersection orders in first schedule', () => {
			const schedule = getSchedule();
			const firstSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15]);
			const secondSchedule = generateSchedule(schedule, [120, 123, 126, 129, 132]);
			const secondChunkSchedule = slice(secondSchedule, 3);

			const expectedSchedule = generateSchedule(schedule, [0, 3, 6, 120, 123, 126, 129, 132]);

			expect(mergeSchedules(firstSchedule, secondChunkSchedule)).to.deep.equal(expectedSchedule);
		});

		it('second schedule has a part(both sides) of schedule not intersection with orders in first schedule', () => {
			const schedule = getSchedule();
			const firstSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15]);
			const secondSchedule = generateSchedule(schedule, [120, 123, 126, 129, 132]);
			const secondChunkSchedule = slice(secondSchedule, 30, 43);

			const expectedSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15, 120, 123, 126]);

			expect(mergeSchedules(firstSchedule, secondChunkSchedule)).to.deep.equal(expectedSchedule);
		});
	});

	describe('fixNeighboringSchedules', () => {

		it('prev schedule is empty', () => {
			const prevSchedule = [];
			const nextSchedule = getSchedule();
			const minDuration = 4;
			const step = 3;

			expect(fixNeighboringSchedules.bind(this, prevSchedule, nextSchedule, minDuration, step)).to.throw('previous schedule is empty');
		});

		it('next schedule is empty', () => {
			const prevSchedule = getSchedule();
			const nextSchedule = [];
			const minDuration = 4;
			const step = 3;

			expect(fixNeighboringSchedules.bind(this, prevSchedule, nextSchedule, minDuration, step)).to.throw('next schedule is empty');
		});

		it('difference between prev and next more then minimal duration', () => {
			const schedule = getSchedule();
			const prevSchedule = generateSchedule(schedule, [123, 126, 129, 132]);
			const nextSchedule = generateSchedule(schedule, [12, 15, 18, 21, 24]);
			const minDuration = 4;

			const expectedSchedules = {
				prev: prevSchedule,
				next: nextSchedule,
			};

			expect(fixNeighboringSchedules(prevSchedule, nextSchedule, minDuration)).to.deep.equal(expectedSchedules);
		});

		it('difference between prev and next equals minimal duration', () => {
			const schedule = getSchedule();
			const prevSchedule = generateSchedule(schedule, [123, 126, 129, 132, 135, 138]);
			const nextSchedule = generateSchedule(schedule, [6, 9, 12, 15, 18, 21, 24]);
			const minDuration = 4;

			const expectedSchedules = {
				prev: prevSchedule,
				next: nextSchedule,
			};

			expect(fixNeighboringSchedules(prevSchedule, nextSchedule, minDuration)).to.deep.equal(expectedSchedules);
		});

		it('last period disable for prev schedule, and first period disable for next schedule', () => {
			const schedule = getSchedule();
			const prevSchedule = generateSchedule(schedule, [123, 126, 129, 132, 135, 138, 141, 144]);
			const nextSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15, 18, 21, 24]);
			const minDuration = 4;

			const expectedSchedules = {
				prev: prevSchedule,
				next: nextSchedule,
			};

			expect(fixNeighboringSchedules(prevSchedule, nextSchedule, minDuration)).to.deep.equal(expectedSchedules);
		});

		it('difference between prev and next less then minimal duration, and first period of next schedule is disable ', () => {
			const schedule = getSchedule();
			const prevSchedule = generateSchedule(schedule, [123, 126, 129, 132, 135, 138]);
			const nextSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15, 18, 21, 24]);
			const minDuration = 4;

			const expectedSchedules = {
				prev: generateSchedule(schedule, [123, 126, 129, 132, 135, 138, 141, 144]),
				next: nextSchedule,
			};

			expect(fixNeighboringSchedules(prevSchedule, nextSchedule, minDuration)).to.deep.equal(expectedSchedules);
		});

		it('difference between prev and next less then minimal duration, and last period of prev schedule is disable', () => {
			const schedule = getSchedule();
			const prevSchedule = generateSchedule(schedule, [123, 126, 129, 132, 135, 138, 141, 144]);
			const nextSchedule = generateSchedule(schedule, [9, 12, 15, 18, 21, 24]);
			const minDuration = 4;

			const expectedSchedules = {
				prev: prevSchedule,
				next: generateSchedule(schedule, [0, 3, 6, 9, 12, 15, 18, 21, 24]),
			};

			expect(fixNeighboringSchedules(prevSchedule, nextSchedule, minDuration)).to.deep.equal(expectedSchedules);
		});

		it('difference between prev and next less then minimal duration', () => {
			const schedule = getSchedule();
			const prevSchedule = generateSchedule(schedule, [123, 126, 129, 132, 135, 138]);
			const nextSchedule = generateSchedule(schedule, [6, 9, 12, 15, 18, 21, 24]);
			const minDuration = 6;

			const expectedSchedules = {
				prev: generateSchedule(schedule, [123, 126, 129, 132, 135, 138, 141, 144]),
				next: generateSchedule(schedule, [0, 3, 6, 9, 12, 15, 18, 21, 24]),
			};

			expect(fixNeighboringSchedules(prevSchedule, nextSchedule, minDuration)).to.deep.equal(expectedSchedules);
		});
	});


	describe('fixOrderEndpoints', () => {

		it('for empty schedule', () => {
			const schedule = getSchedule();

			const expectedSchedule = getSchedule();

			expect(fixOrderEndpoints(schedule)).to.deep.equal(expectedSchedule);
		});

		it('for full day order', () => {
			const schedule = getSchedule();
			const order = map(schedule, period => parseInt(period, 10));
			const orderedSchedule = generateSchedule(schedule, order);

			const expectedSchedule = generateSchedule(schedule, order);

			expect(fixOrderEndpoints(orderedSchedule)).to.deep.equal(expectedSchedule);
		});

		it('for one order in start of schedule', () => {
			const schedule = getSchedule();
			const orderedSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12, 15]);

			const expectedSchedule = generateSchedule(schedule, [0, 3, 6, 9, 12]);

			expect(fixOrderEndpoints(orderedSchedule)).to.deep.equal(expectedSchedule);
		});

		it('for one order in the end of schedule', () => {
			const schedule = getSchedule();
			const orderedSchedule = generateSchedule(schedule, [132, 135, 138, 141, 144]);

			const expectedSchedule = generateSchedule(schedule, [135, 138, 141, 144]);

			expect(fixOrderEndpoints(orderedSchedule)).to.deep.equal(expectedSchedule);
		});

		it('for one order in not start or end of schedule', () => {
			const schedule = getSchedule();
			const orderedSchedule = generateSchedule(schedule, [81, 84, 87, 90, 93, 96]);

			const expectedSchedule = generateSchedule(schedule, [84, 87, 90, 93]);

			expect(fixOrderEndpoints(orderedSchedule)).to.deep.equal(expectedSchedule);
		});

		it('for few orders', () => {
			const schedule = getSchedule();
			const orderedSchedule = generateSchedule(schedule, [12, 15, 18, 21, 24, 81, 84, 87, 90, 93, 96, 123, 126, 129, 132, 135]);

			const expectedSchedule = generateSchedule(schedule, [15, 18, 21, 84, 87, 90, 93, 126, 129, 132]);

			expect(fixOrderEndpoints(orderedSchedule)).to.deep.equal(expectedSchedule);
		});
	});


	describe('splitScheduleByAvailability', () => {

		it('selected date is first date of schedules and maxOrderDuration = 1', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-01';
			const maxOrderDuration = 1;

			const expectedSchedule = {
				unavailable: {
					left: [],
					right: getSchedulesByDates(schedules, datesRange('2016-01-03', endDate)),
				},
				available: {
					left: [],
					right: getSchedulesByDates(schedules, ['2016-01-02']),
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date is first date of schedules and maxOrderDuration = 2', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-01';
			const maxOrderDuration = 2;

			const expectedSchedule = {
				unavailable: {
					left: [],
					right: getSchedulesByDates(schedules, datesRange('2016-01-04', endDate)),
				},
				available: {
					left: [],
					right: getSchedulesByDates(schedules, ['2016-01-02', '2016-01-03']),
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date is second date of schedules and maxOrderDuration = 1', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-02';
			const maxOrderDuration = 1;

			const expectedSchedule = {
				unavailable: {
					left: [],
					right: getSchedulesByDates(schedules, datesRange('2016-01-04', endDate)),
				},
				available: {
					left: getSchedulesByDates(schedules, ['2016-01-01']),
					right: getSchedulesByDates(schedules, ['2016-01-03']),
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date is second date of schedules and maxOrderDuration = 2', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-02';
			const maxOrderDuration = 2;

			const expectedSchedule = {
				unavailable: {
					left: [],
					right: getSchedulesByDates(schedules, datesRange('2016-01-05', endDate)),
				},
				available: {
					left: getSchedulesByDates(schedules, ['2016-01-01']),
					right: getSchedulesByDates(schedules, ['2016-01-03', '2016-01-04']),
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date in middle position of schedules and maxOrderDuration = 1', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-15';
			const maxOrderDuration = 1;

			const expectedSchedule = {
				unavailable: {
					left: getSchedulesByDates(schedules, datesRange(startDate, '2016-01-13')),
					right: getSchedulesByDates(schedules, datesRange('2016-01-17', endDate)),
				},
				available: {
					left: getSchedulesByDates(schedules, ['2016-01-14']),
					right: getSchedulesByDates(schedules, ['2016-01-16']),
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date in middle position of schedules and maxOrderDuration = 2', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-15';
			const maxOrderDuration = 2;

			const expectedSchedule = {
				unavailable: {
					left: getSchedulesByDates(schedules, datesRange(startDate, '2016-01-12')),
					right: getSchedulesByDates(schedules, datesRange('2016-01-18', endDate)),
				},
				available: {
					left: getSchedulesByDates(schedules, ['2016-01-13', '2016-01-14']),
					right: getSchedulesByDates(schedules, ['2016-01-16', '2016-01-17']),
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date is last date of schedules and maxOrderDuration = 1', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-31';
			const maxOrderDuration = 1;

			const expectedSchedule = {
				unavailable: {
					left: getSchedulesByDates(schedules, datesRange(startDate, '2016-01-29')),
					right: [],
				},
				available: {
					left: getSchedulesByDates(schedules, ['2016-01-30']),
					right: [],
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date is last date of schedules and maxOrderDuration = 2', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-31';
			const maxOrderDuration = 2;

			const expectedSchedule = {
				unavailable: {
					left: getSchedulesByDates(schedules, datesRange(startDate, '2016-01-28')),
					right: [],
				},
				available: {
					left: getSchedulesByDates(schedules, ['2016-01-29', '2016-01-30']),
					right: [],
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date is penultimate date of schedules and maxOrderDuration = 1', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-30';
			const maxOrderDuration = 1;

			const expectedSchedule = {
				unavailable: {
					left: getSchedulesByDates(schedules, datesRange(startDate, '2016-01-28')),
					right: [],
				},
				available: {
					left: getSchedulesByDates(schedules, ['2016-01-29']),
					right: getSchedulesByDates(schedules, ['2016-01-31']),
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});

		it('selected date is penultimate date of schedules and maxOrderDuration = 2', () => {
			const startDate = '2016-01-01';
			const endDate = '2016-01-31';
			const schedules = generateSchedules(startDate, endDate);

			const selectedDate = '2016-01-30';
			const maxOrderDuration = 2;

			const expectedSchedule = {
				unavailable: {
					left: getSchedulesByDates(schedules, datesRange(startDate, '2016-01-27')),
					right: [],
				},
				available: {
					left: getSchedulesByDates(schedules, ['2016-01-28', '2016-01-29']),
					right: getSchedulesByDates(schedules, ['2016-01-31']),
				},
				selected: getSchedulesByDates(schedules, [selectedDate])[0]
			};

			expect(splitScheduleByAvailability(schedules, selectedDate, maxOrderDuration)).to.deep.equal(expectedSchedule);
		});
	});


	describe('getLeftAndRightClosestEnablePeriods', () => {

		describe('clear schedule on both sides', () => {
			it('selected period equals 0', () => {
				const schedule = getSchedule();
				const selectedPeriod = 0;

				const expectedPeriods = {
					left: [],
					right: range(3, 147, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(schedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('selected period equals 3', () => {
				const schedule = getSchedule();
				const selectedPeriod = 3;

				const expectedPeriods = {
					left: [0],
					right: range(6, 147, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(schedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('selected period equals 99', () => {
				const schedule = getSchedule();
				const selectedPeriod = 99;

				const expectedPeriods = {
					left: range(0, 99, 3),
					right: range(102, 147, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(schedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('selected period equals last period', () => {
				const schedule = getSchedule();
				const selectedPeriod = 144;

				const expectedPeriods = {
					left: range(0, 144, 3),
					right: [],
				};

				expect(getLeftAndRightClosestEnablePeriods(schedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('selected period equals penultimate period', () => {
				const schedule = getSchedule();
				const selectedPeriod = 141;

				const expectedPeriods = {
					left: range(0, 141, 3),
					right: [144],
				};

				expect(getLeftAndRightClosestEnablePeriods(schedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});
		});

		describe('schedule has left order and right part is clear', () => {

			it('order is at beginning and the selected period is followed', () => {
				const schedule = getSchedule();
				const selectedPeriod = 15;
				const order = [0, 3, 6, 9, 12];
				const orderedSchedule = generateSchedule(schedule, order);

				const expectedPeriods = {
					left: [],
					right: range(18, 147, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('order is at beginning and the selected period is not followed', () => {
				const schedule = getSchedule();
				const selectedPeriod = 33;
				const order = [0, 3, 6, 9, 12];
				const orderedSchedule = generateSchedule(schedule, order);

				const expectedPeriods = {
					left: range(15, 33, 3),
					right: range(36, 147, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('order is not at beginning and the selected period is followed', () => {
				const schedule = getSchedule();
				const selectedPeriod = 33;
				const order = [15, 18, 21, 24, 27, 30];
				const orderedSchedule = generateSchedule(schedule, order);

				const expectedPeriods = {
					left: [],
					right: range(36, 147, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('order is not at beginning and the selected period is not followed', () => {
				const schedule = getSchedule();
				const selectedPeriod = 45;
				const order = [15, 18, 21, 24, 27, 30];
				const orderedSchedule = generateSchedule(schedule, order);

				const expectedPeriods = {
					left: range(33, 45, 3),
					right: range(48, 147, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});
		});

		describe('schedule has right order and left part is clear', () => {

			it('order is at the end and the selected period is facing', () => {
				const schedule = getSchedule();
				const selectedPeriod = 126;
				const order = [129, 132, 135, 138, 141, 144];
				const orderedSchedule = generateSchedule(schedule, order);

				const expectedPeriods = {
					left: range(0, 126, 3),
					right: [],
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('order is at the end and the selected period is not facing', () => {
				const schedule = getSchedule();
				const selectedPeriod = 102;
				const order = [129, 132, 135, 138, 141, 144];
				const orderedSchedule = generateSchedule(schedule, order);

				const expectedPeriods = {
					left: range(0, 102, 3),
					right: range(105, 129, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('order is not at the end and the selected period is facing', () => {
				const schedule = getSchedule();
				const selectedPeriod = 117;
				const order = [120, 123, 126, 129, 132, 135];
				const orderedSchedule = generateSchedule(schedule, order);

				const expectedPeriods = {
					left: range(0, 117, 3),
					right: [],
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});

			it('order is not at the end and the selected period is not facing', () => {
				const schedule = getSchedule();
				const selectedPeriod = 102;
				const order = [120, 123, 126, 129, 132, 135];
				const orderedSchedule = generateSchedule(schedule, order);

				const expectedPeriods = {
					left: range(0, 102, 3),
					right: range(105, 120, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});
		});

		describe('orders on both sides', () => {
			
			it('new order between', () => {
				const schedule = getSchedule();
				const selectedPeriod = 87;
				const leftOrder = [12, 15, 18, 21, 24, 27];
				const rightOrder = [120, 123, 126, 129, 132, 135];
				const orderedSchedule = generateSchedule(schedule, [...leftOrder, ...rightOrder]);

				const expectedPeriods = {
					left: range(30, 87, 3),
					right: range(90, 120, 3),
				};

				expect(getLeftAndRightClosestEnablePeriods(orderedSchedule, selectedPeriod)).to.deep.equal(expectedPeriods);
			});
		});
	});


	describe('findFirstOrLastDisablePeriod', () => {

		describe('find last period for left part', () => {

			it('for empty schedules', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-03');

				const expectedIndex = null;

				expect(findFirstOrLastDisablePeriod(schedules, 'left')).to.be.null;
			});

			it('one order in first date', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-03');
				const schedule = getSchedule();
				const order = [0, 3, 6, 9, 12, 15];
				schedules[0].periods = generateSchedule(schedule, order);

				const expectedIndex = {
					dateIndex: 0,
					periodIndex: 5,
				};

				expect(findFirstOrLastDisablePeriod(schedules, 'left')).to.deep.equal(expectedIndex);
			});

			it('one order in last date', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-03');
				const schedule = getSchedule();
				const order = [0, 3, 6, 9, 12, 15];
				schedules[2].periods = generateSchedule(schedule, order);

				const expectedIndex = {
					dateIndex: 2,
					periodIndex: 5,
				};

				expect(findFirstOrLastDisablePeriod(schedules, 'left')).to.deep.equal(expectedIndex);
			});

			it('few orders', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-03');
				const schedule = getSchedule();
				const firstOrder = [0, 3, 6, 9, 12, 15];
				const secondOrder = [48, 51, 54, 57, 60, 63];
				schedules[1].periods = generateSchedule(schedule, firstOrder);
				schedules[2].periods = generateSchedule(schedule, secondOrder);

				const expectedIndex = {
					dateIndex: 2,
					periodIndex: 21,
				};

				expect(findFirstOrLastDisablePeriod(schedules, 'left')).to.deep.equal(expectedIndex);
			});
		});

		describe('find first period for right part', () => {

			it('for empty schedules', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-07');

				const expectedIndex = null;

				expect(findFirstOrLastDisablePeriod(schedules, 'right')).to.be.null;
			});

			it('one order in first date', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-07');
				const schedule = getSchedule();
				const order = [0, 3, 6, 9, 12, 15];
				schedules[0].periods = generateSchedule(schedule, order);

				const expectedIndex = {
					dateIndex: 0,
					periodIndex: 0,
				};

				expect(findFirstOrLastDisablePeriod(schedules, 'right')).to.deep.equal(expectedIndex);
			});

			it('one order in last date', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-07');
				const schedule = getSchedule();
				const order = [0, 3, 6, 9, 12, 15];
				schedules[2].periods = generateSchedule(schedule, order);

				const expectedIndex = {
					dateIndex: 2,
					periodIndex: 0,
				};

				expect(findFirstOrLastDisablePeriod(schedules, 'right')).to.deep.equal(expectedIndex);
			});

			it('few orders', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-07');
				const schedule = getSchedule();
				const firstOrder = [48, 51, 54, 57, 60, 63];
				const secondOrder = [0, 3, 6, 9, 12, 15];
				schedules[1].periods = generateSchedule(schedule, firstOrder);
				schedules[2].periods = generateSchedule(schedule, secondOrder);

				const expectedIndex = {
					dateIndex: 1,
					periodIndex: 16,
				};

				expect(findFirstOrLastDisablePeriod(schedules, 'right')).to.deep.equal(expectedIndex);
			});
		});
	});
});