import { Map, List, fromJS } from 'immutable';

export default function createReducer(handlers, initialState) {
  return (state = initialState, action) => {
    let _state = state;
    if (!Map.isMap(state) && !List.isList(state)) {
      _state = fromJS(state);
    }

    const handler = handlers[action.type];

    if (!handler) {
      return _state;
    }

    _state = handler(_state, action);

    if (!Map.isMap(_state) && !List.isList(_state)) {
      throw new TypeError('Reducers must return Immutable objects.');
    }

    return _state;
  };
}
