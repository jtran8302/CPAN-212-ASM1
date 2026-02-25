// work order service — all the business logic lives here
// the controller just calls these functions and sends back the result
// this is the same layered pattern from Lab 2: route → controller → service → store
//
// keeping business logic here (not in the route) means we can test it separately
// and the route files stay readable — they don't get cluttered with if/else logic

const { v4: uuidv4 } = require('uuid');
const store = require('../data/workorders.store');
const { AppError } = require('../utils/errors.util');
const { ALLOWED_TRANSITIONS, DEPARTMENTS, PRIORITIES } = require('../utils/constants');

// list with filters and pagination
// returns { items, page, limit, total } — the frontend needs total to render pagination
const listWorkOrders = (query = {}) => {
  const { status, department, priority, assignee, q, page = 1, limit = 10 } = query;
  let results = store.getAll();

  // apply filters — each one narrows down the results
  if (status) results = results.filter(o => o.status === status);
  if (department) results = results.filter(o => o.department === department);
  if (priority) results = results.filter(o => o.priority === priority);
  if (assignee) results = results.filter(o => o.assignee === assignee);
  if (q) results = results.filter(o => o.title.toLowerCase().includes(q.toLowerCase()));

  const total = results.length;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const items = results.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  return { items, page: pageNum, limit: limitNum, total };
};

// throws if not found — so callers don't have to check for null
const getWorkOrderById = (id) => {
  const order = store.getById(id);
  if (!order) throw new AppError(404, 'NOT_FOUND', `Work order ${id} not found`);
  return order;
};

// creates a new work order — status always starts as NEW
// id and timestamps are assigned here, not by the caller
const createWorkOrder = (data) => {
  const now = new Date().toISOString();
  const workOrder = {
    id: uuidv4(),
    ...data,
    status: 'NEW',   // always starts as NEW — can't create a work order in another status
    assignee: data.assignee || null,
    createdAt: now,
    updatedAt: now,
  };
  return store.save(workOrder);
};

// updates allowed fields only — status is NOT updatable here, use changeStatus instead
// always updates updatedAt so we know when the record last changed
const updateWorkOrder = (id, data) => {
  const order = getWorkOrderById(id);
  const { title, description, priority, assignee } = data;

  const updated = {
    ...order,
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(priority !== undefined && { priority }),
    ...(assignee !== undefined && { assignee }),
    updatedAt: new Date().toISOString(),
  };
  return store.save(updated);
};

// enforces the status lifecycle — checks ALLOWED_TRANSITIONS before applying
// transition rules are defined in constants.js, not hardcoded here
const changeStatus = (id, newStatus) => {
  const order = getWorkOrderById(id);
  const allowed = ALLOWED_TRANSITIONS[order.status];

  // if the requested status is not in the allowed list, reject with 409
  // e.g. trying to go from DONE to anything — DONE has no allowed transitions
  if (!allowed.includes(newStatus)) {
    throw new AppError(409, 'INVALID_TRANSITION',
      `Cannot transition from ${order.status} to ${newStatus}`);
  }

  const updated = { ...order, status: newStatus, updatedAt: new Date().toISOString() };
  return store.save(updated);
};

const deleteWorkOrder = (id) => {
  getWorkOrderById(id); // throws 404 if not found before we try to delete
  store.delete(id);
};

// bulk upload — partial acceptance strategy
// valid rows get saved, invalid rows get collected with their row number
// returns a summary so the frontend can show what succeeded and what failed
// same pattern as the bulk upload in Lab 3
const bulkUpload = (rows) => {
  const accepted = [];
  const errors = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because row 1 is headers, arrays start at 0
    const rowErrors = [];

    if (!row.title || row.title.length < 5)
      rowErrors.push({ field: 'title', reason: 'Minimum 5 characters' });
    if (!row.description || row.description.length < 10)
      rowErrors.push({ field: 'description', reason: 'Minimum 10 characters' });
    if (!DEPARTMENTS.includes(row.department))
      rowErrors.push({ field: 'department', reason: `Must be one of: ${DEPARTMENTS.join(', ')}` });
    if (!PRIORITIES.includes(row.priority))
      rowErrors.push({ field: 'priority', reason: 'Must be LOW/MEDIUM/HIGH' });
    if (!row.requesterName || row.requesterName.length < 3)
      rowErrors.push({ field: 'requesterName', reason: 'Minimum 3 characters' });

    if (rowErrors.length > 0) {
      // row has errors — add each error with the row number so the user knows where to look
      rowErrors.forEach(e => errors.push({ row: rowNumber, ...e }));
    } else {
      accepted.push(createWorkOrder(row));
    }
  });

  return {
    uploadId: uuidv4(),
    strategy: 'PARTIAL_ACCEPTANCE',
    totalRows: rows.length,
    accepted: accepted.length,
    rejected: errors.length > 0 ? rows.length - accepted.length : 0,
    errors,
  };
};

module.exports = { listWorkOrders, getWorkOrderById, createWorkOrder, updateWorkOrder, changeStatus, deleteWorkOrder, bulkUpload };
