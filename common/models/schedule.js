import { assign, map, range, flatten } from 'lodash';

import { fixEdgesForDisablePeriods, setDisable, clog, STEP, FIRST_PERIOD, LAST_PERIOD } from '../utils/schedule-helper';

export default (Schedule) => {

	// for now date disable all periods, which less then now time
	Schedule.afterRemote('find', function(ctx, schedules, next) {
		const questParams = JSON.parse(ctx.args.filter);

		const thresholdPeriod = (questParams.data && questParams.data.period) || 0;
		const fixEdges = (questParams.data && questParams.data.fixEdges) || { left: true, right: true };

		const forceDisabledPeriodsRange = range(FIRST_PERIOD, thresholdPeriod + 2 * STEP, STEP);

		const fixedSchedules = map(schedules, (schedule, index) => {
			return assign(schedule, {
				periods: !index ?
					fixEdgesForDisablePeriods(setDisable(schedule.periods, forceDisabledPeriodsRange), fixEdges) :
					fixEdgesForDisablePeriods(schedule.periods, fixEdges),
			});
		});

		// if first date is fully disable, then remove
		if (thresholdPeriod + STEP === LAST_PERIOD || thresholdPeriod === LAST_PERIOD) {
			fixedSchedules.splice(0, 1);
		}

		ctx.result = fixedSchedules;

		next();
	});
};