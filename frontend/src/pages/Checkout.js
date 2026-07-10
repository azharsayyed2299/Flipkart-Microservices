import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Checkout.css';

function Checkout({ user, refreshCartCount }) {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [address, setAddress] = useState({ name: user?.name || '', street: '', city: '', state: '', pincode: '', country: 'India', phone: user?.phone || '' });

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await api.get(`/cart/${user.id}`);
        setCart(response.data);
      } catch (err) {
        setError('Unable to load cart.');
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user.id]);

  const handleAddressChange = (event) => setAddress({ ...address, [event.target.name]: event.target.value });

  const placeOrder = async (event) => {
    event.preventDefault();
    setPlacing(true);
    setError('');
    try {
      const orderResponse = await api.post('/orders', { userId: user.id, shippingAddress: address, paymentMethod });
      const order = orderResponse.data;
      await api.post('/payments', { orderId: order._id, userId: user.id, amount: order.totalAmount, paymentMethod });
      await refreshCartCount();
      navigate('/orders', { state: { orderPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="loading">Loading checkout...</div>;
  if (!cart || cart.items.length === 0) return <div className="empty-state">Cart is empty. Add products before checkout.</div>;

  return (
    <div className="checkout-page page">
      <form className="checkout-form card" onSubmit={placeOrder}>
        <h2>Delivery Address</h2>
        {error && <div className="alert error">{error}</div>}
        <div className="form-grid">
          <div className="form-control"><label>Name</label><input name="name" value={address.name} onChange={handleAddressChange} required /></div>
          <div className="form-control"><label>Phone</label><input name="phone" value={address.phone} onChange={handleAddressChange} required /></div>
          <div className="form-control full"><label>Street</label><input name="street" value={address.street} onChange={handleAddressChange} required /></div>
          <div className="form-control"><label>City</label><input name="city" value={address.city} onChange={handleAddressChange} required /></div>
          <div className="form-control"><label>State</label><input name="state" value={address.state} onChange={handleAddressChange} required /></div>
          <div className="form-control"><label>Pincode</label><input name="pincode" value={address.pincode} onChange={handleAddressChange} required /></div>
          <div className="form-control"><label>Country</label><input name="country" value={address.country} onChange={handleAddressChange} required /></div>
        </div>

        <h2>Payment Method</h2>
        <div className="payment-options">
          {['COD', 'UPI', 'Card', 'NetBanking'].map((method) => (
            <label key={method}><input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} /> {method}</label>
          ))}
        </div>
        <button className="primary-btn" type="submit" disabled={placing}>{placing ? 'Placing Order...' : 'Place Order'}</button>
      </form>

      <aside className="checkout-summary card">
        <h3>Order Summary</h3>
        {cart.items.map((item) => <div className="checkout-item" key={item.productId}><span>{item.name} × {item.quantity}</span><strong>₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</strong></div>)}
        <div className="summary-row total"><span>Total</span><span>₹{Number(cart.totalPrice).toLocaleString('en-IN')}</span></div>
      </aside>
    </div>
  );
}

export default Checkout;
