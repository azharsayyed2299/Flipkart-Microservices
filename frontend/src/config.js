export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  USERS: `${API_BASE_URL}/users`,
  PRODUCTS: `${API_BASE_URL}/products`,
  CART: `${API_BASE_URL}/cart`,
  ORDERS: `${API_BASE_URL}/orders`,
  PAYMENTS: `${API_BASE_URL}/payments`,
  NOTIFICATIONS: `${API_BASE_URL}/notifications`
};
