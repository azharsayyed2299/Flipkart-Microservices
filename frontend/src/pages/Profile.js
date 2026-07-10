import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Profile.css';

function Profile({ user, setUser }) {
  const [profile, setProfile] = useState(user);
  const [message, setMessage] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '', country: 'India', phone: user?.phone || '', isDefault: false });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/users/profile');
        setProfile(response.data);
      } catch (error) {
        setMessage('Unable to load profile.');
      }
    };
    fetchProfile();
  }, []);

  const updateProfile = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put('/users/profile', { name: profile.name, phone: profile.phone });
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      setProfile(response.data);
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Update failed.');
    }
  };

  const addAddress = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/users/address', address);
      setProfile({ ...profile, addresses: response.data });
      setAddress({ street: '', city: '', state: '', pincode: '', country: 'India', phone: profile.phone || '', isDefault: false });
      setMessage('Address added.');
    } catch (error) {
      setMessage(error.response?.data?.error || 'Could not add address.');
    }
  };

  if (!profile) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page page">
      <section className="profile-card card">
        <h2>My Profile</h2>
        {message && <div className="alert success">{message}</div>}
        <form onSubmit={updateProfile} className="form-grid">
          <div className="form-control"><label>Name</label><input value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></div>
          <div className="form-control"><label>Email</label><input value={profile.email || ''} disabled /></div>
          <div className="form-control"><label>Phone</label><input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></div>
          <div className="form-actions"><button className="primary-btn" type="submit">Save Profile</button></div>
        </form>
      </section>

      <section className="profile-card card">
        <h2>Saved Addresses</h2>
        <div className="addresses-list">
          {profile.addresses?.length ? profile.addresses.map((addr) => <div className="address-card" key={addr._id}><strong>{addr.name || profile.name}</strong><p>{addr.street}, {addr.city}, {addr.state} - {addr.pincode}</p><p>{addr.country} · {addr.phone}</p>{addr.isDefault && <span>Default</span>}</div>) : <p>No saved addresses.</p>}
        </div>
        <form onSubmit={addAddress} className="form-grid address-form">
          {['street', 'city', 'state', 'pincode', 'phone', 'country'].map((field) => <div className="form-control" key={field}><label>{field}</label><input value={address[field] || ''} onChange={(e) => setAddress({ ...address, [field]: e.target.value })} required={field !== 'phone'} /></div>)}
          <label className="checkbox"><input type="checkbox" checked={address.isDefault} onChange={(e) => setAddress({ ...address, isDefault: e.target.checked })} /> Default address</label>
          <div className="form-actions"><button className="secondary-btn" type="submit">Add Address</button></div>
        </form>
      </section>
    </div>
  );
}

export default Profile;
