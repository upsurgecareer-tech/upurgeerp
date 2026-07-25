const express = require('express');
const router = express.Router();
const liveClassController = require('../controllers/liveClassController');
const { authenticate } = require('../middlewares/auth');

router.post('/', authenticate, liveClassController.scheduleLiveClass);
router.get('/', authenticate, liveClassController.getLiveClasses);
router.get('/upcoming', authenticate, liveClassController.getUpcoming);
router.get('/:id', authenticate, liveClassController.getLiveClassById);
router.put('/:id', authenticate, liveClassController.updateLiveClass);
router.put('/:id/status', authenticate, liveClassController.updateStatus);

module.exports = router;
