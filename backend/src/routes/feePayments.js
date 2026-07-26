const express = require('express');
const router = express.Router();
const feePaymentController = require('../controllers/feePaymentController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createFeePaymentSchema } = require('../validators/schemas');

router.get('/', authenticate, feePaymentController.getAllPayments);
router.post('/', authenticate, validate(createFeePaymentSchema), feePaymentController.recordPayment);
router.get('/due', authenticate, feePaymentController.getDuePayments);
router.get('/collection-report', authenticate, feePaymentController.getFeeCollectionReport);
router.get('/history/:id', authenticate, feePaymentController.getPaymentHistory);
router.get('/:id/receipt', authenticate, feePaymentController.getPaymentReceipt);

module.exports = router;
