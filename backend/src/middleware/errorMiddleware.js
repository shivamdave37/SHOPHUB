export const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (error, _req, res, _next) => {
  const sqlConflictCodes = new Set(['ER_DUP_ENTRY']);
  const sqlBadRequestCodes = new Set(['ER_NO_REFERENCED_ROW_2', 'ER_ROW_IS_REFERENCED_2', 'ER_CHECK_CONSTRAINT_VIOLATED']);

  let statusCode = error.statusCode || 500;

  if (!error.statusCode && sqlConflictCodes.has(error.code)) {
    statusCode = 409;
  }

  if (!error.statusCode && sqlBadRequestCodes.has(error.code)) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : error.message || 'Request failed'
  });
};
