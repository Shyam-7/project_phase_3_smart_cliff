const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes (for user pages to fetch content)
router.get('/public/user-dashboard', contentController.getUserDashboardContent);
router.get('/public/section/:section', contentController.getContentBySection);
router.get('/public/section-type/:sectionType', contentController.getContentBySectionType);

// Admin routes (protected)
router.get('/admin', protect, admin, contentController.getAllContent);
router.get('/admin/section/:section', protect, admin, contentController.getContentBySection);
router.get('/admin/section-type/:sectionType', protect, admin, contentController.getContentBySectionType);
router.post('/admin', protect, admin, contentController.createContent);
router.put('/admin/:id', protect, admin, contentController.updateContent);
router.delete('/admin/:id', protect, admin, contentController.deleteContent);

module.exports = router;
