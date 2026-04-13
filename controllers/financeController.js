const Wallet = require('../models/Finance');
const Notification = require('../models/Notification'); 
const { v4: uuidv4 } = require('uuid');

/**
 * Helper to create an in-app notification
 */
const sendInternalNotification = async (userId, title, message, type, refId = null) => {
    try {
        await Notification.create({
            id: uuidv4(),
            user_id: userId,
            title: title,
            message: message,
            notification_type: type,
            channel: 'in_app',
            reference_id: refId,
            reference_type: 'wallet',
            is_read: false,
            sent_at: new Date()
        });
    } catch (err) {
        console.error("Notification Error:", err.message);
        // We don't throw here to avoid failing the main transaction
    }
};



const getOrCreateWallet = async (user_id) => {
  let wallet = await Wallet.findOne({ where: { user_id } });

  if (!wallet) {
    wallet = await Wallet.create({
      id: uuidv4(),
      user_id,
      balance: 0,
      trend: [],
      recent_payouts: [],
      transaction_history: []
    });
    
    // Notify user about wallet creation
    await sendInternalNotification(
        user_id, 
        "Wallet Activated", 
        "Your AfiaBridge digital wallet has been successfully created.", 
        "system"
    );
  }

  return wallet;
};

exports.seedMyWallet = async (req, res) => {
  try {
    const existing = await Wallet.findOne({ where: { user_id: req.user.id } });

    if (existing) {
      return res.status(409).json({ success: false, message: 'Wallet already exists' });
    }

    const wallet = await Wallet.create({
      id: uuidv4(),
      user_id: req.user.id,
      balance: 0,
      trend: [],
      recent_payouts: [],
      transaction_history: []
    });

    await sendInternalNotification(
        req.user.id, 
        "Wallet Created", 
        "Welcome! Your wallet is ready for transactions.", 
        "system"
    );

    res.status(201).json({ success: true, data: wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.credit = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const wallet = await getOrCreateWallet(req.user.id);
    const history = [...(wallet.transaction_history || [])];
    const trend = [...(wallet.trend || [])];

    history.unshift({ type: 'credit', amount, created_at: new Date() });
    trend.push(amount);

    await wallet.update({
      balance: Number(wallet.balance) + amount,
      transaction_history: history,
      trend: trend.slice(-12)
    });

    // Notify user of incoming funds
    await sendInternalNotification(
        req.user.id, 
        "Account Credited", 
        `Successfully added KES ${amount.toFixed(2)} to your wallet.`, 
        "payment",
        wallet.id
    );

    res.json({ success: true, message: 'Wallet credited', data: wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.withdraw = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    const wallet = await getOrCreateWallet(req.user.id);

    if (Number(wallet.balance) < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    const payouts = [...(wallet.recent_payouts || [])];
    const history = [...(wallet.transaction_history || [])];

    payouts.unshift({
      method: wallet.payout_method || 'mpesa',
      amount,
      status: 'pending',
      created_at: new Date()
    });

    history.unshift({ type: 'debit', amount, created_at: new Date() });

    await wallet.update({
      balance: Number(wallet.balance) - amount,
      recent_payouts: payouts,
      transaction_history: history
    });

    // Notify user of withdrawal request
    await sendInternalNotification(
        req.user.id, 
        "Withdrawal Pending", 
        `Your request for KES ${amount.toFixed(2)} is being processed via ${wallet.payout_method || 'M-Pesa'}.`, 
        "payment",
        wallet.id
    );

    res.json({ success: true, message: 'Withdrawal successful', data: wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.getMyWallet = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.id);

    res.json({
      success: true,
      data: wallet
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};







exports.getTransactions = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.id);

    res.json({
      success: true,
      data: wallet.transaction_history || []
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRecentPayouts = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user.id);

    res.json({
      success: true,
      data: wallet.recent_payouts || []
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



exports.getDailyEarnings = async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
    
    if (!wallet) {
      return res.json({ success: true, data: [] });
    }

    const history = wallet.transaction_history || [];
    const dailyMap = {};

    history.forEach(tx => {
      // 1. Match the exact key 'transType' and value 'Credit'
      if (tx.transType !== 'Credit') return;

      // 2. Match the exact key 'date' saved in your helper
      const dateVal = tx.date || tx.createdAt; 
      if (!dateVal) return;

      const date = new Date(dateVal).toISOString().split('T')[0];

      if (!dailyMap[date]) {
        dailyMap[date] = 0;
      }

      dailyMap[date] += Number(tx.amount || 0);
    });

    const result = Object.keys(dailyMap).map(date => ({
      date,
      total: dailyMap[date]
    }));

    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: result
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// exports.getDailyEarnings = async (req, res) => {
//   try {
//     const wallet = await getOrCreateWallet(req.user.id);

//     const history = wallet.transaction_history || [];

//     // Group earnings by date
//     const dailyMap = {};

//     history.forEach(tx => {
//       if (tx.type !== 'credit') return;

//       const date = new Date(tx.created_at).toISOString().split('T')[0];

//       if (!dailyMap[date]) {
//         dailyMap[date] = 0;
//       }

//       dailyMap[date] += Number(tx.amount);
//     });

//     // Convert to array format (better for frontend)
//     const result = Object.keys(dailyMap).map(date => ({
//       date,
//       total: dailyMap[date]
//     }));

//     // Sort by newest first
//     result.sort((a, b) => new Date(b.date) - new Date(a.date));

//     res.json({
//       success: true,
//       data: result
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: err.message
//     });
//   }
// };