import React, { useState } from 'react';
import Navbar from './Navbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Add this CSS file

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ Use env variable or fallback
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  console.log('API URL:', API_URL); // Debug: verify URL

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });

      // Save user and token
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);

      // Redirect after login
      navigate('/'); // Change route if needed
    } catch (err) {
      console.error('❌ Login error:', err.response?.data);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="login-card shadow-lg rounded">
          <div className="card-header text-center">
            <h2>Login</h2>
            <p className="text-muted">Access your account to place orders</p>
          </div>

          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label>Email:</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label>Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success w-100">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
