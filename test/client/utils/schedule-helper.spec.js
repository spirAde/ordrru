import chai from 'chai'

import { map, find, includes } from 'lodash';

import { splitOrderByDatesAndPeriods, recalculateSchedule } from '../../../common/utils/schedule-helper';
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

describe('schedule helpers', () => {

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
			const step = 3;

			const expectedSchedule = generateSchedule(schedule, order);

			expect(recalculateSchedule(schedule, order, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order left', () => {
			const schedule = getSchedule();
			const existedOrder = [6, 9, 12, 15, 18, 21, 24];
			const minDuration = 4;
			const step = 3;

			const newOrder = [102, 105, 108, 111, 114, 117];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...existedOrder, ...newOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order right', () => {
			const schedule = getSchedule();
			const existedOrder = [102, 105, 108, 111, 114, 117];
			const minDuration = 4;
			const step = 3;

			const newOrder = [6, 9, 12, 15, 18, 21, 24];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...newOrder, ...existedOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order left and duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrder = [6, 9, 12, 15, 18, 21];
			const minDuration = 4;
			const step = 3;

			const newOrder = [30, 33, 36, 39, 42, 45, 48];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...existedOrder, 24, 27, ...newOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order right and duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrder = [30, 33, 36, 39, 42, 45, 48];
			const minDuration = 4;
			const step = 3;

			const newOrder = [6, 9, 12, 15, 18, 21];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...newOrder, 24, 27, ...existedOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order left and duration equals minimal', () => {

			const schedule = getSchedule();
			const existedOrder = [6, 9, 12, 15, 18, 21];
			const minDuration = 4;
			const step = 3;

			const newOrder = [33, 36, 39, 42, 45, 48];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...existedOrder, ...newOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty schedule and existed order right and duration equals minimal', () => {

			const schedule = getSchedule();
			const existedOrder = [33, 36, 39, 42, 45, 48];
			const minDuration = 4;
			const step = 3;

			const newOrder = [6, 9, 12, 15, 18, 21];

			const existedSchedule = generateSchedule(schedule, existedOrder);
			const expectedSchedule = generateSchedule(schedule, [...newOrder, ...existedOrder]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty and existed order left|right and duration more then minimal', () => {

			const schedule = getSchedule();
			const existedOrderLeft = [33, 36, 39, 42, 45, 48];
			const existedOrderRight = [102, 105, 108, 111, 114];
			const minDuration = 4;
			const step = 3;

			const newOrder = [63, 66, 69, 72, 75];

			const existedLeftSchedule = generateSchedule(schedule, existedOrderLeft);
			const existedSchedule = generateSchedule(existedLeftSchedule, existedOrderRight);

			const expectedSchedule = generateSchedule(schedule, [...existedOrderLeft, ...newOrder, ...existedOrderRight]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty and existed order left|right and left duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrderLeft = [33, 36, 39, 42, 45, 48, 51];
			const existedOrderRight = [102, 105, 108, 111, 114];
			const minDuration = 4;
			const step = 3;

			const newOrder = [60, 63, 66, 69, 72, 75];

			const existedLeftSchedule = generateSchedule(schedule, existedOrderLeft);
			const existedSchedule = generateSchedule(existedLeftSchedule, existedOrderRight);

			const expectedSchedule = generateSchedule(schedule, [...existedOrderLeft, 54, 57, ...newOrder, ...existedOrderRight]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty and existed order left|right and right duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrderLeft = [33, 36, 39, 42, 45, 48];
			const existedOrderRight = [90, 93, 96, 99, 102, 105, 108, 111, 114];
			const minDuration = 4;
			const step = 3;

			const newOrder = [63, 66, 69, 72, 75, 78, 81];

			const existedLeftSchedule = generateSchedule(schedule, existedOrderLeft);
			const existedSchedule = generateSchedule(existedLeftSchedule, existedOrderRight);

			const expectedSchedule = generateSchedule(schedule, [...existedOrderLeft, ...newOrder, 84, 87, ...existedOrderRight]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});

		it('for not empty and existed order left|right and left|right duration less then minimal', () => {

			const schedule = getSchedule();
			const existedOrderLeft = [33, 36, 39, 42, 45, 48];
			const existedOrderRight = [90, 93, 96, 99, 102, 105, 108, 111, 114];
			const minDuration = 4;
			const step = 3;

			const newOrder = [57, 60, 63, 66, 69, 72, 75, 78, 81];

			const existedLeftSchedule = generateSchedule(schedule, existedOrderLeft);
			const existedSchedule = generateSchedule(existedLeftSchedule, existedOrderRight);

			const expectedSchedule = generateSchedule(schedule, [...existedOrderLeft, 51, 54, ...newOrder, 84, 87, ...existedOrderRight]);

			expect(recalculateSchedule(existedSchedule, newOrder, minDuration, step)).to.deep.equal(expectedSchedule);
		});
	});
});