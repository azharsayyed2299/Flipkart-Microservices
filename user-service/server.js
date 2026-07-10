const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const validator = require('validator');
require('dotenv').config();

const User = require('./models/User');

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart-users';
const JWT_SECRET = process.env.JWT_SECRET || 'replace-with-a-long-random-secret';
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

function signToken(user) {
  return jwt.sign({ userId: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const token = req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role || 'user';
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function validateRegistration({ name, email, password, phone }) {
  if (!name || !email || !password || !phone) return 'Name, email, password and phone are required';
  if (!validator.isEmail(email)) return 'Email is invalid';
  if (!validator.isLength(password, { min: 6 })) return 'Password must be at least 6 characters';
  if (!validator.isMobilePhone(String(phone), 'any')) return 'Phone number is invalid';
  return null;
}

app.get('/health', (req, res) => {
  res.json({ status: 'User Service is running', dbState: mongoose.connection.readyState });
});

app.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const validationError = validateRegistration({ name, email, password, phone });
    if (validationError) return res.status(400).json({ error: validationError });

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(409).json({ error: 'User already exists' });

    const user = new User({ name, email: normalizedEmail, password, phone });
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      token: signToken(user),
      user: user.toSafeObject()
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'User already exists' });
    return res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user), user: user.toSafeObject() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user.toSafeObject());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/profile', authMiddleware, async (req, res) => {
  try {
    const allowedFields = ['name', 'phone'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user.toSafeObject());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Current and new password are required' });
    if (!validator.isLength(newPassword, { min: 6 })) return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/address', authMiddleware, async (req, res) => {
  try {
    const required = ['street', 'city', 'state', 'pincode'];
    const missing = required.find((field) => !req.body[field]);
    if (missing) return res.status(400).json({ error: `${missing} is required` });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.body.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((address) => { address.isDefault = false; });
      req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save();
    return res.status(201).json(user.addresses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete('/address/:addressId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ error: 'Address not found' });

    address.deleteOne();
    await user.save();
    return res.json(user.addresses);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

async function connectWithRetry(retries = 15, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('User Service DB connected');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

connectWithRetry()
  .then(() => app.listen(PORT, () => console.log(`User Service running on port ${PORT}`)))
  .catch((error) => {
    console.error('Unable to start User Service:', error);
    process.exit(1);
  });
