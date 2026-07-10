import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { fallbackImage } from '../utils/image';
import './Cart.css';

function Cart({ user, refreshCartCount }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = useCallback(async () => {
    try {
      const response = await api.get(`/cart/${user.id}`);
      setCart(response.data);
      await refreshCartCount();
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id, refreshCartCount]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const updateQuantity = async (productId, newQuantity) => {
    try {
      await api.put(`/cart/${user.id}/items/${productId}`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/${user.id}/items/${productId}`);
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;
  if (!cart || cart.items.length === 0) return <div className="empty-cart card"><h2>Your cart is empty</h2><p>Add products to get started.</p><button className="secondary-btn" onClick={() => navigate('/products')}>Shop Now</button></div>;

  return (
    <div className="cart-page page">
      <div className="cart-items card">
        <h2>Shopping Cart ({cart.items.length} items)</h2>
        {cart.items.map((item) => (
          <div key={item.productId} className="cart-item">
            <img src={item.image || fallbackImage} alt={item.name} />
            <div className="item-details"><h3>{item.name}</h3><p>₹{Number(item.price).toLocaleString('en-IN')}</p></div>
            <div className="quantity-controls">
              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
            </div>
            <div className="item-total">₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</div>
            <button className="remove-btn" onClick={() => removeItem(item.productId)}>Remove</button>
          </div>
        ))}
      </div>

      <aside className="cart-summary card">
        <h3>Price Details</h3>
        <div className="summary-row"><span>Subtotal</span><span>₹{Number(cart.totalPrice).toLocaleString('en-IN')}</span></div>
        <div className="summary-row"><span>Delivery</span><span className="free">FREE</span></div>
        <div className="summary-row total"><span>Total</span><span>₹{Number(cart.totalPrice).toLocaleString('en-IN')}</span></div>
        <button className="primary-btn checkout-btn" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
      </aside>
    </div>
  );
}

export default Cart;
