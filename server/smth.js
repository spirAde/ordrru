import Immutable from 'immutable';

import isEqual from 'lodash/isEqual';

const a = Immutable.Map({ a: 1, b: 2 });
const b = Immutable.Map({ a: 1, b: 2 });

const c = { data: Immutable.Map({ a: 1, b: 2 }) };
const d = { data: Immutable.Map({ a: 1, b: 2 }) };

const e = Immutable.Map({});

console.log(Immutable.is(c, d));

if (e.size) console.log(1);

console.log(Immutable.Map());