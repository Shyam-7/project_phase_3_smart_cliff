// routes/communication.js
const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes for announcements
router.post('/announcements', protect, admin, communicationController.createAnnouncement.bind(communicationController));
router.get('/announcements', protect, admin, communicationController.getAnnouncements.bind(communicationController));
router.get('/announcements/stats', protect, admin, communicationController.getAnnouncementStats.bind(communicationController));
router.post('/notifications/send', protect, admin, communicationController.sendCustomNotification.bind(communicationController));

// User routes for notifications
router.get('/notifications', protect, communicationController.getUserNotifications.bind(communicationController));
router.put('/notifications/:notificationId/read', protect, communicationController.markNotificationAsRead.bind(communicationController));
router.put('/notifications/read-all', protect, communicationController.markAllNotificationsAsRead.bind(communicationController));

// Notification preferences
router.get('/preferences', protect, communicationController.getNotificationPreferences.bind(communicationController));
router.put('/preferences', protect, communicationController.updateNotificationPreferences.bind(communicationController));

module.exports = router;
