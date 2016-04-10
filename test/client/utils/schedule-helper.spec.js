import chai from 'chai'

import { map, find, includes, slice, filter, range, assign } from 'lodash';

import { splitOrderByDatesAndPeriods, recalculateSchedule,
	checkSchedulesIntersection, fixNeighboringSchedules, mergeSchedules,
	fixOrderEndpoints, splitScheduleByAvailability, findFirstOrLastDisablePeriod,
	getLeftAndRightClosestEnablePeriods, setIsForceDisable, clog, forceDisableFor,
	setIsForceDisableBatch } from '../../../common/utils/schedule-helper';
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
					direction: 'left',
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
					direction: 'left',
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
					direction: 'left',
				};

				expect(findFirstOrLastDisablePeriod(schedules, 'left')).to.deep.equal(expectedIndex);
			});

			it('order in last date and last has last period in row', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-03');
				const schedule = getSchedule();
				const firstOrder = [0, 3, 6, 9, 12, 15];
				const secondOrder = [126, 129, 132, 135, 138, 141, 144];
				schedules[1].periods = generateSchedule(schedule, firstOrder);
				schedules[2].periods = generateSchedule(schedule, secondOrder);

				const expectedIndex = {
					dateIndex: 2,
					periodIndex: 48,
					direction: 'left',
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
					direction: 'right',
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
					direction: 'right',
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
					direction: 'right',
				};

				expect(findFirstOrLastDisablePeriod(schedules, 'right')).to.deep.equal(expectedIndex);
			});
			
		});
	});


	describe('setIsForceDisable', () => {
		
		it('for empty range', () => {
			const schedule = getSchedule();
			
			const expectedSchedule = map(schedule, period => assign({}, period, { status: { isForceDisable: true } }));

			expect(setIsForceDisable(schedule)).to.deep.equal(expectedSchedule);
		});

		it('range has length equals 1', () => {
			const schedule = getSchedule();
			const disabledPeriods = range(0, 3, 3);
			const expectedSchedule = getSchedule();
			expectedSchedule[0].status = { isForceDisable: true };

			expect(setIsForceDisable(schedule, disabledPeriods)).to.deep.equal(expectedSchedule);
		});

		it('range has length equals max', () => {
			const schedule = getSchedule();
			const disabledPeriods = range(0, 147, 3);

			const expectedSchedule = map(schedule, period => {
				return assign({}, period, { status: { isForceDisable: true } })
			});

			expect(setIsForceDisable(schedule, disabledPeriods)).to.deep.equal(expectedSchedule);
		});

		it('range has length equals more then 1 and less max', () => {
			const schedule = getSchedule();
			const disabledPeriods = range(12, 57, 3);
			const expectedSchedule = map(schedule, period => {
				if (includes(disabledPeriods, period.period)) {
					return assign({}, period, { status: { isForceDisable: true } })
				}

				return period;
			});

			expect(setIsForceDisable(schedule, disabledPeriods)).to.deep.equal(expectedSchedule);
		});
		
	});


	describe('setIsForceDisableBatch', () => {


		it('threshold is empty', () => {
			const schedules = generateSchedules('2016-01-05', '2016-01-06');
			
			const expectedSchedules = map(schedules, schedule => {
				return assign({}, schedule, { periods: map(schedule.periods, period => assign({}, period, { status: { isForceDisable: true } }))});
			});

			expect(setIsForceDisableBatch(schedules)).to.deep.equal(expectedSchedules);
		});


		describe('direction left', () => {
			
			it('threshold is not empty, dateIndex equals 0, periodIndex equals 0', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 0, periodIndex: 0, direction: 'left' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods[0].status = { isForceDisable: true };

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 0, periodIndex equals max', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 0, periodIndex: 48, direction: 'left' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods = setIsForceDisable(expectedSchedules[0].periods, range(0, 49 * 3, 3));

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 0, periodIndex equals not 0 and not max', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 0, periodIndex: 24, direction: 'left' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods = setIsForceDisable(expectedSchedules[0].periods, range(0, 25 * 3, 3));

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 1, periodIndex equals 0', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 1, periodIndex: 0, direction: 'left' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods = setIsForceDisable(expectedSchedules[0].periods);
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods, range(0, 3, 3));

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 1, periodIndex equals max', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 1, periodIndex: 48, direction: 'left' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods = setIsForceDisable(expectedSchedules[0].periods);
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods, range(0, 49 * 3, 3));

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 1, periodIndex not equals max or zero', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 1, periodIndex: 24, direction: 'left' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods = setIsForceDisable(expectedSchedules[0].periods);
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods, range(0, 25 * 3, 3));

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});
			
		});

		describe('direction right', () => {

			it('threshold is not empty, dateIndex equals 0, periodIndex equals 0', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 0, periodIndex: 0, direction: 'right' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods = setIsForceDisable(expectedSchedules[0].periods);
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods);

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 0, periodIndex equals max', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 0, periodIndex: 48, direction: 'right' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods = setIsForceDisable(expectedSchedules[0].periods, [144]);
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods);

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 0, periodIndex equals not 0 and not max', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 0, periodIndex: 24, direction: 'right' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[0].periods = setIsForceDisable(expectedSchedules[0].periods, range(24 * 3, 147, 3));
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods);

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 1, periodIndex equals 0', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 1, periodIndex: 0, direction: 'right' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods);

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 1, periodIndex equals max', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 1, periodIndex: 48, direction: 'right' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods, [144]);

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});

			it('threshold is not empty, dateIndex equals 1, periodIndex not equals max or zero', () => {
				const schedules = generateSchedules('2016-01-05', '2016-01-06');
				const indexes = { dateIndex: 1, periodIndex: 24, direction: 'right' };

				const expectedSchedules = generateSchedules('2016-01-05', '2016-01-06');
				expectedSchedules[1].periods = setIsForceDisable(expectedSchedules[1].periods, range(24 * 3, 147, 3));

				expect(setIsForceDisableBatch(schedules, indexes)).to.deep.equal(expectedSchedules);
			});
			
		});
	});


	describe('forceDisableFor', () => {

		describe('empty schedule', () => {
			
			it('selected date is first and selected period is first too', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-01';
				const period = 0;

				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
				const availableSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
				const unavailableSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03', '2016-01-04', '2016-01-05']);

				availableSchedules[0].periods = setIsForceDisable(availableSchedules[0].periods, range(3, 147, 3));

				const expectedSchedules = [
					...selectedSchedule,
					...availableSchedules,
					...setIsForceDisableBatch(unavailableSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is first and selected period is in the middle', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-01';
				const period = 72;

				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
				const availableSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
				const unavailableSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03', '2016-01-04', '2016-01-05']);

				availableSchedules[0].periods = setIsForceDisable(availableSchedules[0].periods, range(75, 147, 3));

				const expectedSchedules = [
					...selectedSchedule,
					...availableSchedules,
					...setIsForceDisableBatch(unavailableSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is first and selected period is in the end', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-01';
				const period = 144;

				const unavailableLeftSchedules = [];
				const availableLeftSchedules = [];
				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
				const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
				const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03', '2016-01-04', '2016-01-05']);

				const expectedSchedules = [
					...unavailableLeftSchedules,
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableRightSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
		});

			it('selected date is second and selected period is first', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-02';
				const period = 0;

				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
				const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
				const unavailableSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

				availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(3, 147, 3));

				const expectedSchedules = [
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is second and selected period is in the middle', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-02';
				const period = 72;

				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
				const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
				const unavailableSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

				availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 72, 3));
				availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(75, 147, 3));

				const expectedSchedules = [
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is second and selected period is in the end', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-02';
				const period = 144;

				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
				const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
				const unavailableSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

				availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 144, 3));

				const expectedSchedules = [
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is in the middle and selected period is in the middle to', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-03';
				const period = 72;

				const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
				const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
				const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);

				availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 72, 3));
				availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(75, 147, 3));

				const expectedSchedules = [
					...setIsForceDisableBatch(unavailableLeftSchedules),
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableRightSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is penultimate and selected period is first', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-04';
				const period = 0;

				const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
				const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
				const unavailableRightSchedules = [];

				availableRightSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(3, 147, 3));

				const expectedSchedules = [
					...setIsForceDisableBatch(unavailableLeftSchedules),
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableRightSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is penultimate and selected period is in the middle', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-04';
				const period = 72;

				const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
				const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
				const unavailableRightSchedules = [];

				availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 72, 3));
				availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(75, 147, 3));

				const expectedSchedules = [
					...setIsForceDisableBatch(unavailableLeftSchedules),
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...unavailableRightSchedules,
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is penultimate and selected period is in the end', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-04';
				const period = 144;

				const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
				const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
				const unavailableRightSchedules = [];

				availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 144, 3));

				const expectedSchedules = [
					...setIsForceDisableBatch(unavailableLeftSchedules),
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableRightSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is last and selected period is first', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-05';
				const period = 0;

				const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
				const availableRightSchedules = [];
				const unavailableRightSchedules = [];

				const expectedSchedules = [
					...setIsForceDisableBatch(unavailableLeftSchedules),
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableRightSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is last and selected period is in the middle', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-05';
				const period = 72;

				const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
				const availableRightSchedules = [];
				const unavailableRightSchedules = [];

				availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 72, 3));

				const expectedSchedules = [
					...setIsForceDisableBatch(unavailableLeftSchedules),
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableRightSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});

			it('selected date is last and selected period is in the end', () => {
				const schedules = generateSchedules('2016-01-01', '2016-01-05');
				const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
				const minDuration = 4;
				const maxOrderDuration = 1;
				const date = '2016-01-05';
				const period = 144;

				const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
				const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
				const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
				const availableRightSchedules = [];
				const unavailableRightSchedules = [];

				availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 144, 3));

				const expectedSchedules = [
					...setIsForceDisableBatch(unavailableLeftSchedules),
					...availableLeftSchedules,
					...selectedSchedule,
					...availableRightSchedules,
					...setIsForceDisableBatch(unavailableRightSchedules),
				];

				expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
			});
			
		});

		describe('not empty schedule', () => {
			
			describe('orders to the left of selected period', () => {

				describe('orders in the selected date', () => {

					it('selected date is first and order in the beginning of schedule and excluding minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-01';
						const period = 72;

						const order = [0, 3, 6, 9, 12, 15];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order, minDuration);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = [];
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03', '2016-01-04', '2016-01-05']);

						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, order);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(75, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected date is first and order in the middle of schedule and excluding minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-01';
						const period = 123;

						const order = [72, 75, 78, 81, 84, 87, 90];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order, minDuration);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = [];
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03', '2016-01-04', '2016-01-05']);

						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(0, 93, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(126, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected date is first and has 2 orders and excluding minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-01';
						const period = 123;

						const firstOrder = [12, 15, 18, 21];
						const secondOrder = [72, 75, 78, 81, 84, 87, 90];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, [...firstOrder, ...secondOrder], minDuration);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = [];
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03', '2016-01-04', '2016-01-05']);

						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, [...firstOrder, ...secondOrder], minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(0, 93, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(126, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected date is first and order in the middle of schedule and including minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-01';
						const period = 123;

						const order = [102, 105, 108, 111, 114];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order, minDuration);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = [];
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03', '2016-01-04', '2016-01-05']);

						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(0, 123, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(126, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
					
					it('selected period is close to the order', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-01';
						const period = 117;

						const order = [102, 105, 108, 111, 114];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order, minDuration);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = [];
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03', '2016-01-04', '2016-01-05']);

						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(0, 117, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(120, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
					
				});

				describe('orders in the available dates', () => {

					it('selected period in the beginning and order in the beginning too', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-02';
						const period = 0;

						const order = [0, 3, 6, 9, 12];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, order);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, order);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(3, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the beginning and order in the middle', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-02';
						const period = 0;

						const order = [72, 75, 78, 81, 84, 87, 90];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, order);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 93, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(3, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the beginning and order in the end', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-02';
						const period = 0;

						const order = [129, 132, 135, 138, 141, 144];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, order);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(3, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the end and order in the beginning', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-02';
						const period = 138;

						const order = [0, 3, 6, 9, 12, 15];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, order);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 138, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(141, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the beginning and orders in the middle and end', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-02';
						const period = 0;

						const firstOrder = [72, 75, 78, 81, 84, 87, 90];
						const secondOrder = [129, 132, 135, 138, 141, 144];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, [...firstOrder, ...secondOrder]);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, [...firstOrder, ...secondOrder]);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(3, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
 
					it('check minDuration between selected period not equals 0 and last disable period for last date in available date', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 12;
						const maxOrderDuration = 1;
						const date = '2016-01-02';
						const period = 6;

						const order = [129, 132, 135, 138, 141];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, order);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(0, 6, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(9, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('check minDuration between selected period equals 0 and last disable period for last date in available date', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 12;
						const maxOrderDuration = 1;
						const date = '2016-01-02';
						const period = 0;

						const order = [129, 132, 135, 138];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, order);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, order);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(3, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
				});

				describe('orders in the available dates and selected date', () => {

					it('order in the beginning of selected date and in the beginning for available', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-02';
						const period = 72;

						const firstOrder = [0, 3, 6, 9, 12, 15, 18];
						const secondOrder = [0, 3, 6, 9, 12, 15, 18, 21, 24];

						schedules[0].periods = recalculateSchedule(schedules[0].periods, firstOrder);
						schedules[1].periods = recalculateSchedule(schedules[1].periods, secondOrder);

						const unavailableLeftSchedules = [];
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04', '2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, firstOrder);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, secondOrder);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, secondOrder);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(75, 147, 3));

						const expectedSchedules = [
							...unavailableLeftSchedules,
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
					
				});
			});

			describe('orders to the right of selected period', () => {
				
				describe('orders in the selected date', () => {

					it('selected period in the middle and order in the end of schedule and excluding minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-05';
						const period = 72;

						const order = [132, 135, 138, 141, 144];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const availableRightSchedules = []
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 72, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, order);

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the middle and order in the middle of schedule and excluding minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-05';
						const period = 39;

						const order = [72, 75, 78, 81, 84, 87];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const availableRightSchedules = []
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 39, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(72, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the beginning and order in the middle of schedule and excluding minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-05';
						const period = 0;

						const order = [72, 75, 78, 81, 84, 87];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const availableRightSchedules = []
						const unavailableRightSchedules = [];

						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(72, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected date is first and has 2 orders and excluding minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-05';
						const period = 36;

						const firstOrder = [72, 75, 78, 81, 84, 87];
						const secondOrder = [120, 123, 126, 129, 132, 135];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, [...firstOrder, ...secondOrder], minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const availableRightSchedules = []
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 36, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, [...firstOrder, ...secondOrder], minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(72, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the beginning and order in the middle of schedule and including minDuration', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-05';
						const period = 60;

						const order = [69, 72, 75, 78, 81, 84, 87];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const availableRightSchedules = []
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 60, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(63, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period is close to the order', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-05';
						const period = 66;

						const order = [69, 72, 75, 78, 81, 84, 87];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02', '2016-01-03']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const availableRightSchedules = []
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 66, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, order, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(69, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
					
				});

				describe('orders in the available dates', () => {

					it('selected period in the beginning and order in the beginning too', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-04';
						const period = 0;

						const order = [0, 3, 6, 9, 12, 15, 18, 21];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const unavailableRightSchedules = [];

						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, order, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the beginning and order in the middle', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-04';
						const period = 0;

						const order = [39, 42, 45, 48, 51, 54];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const unavailableRightSchedules = [];

						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, order, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(3, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the end and order in the beginning', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-04';
						const period = 123;

						const order = [0, 3, 6, 9, 12, 15, 18, 21];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 123, 3));
						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, order, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('selected period in the middle and orders in the beginning and end', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-04';
						const period = 72;

						const firstOrder = [0, 3, 6, 9, 12, 15, 18, 21];
						const secondOrder = [123, 126, 129, 132];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, [...firstOrder, ...secondOrder], minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 72, 3));
						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, [...firstOrder, ...secondOrder], minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('check minDuration between selected period not equals 144 and last disable period for last date in available date', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 12;
						const maxOrderDuration = 1;
						const date = '2016-01-04';
						const period = 138;

						const order = [3, 6, 9, 12, 15, 18];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 138, 3));
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(141, 147, 3));
						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, order, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('check minDuration between selected period equals 144 and last disable period for last date in available date', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 12;
						const maxOrderDuration = 1;
						const date = '2016-01-04';
						const period = 144;

						const order = [6, 9, 12, 15, 18];

						schedules[4].periods = recalculateSchedule(schedules[4].periods, order, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 144, 3));
						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, order, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
				});

				describe('orders in the available dates and selected date', () => {

					it('order in the beginning of selected date and in the beginning for available', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-04';
						const period = 72;

						const firstOrder = [123, 126, 129, 132];
						const secondOrder = [21, 24, 27, 30, 33, 36, 39];

						schedules[3].periods = recalculateSchedule(schedules[3].periods, firstOrder, minDuration);
						schedules[4].periods = recalculateSchedule(schedules[4].periods, secondOrder, minDuration);

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01', '2016-01-02']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);
						const unavailableRightSchedules = [];

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 72, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, firstOrder, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(123, 147, 3));
						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, secondOrder, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...unavailableRightSchedules,
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

				});
			});

			describe('orders on either side of selected period', () => {

				describe('order in left available and right in selected date', () => {

					it('left order in the beginning and selected date order in the end, selected period equals 0', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-03';
						const period = 0;

						const leftOrder = [0, 3, 6, 9, 12, 15, 18, 21];
						const selectedOrder = [120, 123, 126, 129, 132, 135, 138, 141, 144];

						schedules[1].periods = recalculateSchedule(schedules[1].periods, leftOrder, minDuration); // left available
						schedules[2].periods = recalculateSchedule(schedules[2].periods, selectedOrder, minDuration); // selected

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, leftOrder, minDuration);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 24, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, selectedOrder, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, selectedOrder);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('left order in the end and selected date order in the beginning, selected period equals 0', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-03';
						const period = 0;

						const leftOrder = [120, 123, 126, 129, 132, 135, 138, 141, 144];
						const selectedOrder = [12, 15, 18, 21, 24];

						schedules[1].periods = recalculateSchedule(schedules[1].periods, leftOrder, minDuration); // left available
						schedules[2].periods = recalculateSchedule(schedules[2].periods, selectedOrder, minDuration); // selected

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, leftOrder, minDuration);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, selectedOrder, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(12, 147, 3));
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('left order in the middle and selected date order in the end, selected period not equals 0', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-03';
						const period = 12;

						const leftOrder = [72, 75, 78, 81, 84, 87, 90];
						const selectedOrder = [120, 123, 126, 129, 132, 135, 138, 141, 144];

						schedules[1].periods = recalculateSchedule(schedules[1].periods, leftOrder, minDuration); // left available
						schedules[2].periods = recalculateSchedule(schedules[2].periods, selectedOrder, minDuration); // selected

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);

						availableLeftSchedules[0].periods = recalculateSchedule(availableLeftSchedules[0].periods, leftOrder, minDuration);
						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 93, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, selectedOrder, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, selectedOrder);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
				});

				describe('order in right available and left in selected date', () => {

					it('right order in the beginning and selected date order in the beginning, selected period equals last period', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-03';
						const period = 144;

						const selectedOrder = [0, 3, 6, 9, 12, 15, 18];
						const rightOrder = [0, 3, 6, 9, 12, 15, 18, 21, 24];

						schedules[2].periods = recalculateSchedule(schedules[2].periods, selectedOrder, minDuration); // selected
						schedules[3].periods = recalculateSchedule(schedules[3].periods, rightOrder, minDuration); // right available

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, selectedOrder, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, selectedOrder);
						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, rightOrder, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(0, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('right order in the middle and selected date order in the end, selected period equals last period', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-03';
						const period = 144;

						const selectedOrder = [117, 120, 123, 126, 129];
						const rightOrder = [72, 75, 78, 81, 84];

						schedules[2].periods = recalculateSchedule(schedules[2].periods, selectedOrder, minDuration); // selected
						schedules[3].periods = recalculateSchedule(schedules[3].periods, rightOrder, minDuration); // right available

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, selectedOrder, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(0, 132, 3));
						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, rightOrder, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(72, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});

					it('right order in the end and selected date order in the beginning, selected period not equals last period', () => {
						const schedules = generateSchedules('2016-01-01', '2016-01-05');
						const dirtySchedules = generateSchedules('2016-01-01', '2016-01-05');
						const minDuration = 4;
						const maxOrderDuration = 1;
						const date = '2016-01-03';
						const period = 120;

						const selectedOrder = [12, 15, 18, 21, 24, 27, 30];
						const rightOrder = [117, 120, 123, 126, 129];

						schedules[2].periods = recalculateSchedule(schedules[2].periods, selectedOrder, minDuration); // selected
						schedules[3].periods = recalculateSchedule(schedules[3].periods, rightOrder, minDuration); // right available

						const unavailableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-01']);
						const availableLeftSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-02']);
						const selectedSchedule = getSchedulesByDates(dirtySchedules, ['2016-01-03']);
						const availableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-04']);
						const unavailableRightSchedules = getSchedulesByDates(dirtySchedules, ['2016-01-05']);

						availableLeftSchedules[0].periods = setIsForceDisable(availableLeftSchedules[0].periods, range(0, 147, 3));
						selectedSchedule[0].periods = recalculateSchedule(selectedSchedule[0].periods, selectedOrder, minDuration);
						selectedSchedule[0].periods = setIsForceDisable(selectedSchedule[0].periods, range(0, 33, 3));
						availableRightSchedules[0].periods = recalculateSchedule(availableRightSchedules[0].periods, rightOrder, minDuration);
						availableRightSchedules[0].periods = setIsForceDisable(availableRightSchedules[0].periods, range(117, 147, 3));

						const expectedSchedules = [
							...setIsForceDisableBatch(unavailableLeftSchedules),
							...availableLeftSchedules,
							...selectedSchedule,
							...availableRightSchedules,
							...setIsForceDisableBatch(unavailableRightSchedules),
						];

						expect(forceDisableFor(schedules, maxOrderDuration, minDuration, date, period)).to.deep.equal(expectedSchedules);
					});
				});
			});
		});
	});
});