export default (Bathhouse) => {

  Bathhouse.observe('before save', (ctx, next) => {

    // calculate distance between bathhouse location and center of city

    if (!ctx.options.center) next(new Error('doesn\'t pass center of city for bathhouse'));

    const bathhouseLocation = new loopback.GeoPoint(ctx.instance.location);
    const cityCenterLocation = new loopback.GeoPoint(ctx.options.center);

    ctx.instance.distance = loopback.GeoPoint.distanceBetween(
      bathhouseLocation, cityCenterLocation, {type: 'kilometers'});

    next();
  });
};
