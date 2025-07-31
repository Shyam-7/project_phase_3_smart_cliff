const express = require('express');
const { 
  getAllJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob,
  getAllJobsForAdmin
} = require('../controllers/jobController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   GET /api/jobs
// @desc    Get all active jobs
// @access  Public
router.get('/', getAllJobs);

// @route   GET /api/jobs/admin/all
// @desc    Get all jobs (including inactive) for admin
// @access  Private/Admin
router.get('/admin/all', protect, admin, getAllJobsForAdmin);

// @route   GET /api/jobs/:id
// @desc    Get a single job by its ID
// @access  Public
router.get('/:id', getJobById);

// @route   POST /api/jobs
// @desc    Create a new job
// @access  Private/Admin
router.post('/', protect, admin, createJob);

// @route   PUT /api/jobs/:id
// @desc    Update an existing job
// @access  Private/Admin
router.put('/:id', protect, admin, updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete a job
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteJob);

module.exports = router;