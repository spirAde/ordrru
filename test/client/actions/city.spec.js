import chai from 'chai'
import chaiImmutable from 'chai-immutable';

import { List, Map, fromJS } from 'immutable';

import { CHANGE_ACTIVE_CITY } from '../../../client/scripts/actions/city-actions';
import { changeActiveCity, shouldChangeActiveCity, getCityBySlug } from '../../../client/scripts/actions/city-actions';

const expect = chai.expect;

chai.use(chaiImmutable);

describe('city actions', () => {

  it('should change active city', () => {
    const id = '219c9b88-d798-4691-8e07-b67404bd222f';
    const expectedAction = {
      type: CHANGE_ACTIVE_CITY,
      payload: {
        id
      }
    };
    expect(changeActiveCity(id)).to.deep.equal(expectedAction);
  });

  it('check should change active city', () => {
    const cityId = '219c9b88-d798-4691-8e07-b67404bd222f';

    expect(
      shouldChangeActiveCity({city: Map({ activeCityId: cityId })}, cityId)
    ).to.equal(false);

    expect(
      shouldChangeActiveCity({city: Map({ activeCityId: 'c88c30f7-8bde-4d8c-a435-f08ead52c7ef' })}, cityId)
    ).to.equal(true);
  });

  it('get city by slug', () => {
    const state = {
      city: fromJS({
        cities: [
          {id: 1, slug: 'mgn'},
          {id: 2, slug: 'ekb'}
        ]
      })
    };

    expect(
      getCityBySlug(state, 'mgn')
    ).to.equal(Map({ id: 1, slug: 'mgn'}))
  });
});