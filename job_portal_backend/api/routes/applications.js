const express = require('express');
const { 
  applyToJob, 
  getUserApplications, 
  withdrawApplication,
  updateApplication 
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (requires login)
router.post('/', protect, applyToJob);

// @route   GET /api/applications/user
// @desc    Get applications for current user
// @access  Private (requires login)
router.get('/user', protect, getUserApplications);

// @route   GET /api/applications/user/:userId
// @desc    Get applications for a specific user
// @access  Private (requires login)
router.get('/user/:userId', protect, getUserApplications);

// @route   PUT /api/applications/:id
// @desc    Update an application
// @access  Private (requires login)
router.put('/:id', protect, updateApplication);

// @route   DELETE /api/applications/:id
// @desc    Withdraw an application
// @access  Private (requires login)
router.delete('/:id', protect, withdrawApplication);

module.exports = router;