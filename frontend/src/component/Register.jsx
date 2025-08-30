import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Register.css';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    role: 'farmer'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  console.log('API URL:', API_URL); // Debug: make sure env is read correctly

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // Simple frontend validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, Email, and Password are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/register`, formData);
      alert('✅ Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      console.error('Axios error response:', err.response?.data);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <div className="register-card shadow-lg rounded">
          <div className="card-header text-center">
            <h2>Register</h2>
            <p className="text-muted">Create an account to start buying or selling products</p>
          </div>

          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleRegister}>
              <div className="mb-3">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Password:</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Phone:</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label>Role:</label>
                <select
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="farmer">Farmer</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <button type="submit" className="btn btn-success w-100">
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
