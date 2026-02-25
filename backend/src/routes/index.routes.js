// central router — mounts each resource's route file under its path
// adding a new resource later = create a route file, add one line here
// same central router pattern from Lab 2

const router = require('express').Router();
router.use('/workorders', require('./workorders.routes'));
module.exports = router;
