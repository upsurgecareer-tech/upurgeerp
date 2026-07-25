const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createBatchSchema, updateBatchSchema, addStudentToBatchSchema, createTimetableSchema } = require('../validators/schemas');

router.post('/', authenticate, validate(createBatchSchema), batchController.createBatch);
router.get('/', authenticate, batchController.getBatches);
router.get('/:id', authenticate, batchController.getBatchById);
router.put('/:id', authenticate, validate(updateBatchSchema), batchController.updateBatch);
router.put('/:id/status', authenticate, batchController.updateBatchStatus);

router.post('/:id/students', authenticate, validate(addStudentToBatchSchema), batchController.addStudentToBatch);
router.get('/:id/students', authenticate, batchController.getBatchStudents);
router.delete('/:id/students/:studentId', authenticate, batchController.removeStudentFromBatch);

router.post('/:id/timetable', authenticate, validate(createTimetableSchema), batchController.createTimetable);
router.get('/:id/timetable', authenticate, batchController.getTimetable);

module.exports = router;
