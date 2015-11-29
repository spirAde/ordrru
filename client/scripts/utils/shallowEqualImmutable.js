import Immutable from 'immutable';

export default function shallowEqualImmutable(objA, objB) {
  if (objA === objB || Immutable.is(objA, objB)) {
    return true;
  }

  if (typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (let index = 0, len = keysA.length; index < len; index++) {
    if (!bHasOwnProperty(keysA[index]) || !Immutable.is(objA[keysA[index]], objB[keysA[index]])) {
      return false;
    }
  }

  return true;
}
