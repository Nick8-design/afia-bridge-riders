const Finance = require('../models/Finance');

/*
Get or create finance record
Logic adjusted for user_id and underscored naming
*/
const getOrCreateFinance = async (user_id) => {
  let finance = await Finance.findOne({
    where: { user_id }
  });

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
GET /api/finance/earning
*/
exports.getMyFinance = async (req, res) => {
  try {
    const finance = await getOrCreateFinance(req.user.id);
    res.json({
      success: true,
      data: finance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
POST /api/finance/seed
*/
exports.seedMyFinance = async (req, res) => {
  try {
    const existing = await Finance.findOne({
      where: { user_id: req.user.id }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Finance already exists',
        data: existing
      });
    }

    const finance = await Finance.create({
      user_id: req.user.id,
      balance: 0,
      trend: [],
      recentPayouts: [],
      transactionHistory: []
    });

    res.status(201).json({
      success: true,
      message: 'Finance created',
      data: finance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
/*
GET /api/finance/payouts
*/
exports.getRecentPayouts = async (req, res) => {
  try {
    const finance = await getOrCreateFinance(req.user.id);
    res.json({
      success: true,
      data: finance.recentPayouts || []
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
/*
POST /api/finance/credit
*/
exports.credit = async (req, res) => {
  try {
    const amount = Number(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'amount must be a positive number'
      });
    }

    const finance = await getOrCreateFinance(req.user.id);

    // Sequelize JSON fields need to be handled carefully
    // We create a copy to avoid mutation issues
    const history = [...(finance.transactionHistory || [])];
    const trend = [...(finance.trend || [])];

    history.unshift({
      transType: 'Credit',
      amount: amount, // Fixed typo from 'ammount'
      created_at: new Date()
    });

    trend.push(amount);

    await finance.update({
      balance: finance.balance + amount,
      transactionHistory: history,
      trend: trend.slice(-12) // Keep last 12 entries
    });

    res.json({
      success: true,
      message: 'Account credited',
      data: finance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
POST /api/finance/withdraw
*/
exports.withdraw = async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const payName = req.body.payName || 'M-Pesa';

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'amount must be a positive number'
      });
    }

    const finance = await getOrCreateFinance(req.user.id);

    if (finance.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    const payouts = [...(finance.recentPayouts || [])];
    const history = [...(finance.transactionHistory || [])];

    payouts.unshift({
      payName,
      amount: amount,
      status: 'pending', // Good practice for financial apps
      created_at: new Date()
    });

    history.unshift({
      transType: 'Debit',
      amount: amount,
      created_at: new Date()
    });

    await finance.update({
      balance: finance.balance - amount,
      recentPayouts: payouts,
      transactionHistory: history
    });

    res.json({
      success: true,
      message: `Withdrawal request received for ${amount}`,
      data: finance
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/*
GET /api/finance/transactions
*/
exports.getTransactions = async (req, res) => {
  try {
    const finance = await getOrCreateFinance(req.user.id);
    res.json({
      success: true,
      data: finance.transactionHistory || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



// const Finance = require('../models/Finance');


// /*
// Get or create finance record
// */
// const getOrCreateFinance = async (userId) => {

//   let finance = await Finance.findOne({
//     where: { userId }
//   });

//   if (!finance) {

//     finance = await Finance.create({
//       userId,
//       balance: 0,
//       trend: [],
//       recentPayouts: [],
//       transactionHistory: []
//     });

//   }

//   return finance;
// };


// /*
// GET /api/finance/earning
// */
// exports.getMyFinance = async (req, res) => {
//   try {

//     const finance = await getOrCreateFinance(req.user.id);

//     res.json({
//       success: true,
//       data: finance
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }
// };


// /*
// POST /api/finance/seed
// */
// exports.seedMyFinance = async (req, res) => {
//   try {

//     const existing = await Finance.findOne({
//       where: { userId: req.user.id }
//     });

//     if (existing) {
//       return res.status(409).json({
//         success: false,
//         message: 'Finance already exists',
//         data: existing
//       });
//     }

//     const finance = await Finance.create({
//       userId: req.user.id,
//       balance: 0,
//       trend: [],
//       recentPayouts: [],
//       transactionHistory: []
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Finance created',
//       data: finance
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }
// };


// /*
// POST /api/finance/credit
// Body: { amount }
// */
// exports.credit = async (req, res) => {

//   try {

//     const amount = Number(req.body.amount);

//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'amount must be a positive number'
//       });
//     }

//     const finance = await getOrCreateFinance(req.user.id);

//     const history = finance.transactionHistory || [];
//     const trend = finance.trend || [];

//     history.unshift({
//       transType: 'Credit',
//       ammount: amount
//     });

//     trend.push(amount);

//     await finance.update({
//       balance: finance.balance + amount,
//       transactionHistory: history,
//       trend: trend.slice(-12)
//     });

//     res.json({
//       success: true,
//       message: 'Account credited',
//       data: finance
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }
// };


// /*
// POST /api/finance/withdraw
// Body: { amount, payName }
// */
// exports.withdraw = async (req, res) => {

//   try {

//     const amount = Number(req.body.amount);
//     const payName = req.body.payName || 'M-Pesa';

//     if (!amount || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'amount must be a positive number'
//       });
//     }

//     const finance = await getOrCreateFinance(req.user.id);

//     if (finance.balance < amount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Insufficient balance'
//       });
//     }

//     const payouts = finance.recentPayouts || [];
//     const history = finance.transactionHistory || [];

//     payouts.unshift({
//       payName,
//       ammount: amount
//     });

//     history.unshift({
//       transType: 'Debit',
//       ammount: amount
//     });

//     await finance.update({
//       balance: finance.balance - amount,
//       recentPayouts: payouts,
//       transactionHistory: history
//     });

//     res.json({
//       success: true,
//       message: `Withdrawal request received for ${amount}`,
//       data: finance
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }
// };


// /*
// GET /api/finance/transactions
// */
// exports.getTransactions = async (req, res) => {

//   try {

//     const finance = await getOrCreateFinance(req.user.id);

//     res.json({
//       success: true,
//       data: finance.transactionHistory || []
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }
// };


// /*
// GET /api/finance/payouts
// */
// exports.getRecentPayouts = async (req, res) => {

//   try {

//     const finance = await getOrCreateFinance(req.user.id);

//     res.json({
//       success: true,
//       data: finance.recentPayouts || []
//     });

//   } catch (err) {

//     res.status(500).json({
//       success: false,
//       message: err.message
//     });

//   }
// };