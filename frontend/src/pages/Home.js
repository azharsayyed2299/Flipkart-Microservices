import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getProductImage } from '../utils/image';
import './Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/products?limit=8&sort=rating');
        setFeaturedProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const categories = [
    { name: 'Electronics', image: '📱' },
    { name: 'Clothing', image: '👕' },
    { name: 'Home', image: '🏠' },
    { name: 'Books', image: '📚' },
    { name: 'Sports', image: '⚽' },
    { name: 'Beauty', image: '💄' },
    { name: 'Grocery', image: '🛒' }
  ];

  return (
    <div className="home page">
      <section className="hero-banner">
        <div className="hero-content">
          <p className="eyebrow">Azharicroservices</p>
          <h1>Everything you need, delivered fast.</h1>
          <p>Browse electronics, fashion, home essentials and more with a production-style microservices backend.</p>
          <Link to="/products" className="hero-btn">Shop Now</Link>
        </div>
      </section>

      <section className="categories-section">
        <h2>Shop by Category</h2>
        <div className="categories-grid">
          {categories.map((category) => (
            <Link key={category.name} to={`/products?category=${encodeURIComponent(category.name)}`} className="category-card">
              <div className="category-icon">{category.image}</div>
              <h3>{category.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <h2>Featured Products</h2>
          <Link to="/products">View all</Link>
        </div>
        {loading ? <div className="loading">Loading...</div> : (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <Link key={product._id} to={`/products/${product._id}`} className="product-card">
                <div className="product-image">
                  <img src={getProductImage(product)} alt={product.name} />
                  {product.discount > 0 && <span className="discount-badge">{product.discount}% OFF</span>}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-rating">⭐ {(product.rating || 0).toFixed(1)} ({product.numReviews || 0})</div>
                  <div className="product-price">
                    <span className="current-price">₹{Number(product.price).toLocaleString('en-IN')}</span>
                    {product.originalPrice && <span className="original-price">₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="offers-section">
        <div className="offer-card"><h3>🎉 Mega Sale</h3><p>Up to 80% off on selected items</p></div>
        <div className="offer-card"><h3>🚚 Free Delivery</h3><p>On orders above ₹500</p></div>
        <div className="offer-card"><h3>💳 Secure Checkout</h3><p>COD, Card, UPI and NetBanking</p></div>
      </section>
    </div>
  );
}

export default Home;
