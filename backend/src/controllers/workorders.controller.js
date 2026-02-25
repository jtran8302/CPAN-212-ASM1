// work order controller — sits between the route and the service
// reads from req (body, params, query), calls the right service function, sends the response
// no business logic here — if you find yourself writing if/else for work order rules,
// it probably belongs in the service instead
//
// all functions are wrapped with asyncHandler so errors from async code
// automatically reach the error middleware — no need for try/catch everywhere

const { sendSuccess } = require('../utils/response.util');
const { AppError } = require('../utils/errors.util');
const service = require('../services/workorders.service');

// wraps async route handlers so any thrown error reaches the error middleware
// without this, unhandled promise rejections would crash the process or hang
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const list = asyncHandler(async (req, res) => {
  const result = service.listWorkOrders(req.query);
  sendSuccess(res, result);
});

const getOne = asyncHandler(async (req, res) => {
  const order = service.getWorkOrderById(req.params.id);
  sendSuccess(res, order);
});

const create = asyncHandler(async (req, res) => {
  const order = service.createWorkOrder(req.body);
  sendSuccess(res, order, 201); // 201 Created
});

const update = asyncHandler(async (req, res) => {
  const order = service.updateWorkOrder(req.params.id, req.body);
  sendSuccess(res, order);
});

const changeStatus = asyncHandler(async (req, res) => {
  const order = service.changeStatus(req.params.id, req.body.status);
  sendSuccess(res, order);
});

const remove = asyncHandler(async (req, res) => {
  service.deleteWorkOrder(req.params.id);
  res.status(204).send(); // 204 No Content — nothing to return after a delete
});

const bulkUpload = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, 'VALIDATION_ERROR', 'No file uploaded');

  // parse CSV from the file buffer that multer put in req.file.buffer
  // using csv-parse — same approach as Lab 3 csv.js utility
  const { parse } = require('csv-parse/sync');
  const rows = parse(req.file.buffer.toString(), {
    columns: true,          // use first row as column names
    skip_empty_lines: true,
    trim: true,             // trim whitespace from values
  });

  const result = service.bulkUpload(rows);
  sendSuccess(res, result);
});

module.exports = { list, getOne, create, update, changeStatus, remove, bulkUpload };
