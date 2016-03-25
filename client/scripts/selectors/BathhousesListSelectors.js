import { createSelector } from 'reselect';

const modeSelector = state => state.routing.locationBeforeTransitions.query.mode;
const activeCityIdSelector = state => state.city.get('activeCityId');

export const BathhousesListSelectors = createSelector(
  modeSelector,
  activeCityIdSelector,
  (mode, activeCityId) => {
    return {
      mode,
      activeCityId,
    };
  }
);
