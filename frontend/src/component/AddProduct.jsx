import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './AddProduct.css';

export default function AddProduct() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: 1,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else if (e.target.name === 'quantity') {
      setFormData({ ...formData, quantity: Number(e.target.value) });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!user || user.role !== 'farmer') {
      setError('Access denied. Only farmers can add products.');
      return;
    }

    setSubmitting(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('price', Number(formData.price));
    data.append('quantity', formData.quantity);
    data.append('image', formData.image);
    data.append('farmerId', user._id);

    try {
      await axios.post(`${API_URL}/products`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Failed to add product: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="addprod-wrapper">

        {/* ── Page Header ── */}
        <div className="addprod-page-header">
          <div className="addprod-page-header-icon">🌾</div>
          <div>
            <h1>Add New Product</h1>
            <p>List your farm product and reach customers worldwide</p>
          </div>
        </div>

        <div className="addprod-card">

          {/* ── Card Header ── */}
          <div className="addprod-card-header">
            <div className="addprod-steps">
              <div className="addprod-step addprod-step--active">
                <span>1</span> Product Info
              </div>
              <div className="addprod-step-line"></div>
              <div className="addprod-step addprod-step--active">
                <span>2</span> Pricing
              </div>
              <div className="addprod-step-line"></div>
              <div className="addprod-step">
                <span>3</span> Image
              </div>
            </div>
          </div>

          {/* ── Alerts ── */}
          {success && (
            <div className="addprod-alert addprod-alert--success">
              ✅ Product added successfully! Redirecting to home…
            </div>
          )}
          {error && (
            <div className="addprod-alert addprod-alert--error">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="addprod-form">

            {/* ── Product Name ── */}
            <div className="addprod-field">
              <label className="addprod-label">
                <span className="addprod-label-icon">📦</span>
                Product Name
              </label>
              <input
                type="text"
                name="name"
                className="addprod-input"
                placeholder="e.g. Fresh Tomatoes, Organic Rice"
                required
                onChange={handleChange}
                value={formData.name}
              />
            </div>

            {/* ── Description ── */}
            <div className="addprod-field">
              <label className="addprod-label">
                <span className="addprod-label-icon">📝</span>
                Description
              </label>
              <textarea
                name="description"
                className="addprod-input addprod-textarea"
                placeholder="Describe your product — quality, origin, harvest date…"
                required
                rows="3"
                onChange={handleChange}
                value={formData.description}
              />
            </div>

            {/* ── Price + Quantity side by side ── */}
            <div className="addprod-row">
              <div className="addprod-field">
                <label className="addprod-label">
                  <span className="addprod-label-icon">💰</span>
                  Price (₹)
                </label>
                <div className="addprod-input-prefix-wrap">
                  <span className="addprod-prefix">₹</span>
                  <input
                    type="number"
                    name="price"
                    className="addprod-input addprod-input--prefixed"
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    onChange={handleChange}
                    value={formData.price}
                  />
                </div>
              </div>

              <div className="addprod-field">
                <label className="addprod-label">
                  <span className="addprod-label-icon">📊</span>
                  Quantity (kg / units)
                </label>
                <input
                  type="number"
                  name="quantity"
                  className="addprod-input"
                  placeholder="1"
                  required
                  min="1"
                  step="1"
                  onChange={handleChange}
                  value={formData.quantity}
                />
              </div>
            </div>

            {/* ── Image Upload ── */}
            <div className="addprod-field">
              <label className="addprod-label">
                <span className="addprod-label-icon">🖼️</span>
                Product Image
              </label>

              <label className="addprod-file-drop" htmlFor="product-image-input">
                {imagePreview ? (
                  <div className="addprod-preview-wrap">
                    <img src={imagePreview} alt="Preview" className="addprod-preview-img" />
                    <div className="addprod-preview-overlay">
                      <span>🔄 Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="addprod-file-placeholder">
                    <div className="addprod-file-icon">📸</div>
                    <p className="addprod-file-text">Click to upload product image</p>
                    <p className="addprod-file-hint">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
              </label>
              <input
                id="product-image-input"
                type="file"
                name="image"
                accept="image/*"
                required
                onChange={handleChange}
                style={{ display: 'none' }}
              />
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              className={`addprod-btn-submit ${submitting ? 'addprod-btn-submit--loading' : ''}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="addprod-spinner"></span>
                  Uploading Product…
                </>
              ) : (
                '🌾 Add Product'
              )}
            </button>

          </form>
        </div>

      </div>
    </>
  );
}
