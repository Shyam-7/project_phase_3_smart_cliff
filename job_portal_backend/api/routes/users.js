const express = require('express');
const { 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  getUserById 
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get the profile for the currently logged-in user
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   PUT /api/users/profile
// @desc    Update the profile for the currently logged-in user
// @access  Private
router.put('/profile', protect, updateUserProfile);

// @route   PATCH /api/users/profile
// @desc    Update the profile for the currently logged-in user (alternative method)
// @access  Private
router.patch('/profile', protect, updateUserProfile);

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, admin, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', protect, admin, getUserById);

module.exports = router;