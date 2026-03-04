const express = require('express');
const router = express.Router();

const {
  fetchContact,
  reportIssue,
  fetchMyNotifications,
  adminFetchIssues,
  adminFetchOneIssue
} = require('../controllers/supportController');
const { serviceGuard } = require('../middleware/serviceGuard');

const { protect } = require('../middleware/auth');
const { adminProtect } = require('../middleware/admin');

// Support
router.get('/contact/:orderId', protect, fetchContact);
router.post('/report-issue', protect, reportIssue);

// Notifications
router.get('/notifications', protect, fetchMyNotifications);



module.exports = router;