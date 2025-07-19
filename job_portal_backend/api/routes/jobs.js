const express = require('express');
const { getAllJobs, getJobById } = require('../controllers/jobController');
const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all active jobs
// @access  Public
router.get('/', getAllJobs);

// @route   GET /api/jobs/:id
// @desc    Get a single job by its ID
// @access  Public
router.get('/:id', getJobById);

// Add more routes here for creating, updating, or deleting jobs
// For example, a protected route for an employer to post a job:
// router.post('/', protect, createJob);

module.exports = router;