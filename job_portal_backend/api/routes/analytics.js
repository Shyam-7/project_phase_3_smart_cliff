const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// GET /api/analytics/overview - Get comprehensive analytics data
router.get('/overview', analyticsController.getAnalyticsOverview);

// GET /api/analytics/job-categories - Get job categories distribution
router.get('/job-categories', analyticsController.getJobCategories);

// GET /api/analytics/application-status - Get application status distribution
router.get('/application-status', analyticsController.getApplicationStatus);

// GET /api/analytics/monthly-trends - Get monthly trends data
router.get('/monthly-trends', analyticsController.getMonthlyTrends);

// GET /api/analytics/conversion - Get conversion funnel data
router.get('/conversion', analyticsController.getConversionData);

// GET /api/analytics/top-jobs - Get top performing jobs
router.get('/top-jobs', analyticsController.getTopJobs);

// GET /api/analytics/user-activity - Get user activity data
router.get('/user-activity', analyticsController.getUserActivity);

// GET /api/analytics/export/:type - Export analytics report
router.get('/export/:type', analyticsController.exportReport);

module.exports = router;

module.exports = router;
