/**
 * Returns whether Object `obj` has the property `k` and that it is 
 * not `undefined`
 * @param obj 
 * @param k 
 */
export function has<T extends {}>(obj: T, k: keyof T) {
  return obj.hasOwnProperty(k) && obj[k] !== undefined;
}
