export default (City) => {

  City.beforeRemote('*', (ctx, user, next) => {

    next();
  });

  City.afterRemote('*', (ctx, modelInstance, next) => {

    next();
  });
};