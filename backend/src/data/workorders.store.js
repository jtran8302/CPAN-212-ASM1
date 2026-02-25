// in-memory storage for work orders — this is our "database" for this assignment
// using a Map because lookup by id is O(1) and it's cleaner than an array
// spec says in-memory storage, so we're not writing to files like Lab 2 did
// downside: data is gone when server restarts — that's fine for now
// phase 2 will replace this with a mongodb collection

const store = new Map();

module.exports = {
  getAll: () => [...store.values()],        // spread into array so callers get a copy
  getById: (id) => store.get(id) || null,
  save: (workOrder) => {
    store.set(workOrder.id, workOrder);
    return workOrder;
  },
  delete: (id) => store.delete(id),
};
