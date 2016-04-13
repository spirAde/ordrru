import { assign, forEach, range } from 'lodash';

import { fixOrderEndpoints, setDisable, STEP, FIRST_PERIOD, LAST_PERIOD } from '../utils/schedule-helper';

export default (Schedule) => {

	// for now date disable all periods, which less then now time
	Schedule.afterRemote('find', function(ctx, schedules, next) {

		const questParams = JSON.parse(ctx.args.filter);
		const thresholdPeriod = questParams.data && questParams.data.period ?
			questParams.data.period : 0;

		const needFixRangePeriods = range(FIRST_PERIOD, thresholdPeriod + 2 * STEP, STEP);

		forEach(schedules, (schedule, index) => {
			schedule.periods = !index ?
				fixOrderEndpoints(setDisable(schedule.periods, needFixRangePeriods)) :
				fixOrderEndpoints(schedule.periods);
		});

		// if first date is fully disable, then remove
		if (thresholdPeriod + STEP === LAST_PERIOD || thresholdPeriod === LAST_PERIOD) {
			schedules.splice(0, 1);
		}

		next();
	});
};