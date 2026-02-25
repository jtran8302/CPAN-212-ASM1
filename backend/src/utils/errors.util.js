// custom error class for all business logic errors
// we throw this instead of using res.status() directly in route handlers
// that way all error responses go through one place — the error middleware
// same approach as Lab 2 where errors bubble up to a central handler

class AppError extends Error {
  constructor(statusCode, code, message, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;      // machine-readable string like 'NOT_FOUND', 'VALIDATION_ERROR'
    this.details = details; // array of field-level errors, used for validation
  }
}

module.exports = { AppError };
