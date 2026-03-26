const express = require('express');
const router = express.Router();

const {
  fetchContact,
  reportIssue,
  fetchMyNotifications,
  markAsRead,
  markAllRead,
  deleteNotification
} = require('../controllers/supportController');
const { serviceGuard } = require('../middleware/serviceGuard');

const { protect } = require('../middleware/auth');
// const { adminProtect } = require('../middleware/admin');

// Support
router.get('/contact/:orderId', protect, fetchContact);
router.post('/report-issue', protect, reportIssue);

// Notifications
router.get('/notifications', protect, fetchMyNotifications);

// router.get('/notifications', protect, notificationController.fetchMyNotifications);
router.put('/notifications/:id/read', protect, markAsRead);
router.put('/notifications/mark-all-read', protect, markAllRead);
router.delete('/notifications/:id', protect, deleteNotification);



module.exports = router;