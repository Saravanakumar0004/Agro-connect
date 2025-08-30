import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Account.css'; // Include the CSS

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    location: ''
  });

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  console.log("API URL:", API_URL);

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
      console.error('❌ Failed to load user data:', err?.response?.data?.message || err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${API_URL}/users/${user._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate('/');
    } catch (err) {
      console.error('❌ Update error:', err?.response?.data?.message || err.message);
      alert('❌ Failed to update profile');
    }
  };

  if (!user) {
    return <p className="center-text mt-5">⚠️ Please login to access your account.</p>;
  }

  return (
    <>
      <Navbar />

      <div className="account-container">
        <h2 className="text-center mb-4">My Account</h2>

        <form onSubmit={handleUpdate} className="account-card shadow">
          <div className="mb-3">
            <label className="form-label">Name:</label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email:</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Role:</label>
            <input
              type="text"
              name="role"
              className="form-control"
              value={formData.role}
              disabled
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone:</label>
            <input
              type="text"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Location:</label>
            <input
              type="text"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-update w-100">
            Update Profile
          </button>
        </form>
      </div>
    </>
  );
}
