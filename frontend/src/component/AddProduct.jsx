import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './AddProduct.css';

export default function AddProduct() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // ── Form state ──
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

  // ── My Products state ──
  const [myProducts, setMyProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'manage'

  // ── Fetch farmer's products ──
  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    if (!user?._id) return;
    setLoadingProducts(true);
    try {
      const res = await axios.get(`${API_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mine = res.data.filter(p => p.farmerId?._id === user._id || p.farmerId === user._id);
      setMyProducts(mine);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

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

  // ── Add or Update product ──
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
    if (formData.image) data.append('image', formData.image);
    if (!editingId) data.append('farmerId', user._id);

    try {
      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess(true);
        setEditingId(null);
      } else {
        await axios.post(`${API_URL}/products`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess(true);
      }

      // Reset form
      setFormData({ name: '', description: '', price: '', quantity: 1, image: null });
      setImagePreview(null);
      fetchMyProducts();

      setTimeout(() => {
        setSuccess(false);
        setActiveTab('manage');
      }, 1500);

    } catch (err) {
      setError('Failed: ' + (err?.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit: populate form ──
  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      quantity: product.quantity || 1,
      image: null,
    });
    setImagePreview(`${API_URL}/products/${product._id}/image`);
    setEditingId(product._id);
    setActiveTab('add');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Cancel edit ──
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', quantity: 1, image: null });
    setImagePreview(null);
    setError('');
  };

  // ── Delete ──
  const handleDelete = async (productId) => {
    setDeletingId(productId);
    try {
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProducts(prev => prev.filter(p => p._id !== productId));
      setDeleteConfirmId(null);
    } catch (err) {
      setError('Failed to delete: ' + (err?.response?.data?.message || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <div className="addprod-wrapper">

        {/* ── Page Header ── */}
        <div className="addprod-page-header">
          <div className="addprod-page-header-icon">🌾</div>
          <div className="addprod-header-text">
            <h1>{editingId ? 'Edit Product' : 'Manage Products'}</h1>
            <p>Add, edit or remove your farm products</p>
          </div>
          <div className="addprod-header-count">
            <span>{myProducts.length}</span>
            <p>Listed</p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="addprod-tabs">
          <button
            className={`addprod-tab ${activeTab === 'add' ? 'addprod-tab--active' : ''}`}
            onClick={() => { setActiveTab('add'); handleCancelEdit(); }}
          >
            {editingId ? '✏️ Edit Product' : '➕ Add Product'}
          </button>
          <button
            className={`addprod-tab ${activeTab === 'manage' ? 'addprod-tab--active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            📦 My Products
            {myProducts.length > 0 && (
              <span className="addprod-tab-badge">{myProducts.length}</span>
            )}
          </button>
        </div>

        {/* ══════════════════════════════════
            ADD / EDIT FORM TAB
        ══════════════════════════════════ */}
        {activeTab === 'add' && (
          <div className="addprod-card">

            {/* Steps header */}
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
                <div className="addprod-step addprod-step--active">
                  <span>3</span> Image
                </div>
              </div>
            </div>

            {/* Alerts */}
            {success && (
              <div className="addprod-alert addprod-alert--success">
                ✅ Product {editingId ? 'updated' : 'added'} successfully!
              </div>
            )}
            {error && (
              <div className="addprod-alert addprod-alert--error">
                ❌ {error}
              </div>
            )}

            {/* Edit mode banner */}
            {editingId && (
              <div className="addprod-edit-banner">
                <span>✏️ You are editing an existing product</span>
                <button className="addprod-cancel-edit" onClick={handleCancelEdit}>
                  ✕ Cancel Edit
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="addprod-form">

              {/* Name */}
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

              {/* Description */}
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

              {/* Price + Quantity */}
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

              {/* Image Upload */}
              <div className="addprod-field">
                <label className="addprod-label">
                  <span className="addprod-label-icon">🖼️</span>
                  Product Image
                  {editingId && (
                    <span className="addprod-optional-tag">optional — keep current if not changed</span>
                  )}
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
                  required={!editingId}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className={`addprod-btn-submit ${submitting ? 'addprod-btn-submit--loading' : ''} ${editingId ? 'addprod-btn-submit--edit' : ''}`}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="addprod-spinner"></span>
                    {editingId ? 'Updating…' : 'Uploading…'}
                  </>
                ) : editingId ? (
                  '✅ Update Product'
                ) : (
                  '🌾 Add Product'
                )}
              </button>

            </form>
          </div>
        )}

        {/* ══════════════════════════════════
            MY PRODUCTS TAB
        ══════════════════════════════════ */}
        {activeTab === 'manage' && (
          <div className="addprod-manage">

            {/* Error */}
            {error && (
              <div className="addprod-alert addprod-alert--error" style={{ marginBottom: '16px' }}>
                ❌ {error}
              </div>
            )}

            {/* Loading */}
            {loadingProducts ? (
              <div className="addprod-manage-loading">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="addprod-manage-skeleton">
                    <div className="addprod-skel-img"></div>
                    <div className="addprod-skel-body">
                      <div className="addprod-skel-line addprod-skel-line--title"></div>
                      <div className="addprod-skel-line addprod-skel-line--sub"></div>
                    </div>
                    <div className="addprod-skel-btns">
                      <div className="addprod-skel-btn"></div>
                      <div className="addprod-skel-btn"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : myProducts.length === 0 ? (
              <div className="addprod-manage-empty">
                <div className="addprod-manage-empty-icon">🌾</div>
                <h3>No products yet</h3>
                <p>You haven't added any products. Start by adding your first product.</p>
                <button
                  className="addprod-btn-submit"
                  style={{ width: 'auto', padding: '12px 28px' }}
                  onClick={() => setActiveTab('add')}
                >
                  ➕ Add First Product
                </button>
              </div>
            ) : (
              <div className="addprod-product-list">
                {myProducts.map((product) => (
                  <div key={product._id} className="addprod-product-item">

                    {/* Image */}
                    <div className="addprod-product-img-wrap">
                      <img
                        src={`${API_URL}/products/${product._id}/image`}
                        alt={product.name}
                        className="addprod-product-img"
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.closest('.addprod-product-img-wrap').classList.add('addprod-img-fallback');
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="addprod-product-info">
                      <h4 className="addprod-product-name">{product.name}</h4>
                      <div className="addprod-product-meta">
                        <span className="addprod-product-price">₹{product.price}</span>
                        <span className="addprod-product-qty">📦 {product.quantity} units</span>
                      </div>
                      {product.description && (
                        <p className="addprod-product-desc">{product.description}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="addprod-product-actions">
                      {/* Edit */}
                      <button
                        className="addprod-action-btn addprod-action-btn--edit"
                        onClick={() => handleEdit(product)}
                      >
                        ✏️ Edit
                      </button>

                      {/* Delete — with confirm */}
                      {deleteConfirmId === product._id ? (
                        <div className="addprod-delete-confirm">
                          <p>Delete this product?</p>
                          <div className="addprod-delete-confirm-btns">
                            <button
                              className="addprod-confirm-yes"
                              onClick={() => handleDelete(product._id)}
                              disabled={deletingId === product._id}
                            >
                              {deletingId === product._id ? (
                                <span className="addprod-spinner" style={{ width: 12, height: 12, borderWidth: 2 }}></span>
                              ) : 'Yes, Delete'}
                            </button>
                            <button
                              className="addprod-confirm-no"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="addprod-action-btn addprod-action-btn--delete"
                          onClick={() => setDeleteConfirmId(product._id)}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
}
