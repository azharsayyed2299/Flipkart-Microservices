import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import api from './services/api';
import './App.css';

import Header from './components/Header';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) setUser(JSON.parse(userData));
  }, []);

  const refreshCartCount = useCallback(async () => {
    if (!user?.id) {
      setCartCount(0);
      return;
    }
    try {
      const response = await api.get(`/cart/${user.id}`);
      const count = response.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      setCartCount(count);
    } catch (error) {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => { refreshCartCount(); }, [refreshCartCount]);

  const PrivateRoute = ({ children }) => (user ? children : <Navigate to="/login" replace />);

  return (
    <Router>
      <div className="App">
        <Header user={user} setUser={setUser} cartCount={cartCount} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail user={user} refreshCartCount={refreshCartCount} />} />
          <Route path="/cart" element={<PrivateRoute><Cart user={user} refreshCartCount={refreshCartCount} /></PrivateRoute>} />
          <Route path="/checkout" element={<PrivateRoute><Checkout user={user} refreshCartCount={refreshCartCount} /></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><Orders user={user} /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile user={user} setUser={setUser} /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications user={user} /></PrivateRoute>} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
