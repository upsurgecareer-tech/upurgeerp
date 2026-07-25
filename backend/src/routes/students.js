const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createStudentSchema, updateStudentSchema } = require('../validators/schemas');
const multer = require('multer');
const path = require('path');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/', authenticate, validate(createStudentSchema), studentController.createStudent);
router.get('/', authenticate, studentController.getStudents);
router.get('/stats', authenticate, studentController.getStudentStats);
router.get('/:id', authenticate, studentController.getStudentById);
router.put('/:id', authenticate, validate(updateStudentSchema), studentController.updateStudent);
router.delete('/:id', authenticate, studentController.deleteStudent);

// Bulk Import
router.post('/bulk-import', authenticate, studentController.bulkImport);

router.post('/:student_id/documents', authenticate, upload.single('document'), studentController.uploadDocument);
router.get('/:student_id/documents', authenticate, studentController.getDocuments);
router.delete('/:student_id/documents/:docId', authenticate, studentController.deleteDocument);

// Generate ID Card
router.post('/:id/generate-idcard', authenticate, studentController.generateIDCard);

module.exports = router;
