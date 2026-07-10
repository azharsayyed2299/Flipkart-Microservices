const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const Payment = require('./models/Payment');

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3005;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart-payments';
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
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

function generateTransactionId() {
  return `TXN${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function updateOrderPayment(orderId, payment) {
  const paymentStatus = payment.status === 'Success' ? 'Completed' : payment.status;
  const orderStatus = payment.status === 'Success' ? 'Confirmed' : undefined;
  try {
    await axios.put(`${ORDER_SERVICE}/${orderId}/payment-status`, { paymentStatus, orderStatus }, { timeout: 3000 });
  } catch (error) {
    console.error('Failed to update order payment status:', error.message);
  }
}

async function sendNotification(payload) {
  try {
    await axios.post(`${NOTIFICATION_SERVICE}/send`, payload, { timeout: 3000 });
  } catch (error) {
    console.error('Notification failed:', error.message);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'Payment Service is running', dbState: mongoose.connection.readyState });
});

app.post('/', async (req, res) => {
  try {
    const { orderId, userId, amount, paymentMethod } = req.body;
    if (!orderId || !userId || amount === undefined || !paymentMethod) {
      return res.status(400).json({ error: 'orderId, userId, amount and paymentMethod are required' });
    }
    if (!VALID_PAYMENT_METHODS.includes(paymentMethod)) return res.status(400).json({ error: 'Invalid payment method' });

    const payment = new Payment({
      orderId,
      userId,
      amount: Number(amount),
      paymentMethod,
      transactionId: paymentMethod === 'COD' ? undefined : generateTransactionId(),
      paymentGateway: paymentMethod === 'COD' ? 'Cash on Delivery' : 'Simulated Razorpay'
    });

    payment.status = paymentMethod === 'COD' ? 'Pending' : 'Success';
    await payment.save();
    await updateOrderPayment(orderId, payment);
    await sendNotification({
      userId,
      type: 'payment',
      title: 'Payment Update',
      message: payment.status === 'Success' ? `Payment of ₹${payment.amount} completed.` : `Payment is pending for order ${orderId}.`,
      orderId
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/order/:orderId', async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/:id/refund', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'Success') return res.status(400).json({ error: 'Can only refund successful payments' });

    payment.status = 'Refunded';
    await payment.save();
    await updateOrderPayment(payment.orderId, payment);
    await sendNotification({ userId: payment.userId, type: 'payment', title: 'Refund Processed', message: `Refund processed for transaction ${payment.transactionId}.`, orderId: payment.orderId });

    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function connectWithRetry(retries = 15, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Payment Service DB connected');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

connectWithRetry()
  .then(() => app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`)))
  .catch((error) => {
    console.error('Unable to start Payment Service:', error);
    process.exit(1);
  });
