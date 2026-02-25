// central error handler — all thrown errors end up here
// express knows this is an error handler because it has 4 parameters (err, req, res, next)
// it has to be registered LAST in app.js — after all routes and middleware
//
// three error types arrive here:
//   1. AppError — our custom errors (validation, not found, unauthorized, etc)
//   2. MulterError — file upload errors from multer (file too large, wrong type)
//   3. everything else — unexpected crashes, default to 500
//
// multer throws its own error type, not AppError, so we catch it separately
// without this check, a file over 2MB would return 500 instead of the correct 413
// never expose stack traces in the response — security risk

const { AppError } = require('../utils/errors.util');
const multer = require('multer');

module.exports = (err, req, res, next) => {
  // multer errors — file upload issues like size limit or wrong file type
  // multer throws MulterError, not AppError, so we handle it before the AppError check
  // LIMIT_FILE_SIZE means the uploaded file exceeded the fileSize limit set in multer config
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const code = err.code === 'LIMIT_FILE_SIZE' ? 'PAYLOAD_TOO_LARGE' : 'UPLOAD_ERROR';
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File exceeds the maximum allowed size of 2MB'
      : `Upload error: ${err.message}`;

    return res.status(statusCode).json({
      requestId: res.locals.requestId || 'unknown',
      success: false,
      error: { code, message, details: [] },
    });
  }

  // AppError — our own errors (validation, not found, unauthorized, invalid transition)
  // these have a statusCode, code, message, and optional details array
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : 'INTERNAL_ERROR';
  const message = err instanceof AppError ? err.message : 'Something went wrong';
  const details = err instanceof AppError ? err.details : [];

  res.status(statusCode).json({
    requestId: res.locals.requestId || 'unknown',
    success: false,
    error: { code, message, details },
  });
};
