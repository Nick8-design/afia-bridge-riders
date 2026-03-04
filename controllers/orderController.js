const Order = require('../models/Order');
const Finance = require('../models/Finance');

// Helper: simple validation
const requireFields = (body, fields = []) => {
  const missing = fields.filter(f => body[f] === undefined || body[f] === null || body[f] === '');
  return missing;
};

// 0) Create Order
// Note: This endpoint is protected currently; you can remove protect if created by external systems.
exports.createOrder = async (req, res) => {
  try {
    const missing = requireFields(req.body, ['packageNumber', 'pickUp', 'dropOff']);
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
    }

    // Basic nested check
    if (!req.body.pickUp.location || !req.body.dropOff.location) {
      return res.status(400).json({ success: false, message: 'pickUp.location and dropOff.location are required' });
    }

    // Prevent duplicate packageNumber (optional but useful)
    const existing = await Order.findOne({ packageNumber: req.body.packageNumber });
    if (existing) {
      return res.status(409).json({ success: false, message: 'packageNumber already exists' });
    }

    const order = await Order.create({
      packageNumber: req.body.packageNumber,
      requirement: req.body.requirement || '',
      estimatedDeliveryTime: req.body.estimatedDeliveryTime || '',
      distance: req.body.distance ?? 0,
      charges: req.body.charges ?? 0,
      deliveredStatus: 'Pending',
      acceptStatus: false,
      assignedRider: null,

      pickUp: {
        lat: req.body.pickUp.lat,
        long: req.body.pickUp.long,
        location: req.body.pickUp.location,
        doctorId: req.body.pickUp.doctorId,
        businessName: req.body.pickUp.businessName,
        docContact: req.body.pickUp.docContact
      },

      dropOff: {
        lat: req.body.dropOff.lat,
        long: req.body.dropOff.long,
        location: req.body.dropOff.location,
        mwanachiId: req.body.dropOff.mwanachiId,
        mwanachiName: req.body.dropOff.mwanachiName,
        receiverContact: req.body.dropOff.receiverContact
      }
    });

    return res.status(201).json({ success: true, data: order });
  } catch (err) {

    return res.status(500).json({ success: false, message: err.message });
  }
};

// 1) Get Incoming Deliveries (Not yet accepted)
exports.getIncomingDelivery = async (req, res) => {
  try {
    const orders = await Order.find({ acceptStatus: false, deliveredStatus: 'Pending' })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2) Fetch All Transport Orders (History for this Rider)
exports.fetchAllTransportOrders = async (req, res) => {
  try {
    const orders = await Order.find({ assignedRider: req.user.id })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3) Get Current Task
exports.currentTask = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Optional safety: only allow rider to view if assigned to them (or not yet assigned)
    // if (order.assignedRider && order.assignedRider.toString() !== req.user.id) {
    //   return res.status(403).json({ success: false, message: 'Not allowed to view this order' });
    // }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4) Accept Order (assign to logged-in rider)
exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.acceptStatus === true) {
      return res.status(409).json({ success: false, message: 'Order already accepted' });
    }

    if (order.deliveredStatus !== 'Pending') {
      return res.status(400).json({ success: false, message: `Cannot accept order in status ${order.deliveredStatus}` });
    }

    order.acceptStatus = true;
    order.assignedRider = req.user.id;
    await order.save();

    res.json({ success: true, message: 'Order accepted', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5) Mark In-Transit (only assigned rider)
exports.markInTransit = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!order.assignedRider || order.assignedRider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this order' });
    }

    if (order.deliveredStatus === 'Delivered' || order.deliveredStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: `Cannot move order from ${order.deliveredStatus}` });
    }

    order.deliveredStatus = 'In-Transit';
    await order.save();

    res.json({ success: true, message: 'Order marked In-Transit', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6) Mark Delivered (only assigned rider)
// exports.markDelivered = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.orderId);

//     if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

//     if (!order.assignedRider || order.assignedRider.toString() !== req.user.id) {
//       return res.status(403).json({ success: false, message: 'You are not assigned to this order' });
//     }

//     if (order.deliveredStatus !== 'In-Transit') {
//       return res.status(400).json({ success: false, message: 'Order must be In-Transit before delivery' });
//     }

//     order.deliveredStatus = 'Delivered';
//     await order.save();

//     res.json({ success: true, message: 'Order delivered', data: order });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


exports.markDelivered = async (req, res) => {
    try {
      const order = await Order.findById(req.params.orderId);
  
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  
      if (!order.assignedRider || order.assignedRider.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this order' });
      }
  
      if (order.deliveredStatus !== 'In-Transit') {
        return res.status(400).json({ success: false, message: 'Order must be In-Transit before delivery' });
      }
  
      // Mark delivered
      order.deliveredStatus = 'Delivered';
      await order.save();
  
      // Credit rider finance with order charges
      const amount = Number(order.charges || 0);
      if (amount > 0) {
        let finance = await Finance.findOne({ userId: req.user.id });
        if (!finance) {
          finance = await Finance.create({
            userId: req.user.id,
            balance: 0,
            trend: [],
            recentPayouts: [],
            transactionHistory: []
          });
        }
  
        finance.balance += amount;
        finance.transactionHistory.unshift({
          transType: 'Credit',
          ammount: amount
        });
  
        finance.trend.push(amount);
        if (finance.trend.length > 12) finance.trend = finance.trend.slice(-12);
  
        await finance.save();
      }
  
      res.json({
        success: true,
        message: 'Order delivered and rider credited',
        creditedAmount: amount,
        data: order
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };

// 7) Cancel Order (assigned rider or unassigned, depending on your rules)
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // If already assigned, only that rider can cancel
    if (order.assignedRider && order.assignedRider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed to cancel this order' });
    }

    if (order.deliveredStatus === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a delivered order' });
    }

    order.deliveredStatus = 'Cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8) Update Order (distance/charges/eta/requirement, etc.)
exports.updateOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Optional rule: only assigned rider can update once accepted
    if (order.assignedRider && order.assignedRider.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not allowed to update this order' });
    }

    const updatable = ['requirement', 'estimatedDeliveryTime', 'distance', 'charges'];
    updatable.forEach((k) => {
      if (req.body[k] !== undefined) order[k] = req.body[k];
    });

    await order.save();
    res.json({ success: true, message: 'Order updated', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};




