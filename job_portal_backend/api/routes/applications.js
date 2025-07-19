const express = require('express');
const { applyToJob } = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (requires login)
router.post('/', protect, applyToJob);

module.exports = router;