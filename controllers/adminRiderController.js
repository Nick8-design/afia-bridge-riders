const Rider = require('../models/Rider');
const Finance = require('../models/Finance');
const Order = require('../models/Order');
const Issue = require('../models/Issue');
const Notification = require('../models/Notification');

// GET /api/admin/riders?status=Pending|Approved|Rejected&accountStatus=Active|Suspended|Locked
exports.fetchAllRiders = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status) filter.approvedStatus = req.query.status;
    if (req.query.accountStatus) filter.accountStatus = req.query.accountStatus;

    const riders = await Rider.find(filter).sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, count: riders.length, data: riders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/riders/:riderId
exports.fetchOneRider = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.riderId).select('-password');
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });
    res.json({ success: true, data: rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/riders/:riderId/verify
// Body: { idVerified: true, lincesVerified: true, approvedStatus: "Approved", reason?: "" }
exports.verifyRider = async (req, res) => {
  try {
    const { idVerified, lincesVerified, approvedStatus, reason } = req.body;

    const rider = await Rider.findById(req.params.riderId);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    if (typeof idVerified === 'boolean') rider.idVerified = idVerified;
    if (typeof lincesVerified === 'boolean') rider.lincesVerified = lincesVerified;

    if (approvedStatus) {
      if (!['Pending', 'Approved', 'Rejected'].includes(approvedStatus)) {
        return res.status(400).json({ success: false, message: 'approvedStatus must be Pending, Approved, or Rejected' });
      }
      rider.approvedStatus = approvedStatus;
      rider.dateApproved = approvedStatus === 'Approved' ? new Date() : rider.dateApproved;
    }

    rider.verifiedByAdmin = true;
    rider.verifiedAt = new Date();

    if (typeof reason === 'string') rider.statusReason = reason;

    await rider.save();

    await Notification.create({
      userId: rider._id,
      notificationType: 'Admin',
      title: 'Account verification updated',
      text: `Your verification status is now: ${rider.approvedStatus}.`
    });

    res.json({ success: true, message: 'Rider verification updated', data: rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/riders/:riderId/suspend
// Body: { reason: "Fraud suspected" }
exports.suspendRider = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.riderId);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    rider.accountStatus = 'Suspended';
    rider.statusReason = req.body.reason || 'Your account has been suspended. Contact support.';
    await rider.save();

    await Notification.create({
      userId: rider._id,
      notificationType: 'Admin',
      title: 'Account suspended',
      text: rider.statusReason
    });

    res.json({ success: true, message: 'Rider suspended', data: rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/riders/:riderId/lock
// Body: { reason: "Too many failed attempts" }
exports.lockRider = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.riderId);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    rider.accountStatus = 'Locked';
    rider.statusReason = req.body.reason || 'Your account has been locked. Contact support.';
    await rider.save();

    await Notification.create({
      userId: rider._id,
      notificationType: 'Admin',
      title: 'Account locked',
      text: rider.statusReason
    });

    res.json({ success: true, message: 'Rider locked', data: rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/admin/riders/:riderId/activate
// Body: { reason: "" } (optional - can clear reason)
exports.activateRider = async (req, res) => {
  try {
    const rider = await Rider.findById(req.params.riderId);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    rider.accountStatus = 'Active';
    rider.statusReason = req.body.reason || '';
    await rider.save();

    await Notification.create({
      userId: rider._id,
      notificationType: 'Admin',
      title: 'Account activated',
      text: 'Your account is active again.'
    });

    res.json({ success: true, message: 'Rider activated', data: rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/admin/riders/:riderId
// Optional: also delete related data
exports.deleteRider = async (req, res) => {
  try {
    const riderId = req.params.riderId;

    const rider = await Rider.findById(riderId);
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' });

    // Optional cleanup (choose what you want to delete)
    await Finance.deleteOne({ userId: riderId });
    await Notification.deleteMany({ userId: riderId });
    await Issue.deleteMany({ userId: riderId });

    // Orders: you can keep history, or nullify rider assignment
    await Order.updateMany({ assignedRider: riderId }, { $set: { assignedRider: null } });

    await Rider.deleteOne({ _id: riderId });

    res.json({ success: true, message: 'Rider deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};