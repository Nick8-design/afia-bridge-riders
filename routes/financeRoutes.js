const express = require('express');
const router = express.Router();

const {
  getMyFinance,
  seedMyFinance,
  credit,
  withdraw,
  getTransactions,
  getRecentPayouts
} = require('../controllers/financeController');


const { serviceGuard } = require('../middleware/serviceGuard');
const { protect } = require('../middleware/auth');



router.get('/earning', protect, serviceGuard,getMyFinance);

// Create finance doc for current rider (useful if none exists yet)
router.post('/seed', protect,serviceGuard, seedMyFinance);

// Manual credit (admin/system/testing)
router.post('/credit', protect,serviceGuard, credit);

// Withdraw request (creates debit record, reduces balance)
router.post('/withdraw', protect, withdraw);

// Lists
router.get('/transactions', protect, serviceGuard,getTransactions);
router.get('/payouts', protect,serviceGuard, getRecentPayouts);

module.exports = router;