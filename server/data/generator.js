import casual from 'casual';
import { head, shuffle, random, map, sampleSize, includes, take, range, flatten, sample, compact } from 'lodash';
import async from 'async';
import moment from 'moment';

import config from './config.json';
import * as utils from './utils';

const generators = {
	bathhouse: (city) => {
		return {
			name: casual.company_name,
			address: casual.address2,
			description: casual.description,
			contactData: {
				phone: [casual.phone],
				email: [casual.email],
				site: [casual.url]
			},
			tableTime: [
				{ startPeriod: 0, endPeriod: 144 },
				{ startPeriod: 0, endPeriod: 144 },
				{ startPeriod: 0, endPeriod: 144 },
				{ startPeriod: 0, endPeriod: 144 },
				{ startPeriod: 0, endPeriod: 144 },
				{ startPeriod: 0, endPeriod: 144 },
				{ startPeriod: 0, endPeriod: 144 }
			],
			cityId: city.id,
			location: utils.generateRandomPoint(city.center, 5000),
			distance: 0,
			isActive: true,
			options: sampleSize(config.options.bathhouse, random(1, config.options.bathhouse.length)),
			services: {
				massage: utils.generateServices(config.services.massage),
				steaming: utils.generateServices(config.services.steaming),
				other: utils.generateServices(config.services.other)
			}
		}
	},
	room: function(bathhouse) {
		return {
			bathhouseId: bathhouse.id,
			name: casual.title,
			description: casual.description,
			types: sampleSize(config.types, random(1, config.types.length)),
			options: sampleSize(config.options.room, random(1, config.options.room.length)),
			settings: {
				minOrderDuration: head(shuffle(config.duration)),
				cleaningTime: 0,
				prepayment: Math.random() < 0.5,
				holdTime: 0
			},
			guest: {
				limit: random(12, 18),
				threshold: random(8, 10),
				price: head(shuffle(range(100, 500, 50)))
			},
			price: {
				min: 0,
				chunks: utils.generatePricesByDateTime(config.thresholds),
			},
			rating: random(1, 10),
			popularity: random(1, 10)
		}
	},
	order: function(room, order) {
		return {
			roomId: room.id,
			datetime: {
				startDate: order.startDate,
				startPeriod: order.startPeriod,
				endDate: order.endDate,
				endPeriod: order.endPeriod,
			},
			services: [],
			guests: 10,
			sums: {
				datetime: 1000,
				services: 1000,
				guests: 1000
			},
			createdByUser: Math.random() < 0.5
		}
	},
	comment: function(room) {
		return {
			roomId: room.id,
			date: utils.generateCommentDate(),
			text: casual.sentences(random(5)),
			evaluation: random(10, true),
		}
	}
};

