const express = require('express');
const router = express.Router();
const leadSourceController = require('../controllers/leadSourceController');
const { authenticate } = require('../middlewares/auth');

router.get('/lead-sources', authenticate, leadSourceController.getLeadSources);
router.post('/lead-sources', authenticate, leadSourceController.createLeadSource);
router.put('/lead-sources/:id', authenticate, leadSourceController.updateLeadSource);
router.delete('/lead-sources/:id', authenticate, leadSourceController.deleteLeadSource);

router.get('/lead-stages', authenticate, leadSourceController.getLeadStages);
router.post('/lead-stages', authenticate, leadSourceController.createLeadStage);
router.put('/lead-stages/:id', authenticate, leadSourceController.updateLeadStage);

module.exports = router;
