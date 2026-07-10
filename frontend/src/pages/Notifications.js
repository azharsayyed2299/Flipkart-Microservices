import React, { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import './Notifications.css';

function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get(`/notifications/user/${user.id}`);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.put(`/notifications/user/${user.id}/read-all`);
    fetchNotifications();
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="notifications-page page">
      <div className="notifications-head"><h2>Notifications</h2>{notifications.some((n) => !n.isRead) && <button className="secondary-btn" onClick={markAllRead}>Mark all read</button>}</div>
      {notifications.length === 0 ? <div className="empty-state">No notifications yet.</div> : notifications.map((notification) => (
        <div key={notification._id} className={`notification-card card ${notification.isRead ? 'read' : 'unread'}`}>
          <div><h3>{notification.title}</h3><p>{notification.message}</p><span>{new Date(notification.createdAt).toLocaleString()}</span></div>
          {!notification.isRead && <button className="secondary-btn" onClick={() => markRead(notification._id)}>Mark read</button>}
        </div>
      ))}
    </div>
  );
}

export default Notifications;
