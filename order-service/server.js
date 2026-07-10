const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const Order = require('./models/Order');

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3004;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart-orders';
const CART_SERVICE = process.env.CART_SERVICE_URL || 'http://localhost:3003';
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3006';
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());
const VALID_PAYMENT_METHODS = ['COD', 'Card', 'UPI', 'NetBanking'];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

function generateOrderNumber() {
  return `ORD${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function sendNotification(payload) {
  try {
    await axios.post(`${NOTIFICATION_SERVICE}/send`, payload, { timeout: 3000 });
  } catch (error) {
    console.error('Notification failed:', error.message);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'Order Service is running', dbState: mongoose.connection.readyState });
});

app.post('/', async (req, res) => {
  try {
    const { userId, shippingAddress, paymentMethod } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (!shippingAddress) return res.status(400).json({ error: 'shippingAddress is required' });
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) return res.status(400).json({ error: 'Invalid payment method' });

    const cartResponse = await axios.get(`${CART_SERVICE}/${userId}`);
    const cart = cartResponse.data;
    if (!cart.items || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const order = new Order({
      userId,
      orderNumber: generateOrderNumber(),
      items: cart.items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      orderStatus: paymentMethod === 'COD' ? 'Confirmed' : 'Pending',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    await order.save();
    await axios.delete(`${CART_SERVICE}/${userId}`).catch((error) => console.error('Failed to clear cart after order:', error.message));
    await sendNotification({ userId, type: 'order_placed', title: 'Order Placed', message: `Order ${order.orderNumber} placed successfully.`, orderId: order._id.toString() });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const query = {};
    if (status) query.orderStatus = status;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).limit(limitNumber).skip((pageNumber - 1) * limitNumber),
      Order.countDocuments(query)
    ]);
    res.json({ orders, totalPages: Math.ceil(total / limitNumber), currentPage: pageNumber, pageSize: limitNumber, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid order id' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/:id/payment-status', async (req, res) => {
  try {
    const { paymentStatus, orderStatus } = req.body;
    const updates = { paymentStatus };
    if (orderStatus) updates.orderStatus = orderStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await sendNotification({ userId: order.userId, type: 'payment', title: 'Payment Update', message: `Payment for order ${order.orderNumber} is ${paymentStatus}.`, orderId: order._id.toString() });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/:id/status', async (req, res) => {
  try {
    const { orderStatus, trackingNumber } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus, trackingNumber }, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    await sendNotification({ userId: order.userId, type: 'order_update', title: 'Order Update', message: `Order ${order.orderNumber} status updated to ${orderStatus}.`, orderId: order._id.toString() });
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['Shipped', 'Delivered'].includes(order.orderStatus)) return res.status(400).json({ error: 'Cannot cancel shipped or delivered orders' });

    order.orderStatus = 'Cancelled';
    await order.save();
    await sendNotification({ userId: order.userId, type: 'order_update', title: 'Order Cancelled', message: `Order ${order.orderNumber} has been cancelled.`, orderId: order._id.toString() });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function connectWithRetry(retries = 15, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Order Service DB connected');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

connectWithRetry()
  .then(() => app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`)))
  .catch((error) => {
    console.error('Unable to start Order Service:', error);
    process.exit(1);
  });
