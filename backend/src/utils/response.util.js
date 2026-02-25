// helpers to send consistent responses from every route
// every response has the same shape: requestId, success flag, then data or error
// requestId comes from res.locals — it was attached by requestId.middleware earlier
// this is the same response standardization pattern from Lab 2 utils/response.js

const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    requestId: res.locals.requestId,
    success: true,
    data,
  });
};

const sendError = (res, statusCode, code, message, details = []) => {
  res.status(statusCode).json({
    requestId: res.locals.requestId,
    success: false,
    error: { code, message, details },
  });
};

module.exports = { sendSuccess, sendError };
