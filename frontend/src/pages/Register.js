import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function Register({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/users/register', form);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page">
      <form className="auth-card card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p>Sign up to start shopping.</p>
        {error && <div className="alert error">{error}</div>}
        <div className="form-control"><label>Name</label><input name="name" value={form.name} onChange={handleChange} required /></div>
        <div className="form-control"><label>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
        <div className="form-control"><label>Phone</label><input name="phone" value={form.phone} onChange={handleChange} required /></div>
        <div className="form-control"><label>Password</label><input name="password" type="password" minLength="6" value={form.password} onChange={handleChange} required /></div>
        <button className="primary-btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
        <p className="auth-switch">Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}

export default Register;
