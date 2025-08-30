import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './AddProduct.css'; // Custom CSS for styling

export default function AddProduct() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  console.log("API URL:", API_URL);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: 1,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

    if (!user || user.role !== 'farmer') {
      alert("Access denied. Only farmers can add products.");
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
      alert('✅ Product added successfully');
      navigate('/');
    } catch (err) {
      alert('❌ Failed to add product: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="product-card shadow-lg rounded">
          <div className="card-header text-center">
            <h2>Add New Product</h2>
            <p className="text-muted">Farmers can upload products to reach customers worldwide.</p>
          </div>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="card-body">
            <div className="mb-3">
              <label className="form-label">Product Name:</label>
              <input
                type="text"
                name="name"
                className="form-control"
                required
                onChange={handleChange}
                value={formData.name}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description:</label>
              <textarea
                name="description"
                className="form-control"
                required
                rows="3"
                onChange={handleChange}
                value={formData.description}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Price (₹):</label>
              <input
                type="number"
                name="price"
                className="form-control"
                required
                min="0"
                step="0.01"
                onChange={handleChange}
                value={formData.price}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Quantity:</label>
              <input
                type="number"
                name="quantity"
                className="form-control"
                required
                min="1"
                step="1"
                onChange={handleChange}
                value={formData.quantity}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Image:</label>
              <input
                type="file"
                name="image"
                className="form-control"
                accept="image/*"
                required
                onChange={handleChange}
              />
            </div>

            {imagePreview && (
              <div className="image-preview text-center mb-3">
                <img src={imagePreview} alt="Preview" className="preview-img"/>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-success w-100"
              disabled={submitting}
            >
              {submitting ? 'Adding...' : 'Add Product'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
