const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, admissionController.createAdmission);
router.get('/', authenticate, admissionController.getAdmissions);
router.get('/:id', authenticate, admissionController.getAdmissionById);
router.put('/:id', authenticate, admissionController.updateAdmission);
router.put('/:id/status', authenticate, admissionController.updateAdmissionStatus);

router.post('/:id/fee-schedule', authenticate, admissionController.createFeeSchedule);
router.get('/:id/fee-schedule', authenticate, admissionController.getFeeSchedule);
router.post('/:id/discount', authenticate, admissionController.applyDiscount);

module.exports = router;
