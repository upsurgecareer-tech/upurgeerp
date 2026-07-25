const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, assignmentController.createAssignment);
router.get('/', authenticate, assignmentController.getAssignments);
router.get('/:id', authenticate, assignmentController.getAssignmentById);

router.post('/:id/submit', authenticate, assignmentController.submitAssignment);
router.get('/:id/submissions', authenticate, assignmentController.getSubmissions);
router.put('/submissions/:id/grade', authenticate, assignmentController.gradeSubmission);

module.exports = router;
