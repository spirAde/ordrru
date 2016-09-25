import { createSelector } from 'reselect';

const citiesSelector = state => state.city.get('cities');

const HeaderSelectors = createSelector(
  citiesSelector,
  cities => ({
    cities,
  })
);

export { HeaderSelectors as default };
