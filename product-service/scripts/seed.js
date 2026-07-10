const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/flipkart-products';

function image(label, color = '#2874f0') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="${color}"/><circle cx="680" cy="90" r="140" fill="rgba(255,255,255,0.16)"/><circle cx="120" cy="520" r="160" fill="rgba(255,255,255,0.12)"/><text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="56" font-weight="700">${label}</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="Arial, sans-serif" font-size="24">Flipkart Clone</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const products = [
  { name: 'AeroPhone X1 5G Smartphone', description: 'Feature-packed 5G smartphone with AMOLED display, 108MP camera, long battery life and fast charging.', price: 24999, originalPrice: 32999, discount: 24, category: 'Electronics', subCategory: 'Mobiles', brand: 'AeroTech', images: [image('AeroPhone X1', '#2874f0')], stock: 45, specifications: { Display: '6.7 inch AMOLED', RAM: '8 GB', Storage: '128 GB', Battery: '5000 mAh' }, rating: 4.4, numReviews: 128, tags: ['mobile', 'smartphone', '5g', 'android'] },
  { name: 'BookAir Pro Laptop 14', description: 'Thin and light laptop for productivity, coding, streaming and office work with all-day battery backup.', price: 64990, originalPrice: 79990, discount: 19, category: 'Electronics', subCategory: 'Laptops', brand: 'NovaBook', images: [image('BookAir Pro', '#673ab7')], stock: 24, specifications: { Processor: 'Intel i5 / Ryzen 5 class', RAM: '16 GB', SSD: '512 GB', Weight: '1.3 kg' }, rating: 4.6, numReviews: 86, tags: ['laptop', 'notebook', 'work'] },
  { name: 'PulsePods Wireless Earbuds', description: 'Compact earbuds with active noise cancellation, low latency gaming mode and 36-hour case backup.', price: 2999, originalPrice: 5999, discount: 50, category: 'Electronics', subCategory: 'Audio', brand: 'Pulse', images: [image('PulsePods', '#00a86b')], stock: 150, specifications: { Playback: '36 hours', ANC: 'Yes', Warranty: '1 Year', Bluetooth: '5.3' }, rating: 4.2, numReviews: 342, tags: ['earbuds', 'audio', 'wireless'] },
  { name: 'Men Slim Fit Cotton Shirt', description: 'Premium breathable cotton shirt suitable for office, casual outings and festive occasions.', price: 799, originalPrice: 1799, discount: 56, category: 'Clothing', subCategory: 'Men Shirts', brand: 'UrbanWeave', images: [image('Cotton Shirt', '#ff6f00')], stock: 90, specifications: { Fabric: '100% Cotton', Fit: 'Slim', Sleeve: 'Full Sleeve', Care: 'Machine Wash' }, rating: 4.1, numReviews: 210, tags: ['shirt', 'men', 'cotton'] },
  { name: 'Women Printed Kurta Set', description: 'Elegant printed kurta set with comfortable fabric and modern fit for everyday wear.', price: 1299, originalPrice: 2499, discount: 48, category: 'Clothing', subCategory: 'Women Ethnic', brand: 'RangVilla', images: [image('Kurta Set', '#d81b60')], stock: 65, specifications: { Fabric: 'Rayon Blend', Pattern: 'Printed', Occasion: 'Casual', Set: 'Kurta + Pants' }, rating: 4.3, numReviews: 156, tags: ['kurta', 'women', 'ethnic'] },
  { name: 'ComfortPlus Sofa 3 Seater', description: 'Modern 3-seater sofa with high-density foam cushions and durable wooden frame.', price: 18999, originalPrice: 29999, discount: 37, category: 'Home', subCategory: 'Furniture', brand: 'HomeNest', images: [image('3 Seater Sofa', '#795548')], stock: 12, specifications: { Material: 'Fabric', Seating: '3 Seater', Frame: 'Solid Wood', Warranty: '3 Years' }, rating: 4.5, numReviews: 74, tags: ['sofa', 'furniture', 'home'] },
  { name: 'Non-Stick Cookware Set 5 Pieces', description: 'Daily-use cookware set with non-stick coating, ergonomic handles and induction compatibility.', price: 2199, originalPrice: 3999, discount: 45, category: 'Home', subCategory: 'Kitchen', brand: 'ChefMate', images: [image('Cookware Set', '#607d8b')], stock: 54, specifications: { Pieces: '5', Coating: 'Non-stick', Base: 'Induction', Warranty: '1 Year' }, rating: 4.0, numReviews: 98, tags: ['kitchen', 'cookware', 'home'] },
  { name: 'Mastering Microservices Architecture', description: 'Practical guide to building distributed systems, API gateways, containers and cloud-native deployments.', price: 599, originalPrice: 999, discount: 40, category: 'Books', subCategory: 'Technology', brand: 'TechReads', images: [image('Microservices Book', '#3f51b5')], stock: 120, specifications: { Pages: '420', Language: 'English', Binding: 'Paperback', Publisher: 'TechReads' }, rating: 4.7, numReviews: 64, tags: ['book', 'microservices', 'software'] },
  { name: 'Kids Building Blocks Mega Pack', description: 'Creative building blocks set for kids with 500 colorful pieces and safe rounded edges.', price: 999, originalPrice: 1699, discount: 41, category: 'Toys', subCategory: 'Learning Toys', brand: 'PlayBox', images: [image('Building Blocks', '#e91e63')], stock: 80, specifications: { Pieces: '500', Age: '3+ years', Material: 'Non-toxic Plastic', Skill: 'Creativity' }, rating: 4.4, numReviews: 123, tags: ['toys', 'kids', 'blocks'] },
  { name: 'ProStrike Cricket Bat', description: 'Lightweight tennis ball cricket bat with power profile and comfortable rubber grip.', price: 1499, originalPrice: 2499, discount: 40, category: 'Sports', subCategory: 'Cricket', brand: 'ProStrike', images: [image('Cricket Bat', '#009688')], stock: 38, specifications: { Material: 'Poplar Willow', Size: 'Full Size', Weight: 'Lightweight', Grip: 'Rubber' }, rating: 4.2, numReviews: 88, tags: ['sports', 'cricket', 'bat'] },
  { name: 'GlowCare Vitamin C Serum', description: 'Brightening face serum with vitamin C, hyaluronic acid and lightweight non-sticky texture.', price: 449, originalPrice: 899, discount: 50, category: 'Beauty', subCategory: 'Skincare', brand: 'GlowCare', images: [image('Vitamin C Serum', '#ff4081')], stock: 200, specifications: { Quantity: '30 ml', SkinType: 'All skin types', ParabenFree: 'Yes', Usage: 'Daily' }, rating: 4.1, numReviews: 276, tags: ['beauty', 'skincare', 'serum'] },
  { name: 'Daily Essentials Grocery Pack', description: 'Monthly grocery combo with rice, dal, sugar and cooking oil for everyday Indian kitchens.', price: 1199, originalPrice: 1499, discount: 20, category: 'Grocery', subCategory: 'Staples', brand: 'DailyFresh', images: [image('Grocery Pack', '#4caf50')], stock: 75, specifications: { Includes: 'Rice, Dal, Sugar, Oil', Weight: 'Approx 8 kg', ShelfLife: '6 months', Vegetarian: 'Yes' }, rating: 4.0, numReviews: 45, tags: ['grocery', 'staples', 'daily'] }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
