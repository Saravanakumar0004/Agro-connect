import React, { useState } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });

      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);

      setSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="login-wrapper">

        {/* ── Left panel (decorative) ── */}
        <div className="login-left">
          <div className="login-left-content">
            <div className="login-left-logo">🌿</div>
            <h2>Welcome Back to AgroLink</h2>
            <p>Connect directly with farmers and customers across the globe.</p>
            <div className="login-left-features">
              <div className="login-feature">
                <span className="login-feature-icon">🌾</span>
                <span>Fresh farm products daily</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">🚚</span>
                <span>Track orders in real time</span>
              </div>
              <div className="login-feature">
                <span className="login-feature-icon">💰</span>
                <span>Commission-free pricing</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel (form) ── */}
        <div className="login-right">
          <div className="login-card">

            {/* Header */}
            <div className="login-card-header">
              <div className="login-card-icon">👤</div>
              <h2>Sign In</h2>
              <p>Access your AgroLink account</p>
            </div>

            {/* Alerts */}
            {success && (
              <div className="login-alert login-alert--success">
                ✅ Login successful! Redirecting…
              </div>
            )}
            {error && (
              <div className="login-alert login-alert--error">
                ❌ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="login-form">

              {/* Email */}
              <div className="login-field">
                <label className="login-label">
                  <span className="login-label-icon">✉️</span>
                  Email Address
                </label>
                <input
                  type="email"
                  className="login-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-label">
                  <span className="login-label-icon">🔒</span>
                  Password
                </label>
                <div className="login-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input login-input--password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`login-btn-submit ${loading ? 'login-btn-submit--loading' : ''}`}
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in…
                  </>
                ) : success ? (
                  '✅ Signed In!'
                ) : (
                  '→ Sign In'
                )}
              </button>

            </form>

            {/* Footer links */}
            <div className="login-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="login-link">Create one free</Link>
              </p>
              <div className="login-divider">
                <span>or register as</span>
              </div>
              <div className="login-register-links">
                <Link to="/register?role=farmer" className="login-role-btn login-role-btn--farmer">
                  👨‍🌾 Farmer
                </Link>
                <Link to="/register?role=customer" className="login-role-btn login-role-btn--customer">
                  🛒 Customer
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
