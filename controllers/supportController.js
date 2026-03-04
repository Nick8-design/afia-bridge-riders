const Issue = require('../models/Issue');
const Order = require('../models/Order');
const Rider = require('../models/Rider');
const Notification = require('../models/Notification');

// 1) Fetch contacts for an order
// GET /api/support/contact/:orderId
exports.fetchContact = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If order is assigned, include emergencyContact of assigned rider
    let emergencyContact = null;
    if (order.assignedRider) {
      const rider = await Rider.findById(order.assignedRider).select('emergencyContact');
      emergencyContact = rider?.emergencyContact || null;
    }

    res.json({
      success: true,
      data: {
        docContact: order.pickUp?.docContact || null,
        receiverContact: order.dropOff?.receiverContact || null,
        emergencyContact
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2) Report an issue (protected)
// POST /api/support/report-issue
// body: { orderId, title, issue }
exports.reportIssue = async (req, res) => {
  try {
    const { orderId, title, issue } = req.body;

    if (!orderId || !title || !issue) {
      return res.status(400).json({
        success: false,
        message: 'orderId, title and issue are required'
      });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Optional: only allow reporting if rider is assigned to that order
    if (order.assignedRider && order.assignedRider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed to report issue for this order' });
    }

    const created = await Issue.create({
      orderId,
      userId: req.user.id,
      title,
      issue
    });

    // Optional: create a notification for the rider (or later for admin)
    await Notification.create({
      userId: req.user.id,
      notificationType: 'Support',
      title: 'Issue reported',
      text: `Issue recorded for order ${order.packageNumber || orderId}`
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3) Rider fetch own notifications
// GET /api/support/notifications
exports.fetchMyNotifications = async (req, res) => {
  try {
    const notes = await Notification.find({ userId: req.user.id }).sort({ timeSent: -1 });
    res.json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4) Admin: fetch all issues (sorted by date desc by default)
// GET /api/support/admin/issues?sort=asc|desc
exports.adminFetchIssues = async (req, res) => {
  try {
    const sort = (req.query.sort || 'desc').toLowerCase() === 'asc' ? 1 : -1;

    const issues = await Issue.find({})
      .populate('userId', 'fname lname phnNum email')
      .populate('orderId', 'packageNumber deliveredStatus')
      .sort({ date: sort });

    res.json({ success: true, count: issues.length, data: issues });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5) Admin: fetch one issue
// GET /api/support/admin/issues/:issueId
exports.adminFetchOneIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.issueId)
      .populate('userId', 'fname lname phnNum email')
      .populate('orderId', 'packageNumber deliveredStatus');

    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });

    res.json({ success: true, data: issue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};