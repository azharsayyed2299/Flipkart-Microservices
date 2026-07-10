const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const Cart = require('./models/Cart');

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3003;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart-carts';
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
}

app.get('/health', (req, res) => {
  res.json({ status: 'Cart Service is running', dbState: mongoose.connection.readyState });
});

app.get('/:userId', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.params.userId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/:userId/items', async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = Math.max(Number(req.body.quantity) || 1, 1);
    if (!productId) return res.status(400).json({ error: 'productId is required' });

    let product;
    try {
      const productResponse = await axios.get(`${PRODUCT_SERVICE}/${productId}`);
      product = productResponse.data;
    } catch (error) {
      const status = error.response?.status || 502;
      return res.status(status).json({ error: 'Unable to fetch product details' });
    }

    if (product.stock <= 0) return res.status(400).json({ error: 'Product is out of stock' });

    const cart = await getOrCreateCart(req.params.userId);
    const existingItem = cart.items.find((item) => item.productId === productId);
    const nextQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (nextQuantity > product.stock) return res.status(400).json({ error: `Only ${product.stock} units available` });

    if (existingItem) {
      existingItem.quantity = nextQuantity;
    } else {
      cart.items.push({ productId: product._id, name: product.name, price: product.price, image: product.images?.[0] || '', quantity });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/:userId/items/:productId', async (req, res) => {
  try {
    const quantity = Number(req.body.quantity);
    if (!Number.isFinite(quantity)) return res.status(400).json({ error: 'quantity must be a number' });

    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find((cartItem) => cartItem.productId === req.params.productId);
    if (!item) return res.status(404).json({ error: 'Cart item not found' });

    if (quantity <= 0) {
      cart.items = cart.items.filter((cartItem) => cartItem.productId !== req.params.productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/:userId/items/:productId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((item) => item.productId !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/:userId', async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.params.userId);
    cart.items = [];
    await cart.save();
    res.json({ message: 'Cart cleared successfully', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function connectWithRetry(retries = 15, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Cart Service DB connected');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

connectWithRetry()
  .then(() => app.listen(PORT, () => console.log(`Cart Service running on port ${PORT}`)))
  .catch((error) => {
    console.error('Unable to start Cart Service:', error);
    process.exit(1);
  });
