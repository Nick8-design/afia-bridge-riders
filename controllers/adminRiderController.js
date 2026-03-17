const User = require("../models/Rider");
const Finance = require("../models/Finance");
const DeliveryTask = require("../models/DeliveryTask"); // Updated from Order to DeliveryTask
const Issue = require("../models/Issue");
const Notification = require("../models/Notification");

/*
GET /api/admin/riders
*/
exports.fetchAllRiders = async (req, res) => {
  try {
    const filter = { role: "rider" };

    if (req.query.status) {
      filter.approved_status = req.query.status;
    }

    if (req.query.accountStatus) {
      filter.account_status = req.query.accountStatus;
    }

    const riders = await User.findAll({
      where: filter,
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      count: riders.length,
      data: riders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
VERIFY RIDER
*/
exports.verifyRider = async (req, res) => {
  try {
    const { id_verified, license_verified, approved_status, reason } = req.body;

    const rider = await User.findOne({
      where: { id: req.params.riderId, role: "rider" }
    });

    if (!rider) {
      return res.status(404).json({ success: false, message: "Rider not found" });
    }

    if (typeof id_verified === 'boolean') rider.id_verified = id_verified;
    if (typeof license_verified === 'boolean') rider.license_verified = license_verified;

    if (approved_status) {
      if (!['pending', 'approved', 'rejected'].includes(approved_status)) {
        return res.status(400).json({
          success: false,
          message: "approved_status must be pending, approved, or rejected"
        });
      }
      rider.approved_status = approved_status;
      if (approved_status === "approved") {
        rider.date_approved = new Date();
      }
    }

    rider.verified_by_admin = true;
    if (typeof reason === "string") rider.status_reason = reason;

    await rider.save();

    // Updated to match your Notification model schema
    await Notification.create({
      user_id: rider.id,
      notification_type: "system",
      title: "Account verification updated",
      message: `Your verification status is now: ${rider.approved_status}`,
      channel: "in_app"
    });

    res.json({ success: true, message: "Rider verification updated", data: rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
SUSPEND RIDER
*/
exports.suspendRider = async (req, res) => {
  try {
    const rider = await User.findOne({
      where: { id: req.params.riderId, role: "rider" }
    });

    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    rider.account_status = "suspended";
    rider.status_reason = req.body.reason || "Your account has been suspended. Contact support.";
    await rider.save();

    await Notification.create({
      user_id: rider.id,
      notification_type: "system",
      title: "Account suspended",
      message: rider.status_reason,
      channel: "in_app"
    });

    res.json({ success: true, message: "Rider suspended", data: rider });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
DELETE RIDER (Cleanup)
*/
exports.deleteRider = async (req, res) => {
  try {
    const riderId = req.params.riderId;
    const rider = await User.findOne({ where: { id: riderId, role: "rider" } });

    if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

    // Consistent cleanup using user_id
    await Finance.destroy({ where: { user_id: riderId } });
    await Notification.destroy({ where: { user_id: riderId } });
    await Issue.destroy({ where: { user_id: riderId } });

    // Update DeliveryTasks (your new model name)
    await DeliveryTask.update(
      { rider_id: null, status: 'pending' },
      { where: { rider_id: riderId } }
    );

    await rider.destroy();

    res.json({ success: true, message: "Rider and associated records deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
FETCH ONE RIDER
*/
exports.fetchOneRider = async (req, res) => {
    try {
      const rider = await User.findOne({
        where: { id: req.params.riderId, role: "rider" },
        include: [Finance, Issue] // Include associations if defined
      });
  
      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });
  
      res.json({ success: true, data: rider });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  /*
  LOCK RIDER ACCOUNT
  */
  exports.lockRider = async (req, res) => {
    try {
      const rider = await User.findByPk(req.params.riderId);
      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });
  
      rider.account_status = "locked";
      await rider.save();
  
      res.json({ success: true, message: "Account locked", data: rider });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
  
  /*
  ACTIVATE RIDER ACCOUNT
  */
  exports.activateRider = async (req, res) => {
    try {
      const rider = await User.findByPk(req.params.riderId);
      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });
  
      rider.account_status = "active";
      rider.approved_status = "approved";
      await rider.save();
  
      res.json({ success: true, message: "Account activated", data: rider });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

  