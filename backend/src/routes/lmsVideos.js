const express = require('express');
const router = express.Router();
const lmsVideoController = require('../controllers/lmsVideoController');
const { authenticate } = require('../middlewares/authenticate');

router.post('/', authenticate, lmsVideoController.uploadVideo);
router.get('/', authenticate, lmsVideoController.getVideos);
router.get('/:id', authenticate, lmsVideoController.getVideoById);
router.put('/:id', authenticate, lmsVideoController.updateVideo);
router.delete('/:id', authenticate, lmsVideoController.deleteVideo);

router.post('/:id/progress', authenticate, lmsVideoController.updateProgress);
router.get('/:id/progress', authenticate, lmsVideoController.getProgress);

module.exports = router;
