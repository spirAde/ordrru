import moment from 'moment';
import { forEach, find, isEmpty, head, last, map, filter, zipWith, isNumber,
  take, takeRight, assign, flatten } from 'lodash';

import { splitOrderByDatesAndPeriods, checkSchedulesIntersection,
  recalculateSchedule, fixNeighboringSchedules,
  clog, calculateDatetimeOrderSum, mergeSchedules, fixEdgesForDisablePeriods } from '../utils/schedule-helper';
import { datesRange, isSameDate } from '../utils/date-helper';
import { FIRST_PERIOD, LAST_PERIOD } from '../utils/schedule-helper';
import mkLogger from '../../server/utils/logger';

const logger = mkLogger('model:Order');

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

  Order.afterRemote('find', (ctx, orders, next) => {
    const questParams = JSON.parse(ctx.args.filter);
    const needSplitOrders = questParams && questParams.data && questParams.data.splitByDates;

    //console.log(needSplitOrders, orders);

    if (needSplitOrders && orders.length) {
      const newOrders = map(orders, order => {
        const orderData = order.__data;

        const startDate = orderData.datetime.startDate;
        const endDate = orderData.datetime.endDate;

        const isOneDayOrder = moment(startDate).isSame(endDate);

        if (isOneDayOrder) return assign({}, orderData, { isOneDayOrder: true });

        const dates = datesRange(startDate, endDate);
        const datesLength = dates.length;

        return dates.map((date, index) => {
          const dateISO = date + 'T00:00:00.000Z';

          if (index === 0) {
            return assign({}, orderData, {
              datetime: {
                startDate: dateISO,
                startPeriod: orderData.datetime.startPeriod,
                endDate: dateISO,
                endPeriod: LAST_PERIOD
              },
              isOneDayOrder: false,
            });
          } else if (index === datesLength - 1) {
            return assign({}, orderData, {
              datetime: {
                startDate: dateISO,
                startPeriod: FIRST_PERIOD,
                endDate: dateISO,
                endPeriod: orderData.datetime.endPeriod
              },
              isOneDayOrder: false,
            });
          }

          return assign({}, orderData, {
            datetime: {
              startDate: dateISO,
              startPeriod: FIRST_PERIOD,
              endDate: dateISO,
              endPeriod: LAST_PERIOD,
            },
            isOneDayOrder: false,
          });
        });
      });

      ctx.result = flatten(newOrders);
    }

    next();
  });

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
    const { roomId, bathhouseId, datetime: { startDate, endDate, startPeriod, endPeriod } } = ctx.instance;

    //console.log('startDate', startDate, 'endDate', endDate, 'startPeriod', startPeriod, 'endPeriod', endPeriod);

    const app = Order.app;
    const Bathhouse = app.models.Bathhouse;
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

    //console.log(splittedOrder);

    Promise.all([
      Schedule.find({
        where: {
          roomId,
          date: { between: [start, end] },
        },
        order: 'date ASC'
      }),
      Room.findById(roomId)
    ]).then(data => {
      const [ schedules, room ] = data;
      const minOrderDuration = room.settings.minOrderDuration / step;

      //clog(schedules);
      // get recalculated schedule for each chunk of splitted order
      const newSchedules = map(splittedOrder, chunkOrder => {
        const schedule = find(schedules, schedule => isSameDate(schedule.date, chunkOrder.date));
        return recalculateSchedule(schedule.periods, chunkOrder.periods, minOrderDuration);
      });

      const prevSchedule = head(schedules);
      const nextSchedule = last(schedules);

      let fixedNewPeriodsPacks = [];

      const leftFix = fixNeighboringSchedules(prevSchedule.periods, head(newSchedules), minOrderDuration);
      const rightFix = fixNeighboringSchedules(last(newSchedules), nextSchedule.periods, minOrderDuration);

      if (isOneDayOrder) {
        // TODO: need fix, because if order has fixNeighboringSchedules for both sides, then right overwrites left fix
        fixedNewPeriodsPacks = [leftFix.prev, mergeSchedules(leftFix.next, rightFix.prev), rightFix.next];
      } else {
        const fixedLeftSchedule = newSchedules.splice(0, 1);
        const fixedRightSchedule = newSchedules.splice(-1, 1);

        fixedNewPeriodsPacks = [
          leftFix.prev,
          mergeSchedules(...fixedLeftSchedule, leftFix.next),
          ...newSchedules,
          mergeSchedules(...fixedRightSchedule, rightFix.prev),
          rightFix.next,
        ];
      }

      const fixedNewSchedules = zipWith(fixedNewPeriodsPacks, schedules, (periods, schedule) => {
        return {
          id: schedule.id,
          roomId: schedule.roomId,
          date: schedule.date,
          periods,
        }
      });

      //clog(fixedNewSchedules);

      const updateSchedulePromises = map(fixedNewSchedules, schedule => {
        return Schedule.update({ id: schedule.id }, schedule);
      });

      return Promise.all([Bathhouse.findById(bathhouseId), ...updateSchedulePromises])
        .then(data => {
          const [bathhouse, schedules] = data;

          // user sockets
          app.io.in(bathhouse.cityId).emit('action', {
            type: 'UPDATE_SCHEDULE',
            payload: {
              roomId: room.id,
              schedule: map(fixedNewSchedules, schedule => assign(
                {}, schedule, { periods: fixEdgesForDisablePeriods(schedule.periods, { left: true, right: true }) })
              ),
            },
          });

          // manager sockets
          app.io.in(bathhouseId).emit('action', {
            type: 'UPDATE_SCHEDULE',
            payload: {
              roomId: room.id,
              schedule: map(fixedNewSchedules, schedule => assign(
                {}, schedule, { periods: fixEdgesForDisablePeriods(schedule.periods, { left: false, right: true }) })
              ),
            },
          });
  
          app.io.in(bathhouseId).emit('action', {
            type: 'ADD_ORDER',
            payload: {
              order: ctx.instance,
            },
          });

          logger('afterSave').info({
            roomId: room.id,
            minOrderDuration: minOrderDuration,
            order: ctx.instance,
            oldSchedule: schedules,
            newSchedule: fixedNewSchedules,
          });

          next();
        })
        .catch(error => next(error));
    }).catch(error => next(error));
  });

  // Validation for order
  function checkOrder(order, app, callback) {
    const { roomId, datetime: { startDate, startPeriod, endDate, endPeriod }, services, sums } = order;

    const step = app.get('steps').bathhouse;
    const maxOrderDuration = app.get('maxOrderDuration').bathhouse;

    const firstPeriod = app.get('firstPeriod');
    const lastPeriod = app.get('lastPeriod');

    if (!moment(startDate).isValid() || !moment(endDate).isValid()) {
      const error = new Error();
      error.statusCode = 422;
      error.message = 'Order has incorrect format for date';
      error.code = 'ORDER_INCORRECT_DATE_FORMAT';

      return callback(error);
    }

    if (moment(endDate).diff(moment(startDate), 'days') > maxOrderDuration) {
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
      const minOrderDuration = room.settings.minOrderDuration / step;

      if (moment(startDate).isSame(endDate)) {
        if (startPeriod > endPeriod) {
          const error = new Error();
          error.statusCode = 422;
          error.message = 'Order start period after end date';
          error.code = 'ORDER_INCORRECT_PERIODS_SEQUENCE';

          return callback(error);
        }
        if (endPeriod - startPeriod < minOrderDuration) {
          const error = new Error();
          error.statusCode = 422;
          error.message = 'Order has incorrect period value';
          error.code = 'ORDER_INCORRECT_PERIOD_VALUE';

          return callback(error);
        }
      }

      if (!moment(startDate).isSame(endDate)) {
        if (lastPeriod - startPeriod + endPeriod < minOrderDuration) {
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

      const checkedStartPeriod = startPeriod === firstPeriod ? startPeriod : startPeriod + step;
      const checkedEndPeriod = endPeriod === lastPeriod ? endPeriod : endPeriod - step;

      const splittedOrder = splitOrderByDatesAndPeriods({ startDate, endDate, startPeriod: checkedStartPeriod, endPeriod: checkedEndPeriod }, step);

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
          callback(null, true);
        })
        .catch(error => callback(error));
    });
  }
};