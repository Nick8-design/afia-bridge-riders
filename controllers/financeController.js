const Wallet = require('../models/Finance');
const { v4: uuidv4 } = require('uuid');

/*
Get or create wallet
*/
const getOrCreateWallet = async (user_id) => {
  let wallet = await Wallet.findOne({
    where: { user_id }
  });

  if (!wallet) {
    wallet = await Wallet.create({
      id: uuidv4(),
      user_id,
      balance: 0,
      trend: [],
      recent_payouts: [],
      transaction_history: []
    });
  }

  return wallet;
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

exports.seedMyWallet = async (req, res) => {
  try {
    const existing = await Wallet.findOne({
      where: { user_id: req.user.id }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Wallet already exists',
        data: existing
      });
    }

    const wallet = await Wallet.create({
      id: uuidv4(),
      user_id: req.user.id,
      balance: 0,
      trend: [],
      recent_payouts: [],
      transaction_history: []
    });

    res.status(201).json({
      success: true,
      message: 'Wallet created',
      data: wallet
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.credit = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const wallet = await getOrCreateWallet(req.user.id);

    const history = [...(wallet.transactionHistory || [])];
    const trend = [...(wallet.trend || [])];

    history.unshift({
      type: 'credit',
      amount,
      created_at: new Date()
    });

    trend.push(amount);

    await wallet.update({
      balance: Number(wallet.balance) + amount,
      transaction_history: history,
      trend: trend.slice(-12)
    });

    res.json({
      success: true,
      message: 'Wallet credited',
      data: wallet
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.withdraw = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const wallet = await getOrCreateWallet(req.user.id);

    if (Number(wallet.balance) < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const payouts = [...(wallet.recent_payouts || [])];
    const history = [...(wallet.transaction_history || [])];

    payouts.unshift({
      method: wallet.payout_method || 'mpesa',
      amount,
      status: 'pending',
      created_at: new Date()
    });

    history.unshift({
      type: 'debit',
      amount,
      created_at: new Date()
    });

    await wallet.update({
      balance: Number(wallet.balance) - amount,
      recent_payouts: payouts,
      transaction_history: history
    });

    res.json({
      success: true,
      message: 'Withdrawal successful',
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
    const wallet = await getOrCreateWallet(req.user.id);

    const history = wallet.transaction_history || [];

    // Group earnings by date
    const dailyMap = {};

    history.forEach(tx => {
      if (tx.type !== 'credit') return;

      const date = new Date(tx.created_at).toISOString().split('T')[0];

      if (!dailyMap[date]) {
        dailyMap[date] = 0;
      }

      dailyMap[date] += Number(tx.amount);
    });

    // Convert to array format (better for frontend)
    const result = Object.keys(dailyMap).map(date => ({
      date,
      total: dailyMap[date]
    }));

    // Sort by newest first
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