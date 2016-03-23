import { createSelector } from 'reselect';

const modeSelector = state => state.routing.locationBeforeTransitions.query.mode;

export const HeaderSelectors = createSelector(
  modeSelector,
  (mode) => {
    return {
      mode,
    };
  }
);
