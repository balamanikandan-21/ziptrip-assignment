/**
 * Wrap an async Express handler so any rejected promise is forwarded to
 * `next()` (and therefore to the central error handler) instead of crashing
 * the process with an unhandled rejection.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
