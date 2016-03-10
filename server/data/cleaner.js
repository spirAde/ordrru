import async from 'async';
import { forEach, includes } from 'lodash';

export default (models) => {
	const run = require('./server');

	run((error, app) => {
		if (error) throw error;

		const statuses = {
			city: includes(models, 'city') || includes(models, 'all'),
			bathhouse: includes(models, 'bathhouse') || includes(models, 'all'),
			room: includes(models, 'room') || includes(models, 'all'),
			order: includes(models, 'order') || includes(models, 'all'),
			schedule: includes(models, 'schedule') || includes(models, 'all'),
		};

		const funcs = [];

		function deleteCity(callback) {
			return app.models.City.destroyAll({}, (error, data) => {
				callback(null, {
					type: 'city',
					count: data.count,
				});
			});
		}

		function deleteBathhouse(callback) {
			return app.models.Bathhouse.destroyAll({}, (error, data) => {
				callback(null, {
					type: 'bathhouse',
					count: data.count,
				});
			});
		}

		function deleteRoom(callback) {
			return app.models.Room.destroyAll({}, (error, data) => {
				callback(null, {
					type: 'room',
					count: data.count,
				});
			});
		}

		function deleteSchedule(callback) {
			return app.models.Schedule.destroyAll({}, (error, data) => {
				callback(null, {
					type: 'schedule',
					count: data.count,
				});
			});
		}

		function deleteOrder(callback) {
			return app.models.Order.destroyAll({}, (error, data) => {
				callback(null, {
					type: 'order',
					count: data.count,
				});
			});
		}

		if (statuses.city) {
			funcs.push(deleteCity);
		}
		if (statuses.bathhouse) {
			funcs.push(deleteBathhouse);
		}
		if (statuses.room) {
			funcs.push(deleteRoom);
		}
		if (statuses.order) {
			funcs.push(deleteOrder);
		}
		if (statuses.schedule) {
			funcs.push(deleteSchedule);
		}

		async.series(funcs, (error, data) => {
			if (error) throw error;

			console.log('Removed');

			forEach(data, item => {
				console.log(item.type, 'x', item.count);
			});

			process.exit();
		});
	});
}