const express = require('express');
const {
  createOrder,
  getCustomerOrders,
  getFarmerOrders,
  updateOrderStatus
} = require('../controllers/orderController');

const router = express.Router();

// Customer creates an order
router.post('/', createOrder);

// Get all orders for a specific customer
router.get('/customer/:customerId', getCustomerOrders);

// Get all orders for a specific farmer
router.get('/farmer/:farmerId', getFarmerOrders);

// Update order status
router.put('/:orderId/status', updateOrderStatus);

module.exports = router;
