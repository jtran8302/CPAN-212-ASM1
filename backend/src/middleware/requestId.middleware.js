// attaches a unique id to every request before it hits the route handler
// stored in res.locals so any code that runs after can access it
// response helpers read it from res.locals to include in every response
// useful for debugging — if a user reports an error, we can find the request by id
// same middleware pattern from Lab 2 middleware/requestLogger.js

const { v4: uuidv4 } = require('uuid');

module.exports = (req, res, next) => {
  res.locals.requestId = uuidv4();
  next();
};
