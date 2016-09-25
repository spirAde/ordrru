import { createSelector } from 'reselect';

const modeSelector = state => state.routing.locationBeforeTransitions.query.mode;

const HeaderSelectors = createSelector(
  modeSelector,
  mode => ({
    mode,
  })
);

export { HeaderSelectors as default };
