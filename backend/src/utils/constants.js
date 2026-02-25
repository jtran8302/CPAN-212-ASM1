// all the allowed values for work order fields
// same pattern as config.js in Lab 2 — one place for all constants
// if the business adds a new department or priority, we only change it here

const DEPARTMENTS = ['FACILITIES', 'IT', 'SECURITY', 'HR'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
const STATUSES = ['NEW', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

// defines which status transitions are allowed
// key = current status, value = array of statuses it can move to
// this enforces the lifecycle rules from the spec
// e.g. DONE has an empty array — once done, no more changes allowed
const ALLOWED_TRANSITIONS = {
  NEW: ['IN_PROGRESS'],
  IN_PROGRESS: ['BLOCKED', 'DONE'],
  BLOCKED: ['IN_PROGRESS'],
  DONE: [],
};

module.exports = { DEPARTMENTS, PRIORITIES, STATUSES, ALLOWED_TRANSITIONS };
