// work order routes — maps HTTP methods + paths to controller functions
// auth middleware is applied to all routes in this file via router.use(auth)
// validate middleware is applied per-route where input validation is needed
//
// IMPORTANT: bulk-upload route must come before /:id
// otherwise express would interpret "bulk-upload" as an id param

const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const { validateCreate, validateUpdate, validateStatus } = require('../middleware/validate.middleware');
const controller = require('../controllers/workorders.controller');
const { AppError } = require('../utils/errors.util');
const multer = require('multer');

// multer handles multipart/form-data — needed for file uploads
// memoryStorage keeps the file in a buffer instead of saving to disk
// we only accept .csv files, max 2MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      return cb(new AppError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Only .csv files are accepted'));
    }
    cb(null, true);
  },
});

// apply auth to every route in this file
router.use(auth);

// bulk-upload MUST come before /:id — express reads routes top to bottom
// if /:id came first, a request to POST /bulk-upload would be treated as id = "bulk-upload"
router.post('/bulk-upload', upload.single('file'), controller.bulkUpload);

router.get('/', controller.list);
router.post('/', validateCreate, controller.create);
router.get('/:id', controller.getOne);
router.put('/:id', validateUpdate, controller.update);
router.patch('/:id/status', validateStatus, controller.changeStatus);
router.delete('/:id', controller.remove);

module.exports = router;
