const express = require('express');


const router = express.Router();
// const { 
//     getIncomingDelivery, fetchAllTransportOrders, currentTask 
// } = require('../controllers/orderController');
// const express = require('express');
// const router = express.Router();
const {
  createOrder,
  getIncomingDelivery,
  fetchAllTransportOrders,
  currentTask,
  acceptOrder,
  markInTransit,
  markDelivered,
  cancelOrder,
  updateOrderDetails
} = require('../controllers/orderController');

const { protect } = require('../middleware/auth');
const { serviceGuard } = require('../middleware/serviceGuard');


// router.post('/create', protect,serviceGuard, createOrder);

router.get('/incoming', protect,serviceGuard, getIncomingDelivery);

router.get('/history', protect,serviceGuard, fetchAllTransportOrders);

router.get('/task/:orderId', protect,serviceGuard, currentTask);

router.put('/accept/:orderId', protect,serviceGuard, acceptOrder);
router.put('/in-transit/:orderId', protect,serviceGuard, markInTransit);
router.put('/deliver/:orderId', protect,serviceGuard, markDelivered);
router.put('/cancel/:orderId', protect,serviceGuard, cancelOrder);


router.put('/update/:orderId', protect,serviceGuard, updateOrderDetails);




module.exports = router;