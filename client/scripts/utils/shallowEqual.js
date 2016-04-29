export default function shallowEqual(objA, objB) {
  if (objA === objB) {
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

  const bHasOwnProperty = Object.prototype.hasOwnProperty.bind(objB);
  for (let index = 0; index < keysA.length; index++) {
    if (!bHasOwnProperty(keysA[index]) || objA[keysA[index]] !== objB[keysA[index]]) {
      return false;
    }
  }

  return true;
}