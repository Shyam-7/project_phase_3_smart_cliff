const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/analytics
// @desc    Get comprehensive analytics data
// @access  Private (Admin only)
router.get('/', protect, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  analyticsController.getAnalyticsData(req, res);
});

// @route   GET /api/analytics/stats
// @desc    Get basic dashboard statistics
// @access  Private (Admin only)
router.get('/stats', protect, (req, res) => {
  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  analyticsController.getDashboardStats(req, res);
});

module.exports = router;
