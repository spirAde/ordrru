import moment from 'moment';
import { forEach, find, isEmpty, head, last, map, filter, zipWith } from 'lodash';

import { splitOrderByDatesAndPeriods, checkSchedulesIntersection,
  recalculateSchedule, fixNeighboringSchedules, mergeSchedules, clog } from '../utils/schedule-helper';
import { datesRange, isSameDate } from '../utils/date-helper';

export default (Order) => {

  // Check that new order has valid interval, and doesn't conflict with other orders
  Order.observe('before save', (ctx, next) => {

    const { roomId, startDate, endDate, startPeriod, endPeriod } = ctx.instance;

    const app = Order.app;
    const Schedule = app.models.Schedule;

    const step = app.get('steps').bathhouse;

    const start = moment(startDate).subtract(1, 'days').toDate();
    const end = moment(endDate).add(1, 'days').toDate();

    const splittedOrder = splitOrderByDatesAndPeriods({ startDate, endDate, startPeriod, endPeriod }, step);

    Schedule.find({
      where: {
        roomId: roomId,
        date: { between: [start, end] }
      },
      order: 'date ASC'
    }).then(schedules => {
      const notValid = [];
      const createSchedulePromises = [];

      forEach(splittedOrder, chunkOrder => {
        const schedule = find(schedules, schedule => isSameDate(schedule.date, chunkOrder.date));

        if (isEmpty(schedule)) {
          createSchedulePromises.push(Schedule.create({
            roomId,
            date: chunkOrder.date,
          }));
        } else {
          const orderIsValid = checkSchedulesIntersection(schedule.periods, chunkOrder.periods);

          if (!orderIsValid) {
            //TODO: add logger
            notValid.push(chunkOrder.date);
          }
        }
      });

      if (notValid.length) {
        const error = new Error();
        error.statusCode = 422;
        error.message = 'Order has forbidden interval';
        error.code = 'ORDER_FAILED';

        return next(error);
      }

      return Promise.all(createSchedulePromises)
        .then(schedules => {
          ctx.instance.createdByDatetime = moment().toDate();
          next();
        })
        .catch(error => next(error));
    }).catch(error => next(error));
  });

  // If order is valid, save order and recalculate schedule
  Order.observe('after save', (ctx, next) => {

    const { roomId, startDate, endDate, startPeriod, endPeriod } = ctx.instance;

    //console.log('startDate', startDate, 'endDate', endDate, 'startPeriod', startPeriod, 'endPeriod', endPeriod);

    const app = Order.app;
    const Room = app.models.Room;
    const Schedule = app.models.Schedule;

    const periods = app.get('periods');

    //TODO: add check for type later
    const step = app.get('steps').bathhouse;
    const defaultPeriodsByType = map(
      filter(periods, (period, index) => index % step === 0),
      (period, index) => {
      return {
        period: index * step,
        enable: true,
      };
    });

    const isOneDayOrder = isSameDate(startDate, endDate);

    // added 1 additional date, because: if user creating order with startPeriod = 0 and previous date has
    // last free period equal 141 and min duration of order equal 6, then we need disabling period with number 144
    // It's same for last period in the last date
    const start = moment(startDate).subtract(2, 'days').toDate();
    const end = moment(endDate).add(2, 'days').toDate();

    const prevDate = moment(startDate).subtract(1, 'days').toDate();
    const nextDate = moment(endDate).add(1, 'days').toDate();

    const dates = datesRange(prevDate, nextDate);

    // split order: for example order = { 2016-01-02, 138, 2016-01-04, 12 } will be
    // 2016-01-02: 138-144, 2016-01-04: 0-144, 2016-01-04: 0-12
    const splittedOrder = splitOrderByDatesAndPeriods({ startDate, endDate, startPeriod, endPeriod }, step);

    Promise.all([
      Schedule.find({
        where: {
          roomId: roomId,
          date: { between: [start, end] },
        },
        order: 'date ASC'
      }),
      Room.findById(roomId)
    ]).then(data => {
      const [ schedules, room ] = data;
      const minDuration = room.settings.minDuration / step;

      // get recalculated schedule for each chunk of splitted order
      const newSchedules = map(splittedOrder, chunkOrder => {
        const schedule = find(schedules, schedule => isSameDate(schedule.date, chunkOrder.date));
        return recalculateSchedule(schedule.periods, chunkOrder.periods, minDuration, step);
      });

      const prevSchedule = isSameDate(schedules[0].date, prevDate) ? head(schedules) : null;
      const nextSchedule = isSameDate(last(schedules).date, nextDate) ? last(schedules) : null;

      let fixedNewPeriodsPacks = [];

      const prevSchedulePeriods = prevSchedule && prevSchedule.periods || defaultPeriodsByType;
      const nextSchedulePeriods = nextSchedule && nextSchedule.periods || defaultPeriodsByType;

      const leftFix = fixNeighboringSchedules(prevSchedulePeriods, head(newSchedules), minDuration, step);
      const rightFix = fixNeighboringSchedules(last(newSchedules), nextSchedulePeriods, minDuration, step);

      if (isOneDayOrder) {
        fixedNewPeriodsPacks = [leftFix.prev, mergeSchedules(leftFix.next, rightFix.prev), rightFix.next];
      } else {
        const fixedLeftSchedule = newSchedules.splice(0, 1);
        const fixedRightSchedule = newSchedules.splice(-1, 1);

        fixedNewPeriodsPacks = [
          leftFix.prev,
          ...mergeSchedules(fixedLeftSchedule, leftFix.next),
          ...newSchedules,
          ...mergeSchedules(fixedRightSchedule, rightFix.prev),
          rightFix.next,
        ];
      }

      const fixedNewSchedules = zipWith(fixedNewPeriodsPacks, dates, (periods, date) => {
        return {
          roomId: room.id,
          date: moment(date).toDate(),
          periods,
        }
      });

      if (!prevSchedule) fixedNewSchedules.splice(0, 1);
      if (!nextSchedule) fixedNewSchedules.splice(-1, 1);

      const updateSchedulePromises = map(fixedNewSchedules, (fixNewSchedule, index) => {
        return Schedule.update({ id: schedules[index].id }, fixNewSchedule);
      });

      //next();
      return Promise.all(updateSchedulePromises)
        .then(schedules => {
          //TODO: logger
          //console.log(schedules);
          next();
        })
        .catch(error => next(error));
    }).catch(error => next(error));
  });
};