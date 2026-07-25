const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createLeadSchema, updateLeadSchema } = require('../validators/schemas');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/import', authenticate, upload.single('file'), leadController.importLeads);
router.post('/', authenticate, validate(createLeadSchema), leadController.createLead);
router.get('/', authenticate, leadController.getLeads);
router.get('/:id', authenticate, leadController.getLeadById);
router.get('/:id/activities', authenticate, leadController.getLeadActivities);
router.post('/:id/notes', authenticate, leadController.addLeadNote);
router.put('/:id', authenticate, validate(updateLeadSchema), leadController.updateLead);
router.put('/:id/stage', authenticate, leadController.updateLeadStage);
router.put('/:id/assign', authenticate, leadController.assignLead);
router.delete('/:id', authenticate, leadController.deleteLead);

module.exports = router;
