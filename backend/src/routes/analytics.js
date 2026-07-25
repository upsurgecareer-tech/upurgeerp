const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middlewares/auth');
const { cacheMiddleware } = require('../utils/cacheService');

router.get('/lead-source', authenticate, cacheMiddleware('analytics:lead-source', 600), analyticsController.getLeadSourceAnalytics);
router.get('/lead-stage', authenticate, cacheMiddleware('analytics:lead-stage', 600), analyticsController.getLeadStageFunnel);
router.get('/lead-conversion', authenticate, cacheMiddleware('analytics:conversion', 600), analyticsController.getLeadConversionRate);
router.get('/counsellor-wise', authenticate, cacheMiddleware('analytics:counsellor', 600), analyticsController.getCounsellorPerformance);
router.get('/course-wise', authenticate, cacheMiddleware('analytics:course', 600), analyticsController.getCourseWiseEnquiry);

module.exports = router;
