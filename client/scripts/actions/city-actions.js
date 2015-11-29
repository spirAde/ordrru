export const CHANGE_ACTIVE_CITY = 'CHANGE_ACTIVE_CITY';

/**
 * Check if need to change city
 * @param {Object} state - state
 * @param {string} id - city id
 * @return {boolean} - should or not
 * */
export function shouldChangeActiveCity(state, id) {
  return state.city.get('activeCityId') !== id;
}

/**
 * Change active city.
 * @param {string} id - city id
 * @return {{type: string, payload: {id: string}}} - action
 * */
export function changeActiveCity(id) {
  return {
    type: CHANGE_ACTIVE_CITY,
    payload: {
      id
    }
  };
}

/**
 * Get city by slug.
 * @param {Object} state - state
 * @param {string} slug - slug of city. example if city is Magnitogorsk, that slug is mgn
 * @return {Object} - city object
 * */
export function getCityBySlug(state, slug) {
  return state.city.get('cities').find(city => city.get('slug') === slug);
}
