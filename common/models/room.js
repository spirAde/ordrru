import pluck from 'lodash/collection/pluck';
import flatten from 'lodash/array/flatten';
import min from 'lodash/math/min';

export default (Room) => {

  Room.observe('before save', (ctx, next) => {

    ctx.instance.price.min = min(pluck(flatten(ctx.instance.price.chunks), 'price'));

    next();
  });
};