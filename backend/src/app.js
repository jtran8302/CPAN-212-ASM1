// app setup — creates the express app, registers middleware and routes
// middleware order matters: json parsing first, then requestId, then routes, then error handlers
// the professor specified this order in the technical spec
//
// health check is registered before /api routes and doesn't need auth
// useful for checking if the server is up without needing an api key

const express = require('express');
const cors = require('cors');
const app = express();

// enable CORS so the Next.js frontend (port 3000) can talk to this backend (port 3001)
// without this the browser would block cross-origin requests
app.use(cors());

// parse json request bodies — must come before any route that reads req.body
app.use(express.json());

// attach a unique requestId to every request before anything else runs
// all responses will include this id so errors are traceable
app.use(require('./middleware/requestId.middleware'));

// health check — no auth required, just confirms the server is alive
// professor said in class: "health check we already have implemented in Lab 2, right?"
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// all api routes — auth middleware is applied inside each route file
app.use('/api', require('./routes/index.routes'));

// 404 handler — catches any request that didn't match a route above
app.use(require('./middleware/notfound.middleware'));

// central error handler — must be last, must have 4 parameters
// any error thrown anywhere in the app ends up here
app.use(require('./middleware/error.middleware'));

module.exports = app;
