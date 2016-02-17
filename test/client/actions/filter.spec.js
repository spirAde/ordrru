import { expect } from 'chai'

import { setFiltersData, changeDateTimeFilterValues, changeDistanceFilterValue, changeGuestFilterValue,
  changeOptionsFilterValue, changePrepaymentFilterValue, changePriceFilterValues, changeSearchNameFilterValue,
  changeTypesFilterValue, addTag, removeTag } from '../../../client/scripts/actions/filter-actions';

import { SET_FILTERS_DATA, CHANGE_DATETIME_FILTER_VALUES, CHANGE_DISTANCE_FILTER_VALUE, CHANGE_GUEST_FILTER_VALUE,
  CHANGE_OPTIONS_FILTER_VALUE, CHANGE_PREPAYMENT_FILTER_VALUE, CHANGE_PRICE_FILTER_VALUES, CHANGE_SEARCH_NAME_FILTER_VALUE,
  CHANGE_TYPES_FILTER_VALUE, ADD_TAG, REMOVE_TAG } from '../../../client/scripts/actions/filter-actions';

describe('filter actions', () => {

  it('set filters data', () => {
    const id = '219c9b88-d798-4691-8e07-b67404bd222f';
    const expectedAction = {
      type: SET_FILTERS_DATA,
      payload: {
        id
      }
    };
    expect(setFiltersData(id)).to.deep.equal(expectedAction);
  });

  it('change datetime filter values', () => {
    const values = 'smth';
    const expectedAction = {
      type: CHANGE_DATETIME_FILTER_VALUES,
      payload: {
        values
      }
    };
    expect(changeDateTimeFilterValues(values)).to.deep.equal(expectedAction);
  });

  it('change distance filter value', () => {
    const value = 3;
    const expectedAction = {
      type: CHANGE_DISTANCE_FILTER_VALUE,
      payload: {
        value
      }
    };
    expect(changeDistanceFilterValue(value)).to.deep.equal(expectedAction);
  });

  it('change guest count filter data', () => {
    const value = 3;
    const expectedAction = {
      type: CHANGE_GUEST_FILTER_VALUE,
      payload: {
        value
      }
    };
    expect(changeGuestFilterValue(value)).to.deep.equal(expectedAction);
  });

  it('change options filter data', () => {
    const value = {name: 'bar', checked: true};
    const expectedAction = {
      type: CHANGE_OPTIONS_FILTER_VALUE,
      payload: {
        value
      }
    };
    expect(changeOptionsFilterValue(value)).to.deep.equal(expectedAction);
  });

  it('change prepayment data', () => {
    const value = {isRequired: true, checked: true};
    const expectedAction = {
      type: CHANGE_PREPAYMENT_FILTER_VALUE,
      payload: {
        value
      }
    };
    expect(changePrepaymentFilterValue(value)).to.deep.equal(expectedAction);
  });

  it('change price filter data', () => {
    const values = {current: 3};
    const expectedAction = {
      type: CHANGE_PRICE_FILTER_VALUES,
      payload: {
        values
      }
    };
    expect(changePriceFilterValues(values)).to.deep.equal(expectedAction);
  });

  it('change search name value', () => {
    const value = 'asd';
    const expectedAction = {
      type: CHANGE_SEARCH_NAME_FILTER_VALUE,
      payload: {
        value
      }
    };
    expect(changeSearchNameFilterValue(value)).to.deep.equal(expectedAction);
  });

  it('change types of bathhouse data', () => {
    const value = { name: 'bathhouse', checked: true };
    const expectedAction = {
      type: CHANGE_TYPES_FILTER_VALUE,
      payload: {
        value
      }
    };
    expect(changeTypesFilterValue(value)).to.deep.equal(expectedAction);
  });

  it('add new tag to list', () => {
    const tag = 'options';
    const expectedAction = {
      type: ADD_TAG,
      payload: {
        tag
      }
    };
    expect(addTag(tag)).to.deep.equal(expectedAction);
  });

  it('remove tag name from list', () => {
    const tag = 'options';
    const id = '219c9b88-d798-4691-8e07-b67404bd222f';
    const expectedAction = {
      type: REMOVE_TAG,
      payload: {
        tag,
        id
      }
    };
    expect(removeTag(tag, id)).to.deep.equal(expectedAction);
  });
});