import { ROUTER_DID_CHANGE } from 'redux-router/lib/constants';
import getDataDependencies from '../utils/get-dependencies';

const locationAreEqual = (locationA, locationB) => {
  return (locationA.pathname === locationB.pathname) && (locationA.search === locationB.search);
};

export default ({ dispatch, getState }) => next => action => {
  if (action.type === ROUTER_DID_CHANGE) {
    if (getState().router && locationAreEqual(action.payload.location, getState().router.location)) {
      return next(action);
    }

    const { components, location, params } = action.payload;

    const promise = new Promise((resolve) => {

      const doTransition = () => {
        next(action);
        Promise.all(getDataDependencies(components, dispatch, getState, location, params, true))
          .then(data => {
            resolve();
          })
          .catch(error => {
            console.warn('Warning: Error in fetchDataDeferred', error);
            return resolve();
          });
      };

      Promise.all(getDataDependencies(components, dispatch, getState, location, params))
        .then((data) => {
          doTransition();
        })
        .catch(error => {
          console.warn('Warning: Error in fetchData', error);
          return doTransition();
        });
    });

    if (__SERVER__) {
      // router state is null until ReduxRouter is created so we can use this to store
      // our promise to let the server know when it can render
      getState().router = promise;
    }

    return promise;
  }

  return next(action);
}