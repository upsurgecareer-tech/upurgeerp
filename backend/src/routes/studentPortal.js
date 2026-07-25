const express = require('express');
const router = express.Router();
const studentPortalController = require('../controllers/studentPortalController');
const { authenticate } = require('../middlewares/authenticate');
const multer = require('multer');
const path = require('path');

// Multer configuration for assignment uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Public routes (no authentication)
router.post('/login', studentPortalController.studentLogin);

// Protected routes (require authentication)
router.get('/dashboard', authenticate, studentPortalController.getStudentDashboard);
router.get('/attendance', authenticate, studentPortalController.getStudentAttendance);
router.get('/assignments', authenticate, studentPortalController.getStudentAssignments);
router.post('/assignments/submit', authenticate, upload.single('file'), studentPortalController.submitAssignment);
router.get('/study-materials', authenticate, studentPortalController.getStudyMaterials);
router.get('/results', authenticate, studentPortalController.getExamResults);
router.put('/profile', authenticate, studentPortalController.updateStudentProfile);
router.get('/certificates', authenticate, studentPortalController.getStudentCertificates);
router.get('/documents', authenticate, studentPortalController.getStudentDocuments);

module.exports = router;
