const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const Notification = require('./models/Notification');

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3006;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart-notifications';
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

const transporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_PORT) === '465',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    })
  : null;

function getTitle(type) {
  const titles = {
    order_placed: 'Order Placed',
    order_update: 'Order Update',
    payment: 'Payment Update',
    promotional: 'Special Offer'
  };
  return titles[type] || 'Notification';
}

async function maybeSendEmail({ email, title, message }) {
  if (!transporter || !email) return;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Flipkart Clone <no-reply@example.com>',
      to: email,
      subject: title,
      text: message
    });
  } catch (error) {
    console.error('Email delivery failed:', error.message);
  }
}

app.get('/health', (req, res) => {
  res.json({ status: 'Notification Service is running', dbState: mongoose.connection.readyState, emailEnabled: Boolean(transporter) });
});

app.post('/send', async (req, res) => {
  try {
    const { userId, type, message, title, orderId, email } = req.body;
    if (!userId || !type || !message) return res.status(400).json({ error: 'userId, type and message are required' });

    const notification = new Notification({ userId, type, title: title || getTitle(type), message, orderId });
    await notification.save();
    await maybeSendEmail({ email, title: notification.title, message });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId }).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/user/:userId/unread-count', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.params.userId, isRead: false });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/user/:userId/read-all', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function connectWithRetry(retries = 15, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(MONGODB_URI, {
        authMechanism: 'SCRAM-SHA-1',
        tls: true,
        tlsCAFile: '/app/global-bundle.pem'
      });

      console.log('Notification Service DB connected');
      return;

    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);

      if (attempt === retries) throw error;

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

connectWithRetry()
  .then(() =>
    app.listen(PORT, () =>
      console.log(`Notification Service running on port ${PORT}`)
    )
  )
  .catch((error) => {
    console.error('Unable to start Notification Service:', error);
    process.exit(1);
  });