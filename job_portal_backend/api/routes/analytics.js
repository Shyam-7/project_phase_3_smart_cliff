const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/analytics/overview - Get comprehensive analytics data
router.get('/overview', protect, admin, analyticsController.getAnalyticsOverview);

// GET /api/analytics/job-categories - Get job categories distribution
router.get('/job-categories', protect, admin, analyticsController.getJobCategories);

// GET /api/analytics/application-status - Get application status distribution
router.get('/application-status', protect, admin, analyticsController.getApplicationStatus);

// GET /api/analytics/monthly-trends - Get monthly trends data
router.get('/monthly-trends', protect, admin, analyticsController.getMonthlyTrends);

// GET /api/analytics/conversion - Get conversion funnel data
router.get('/conversion', protect, admin, analyticsController.getConversionData);

// GET /api/analytics/top-jobs - Get top performing jobs
router.get('/top-jobs', protect, admin, analyticsController.getTopJobs);

// GET /api/analytics/user-activity - Get user activity data
router.get('/user-activity', protect, admin, analyticsController.getUserActivity);

// GET /api/analytics/export/:type - Export analytics report
router.get('/export/:type', protect, admin, analyticsController.exportReport);

module.exports = router;

module.exports = router;
