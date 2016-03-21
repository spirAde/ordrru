import util from 'util';
import { head, shuffle, random, map, forEach, sample, sampleSize, reduce, range, compact, take } from 'lodash';
import moment from 'moment';

import { datesRange, isSameDate } from '../../common/utils/date-helper';

export function distance(from, to, unit) {
	const fromLatRadian = Math.PI * from.lat / 180;
	const toLatRadian = Math.PI * to.lat / 180;
	const fromLngRadian = Math.PI * from.lng / 180;
	const toLngRadian = Math.PI * to.lng / 180;

	const delta = fromLngRadian - toLngRadian;
	const deltaRadian = Math.PI * delta / 180;

	let distance = Math.sin(fromLatRadian) * Math.sin(toLatRadian) +
		Math.cos(fromLatRadian) * Math.cos(toLatRadian) * Math.cos(deltaRadian);

	distance = Math.acos(distance);
	distance = distance * 180 / Math.PI;
	distance = distance * 60 * 1.1515;

	return unit === 'K' ? distance * 1.609344 : distance * 0.8684;
}

export function generateRandomPoint({ lat, lng }, radius) {

	const degreesRadius = radius / 111300;

	const xRate = Math.random();
	const yRate = Math.random();

	const w = degreesRadius * Math.sqrt(xRate);
	const t = 2 * Math.PI * yRate;

	const x = w * Math.cos(t);
	const y = w * Math.sin(t);

	const xp = x / Math.cos(lat);

	return { lat: y + lng, lng: xp + lat };
}

export function clog(data) {
	console.log(util.inspect(data, false, null));
}

export  function generateServices(services) {
	const items = sampleSize(services, random(1, services.length));

	return map(items, item => {
		return {
			name: item,
			price: sample(range(1000, 2000, 100)),
		}
	});
}

export function generatePricesByDateTime(pricesThresholds) {
	const pricesDatetime = [];
	const price = head(shuffle(range(700, 2450, 50)));
	const priceWeekend = price + Math.ceil(random() * 500);
	const pricesSchema = pricesThresholds[random(0, 2)];

	const pricesPoints = map(pricesSchema, line => {
		return head(shuffle(line));
	}).concat(144);

	forEach(range(0, 7), dayIndex => {

		pricesDatetime[dayIndex] = [];

		reduce(pricesPoints, (prev, curr) => {
			pricesDatetime[dayIndex].push({
				startPeriod: prev,
				endPeriod: curr,
				price: dayIndex === 0 || dayIndex === 6 ? priceWeekend : price
			});

			return curr;
		}, 0);
	});

	return pricesDatetime;
}

export function generateOrders(start, end, count) {
	const next = moment(start).add(1, 'days').toDate();
	const prev = moment(end).subtract(1, 'days').toDate();
	const dates = datesRange(next, prev);

	let skip = false;

	const orders = map(dates, date => {

		if (skip) {
			skip = false;
			return false;
		}

		let isTwoDaysOrder = Math.random() <= 0.5;
		const startPeriod = isTwoDaysOrder ? sample(range(120, 144, 3)) : sample(range(42, 87, 3));
		const endPeriod = isTwoDaysOrder ? sample(range(6, 30, 3)) : startPeriod + sample(range(6, 21, 3));

		skip = isTwoDaysOrder;

		return {
			startDate: date,
			endDate: isTwoDaysOrder ? moment(date).add(1, 'days').format('YYYY-MM-DD') : date,
			startPeriod: startPeriod,
			endPeriod: endPeriod,
		};
	});

	return take(compact(orders), count);
}

export function generateReviewDate() {
	const end = moment().toDate();
	const start = moment(end).subtract(random(3), 'months').toDate();

	const dates = datesRange(start, end);

	return sample(shuffle(dates));
}

export function dedent(strings, ...values) {

	let raw;

	if (typeof strings === 'string') {
		raw = [strings];
	} else {
		raw = strings.raw;
	}

	let result = '';
	for (let i = 0; i < raw.length; i++) {
		result += raw[i]
			.replace(/\\\n[ \t]*/g, '')
			.replace(/\\`/g, '`');

		if (i < values.length) {
			result += values[i];
		}
	}

	result = result.trim();

	const lines = result.split('\n');

	let mindent = null;

	forEach(lines, line => {
		let matches = line.match(/^ +/);
		if (matches) {
			let indent = matches[0].length;

			mindent = !mindent ? indent : Math.min(mindent, indent);
		}
	});

	if (mindent !== null) {
		result = map(lines, line => line[0] === ' ' ? line.slice(mindent) : line).join('\n');
	}

	return result.replace(/\\n/g, '\n');
}