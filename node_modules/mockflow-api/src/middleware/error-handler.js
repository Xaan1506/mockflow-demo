/**
 * Global API Error handler middleware.
 * Ensures consistent error formatting without leaking stack traces.
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || (err.name === 'ValidationError' || err.name === 'PaginationValidationError' ? 400 : 500);
  const code = err.code || (status === 404 ? 'RESOURCE_NOT_FOUND' : status === 400 ? 'INVALID_REQUEST' : 'INTERNAL_SERVER_ERROR');

  const errorResponse = {
    error: {
      message: err.message || 'An unexpected error occurred',
      status,
      code
    }
  };

  if (err.details) {
    errorResponse.error.details = err.details;
  }

  res.status(status).json(errorResponse);
}

export class ApiError extends Error {
  constructor(message, status = 400, code = 'BAD_REQUEST', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
