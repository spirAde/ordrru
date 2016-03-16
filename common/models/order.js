import moment from 'moment';
import { forEach, find, isEmpty, head, last, map, filter, zipWith, isNumber } from 'lodash';

import { splitOrderByDatesAndPeriods, checkSchedulesIntersection,
  recalculateSchedule, fixNeighboringSchedules, mergeSchedules,
  clog, calculateDatetimeOrderSum } from '../utils/schedule-helper';
import { datesRange, isSameDate } from '../utils/date-helper';

export default (Order) => {

  Order.remoteMethod(
    'check',
    {
      http: { path: '/check', verb: 'post' },
      description: 'Validate order by interval and sum',
      accepts: {
        arg: 'data',
        type: 'object',
        http: { source: 'body' },
        required: true,
        description: 'start date, end date, start period, end period, sums'
      },
      returns: { arg: 'status', type: 'boolean', description: 'status of validation' },
    }
  );

  Order.check = (data, next) => {
    checkOrder(data, Order.app, (error, status) => {
      if (error) return next(error);

      next(null, status);
    });
  }

  // Check that new order has valid interval, and doesn't conflict with other orders
  Order.observe('before save', (ctx, next) => {
    checkOrder(ctx.instance, Order.app, (error, status) => {
      if (error) return next(error);

      ctx.instance.createdByDatetime = moment().toDate();
      next();
    });
  });

  // If order is valid, save order and recalculate schedule
  Order.observe('after save', (ctx, next) => {

    const { roomId, datetime: { startDate, endDate, startPeriod, endPeriod } } = ctx.instance;

    //console.log('startDate', startDate, 'endDate', endDate, 'startPeriod', startPeriod, 'endPeriod', endPeriod);

    const app = Order.app;
    const Room = app.models.Room;
    const Schedule = app.models.Schedule;

    //TODO: add check for type later
    const step = app.get('steps').bathhouse;
    const periods = app.get('periods');

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
    // 2016-01-02: 138-144, 2016-01-03: 0-144, 2016-01-04: 0-12
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

  // Validation for order
  function checkOrder(order, app, callback) {
    const { roomId, datetime: { startDate, startPeriod, endDate, endPeriod }, services, sums } = order;

    const step = app.get('steps').bathhouse;
    const limitOrderDuration = app.get('limitOrderDuration').bathhouse;

    const firstPeriod = app.get('firstPeriod');
    const lastPeriod = app.get('lastPeriod');

    if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
      const error = new Error();
      error.statusCode = 422;
      error.message = 'Order has incorrect format for date';
      error.code = 'ORDER_INCORRECT_DATE_FORMAT';

      return callback(error);
    }

    if (moment(endDate).diff(moment(startDate), 'days') > limitOrderDuration) {
      const error = new Error();
      error.statusCode = 422;
      error.message = 'Order has so long duration';
      error.code = 'ORDER_INCORRECT_DURATION';

      return callback(error);
    }

    if (!isNumber(startPeriod) || !isNumber(endPeriod)) {
      const error = new Error();
      error.statusCode = 422;
      error.message = 'Order has incorrect format for period';
      error.code = 'ORDER_INCORRECT_PERIOD_FORMAT';

      return callback(error);
    }

    if (startPeriod < firstPeriod || endPeriod > lastPeriod ||
      startPeriod % step !== 0 || endPeriod % step !== 0) {

      const error = new Error();
      error.statusCode = 422;
      error.message = 'Order has incorrect period value';
      error.code = 'ORDER_INCORRECT_PERIOD_VALUE';

      return callback(error);
    }

    if (moment(endDate).isBefore(startDate)) {
      const error = new Error();
      error.statusCode = 422;
      error.message = 'Order start date after end date';
      error.code = 'ORDER_INCORRECT_DATES_SEQUENCE';

      return callback(error);
    }

    const Room = app.models.Room;
    const Schedule = app.models.Schedule;

    const start = moment(startDate).subtract(1, 'days').toDate();
    const end = moment(endDate).add(1, 'days').toDate();

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

      if (moment(startDate).isSame(endDate)) {
        if (startPeriod > endPeriod) {
          const error = new Error();
          error.statusCode = 422;
          error.message = 'Order start period after end date';
          error.code = 'ORDER_INCORRECT_PERIODS_SEQUENCE';

          return callback(error);
        }
        if (endPeriod - startPeriod < minDuration) {
          const error = new Error();
          error.statusCode = 422;
          error.message = 'Order has incorrect period value';
          error.code = 'ORDER_INCORRECT_PERIOD_VALUE';

          return callback(error);
        }
      }

      if (!moment(startDate).isSame(endDate)) {
        if (lastPeriod - startPeriod + endPeriod < minDuration) {
          const error = new Error();
          error.statusCode = 422;
          error.message = 'Order has incorrect period value';
          error.code = 'ORDER_INCORRECT_PERIOD_VALUE';

          return callback(error);
        }
      }

      /*const datetimeOrderSum = calculateDatetimeOrderSum(order.datetime, room.price.chunks);

      if (datetimeOrderSum !== order.sums.datetime) {
        const error = new Error();
        error.statusCode = 422;
        error.message = 'Order has incorrect datetime order sum';
        error.code = 'ORDER_INCORRECT_DATETIME_SUM';

        return callback(error);
      }*/

      const splittedOrder = splitOrderByDatesAndPeriods({ startDate, endDate, startPeriod, endPeriod }, step);

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
        error.code = 'ORDER_INCORRECT_INTERVAL';

        return callback(error);
      }

      return Promise.all(createSchedulePromises)
        .then(schedules => {
          callback(null, { status: true });
        })
        .catch(error => callback(error));
    });
  }
};