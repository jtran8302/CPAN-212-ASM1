// entry point — loads env variables and starts the server
// keep this file minimal: just config, app setup, and listen
// this is the file you run: node server.js

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`WorkOrderHub backend running on http://localhost:${PORT}`);
});
