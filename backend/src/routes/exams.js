const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, examController.createExam);
router.get('/', authenticate, examController.getExams);
router.get('/:id', authenticate, examController.getExamById);
router.put('/:id', authenticate, examController.updateExam);
router.put('/:id/publish', authenticate, examController.publishExam);

router.post('/:id/questions', authenticate, examController.addQuestions);
router.post('/:id/start', authenticate, examController.startExam);
router.post('/:id/submit', authenticate, examController.submitExam);

module.exports = router;
