// checks that the request has the right api key in the x-api-key header
// if the key is missing or wrong, throws 401 immediately — request doesn't go further
// applied at route level on /api/* routes, not globally
// so GET /health still works without a key — useful for monitoring
// api key approach is what the professor specified — no jwt, just a shared string

const { AppError } = require('../utils/errors.util');

module.exports = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or missing API key');
  }
  next();
};
