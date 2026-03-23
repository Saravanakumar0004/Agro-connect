import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import './OrderPage.css';
import Footer from "./Footer";

export default function OrderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 1,
    address: "",
    phone: ""
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
        // Pre-fill phone from user profile
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.phone) setFormData(p => ({ ...p, phone: user.phone }));
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) {
        navigate("/login");
        return;
      }

      const orderData = {
        customerId: user._id,
        productId: id,
        quantity: Number(formData.quantity),
        address: formData.address,
        phone: formData.phone
      };

      const res = await axios.post(`${API_URL}/orders`, orderData);

      if (res.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate("/my-orders"), 1800);
      }
    } catch (err) {
      setError("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = product
    ? (product.price * Number(formData.quantity)).toFixed(2)
    : 0;

  // ── Loading ──
  if (loading) return (
    <>
      <Navbar />
      <div className="op-loading">
        <div className="op-spinner"></div>
        <p>Loading product…</p>
      </div>
    </>
  );

  // ── Not found ──
  if (!product) return (
    <>
      <Navbar />
      <div className="op-state-msg">
        <span>🔍</span>
        <p>Product not found.</p>
      </div>
    </>
  );

  const farmerId = product.farmerId;

  return (
    <>
      <Navbar />

      <div className="op-wrapper">

        {/* ── Page Header ── */}
        <div className="op-page-header">
          <div className="op-page-header-icon">🛒</div>
          <div className="op-header-text">
            <h1>Place Your Order</h1>
            <p>Order directly from the farmer and support local agriculture</p>
          </div>
        </div>

        <div className="op-layout">

          {/* ══ LEFT — Product + Farmer info ══ */}
          <div className="op-left">

            {/* Product preview card */}
            <div className="op-product-card">
              <div className="op-product-img-wrap">
                {imgError ? (
                  <div className="op-img-fallback">🌾</div>
                ) : (
                  <img
                    src={`${API_URL}/products/${id}/image`}
                    alt={product.name}
                    className="op-product-img"
                    onError={() => setImgError(true)}
                  />
                )}
                <div className="op-product-img-overlay"></div>
              </div>

              <div className="op-product-info">
                <div className="op-product-tag">🌿 Farm Fresh</div>
                <h3 className="op-product-name">{product.name}</h3>
                <div className="op-product-price-row">
                  <span className="op-product-price">₹{product.price}</span>
                  <span className="op-product-per">per unit</span>
                </div>
                {product.description && (
                  <p className="op-product-desc">{product.description}</p>
                )}
              </div>
            </div>

            {/* Payment info notice */}
            <div className="op-notice">
              <div className="op-notice-icon">💰</div>
              <div>
                <p className="op-notice-title">Direct Payment to Farmer</p>
                <p className="op-notice-text">
                  After placing your order, contact the farmer directly to confirm and complete payment.
                </p>
              </div>
            </div>

            {/* Farmer info */}
            {farmerId ? (
              <div className="op-farmer-card">
                <div className="op-farmer-header">
                  <div className="op-farmer-avatar">
                    {farmerId.name?.charAt(0).toUpperCase() || 'F'}
                  </div>
                  <div>
                    <p className="op-farmer-name">{farmerId.name}</p>
                    <p className="op-farmer-badge">👨‍🌾 Verified Farmer</p>
                  </div>
                </div>
                <div className="op-farmer-details">
                  {farmerId.location && (
                    <div className="op-farmer-row">
                      <span>📍</span>
                      <span>{farmerId.location}</span>
                    </div>
                  )}
                  {farmerId.phone && (
                    <a href={`tel:${farmerId.phone}`} className="op-call-btn">
                      📞 Call {farmerId.phone}
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="op-farmer-na">
                👤 Farmer info not available
              </div>
            )}

          </div>

          {/* ══ RIGHT — Order form ══ */}
          <div className="op-right">
            <div className="op-form-card">

              <div className="op-form-header">
                <h2>Order Details</h2>
                <p>Fill in your delivery information</p>
              </div>

              {/* Alerts */}
              {success && (
                <div className="op-alert op-alert--success">
                  ✅ Order placed successfully! Redirecting to your orders…
                </div>
              )}
              {error && (
                <div className="op-alert op-alert--error">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="op-form">

                {/* Quantity */}
                <div className="op-field">
                  <label className="op-label">
                    <span>📦</span> Quantity
                  </label>
                  <input
                    type="number"
                    className="op-input"
                    min="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="op-field">
                  <label className="op-label">
                    <span>📞</span> Phone Number
                  </label>
                  <input
                    type="text"
                    className="op-input"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {/* Address */}
                <div className="op-field">
                  <label className="op-label">
                    <span>📍</span> Delivery Address
                  </label>
                  <textarea
                    className="op-input op-textarea"
                    placeholder="Enter your full delivery address…"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                {/* Order summary */}
                <div className="op-summary">
                  <div className="op-summary-row">
                    <span>Unit Price</span>
                    <span>₹{product.price}</span>
                  </div>
                  <div className="op-summary-row">
                    <span>Quantity</span>
                    <span>× {formData.quantity}</span>
                  </div>
                  <div className="op-summary-divider"></div>
                  <div className="op-summary-row op-summary-total">
                    <span>Total</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className={`op-submit-btn ${submitting ? 'op-submit-btn--loading' : ''}`}
                  disabled={submitting || success}
                >
                  {submitting ? (
                    <>
                      <span className="op-spinner-sm"></span>
                      Placing Order…
                    </>
                  ) : success ? (
                    '✅ Order Placed!'
                  ) : (
                    '🛒 Place Order'
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
