import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Account.css';

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    location: ''
  });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    if (storedUser && storedUser._id && token) {
      fetchUserData(storedUser._id);
    }
  }, [token]);

  const fetchUserData = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(res.data);
    } catch (err) {
      console.error('Failed to load user data:', err?.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await axios.put(`${API_URL}/users/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess(true);
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Update error:', err?.response?.data?.message || err.message);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="account-not-logged">
          <div className="account-not-logged-icon">🔒</div>
          <h3>Access Restricted</h3>
          <p>Please login to access your account.</p>
          <button className="btn acc-btn-login" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </>
    );
  }

  const getRoleIcon = (role) => {
    if (role === 'farmer') return '👨‍🌾';
    if (role === 'customer') return '🛒';
    if (role === 'admin') return '🛡️';
    return '👤';
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <Navbar />

      <div className="account-wrapper">

        {/* ── Profile Header ── */}
        <div className="account-profile-header">
          <div className="account-avatar">
            {getInitials(formData.name)}
          </div>
          <div className="account-profile-info">
            <h1>{formData.name || 'Your Account'}</h1>
            <div className="account-role-badge">
              <span>{getRoleIcon(formData.role)}</span>
              {formData.role
                ? formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
                : 'User'}
            </div>
            {formData.location && (
              <p className="account-location">📍 {formData.location}</p>
            )}
          </div>
        </div>

        {/* ── Form Card ── */}
        <div className="account-card">

          <div className="account-card-header">
            <h2>Edit Profile</h2>
            <p>Update your personal information below</p>
          </div>

          {/* Success alert */}
          {success && (
            <div className="acc-alert acc-alert--success">
              ✅ Profile updated successfully! Redirecting…
            </div>
          )}

          {/* Error alert */}
          {error && (
            <div className="acc-alert acc-alert--error">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleUpdate}>

            {/* Name */}
            <div className="acc-field">
              <label className="acc-label">
                <span className="acc-label-icon">👤</span>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                className="acc-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className="acc-field">
              <label className="acc-label">
                <span className="acc-label-icon">✉️</span>
                Email Address
                <span className="acc-locked-badge">🔒 Locked</span>
              </label>
              <input
                type="email"
                name="email"
                className="acc-input acc-input--disabled"
                value={formData.email}
                disabled
                placeholder="your@email.com"
              />
            </div>

            {/* Role */}
            <div className="acc-field">
              <label className="acc-label">
                <span className="acc-label-icon">🏷️</span>
                Role
                <span className="acc-locked-badge">🔒 Locked</span>
              </label>
              <input
                type="text"
                name="role"
                className="acc-input acc-input--disabled"
                value={formData.role}
                disabled
                placeholder="Your role"
              />
            </div>

            {/* Phone + Location side by side */}
            <div className="acc-row">
              <div className="acc-field">
                <label className="acc-label">
                  <span className="acc-label-icon">📞</span>
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  className="acc-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
                />
              </div>

              <div className="acc-field">
                <label className="acc-label">
                  <span className="acc-label-icon">📍</span>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  className="acc-input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`acc-btn-submit ${loading ? 'acc-btn-submit--loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="acc-spinner"></span>
                  Saving Changes…
                </>
              ) : (
                '✅ Save Changes'
              )}
            </button>

          </form>
        </div>

      </div>
    </>
  );
}
