import map from 'lodash/map';
import flatten from 'lodash/flatten';
import min from 'lodash/min';

export default (Room) => {

  Room.observe('before save', (ctx, next) => {

    ctx.instance.price.min = min(map(flatten(ctx.instance.price.chunks), 'price'));

    next();
  });
};