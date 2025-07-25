const express = require('express');
const { 
  getDashboardStats,
  getRecentJobs,
  getRecentActivity
} = require('../controllers/adminDashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private/Admin
router.get('/stats', protect, admin, getDashboardStats);

// @route   GET /api/admin/dashboard/recent-jobs
// @desc    Get recent job postings with application counts
// @access  Private/Admin
router.get('/recent-jobs', protect, admin, getRecentJobs);

// @route   GET /api/admin/dashboard/recent-activity
// @desc    Get recent platform activity
// @access  Private/Admin
router.get('/recent-activity', protect, admin, getRecentActivity);

module.exports = router;
