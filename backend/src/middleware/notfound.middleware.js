// catches any request that didn't match a route above
// without this, express would just hang or give a generic response
// registered after all routes so it only fires if nothing else matched

const { AppError } = require('../utils/errors.util');

module.exports = (req, res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));
};
