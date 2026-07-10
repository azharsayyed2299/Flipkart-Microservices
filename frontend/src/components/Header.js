import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import './Header.css';

function Header({ user, setUser, cartCount }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) navigate(`/products?search=${encodeURIComponent(query)}`);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo" aria-label="Flipkart Clone Home">
          <span className="logo-main">Flipkart</span>
          <span className="logo-sub">Clone</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <input type="text" placeholder="Search for products, brands and more" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button type="submit" aria-label="Search"><FaSearch /></button>
        </form>

        <nav className="nav-links">
          {user ? (
            <>
              <Link to="/profile" className="nav-item"><FaUser /> <span>{user.name}</span></Link>
              <Link to="/notifications" className="nav-item"><FaBell /> <span>Alerts</span></Link>
              <Link to="/cart" className="nav-item cart-link">
                <FaShoppingCart /> <span>Cart</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </Link>
              <Link to="/orders" className="nav-item">Orders</Link>
              <button onClick={handleLogout} className="nav-item logout-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item login-btn">Login</Link>
              <Link to="/register" className="nav-item">Register</Link>
            </>
          )}
        </nav>
      </div>

      <div className="categories-bar">
        <Link to="/products?category=Electronics">Electronics</Link>
        <Link to="/products?category=Clothing">Clothing</Link>
        <Link to="/products?category=Home">Home & Furniture</Link>
        <Link to="/products?category=Books">Books</Link>
        <Link to="/products?category=Sports">Sports</Link>
        <Link to="/products?category=Beauty">Beauty</Link>
        <Link to="/products?category=Grocery">Grocery</Link>
      </div>
    </header>
  );
}

export default Header;
