import _ from 'lodash';

import moment from 'moment';

// move to smth helper in future
function getDatesRange(start, end) {
  let datesRange = [];

  while (start <= end) {
    datesRange.push(moment(start).format('YYYY-MM-DD'));
    start = moment(start).add(1, 'days');
  }

  return datesRange;
}

export default (Order) => {

  Order.observe('after access', (ctx, next) => {

    next();
  });

  Order.observe('before save', (ctx, next) => {

    ctx.instance.createdByDatetime = new Date();

    next();
  });

  Order.observe('after save', (ctx, next) => {

    const { roomId, startDate, endDate, startPeriod, endPeriod } = ctx.instance;

    const app = Order.app;

    const Schedule = app.models.Schedule;
    const Room = app.models.Room;
    const periods = app.get('periods');

    const isTwoDaysOrder = !moment(startDate).isSame(endDate);

    const start = moment(startDate).subtract(1, 'days');
    const end = moment(endDate).add(1, 'days');
    const datesRange = getDatesRange(start, end);

    Schedule.find({
      where: {
        roomId: roomId,
        date: { gt: moment(start).format(), lt: moment(end).format() }
      },
      order: 'date ASC'
    }).then((data) => {

      const dates = _.pluck(data, 'date');
      const difference = _.difference(datesRange, dates);

      let records = difference.map(date => {
        return Schedule.create({
          roomId: roomId,
          date: date,
          periods: _.keys(periods)
            .filter((time, period) => parseInt(period) % 3 === 0)
            .map(period => { return { period, enable: true } })
        });
      });

      dates.forEach(date => {
        const schedule = _.find(data, { date: date}).periods;
        
      });
      /*new Promise(records).then(data => {

      });*/
    });

    //console.log(Order.app.models.Schedule);
    next();
  });
};