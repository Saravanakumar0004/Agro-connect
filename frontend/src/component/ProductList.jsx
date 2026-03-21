import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './ProductList.css';

export default function ProductList({ limit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${API_URL}/products`);
        setProducts(res.data);
      } catch (err) {
        setError("Failed to load products. Please try again.");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [API_URL]);

  const filtered = products
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name')       return a.name.localeCompare(b.name);
      return 0;
    })
    .slice(0, limit || products.length); // ← limit: 4 on homepage, all on shop

  // ── Loading skeletons ──
  if (loading) return (
    <div className="plist-loading">
      {[...Array(limit || 8)].map((_, i) => (
        <div key={i} className="plist-skeleton">
          <div className="plist-skeleton-img"></div>
          <div className="plist-skeleton-body">
            <div className="plist-skeleton-line plist-skeleton-line--title"></div>
            <div className="plist-skeleton-line plist-skeleton-line--price"></div>
            <div className="plist-skeleton-line plist-skeleton-line--btn"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Error ──
  if (error) return (
    <div className="plist-error">
      <div className="plist-error-icon">⚠️</div>
      <p>{error}</p>
    </div>
  );

  return (
    <div className="plist-wrapper">

      {/* ── Toolbar — hidden on homepage (when limit is passed) ── */}
      {!limit && (
        <div className="plist-toolbar">
          <div className="plist-search-wrap">
            <span className="plist-search-icon">🔍</span>
            <input
              type="text"
              className="plist-search"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="plist-search-clear"
                onClick={() => setSearch('')}
              >✕</button>
            )}
          </div>

          <select
            className="plist-sort"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name: A → Z</option>
          </select>

          <div className="plist-count">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="plist-empty">
          <div className="plist-empty-icon">🌾</div>
          <h3>No products found</h3>
          <p>
            {search
              ? `No results for "${search}". Try a different search.`
              : 'No products available right now.'}
          </p>
          {search && (
            <button className="plist-clear-btn" onClick={() => setSearch('')}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="plist-grid">
          {filtered.map((product, index) => (
            <div
              className="plist-card"
              key={product._id}
              style={{ '--delay': `${index * 0.07}s` }}
            >
              {/* Image */}
              <div className="plist-card-img-wrap">
                <img
                  src={`${API_URL}/products/${product._id}/image`}
                  alt={product.name}
                  className="plist-card-img"
                  loading="lazy"
                  onError={e => {
                    e.target.src = '';
                    e.target.closest('.plist-card-img-wrap').classList.add('plist-img-fallback');
                  }}
                />
                <div className="plist-card-img-overlay"></div>
                <div className="plist-price-badge">₹{product.price}</div>
                {/* Popular badge on first card — only in full shop view */}
                {index === 0 && !limit && (
                  <div className="plist-hot-badge">🔥 Popular</div>
                )}
              </div>

              {/* Body */}
              <div className="plist-card-body">
                <h5 className="plist-card-title">{product.name}</h5>
                {product.description && (
                  <p className="plist-card-desc">{product.description}</p>
                )}
                <div className="plist-card-meta">
                  {product.quantity && (
                    <span className="plist-qty">📦 {product.quantity} units</span>
                  )}
                  {product.farmerId?.name && (
                    <span className="plist-farmer">👨‍🌾 {product.farmerId.name}</span>
                  )}
                </div>
                <Link
                  to={`/product/${product._id}`}
                  className="plist-card-btn"
                >
                  View Details →
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
