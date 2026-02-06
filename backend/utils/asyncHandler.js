/**
 * Async Handler Utility
 * Wraps async route handlers to automatically catch errors
 */

/**
 * Wrap an async function to automatically catch errors and pass to next()
 * @param {Function} fn - Async function (req, res, next) => Promise
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create an error with status code
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @returns {Error} Error object with statusCode property
 */
const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * Common HTTP errors
 */
const errors = {
  badRequest: (message = 'Bad Request') => createError(400, message),
  unauthorized: (message = 'Unauthorized') => createError(401, message),
  forbidden: (message = 'Forbidden') => createError(403, message),
  notFound: (message = 'Not Found') => createError(404, message),
  conflict: (message = 'Conflict') => createError(409, message),
  serverError: (message = 'Internal Server Error') => createError(500, message)
};

module.exports = {
  asyncHandler,
  createError,
  errors
};
