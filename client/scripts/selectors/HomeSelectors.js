import { createSelector } from 'reselect';

const citiesSelector = state => state.city.get('cities');

export const HeaderSelectors = createSelector(
  citiesSelector,
  (cities) => {
    return {
      cities,
    };
  }
);
