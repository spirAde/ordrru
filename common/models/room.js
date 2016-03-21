import { map, min, flatten } from 'lodash';
import moment from 'moment';

import { datesRange, isSameDate } from '../utils/date-helper';

export default (Room) => {

  Room.observe('before save', (ctx, next) => {

    ctx.instance.price.min = min(map(flatten(ctx.instance.price.chunks), 'price'));

    next();
  });

  Room.observe('after save', (ctx, next) => {

    if (!ctx.isNewInstance) next();

    const id = ctx.instance.id;
    const now = moment().subtract(1, 'days');
    const end = moment(now).add(32, 'days');

    const app = Room.app;
    const Schedule = app.models.Schedule;

    const dates = datesRange(now, end);

    const promises = map(dates, date => {
      return Schedule.create({
        roomId: id,
        date,
      });
    });

    Promise.all(promises)
      .then(() => {
        next();
      })
      .catch(error => next(error));
  });
};