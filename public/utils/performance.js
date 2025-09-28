/**
 * Performance utilities
 */
export const measureTime = (fn) => {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    return [result, end - start];
};
export const measureAsyncTime = async (fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return [result, end - start];
};
