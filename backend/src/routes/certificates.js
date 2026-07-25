const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate } = require('../middlewares/auth');

router.post('/generate/:studentId', authenticate, certificateController.generateCertificate);
router.get('/:studentId', authenticate, certificateController.getStudentCertificates);
router.get('/:id/download', authenticate, certificateController.downloadCertificate);
router.get('/verify/:qrToken', certificateController.verifyCertificate);

module.exports = router;
