const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Product = require('./models/Product');

const app = express();
app.disable('x-powered-by');

const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart-products';
const allowedOrigins = (process.env.CORS_ORIGIN || '*').split(',').map((origin) => origin.trim());
const DEFAULT_CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Books', 'Toys', 'Sports', 'Beauty', 'Grocery'];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.get('/health', (req, res) => {
  res.json({ status: 'Product Service is running', dbState: mongoose.connection.readyState });
});

app.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json([...new Set([...DEFAULT_CATEGORIES, ...categories])]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true, brand: { $ne: null } });
    res.json(brands.filter(Boolean).sort());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice, search, sort = 'newest', page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const query = { isActive: true };

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      const safeSearch = escapeRegex(search);
      query.$or = [
        { name: new RegExp(safeSearch, 'i') },
        { description: new RegExp(safeSearch, 'i') },
        { brand: new RegExp(safeSearch, 'i') },
        { tags: new RegExp(safeSearch, 'i') }
      ];
    }

    let sortOption;
    switch (sort) {
      case 'price-low': sortOption = { price: 1 }; break;
      case 'price-high': sortOption = { price: -1 }; break;
      case 'rating': sortOption = { rating: -1, numReviews: -1 }; break;
      case 'newest':
      default: sortOption = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOption).limit(limitNumber).skip((pageNumber - 1) * limitNumber).lean(),
      Product.countDocuments(query)
    ]);

    res.json({ products, totalPages: Math.ceil(total / limitNumber), currentPage: pageNumber, pageSize: limitNumber, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product id' });
    const product = await Product.findOne({ _id: req.params.id, isActive: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product id' });
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

app.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product id' });
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post('/:id/reviews', async (req, res) => {
  try {
    const { userId, userName, rating, comment } = req.body;
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid product id' });
    if (!userId || !rating) return res.status(400).json({ error: 'userId and rating are required' });

    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) return res.status(404).json({ error: 'Product not found' });

    product.reviews.push({ userId, userName, rating: numericRating, comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => acc + item.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function connectWithRetry(retries = 15, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('Product Service DB connected');
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

connectWithRetry()
  .then(() => app.listen(PORT, () => console.log(`Product Service running on port ${PORT}`)))
  .catch((error) => {
    console.error('Unable to start Product Service:', error);
    process.exit(1);
  });
