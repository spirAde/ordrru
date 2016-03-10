import { createSelector } from 'reselect';

const modeSelector = state => state.routing.location.query.mode;

export const BathhousesListSelectors = createSelector(
  modeSelector,
  (mode) => {
    return {
      mode,
    };
  }
);
