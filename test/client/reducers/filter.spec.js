import chai from 'chai'
import chaiImmutable from 'chai-immutable';

import { List, Map, fromJS } from 'immutable';
import { keys, assign, map } from 'lodash';

import { initialState as defaultInitialState, reducer } from '../../../common/reducers/filter';

import configs from '../../../common/data/configs.json';

import { SET_FILTERS_DATA, ADD_TAG, REMOVE_TAG,
  CHANGE_DATETIME_FILTER_VALUES, CHANGE_DISTANCE_FILTER_VALUE, CHANGE_GUEST_FILTER_VALUE, CHANGE_SEARCH_NAME_FILTER_VALUE,
  CHANGE_OPTIONS_FILTER_VALUE, CHANGE_PRICE_FILTER_VALUES, CHANGE_TYPES_FILTER_VALUE,
  CHANGE_PREPAYMENT_FILTER_VALUE } from '../../../client/scripts/actions/filter-actions';

const expect = chai.expect;

chai.use(chaiImmutable);

const defaultCityId = map(configs.cities, 'id')[0];

describe('filter reducer', () => {

  it('handles if type and action is empty', () => {
    const nextState = reducer(undefined, {});

    expect(nextState).to.equal(defaultInitialState);
  });

  it('handles INCORRECT type', () => {
    const initialState = Map();
    const action = {
      type: 'INCORRECT',
      payload: {}
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(Map());
  });

  it('handles SET_FILTERS_DATA', () => {
    const initialState = fromJS({
      filters: {},
      tags: []
    });
    const action = {
      type: SET_FILTERS_DATA,
      payload: {
        id: defaultCityId
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.get('filters').toJS()).to.have.all.keys(keys(configs.filters[defaultCityId]));
    expect(nextState.get('tags')).to.equal(List());
  });

  it('handles ADD_TAG', () => {
    const initialState = fromJS({
      filters: {},
      tags: []
    });
    const action = {
      type: ADD_TAG,
      payload: {
        tag: 'distance'
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.get('tags')).to.equal(List.of('distance'));
  });

  it('handles REMOVE_TAG', () => {
    const defaultFilters = configs.filters[defaultCityId];
    const initialState = fromJS({
      filters: assign({}, defaultFilters, { distance: {
        "min": 1,
        "max": 4.7,
        "current": 3 }
      }),
      tags: ['distance', 'options', 'types']
    });
    const action = {
      type: REMOVE_TAG,
      payload: {
        tag: 'distance',
        id: defaultCityId
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.get('tags')).to.equal(List.of('options', 'types'));
    expect(nextState.getIn(['filters', 'distance'])).to.equal(fromJS(defaultFilters.distance));
  });

  it('handles CHANGE_DISTANCE_FILTER_VALUE', () => {
    const current = 3;
    const initialState = fromJS({
      filters: {
        distance: { min: 0, max: 5, current: 5 }
      },
      tags: []
    });
    const action = {
      type: CHANGE_DISTANCE_FILTER_VALUE,
      payload: {
        value: current
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.getIn(['filters', 'distance', 'current'])).to.equal(current);
  });

  it('handles CHANGE_GUEST_FILTER_VALUE', () => {
    const current = 12;
    const initialState = fromJS({
      filters: {
        guest: { min: 0, max: 15, current: 15 }
      },
      tags: []
    });
    const action = {
      type: CHANGE_GUEST_FILTER_VALUE,
      payload: {
        value: current
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.getIn(['filters', 'guest', 'current'])).to.equal(current);
  });

  it('handles CHANGE_SEARCH_NAME_FILTER_VALUE', () => {
    const searchedText = 'smth room or bathhouse name';
    const initialState = fromJS({
      filters: {
        searchName: {
          text: ''
        }
      },
      tags: []
    });
    const action = {
      type: CHANGE_SEARCH_NAME_FILTER_VALUE,
      payload: {
        value: searchedText
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.getIn(['filters', 'searchName', 'text'])).to.equal(searchedText);
  });

  it('handles CHANGE_OPTIONS_FILTER_VALUE', () => {
    const initialState = fromJS({
      filters: {
        options: [{ name: 'bar', checked: false }, { name: 'pool', checked: false }]
      },
      tags: []
    });
    const action = {
      type: CHANGE_OPTIONS_FILTER_VALUE,
      payload: {
        value: Map({ name: 'bar', checked: true })
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.getIn(['filters', 'options'])).to.equal(List.of(Map({ name: 'bar', checked: true }), Map({ name: 'pool', checked: false })));
  });

  it('handles CHANGE_PREPAYMENT_FILTER_VALUE', () => {
    const initialState = fromJS({
      filters: {
        prepayment: [{ isRequired: true, checked: false }, { isRequired: false, checked: false }, { isRequired: null, checked: true }]
      },
      tags: []
    });
    const action = {
      type: CHANGE_PREPAYMENT_FILTER_VALUE,
      payload: {
        value: Map({ isRequired: true })
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.getIn(['filters', 'prepayment'])).to.equal(
      List.of(Map({ isRequired: true, checked: true }), Map({ isRequired: false, checked: false }), Map({ isRequired: null, checked: false }))
    );
  });

  it('handles CHANGE_TYPES_FILTER_VALUE', () => {
    const initialState = fromJS({
      filters: {
        types: [{ name: 'bathhouse', checked: false }, { name: 'hammam', checked: false }]
      },
      tags: []
    });
    const action = {
      type: 'CHANGE_TYPES_FILTER_VALUE',
      payload: {
        value: Map({ name: 'bathhouse', checked: true })
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState.getIn(['filters', 'types'])).to.equal(List.of(Map({ name: 'bathhouse', checked: true }), Map({ name: 'hammam', checked: false })));
  });
});
