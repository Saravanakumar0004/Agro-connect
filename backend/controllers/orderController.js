const Order = require('../models/Order');
const Product = require('../models/Product');

// Create Order
const createOrder = async (req, res) => {
  try {
    const { customerId, productId, quantity, address, phone } = req.body;

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: '❌ Product not found' });
    }

    const order = new Order({
      customerId,
      farmerId: product.farmerId,
      productId,
      quantity,
      address,
      phone,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('productId', 'name price')
      .populate('customerId', 'name phone location')
      .populate('farmerId', 'name location');

    res.status(201).json({ message: '✅ Order created successfully', order: populatedOrder });
  } catch (err) {
    res.status(500).json({ message: '❌ Server Error', error: err.message });
  }
};

// Get Orders for Customer
const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    const orders = await Order.find({ customerId })
      .populate('productId', 'name price')
      .populate('farmerId', 'name location');

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: '❌ Server Error', error: err.message });
  }
};

// Get Orders for Farmer
const getFarmerOrders = async (req, res) => {
  try {
    const { farmerId } = req.params;
    const orders = await Order.find({ farmerId })
      .populate('productId', 'name price')
      .populate('customerId', 'name phone location');

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: '❌ Server Error', error: err.message });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: '❌ Invalid status value' });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: '❌ Order not found' });

    // Update and save
    order.status = status;
    await order.save();

    // Populate fields for response
    const populatedOrder = await Order.findById(orderId)
      .populate('productId', 'name price')
      .populate('customerId', 'name phone location')
      .populate('farmerId', 'name location');

    res.json({ message: '✅ Order status updated', order: populatedOrder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '❌ Server Error', error: err.message });
  }
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getFarmerOrders,
  updateOrderStatus,
};
