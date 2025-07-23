const express = require('express');
const { 
  getAllJobs, 
  getJobById
} = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all active jobs
// @access  Public
router.get('/', getAllJobs);

// @route   GET /api/jobs/:id
// @desc    Get a single job by its ID
// @access  Public
router.get('/:id', getJobById);

// TODO: Implement these endpoints when needed
// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private/Admin
// router.post('/', protect, admin, createJob);

// @route   PUT /api/jobs/:id
// @desc    Update an existing job
// @access  Private/Admin
// router.put('/:id', protect, admin, updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private/Admin
// router.delete('/:id', protect, admin, deleteJob);

module.exports = router;