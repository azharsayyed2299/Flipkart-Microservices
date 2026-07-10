import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { getProductImage } from '../utils/image';
import './ProductList.css';

const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Toys', 'Sports', 'Beauty', 'Grocery'];

function filtersFromParams(searchParams) {
  return {
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'newest'
  };
}

function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(filtersFromParams(searchParams));

  useEffect(() => {
    const nextFilters = filtersFromParams(searchParams);
    setFilters(nextFilters);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(nextFilters).forEach(([key, value]) => { if (value) params.append(key, value); });
        const response = await api.get(`/products?${params.toString()}`);
        setProducts(response.data.products || []);
        setMeta(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue) params.append(filterKey, filterValue);
    });
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="product-list-page page">
      <aside className="filters-sidebar card">
        <div className="filter-title"><h3>Filters</h3><button onClick={clearFilters}>Clear</button></div>
        <div className="filter-group">
          <h4>Category</h4>
          <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <h4>Price Range</h4>
          <div className="price-inputs">
            <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} />
            <span>to</span>
            <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} />
          </div>
        </div>
        <div className="filter-group">
          <h4>Sort By</h4>
          <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
          </select>
        </div>
      </aside>

      <main className="products-main card">
        <div className="products-header">
          <div>
            <h2>{filters.search ? `Search results for "${filters.search}"` : filters.category || 'All Products'}</h2>
            <span className="product-count">{meta.total ?? products.length} Products</span>
          </div>
        </div>

        {loading ? <div className="loading">Loading products...</div> : products.length === 0 ? <div className="empty-state">No products found.</div> : (
          <div className="products-grid list-products-grid">
            {products.map((product) => (
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
                  {product.stock === 0 && <span className="out-of-stock">Out of Stock</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductList;
