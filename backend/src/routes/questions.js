const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, questionController.createQuestion);
router.get('/', authenticate, questionController.getQuestions);
router.get('/:id', authenticate, questionController.getQuestionById);
router.put('/:id', authenticate, questionController.updateQuestion);
router.delete('/:id', authenticate, questionController.deleteQuestion);

module.exports = router;
