// validation middleware — checks request body before it reaches the controller
// collects all errors into an array so we can return everything wrong at once
// instead of making the user fix one field at a time
// same pattern as validators.js in Lab 2

const { AppError } = require('../utils/errors.util');
const { DEPARTMENTS, PRIORITIES, STATUSES } = require('../utils/constants');

const validateCreate = (req, res, next) => {
  const { title, description, department, priority, requesterName } = req.body;
  const errors = [];

  if (!title || title.length < 5)
    errors.push({ field: 'title', reason: 'Minimum 5 characters' });
  if (!description || description.length < 10)
    errors.push({ field: 'description', reason: 'Minimum 10 characters' });
  if (!DEPARTMENTS.includes(department))
    errors.push({ field: 'department', reason: `Must be one of: ${DEPARTMENTS.join(', ')}` });
  if (!PRIORITIES.includes(priority))
    errors.push({ field: 'priority', reason: `Must be one of: ${PRIORITIES.join(', ')}` });
  if (!requesterName || requesterName.length < 3)
    errors.push({ field: 'requesterName', reason: 'Minimum 3 characters' });

  if (errors.length > 0)
    throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', errors);
  next();
};

const validateUpdate = (req, res, next) => {
  // update only validates fields that were actually sent
  // if a field is undefined, the user didn't include it — skip it
  const { title, description, priority } = req.body;
  const errors = [];

  if (title !== undefined && title.length < 5)
    errors.push({ field: 'title', reason: 'Minimum 5 characters' });
  if (description !== undefined && description.length < 10)
    errors.push({ field: 'description', reason: 'Minimum 10 characters' });
  if (priority !== undefined && !PRIORITIES.includes(priority))
    errors.push({ field: 'priority', reason: 'Must be LOW/MEDIUM/HIGH' });

  if (errors.length > 0)
    throw new AppError(400, 'VALIDATION_ERROR', 'Validation failed', errors);
  next();
};

const validateStatus = (req, res, next) => {
  const { status } = req.body;
  // just checks if it's a known status — the actual transition check happens in the service
  if (!STATUSES.includes(status))
    throw new AppError(400, 'VALIDATION_ERROR', `Status must be one of: ${STATUSES.join(', ')}`);
  next();
};

module.exports = { validateCreate, validateUpdate, validateStatus };
