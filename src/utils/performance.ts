/**
 * Performance utilities
 */

export const measureTime = <T>(fn: () => T): [T, number] => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return [result, end - start];
};

export const measureAsyncTime = async <T>(fn: () => Promise<T>): Promise<[T, number]> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return [result, end - start];
};