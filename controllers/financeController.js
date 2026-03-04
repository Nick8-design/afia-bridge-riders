const Finance = require('../models/Finance');

const getOrCreateFinance = async (userId) => {
  let finance = await Finance.findOne({ userId });
  if (!finance) {
    finance = await Finance.create({
      userId,
      balance: 0,
      trend: [],
      recentPayouts: [],
      transactionHistory: []
    });
  }
  return finance;
};

// GET /api/finance/earning
exports.getMyFinance = async (req, res) => {
  try {
    const finance = await getOrCreateFinance(req.user.id);
    res.json({ success: true, data: finance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/finance/seed
exports.seedMyFinance = async (req, res) => {
  try {
    const existing = await Finance.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Finance already exists', data: existing });
    }

    const finance = await Finance.create({
      userId: req.user.id,
      balance: 0,
      trend: [],
      recentPayouts: [],
      transactionHistory: []
    });

    res.status(201).json({ success: true, message: 'Finance created', data: finance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/finance/credit
// Body: { amount: 350, reason: "Delivery credit PKG-1001" }
exports.credit = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const finance = await getOrCreateFinance(req.user.id);

    finance.balance += amount;
    finance.transactionHistory.unshift({
      transType: 'Credit',
      ammount: amount
    });

    // simple trend: keep last 12 values (can be daily/weekly - your choice)
    finance.trend.push(amount);
    if (finance.trend.length > 12) finance.trend = finance.trend.slice(-12);

    await finance.save();

    res.json({ success: true, message: 'Account credited', data: finance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/finance/withdraw
// Body: { amount: 500, payName: "M-Pesa", note: "Withdraw to 07xx..." }
exports.withdraw = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const payName = req.body.payName || 'M-Pesa';

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const finance = await getOrCreateFinance(req.user.id);

    if (finance.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance' });
    }

    // Here is where M-Pesa/Bank API integration would go.
    // For now we simulate a successful request by saving payout + debit transaction.

    finance.balance -= amount;

    finance.recentPayouts.unshift({
      payName,
      ammount: amount
    });

    finance.transactionHistory.unshift({
      transType: 'Debit',
      ammount: amount
    });

    await finance.save();

    res.json({
      success: true,
      message: `Withdrawal request received for ${amount}`,
      data: finance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/finance/transactions
exports.getTransactions = async (req, res) => {
  try {
    const finance = await getOrCreateFinance(req.user.id);
    res.json({ success: true, data: finance.transactionHistory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/finance/payouts
exports.getRecentPayouts = async (req, res) => {
  try {
    const finance = await getOrCreateFinance(req.user.id);
    res.json({ success: true, data: finance.recentPayouts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};