import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Navbar from './Navbar';
import './Register.css';
import Footer from './Footer';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: 'farmer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Pre-select role from URL param e.g. /register?role=farmer
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'farmer' || roleParam === 'customer') {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  const calcStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6)  score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'password') setPasswordStrength(calcStrength(value));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, Email, and Password are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/users/register`, formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColor = ['', '#ef5350', '#ff9800', '#ffc107', '#66bb6a', '#2e7d32'];

  return (
    <>
      <Navbar />

      <div className="reg-wrapper">

        {/* ── Left panel ── */}
        <div className="reg-left">
          <div className="reg-left-content">

            <div className="reg-left-logo">🌿</div>
            <h2>Join AgroLink Today</h2>
            <p>Start buying fresh farm produce or sell your harvest to thousands of customers.</p>

            {/* Role selector cards on left panel */}
            <div className="reg-role-cards">
              <div
                className={`reg-role-card ${formData.role === 'farmer' ? 'reg-role-card--active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'farmer' })}
              >
                <span className="reg-role-emoji">👨‍🌾</span>
                <div>
                  <strong>Farmer</strong>
                  <p>List and sell your products</p>
                </div>
              </div>
              <div
                className={`reg-role-card ${formData.role === 'customer' ? 'reg-role-card--active' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'customer' })}
              >
                <span className="reg-role-emoji">🛒</span>
                <div>
                  <strong>Customer</strong>
                  <p>Browse and buy farm products</p>
                </div>
              </div>
            </div>

            <div className="reg-left-features">
              <div className="reg-feature">
                <span>✅</span> Free to join, no credit card needed
              </div>
              <div className="reg-feature">
                <span>🔒</span> Your data is safe and secure
              </div>
              <div className="reg-feature">
                <span>🌍</span> Connect with buyers worldwide
              </div>
            </div>

          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="reg-right">
          <div className="reg-card">

            {/* Header */}
            <div className="reg-card-header">
              <div className="reg-card-icon">
                {formData.role === 'farmer' ? '👨‍🌾' : '🛒'}
              </div>
              <h2>Create Account</h2>
              <p>Register as a <strong>{formData.role}</strong> on AgroLink</p>
            </div>

            {/* Alerts */}
            {success && (
              <div className="reg-alert reg-alert--success">
                ✅ Registration successful! Redirecting to login…
              </div>
            )}
            {error && (
              <div className="reg-alert reg-alert--error">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="reg-form">

              {/* Name + Email row */}
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label">
                    <span>👤</span> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="reg-input"
                    placeholder="Your full name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="reg-field">
                  <label className="reg-label">
                    <span>✉️</span> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="reg-input"
                    placeholder="your@email.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="reg-field">
                <label className="reg-label">
                  <span>🔒</span> Password
                </label>
                <div className="reg-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="reg-input reg-input--password"
                    placeholder="Min. 6 characters"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="reg-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {/* Password strength bar */}
                {formData.password && (
                  <div className="reg-strength">
                    <div className="reg-strength-bar">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className="reg-strength-seg"
                          style={{
                            background: i <= passwordStrength
                              ? strengthColor[passwordStrength]
                              : 'rgba(0,0,0,0.08)'
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className="reg-strength-label"
                      style={{ color: strengthColor[passwordStrength] }}
                    >
                      {strengthLabel[passwordStrength]}
                    </span>
                  </div>
                )}
              </div>

              {/* Phone + Location */}
              <div className="reg-row">
                <div className="reg-field">
                  <label className="reg-label">
                    <span>📞</span> Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="reg-input"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="reg-field">
                  <label className="reg-label">
                    <span>📍</span> Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="reg-input"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Role selector (hidden select, visual handled on left) */}
              <div className="reg-field">
                <label className="reg-label">
                  <span>🏷️</span> Register as
                </label>
                <div className="reg-role-toggle">
                  <button
                    type="button"
                    className={`reg-role-toggle-btn ${formData.role === 'farmer' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'farmer' })}
                  >
                    👨‍🌾 Farmer
                  </button>
                  <button
                    type="button"
                    className={`reg-role-toggle-btn ${formData.role === 'customer' ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, role: 'customer' })}
                  >
                    🛒 Customer
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`reg-btn-submit ${loading ? 'reg-btn-submit--loading' : ''}`}
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <span className="reg-spinner"></span>
                    Creating Account…
                  </>
                ) : success ? (
                  '✅ Account Created!'
                ) : (
                  `→ Create ${formData.role === 'farmer' ? 'Farmer' : 'Customer'} Account`
                )}
              </button>

            </form>

            {/* Footer */}
            <div className="reg-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="reg-link">Sign in here</Link>
              </p>
            </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}
