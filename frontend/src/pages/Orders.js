import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import './Orders.css';

function Orders({ user }) {
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(location.state?.orderPlaced ? 'Order placed successfully!' : '');

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get(`/orders/user/${user.id}`);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const cancelOrder = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/cancel`);
      setMessage('Order cancelled.');
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Unable to cancel order.');
    }
  };

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="orders-page page">
      <h2>My Orders</h2>
      {message && <div className="alert success">{message}</div>}
      {orders.length === 0 ? <div className="empty-state">No orders yet.</div> : orders.map((order) => (
        <div className="order-card card" key={order._id}>
          <div className="order-head">
            <div><strong>{order.orderNumber}</strong><p>{new Date(order.createdAt).toLocaleString()}</p></div>
            <div className="order-badges"><span className={`badge ${order.orderStatus.toLowerCase()}`}>{order.orderStatus}</span><span className="badge payment">{order.paymentStatus}</span></div>
          </div>
          <div className="order-items">
            {order.items.map((item) => <div key={item.productId} className="order-item"><span>{item.name} × {item.quantity}</span><strong>₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</strong></div>)}
          </div>
          <div className="order-foot"><strong>Total: ₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong>{!['Shipped', 'Delivered', 'Cancelled'].includes(order.orderStatus) && <button className="danger-btn" onClick={() => cancelOrder(order._id)}>Cancel Order</button>}</div>
        </div>
      ))}
    </div>
  );
}

export default Orders;
