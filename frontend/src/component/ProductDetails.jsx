import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductList from "./ProductList";
import axios from "axios";
import Navbar from "./Navbar";
import './ProductDetails.css';
import Footer from "./Footer";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, API_URL]);

  // ── Loading ──
  if (loading) return (
    <>
      <Navbar />
      <div className="pd-loading">
        <div className="pd-spinner"></div>
        <p>Loading product details…</p>
      </div>
    </>
  );

  // ── Error ──
  if (error) return (
    <>
      <Navbar />
      <div className="pd-state-msg">
        <span>⚠️</span>
        <p>{error}</p>
      </div>
    </>
  );

  // ── Not found ──
  if (!product) return (
    <>
      <Navbar />
      <div className="pd-state-msg">
        <span>🔍</span>
        <p>Product not found.</p>
      </div>
    </>
  );

  const { farmerId } = product;

  return (
    <>
      <Navbar />

      <div className="pd-wrapper">

        {/* ── Breadcrumb ── */}
        <div className="pd-breadcrumb">
          <span onClick={() => navigate('/')} className="pd-bc-link">Home</span>
          <span className="pd-bc-sep">›</span>
          <span onClick={() => navigate('/shop')} className="pd-bc-link">Shop</span>
          <span className="pd-bc-sep">›</span>
          <span className="pd-bc-current">{product.name}</span>
        </div>

        {/* ── Main detail card ── */}
        <div className="pd-main">

          {/* Left — Image */}
          <div className="pd-image-col">
            <div className="pd-image-wrap">
              {imgError ? (
                <div className="pd-image-fallback">🌾</div>
              ) : (
                <img
                  src={`${API_URL}/products/${id}/image`}
                  alt={product.name}
                  className="pd-image"
                  onError={() => setImgError(true)}
                />
              )}
              {/* Price overlay */}
              <div className="pd-image-price-badge">₹{product.price}</div>
            </div>

            {/* Quick stats below image */}
            <div className="pd-quick-stats">
              <div className="pd-stat">
                <span className="pd-stat-icon">📦</span>
                <div>
                  <p className="pd-stat-val">{product.quantity || 'N/A'}</p>
                  <p className="pd-stat-lbl">In Stock</p>
                </div>
              </div>
              <div className="pd-stat-divider"></div>
              <div className="pd-stat">
                <span className="pd-stat-icon">💰</span>
                <div>
                  <p className="pd-stat-val">₹{product.price}</p>
                  <p className="pd-stat-lbl">Per Unit</p>
                </div>
              </div>
              <div className="pd-stat-divider"></div>
              <div className="pd-stat">
                <span className="pd-stat-icon">🌿</span>
                <div>
                  <p className="pd-stat-val">Fresh</p>
                  <p className="pd-stat-lbl">Quality</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Info */}
          <div className="pd-info-col">

            {/* Category tag */}
            <div className="pd-tag">🛒 Farm Product</div>

            {/* Name */}
            <h1 className="pd-name">{product.name}</h1>

            {/* Price */}
            <div className="pd-price-row">
              <span className="pd-price">₹{product.price}</span>
              <span className="pd-price-unit">per unit</span>
            </div>

            {/* Description */}
            <div className="pd-desc-wrap">
              <h4 className="pd-section-title">About this product</h4>
              <p className="pd-desc">{product.description}</p>
            </div>

            {/* Farmer info */}
            {farmerId ? (
              <div className="pd-farmer-card">
                <div className="pd-farmer-header">
                  <div className="pd-farmer-avatar">
                    {farmerId.name?.charAt(0).toUpperCase() || 'F'}
                  </div>
                  <div>
                    <p className="pd-farmer-name">{farmerId.name}</p>
                    <p className="pd-farmer-role">👨‍🌾 Verified Farmer</p>
                  </div>
                </div>
                <div className="pd-farmer-details">
                  {farmerId.phone && (
                    <a href={`tel:${farmerId.phone}`} className="pd-farmer-detail">
                      <span>📞</span>
                      <span>{farmerId.phone}</span>
                    </a>
                  )}
                  {farmerId.location && (
                    <div className="pd-farmer-detail">
                      <span>📍</span>
                      <span>{farmerId.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="pd-farmer-na">
                <span>👤</span> Farmer info not available
              </div>
            )}

            {/* Order button */}
            <button
              className="pd-order-btn"
              onClick={() => navigate(`/order/${product._id}`)}
            >
              <span>🛒</span>
              Order Now
            </button>

            {/* Back link */}
            <button
              className="pd-back-btn"
              onClick={() => navigate(-1)}
            >
              ← Back to Shop
            </button>

          </div>
        </div>

        {/* ── Related products ── */}
        <div className="pd-related">
          <div className="pd-related-header">
            <h3>More Products</h3>
            <p>Fresh picks from verified farmers</p>
          </div>
          <ProductList />
        </div>
        <Footer />

      </div>
    </>
  );
}