export default (models) => {

	const run = require('./server');

	run((error, app) => {
		if (error) throw error;

		const dataSources = app.dataSources.ordrDB;

		function createCity(data, callback) {
			return app.models.City.create(data, (error, record) => {
				if (error) console.log('createCity', error);
				callback(null, record);
			});
		}

		function getCities(callback) {
			return app.models.City.find({}, (error, cities) => {
				if (error) console.log('getCities', error);
				callback(null, cities);
			});
		}

		function createBathhouse(city, callback) {
			const data = generators.bathhouse(city);
			return app.models.Bathhouse.create(data, { center: city.center }, (error, record) => {
				if (error) console.log('createBathhouse', error);
				return callback(null, record);
			});
		}

		function getBathhouses(callback) {
			return app.models.Bathhouse.find({}, (error, bathhouses) => {
				if (error) console.log('getBathhouses', error);
				callback(null, bathhouses);
			});
		}

		function createRoom(bathhouse, callback) {
			const data = generators.room(bathhouse);
			return app.models.Room.create(data, (error, record) => {
				if (error) console.log('createRoom', error);
				return callback(null, record);
			});
		}

		function getRooms(callback) {
			return app.models.Room.find({}, (error, rooms) => {
				if (error) console.log('getRooms', error);
				callback(null, rooms);
			});
		}

		function createOrder(room, order, callback) {
			const data = generators.order(room, order);
			return app.models.Order.create(data, (error, record) => {
				if (error) console.log('createOrder', error);
				return callback(null, record);
			});
		}

		function createComment(room, callback) {
			const data = generators.comment(room);
			return app.models.Comment.create(data, (error, record) => {
				if (error) console.log('createComment', error);
				return callback(null, record);
			});
		}

		const queue = [];

		const funcs = {
			city: [],
			bathhouse: [],
			room: [],
			order: [],
			schedule: [],
			comment: [],
		};

		const statuses = {
			city: includes(models, 'city') || includes(models, 'all'),
			bathhouse: includes(models, 'bathhouse') || includes(models, 'all'),
			room: includes(models, 'room') || includes(models, 'all'),
			order: includes(models, 'order') || includes(models, 'all'),
			schedule: includes(models, 'schedule') || includes(models, 'all'),
			comment: includes(models, 'comment') || includes(models, 'all'),
		};

		const counts = {
			city: 2,
			bathhouse: 5,
			room: 5,
			order: 5,
			comment: 10,
		};

		if (error) throw error;

		dataSources.automigrate(error => {
			if (error) throw  error;

			if (statuses.city) {

				funcs.city = function (callback) {
					const funcs = map(take(config.cities, counts.city), city => {
						return async.apply(createCity, city);
					});

					return async.parallel(flatten(funcs), (error, cities) => {
						console.log('cities', 'x', cities.length);
						callback(null, cities);
					});
				}

				queue.push(funcs.city);
			}
			if (statuses.bathhouse) {

				if (!statuses.city) {
					funcs.city = function(callback) {
						getCities((error, cities) => {
							callback(null, cities);
						});
					};

					queue.push(funcs.city);
				}

				funcs.bathhouse = function (cities, callback) {
					const funcs = map(cities, city => {
						return map(range(0, counts.bathhouse), index => {
							return async.apply(createBathhouse, city);
						});
					});

					return async.parallel(flatten(funcs), (error, bathhouses) => {
						console.log('bathhouses', 'x', compact(map(bathhouses, 'id')).length);
						callback(null, bathhouses);
					});
				}

				queue.push(funcs.bathhouse);
			}
			if (statuses.room) {

				if (!statuses.bathhouse) {
					funcs.bathhouse = function(callback) {
						getBathhouses((error, bathhouses) => {
							callback(null, bathhouses);
						});
					}

					queue.push(funcs.bathhouse);
				}

				funcs.room = function (bathhouses, callback) {
					const funcs = map(bathhouses, bathhouse => {
						return map(range(0, counts.room, 1), index => {
							return async.apply(createRoom, bathhouse);
						});
					});

					return async.parallel(flatten(funcs), (error, rooms) => {
						console.log('rooms', 'x', compact(map(rooms, 'id')).length);
						callback(null, rooms);
					});
				}

				queue.push(funcs.room);
			}
			if (statuses.comment) {

				if (!statuses.room) {
					funcs.room = function(callback) {
						getRooms((error, bathhouses) => {
							callback(null, bathhouses);
						});
					}

					queue.push(funcs.room);
				}

				funcs.comment = function (rooms, callback) {
					const funcs = map(rooms, room => {
						return map(range(0, counts.comment, 1), index => {
							return async.apply(createComment, room);
						});
					});

					return async.parallel(flatten(funcs), (error, comments) => {
						console.log('comments', 'x', compact(map(comments, 'id')).length);
						callback(null, comments);
					});
				}

				queue.push(funcs.comment);
			}
			if (statuses.order) {

				if (!statuses.room) {
					funcs.room = function(callback) {
						getRooms((error, bathhouses) => {
							callback(null, bathhouses);
						});
					}

					queue.push(funcs.room);
				}

				funcs.order = function (rooms, callback) {
					const now = moment().toDate();
					const end = moment(now).add(31, 'days').toDate();

					const funcs = map(rooms, room => {
						const orders = utils.generateOrders(now, end, counts.order);
						return map(orders, order => {
							return async.apply(createOrder, room, order);
						});
					});

					return async.parallel(flatten(funcs), (error, orders) => {
						console.log('orders', 'x', compact(map(orders, 'id')).length);
						callback(null, rooms);
					});
				}

				queue.push(funcs.order);
			}

			async.waterfall(queue, (error, data) => {

				if (error) throw error;

				process.exit();
			});
		});
	});
}
