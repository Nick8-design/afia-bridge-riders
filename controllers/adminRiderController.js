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
    }const { Op } = require("sequelize");
    const User = require("../models/Rider");
    const Finance = require("../models/Finance");
    const Notification = require("../models/Notification");
    const Issue = require("../models/Issue");
    const DeliveryTask = require("../models/DeliveryTask"); // Updated from Order
    
    const bcrypt = require("bcryptjs");
    const jwt = require("jsonwebtoken");
    
    
    
    
    
    
    
    
    
    
    
    
    
    /*
    DELETE ACCOUNT
    Removes all associated data for a specific user_id
    */
    exports.deleteMyAccount = async (req, res) => {
      try {
        const riderId = req.user.id;
    
        // Cleanup based on new user_id field name
        await Finance.destroy({ where: { user_id: riderId } });
        await Notification.destroy({ where: { user_id: riderId } });
        await Issue.destroy({ where: { user_id: riderId } });
    
        // Unassign tasks from this rider
        await DeliveryTask.update(
          { rider_id: null, status: 'pending' },
          { where: { rider_id: riderId } }
        );
    
        await User.destroy({
          where: { id: riderId, role: "rider" }
        });
    
        res.json({
          success: true,
          message: "Account and associated data deleted successfully"
        });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    };
    
    /*
    REGISTER RIDER
    */
    exports.registerTransporter = async (req, res) => {
      try {
        const { email, password } = req.body;
    
        const existing = await User.findOne({ where: { email } });
    
        if (existing) {
          return res.status(400).json({ success: false, message: "User already exists" });
        }
    
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
    
        const rider = await User.create({
          ...req.body,
          role: "rider",
          password_hash: hashed // Matching your model's field name
        });
    
        res.status(201).json({ success: true, data: rider });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    };
    
    /*
    LOGIN RIDER
    */
    exports.loginRider = async (req, res) => {
      try {
        const { email, password } = req.body;
    
        const rider = await User.findOne({
          where: { email, role: "rider" }
        });
    
        if (!rider) {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    
        const match = await bcrypt.compare(password, rider.password_hash);
    
        if (!match) {
          return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    
        // Using your model's timestamp fields
        await rider.update({ last_login: new Date() });
    
        const token = jwt.sign(
          { id: rider.id },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
    
        res.json({
          success: true,
          token,
          userId: rider.id,
          lastLogin: rider.last_login
        });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    };
    
    /*
    HELPER: GET OR CREATE FINANCE
    */
    const getOrCreateFinance = async (user_id) => {
      let finance = await Finance.findOne({ where: { user_id } });
    
      if (!finance) {
        finance = await Finance.create({
          user_id,
          balance: 0,
          trend: [],
          recentPayouts: [],
          transactionHistory: []
        });
      }
      return finance;
    };
    
    /*
    CREDIT ACCOUNT
    */
    exports.credit = async (req, res) => {
      try {
        const amount = Number(req.body.amount);
    
        if (!amount || amount <= 0) {
          return res.status(400).json({ success: false, message: "Amount must be positive" });
        }
    
        const finance = await getOrCreateFinance(req.user.id);
    
        // Spread to avoid direct mutation of Sequelize JSON objects
        const history = [...(finance.transactionHistory || [])];
        const trend = [...(finance.trend || [])];
    
        history.unshift({
          transType: "Credit",
          amount: amount, // Corrected typo
          date: new Date()
        });
    
        trend.push(amount);
    
        await finance.update({
          balance: finance.balance + amount,
          transactionHistory: history,
          trend: trend.slice(-12)
        });
    
        res.json({ success: true, message: "Account credited", data: finance });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    };
    
    /*
    WITHDRAW
    */
    exports.withdraw = async (req, res) => {
      try {
        const amount = Number(req.body.amount);
        const finance = await getOrCreateFinance(req.user.id);
    
        if (finance.balance < amount) {
          return res.status(400).json({ success: false, message: "Insufficient balance" });
        }
    
        const payouts = [...(finance.recentPayouts || [])];
        const history = [...(finance.transactionHistory || [])];
    
        payouts.unshift({
          payName: req.body.payName || "M-Pesa",
          amount: amount,
          date: new Date()
        });
    
        history.unshift({
          transType: "Debit",
          amount: amount,
          date: new Date()
        });
    
        await finance.update({
          balance: finance.balance - amount,
          recentPayouts: payouts,
          transactionHistory: history
        });
    
        res.json({ success: true, message: "Withdrawal successful", data: finance });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    };
    
    
    /*
    FETCH DASHBOARD DATA
    */
    // Ensure it is "exports.fetchUserData" NOT "const fetchUserData"
    exports.fetchUserData = async (req, res) => { 
        try {
          const rider = await User.findOne({
            where: {
              id: req.user.id,
              role: "rider"
            }
          });
      
          if (!rider) {
              return res.status(404).json({ success: false, message: "User not found" });
          }
      
          res.json({
            success: true,
            data: rider
          });
        } catch (err) {
          res.status(500).json({ success: false, message: err.message });
        }
      };
    
    
      /*
    UPDATE PROFILE
    */
    exports.updateUserInformation = async (req, res) => { // <--- Must be exports.name
        try {
          await User.update(
            req.body,
            {
              where: {
                id: req.user.id,
                role: "rider"
              }
            }
          );
      
          const updated = await User.findByPk(req.user.id);
      
          res.json({
            success: true,
            data: updated
          });
        } catch (err) {
          res.status(500).json({ success: false, message: err.message });
        }
      };
    
      /*
    GET MY FINANCE
    */
    exports.getMyFinance = async (req, res) => {
        try {
          const finance = await getOrCreateFinance(req.user.id);
      
          res.json({
            success: true,
            data: finance
          });
        } catch (err) {
          res.status(500).json({
            success: false,
            message: err.message
          });
        }
      };

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

  