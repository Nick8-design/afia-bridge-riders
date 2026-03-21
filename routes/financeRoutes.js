const express = require('express');
const router = express.Router();

const {
  getMyWallet,
  seedMyWallet,
  credit,
  withdraw,
  getTransactions,
  getRecentPayouts,
  getDailyEarnings
} = require('../controllers/financeController');

const { serviceGuard } = require('../middleware/serviceGuard');
const { protect } = require('../middleware/auth');

router.get('/earning', protect, serviceGuard, getMyWallet);
router.post('/seed', protect, serviceGuard, seedMyWallet);
router.post('/credit', protect, serviceGuard, credit);
router.post('/withdraw', protect, withdraw);

router.get('/transactions', protect, serviceGuard, getTransactions);
router.get('/payouts', protect, serviceGuard, getRecentPayouts);
router.get('/daily-earnings', protect, serviceGuard, getDailyEarnings);


module.exports = router;