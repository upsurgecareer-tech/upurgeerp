const express = require('express');
const router = express.Router();
const followUpController = require('../controllers/followUpController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');
const { createFollowUpSchema } = require('../validators/schemas');

router.get('/today', authenticate, followUpController.getTodayFollowUps);
router.get('/upcoming', authenticate, followUpController.getUpcomingFollowUps);
router.post('/leads/:lead_id', authenticate, validate(createFollowUpSchema), followUpController.createFollowUp);
router.get('/leads/:lead_id', authenticate, followUpController.getFollowUpsByLead);
router.put('/:id', authenticate, followUpController.updateFollowUp);
router.delete('/:id', authenticate, followUpController.deleteFollowUp);

module.exports = router;
