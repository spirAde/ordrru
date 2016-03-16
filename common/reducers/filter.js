import { Map, fromJS } from 'immutable';

import createReducer from '../utils/create-reducer';

import { SET_FILTERS_DATA, ADD_TAG, REMOVE_TAG, UPDATE_OFFERS_COUNT,
  CHANGE_DATETIME_FILTER_VALUES, CHANGE_DISTANCE_FILTER_VALUE, CHANGE_GUEST_FILTER_VALUE,
  CHANGE_SEARCH_NAME_FILTER_VALUE, CHANGE_OPTIONS_FILTER_VALUE, CHANGE_PREPAYMENT_FILTER_VALUE,
  CHANGE_PRICE_FILTER_VALUES, CHANGE_TYPES_FILTER_VALUE, CHANGE_SORTING_FILTER_VALUE } from '../../client/scripts/actions/filter-actions';

import configs from '../../common/data/configs.json';

export const initialState = fromJS({
  filters: {},
  tags: []
});

export const reducer = createReducer({
  [SET_FILTERS_DATA](state, action) {
    return state.set('filters', fromJS(configs.filters[action.payload.id]));
  },
  [ADD_TAG](state, action) {
    return state.update('tags', tags => tags.push(action.payload.tag));
  },
  [REMOVE_TAG](state, action) {
    return state
      .update('tags', tags => tags.delete(tags.findIndex(tag => tag === action.payload.tag)))
      //  if remove tag from list, need to reset filter type to start state
      .updateIn(
        ['filters', action.payload.tag],
        filter => filter.clear().merge(fromJS(configs.filters[action.payload.id][action.payload.tag]))
      );
  },
  [CHANGE_DATETIME_FILTER_VALUES](state) {
    return state;
  },
  [CHANGE_DISTANCE_FILTER_VALUE](state, action) {
    return state.setIn(['filters', 'distance', 'current'], action.payload.value);
  },
  [CHANGE_GUEST_FILTER_VALUE](state, action) {
    return state.setIn(['filters', 'guest', 'current'], action.payload.value);
  },
  [CHANGE_SEARCH_NAME_FILTER_VALUE](state, action) {
    return state.setIn(['filters', 'searchName', 'text'], action.payload.value);
  },
  [CHANGE_OPTIONS_FILTER_VALUE](state, action) {
    const options = state.getIn(['filters', 'options']);
    return state
      .setIn(
        ['filters', 'options'],
        options.update(
          options.findIndex(
            option => option.get('name') === action.payload.value.get('name')
          ),
          option => action.payload.value)
      );
  },
  [CHANGE_PREPAYMENT_FILTER_VALUE](state, action) {
    const changedValues = state.getIn(['filters', 'prepayment']).map(value => {
      return Map({
        isRequired: value.get('isRequired'),
        checked: value.get('isRequired') === action.payload.value.get('isRequired')
      });
    });
    return state.updateIn(['filters', 'prepayment'], list => list.clear().merge(changedValues));
  },
  [CHANGE_PRICE_FILTER_VALUES](state, action) {
    return state.setIn(['filters', 'price', 'current'], Map({
      start: action.payload.values[0],
      end: action.payload.values[1]
    }));
  },
  [CHANGE_TYPES_FILTER_VALUE](state, action) {
    const types = state.getIn(['filters', 'types']);
    return state
      .setIn(
        ['filters', 'types'],
        types.update(
          types.findIndex(
            type => type.get('name') === action.payload.value.get('name')
          ),
          type => action.payload.value)
      );
  },
  [CHANGE_SORTING_FILTER_VALUE](state, action) {
    const changedValues = state.getIn(['filters', 'sorting']).map(value => {
      return Map({
        name: value.get('name'),
        isDesc: value.get('name') === action.payload.value.get('name') && value.get('checked') ?
          !value.get('isDesc') : true,
        checked: value.get('name') === action.payload.value.get('name')
      });
    });
    return state.updateIn(['filters', 'sorting'], list => list.clear().merge(changedValues));
  }
}, initialState);
