import { map, assign, forEach } from 'lodash';

import { fixOrderEndpoints } from '../utils/schedule-helper';

export default (Schedule) => {

	Schedule.afterRemote('find', function(ctx, schedules, next) {

		forEach(schedules, schedule => {
			schedule.periods = fixOrderEndpoints(schedule.periods);
		});

		next();
	});
};