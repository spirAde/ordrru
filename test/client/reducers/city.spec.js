import { List, Map, fromJS } from 'immutable';
import { expect } from 'chai';

import { initialState as defaultInitialState, reducer } from '../../../common/reducers/city';

describe('city reducer', () => {

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

  it('handles CHANGE_ACTIVE_CITY', () => {
    const activeCityId = '219c9b88-d798-4691-8e07-b67404bd222f';
    const initialState = Map({ activeCityId: null });
    const action = {
      type: 'CHANGE_ACTIVE_CITY',
      payload: {
        id: activeCityId
      }
    };
    const nextState = reducer(initialState, action);

    expect(nextState).to.equal(Map({ activeCityId }));
  });
});
