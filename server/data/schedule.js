import moment from 'moment';
import { map, findIndex, last } from 'lodash';

import { isSameDate, datesRange } from '../../common/utils/date-helper';

export default (app, callback) => {

	const Schedule = app.models.Schedule;
	const Room = app.models.Room;

	const now = moment().format('YYYY-MM-DD');
	const prev = moment(now).subtract(1, 'days').format('YYYY-MM-DD');
	const endDate = moment(now).add(31, 'days').format('YYYY-MM-DD');

	return Room.find({ fields: ['id'] }).then(rooms => {

		const schedulePromises = map(rooms, room => {
			return Schedule.find({
				where: {
					roomId: room.id,
					date: { gte: moment(prev).toDate() }
				},
				order: 'date ASC'
			});
		});

		Promise.all(schedulePromises).then(schedules => {
			const promises = map(schedules, (schedule, index) => {
				if (!schedule.length) {
					return map(datesRange(now, endDate), date => {
						return Schedule.create({
							roomId: rooms[index].id,
							date: moment(date).toDate(),
						});
					});
				}

				const dates = map(schedule, 'date');
				const dateIndex = findIndex(dates, date => isSameDate(now, date));

				if (dateIndex === -1) {

					const startDate = moment(now).subtract(1, 'days').format('YYYY-MM-DD');

					return map(datesRange(startDate, endDate), date => {
						return Schedule.create({
							roomId: rooms[index].id,
							date: moment(date).toDate(),
						});
					});
				} else {
					const date = dates[dateIndex];
					const duration = moment(endDate).diff(moment(date), 'days');
					const residue = 31 - duration;

					if (!residue) {
						return new Promise(resolve => resolve());
					}

					const additionalDates = moment(last(dates)).add(residue, 'days').format('YYYY-MM-DD');

					return map(datesRange(last(dates), additionalDates), date => {
						return Schedule.create({
							roomId: rooms[index].id,
							date: moment(date).toDate(),
						});
					});
				}
			});

			Promise.all(promises)
				.then(() => {
					callback();
				})
				.catch(error => { throw error; });
		});
	})
	.catch(error => { throw error; });
};
