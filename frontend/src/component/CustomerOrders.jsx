import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import './CustomerOrders.css';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    async function fetchOrders() {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) { setError("User not logged in"); setLoading(false); return; }
        const user = JSON.parse(storedUser);
        if (!user._id) { setError("Invalid user ID"); setLoading(false); return; }
        const res = await axios.get(`${API_URL}/orders/customer/${user._id}`);
        setOrders(res.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [API_URL]);

  const updateStatus = async (orderId, status) => {
    setActionLoading(orderId);
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch {
      setError("Failed to update order status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending:   "🕐",
      shipped:   "🚚",
      delivered: "✅",
      cancelled: "❌"
    };
    return icons[status] || "📦";
  };

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter);

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  // ── Loading ──
  if (loading) return (
    <>
      <Navbar />
      <div className="cord-loading">
        <div className="cord-spinner"></div>
        <p>Loading your orders…</p>
      </div>
    </>
  );

  // ── Error ──
  if (error && orders.length === 0) return (
    <>
      <Navbar />
      <div className="cord-empty">
        <div className="cord-empty-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />

      <div className="cord-wrapper">

        {/* ── Page Header ── */}
        <div className="cord-page-header">
          <div className="cord-page-header-icon">🛒</div>
          <div>
            <h1>My Orders</h1>
            <p>Track and manage all your purchases</p>
          </div>
          <div className="cord-header-count">
            {orders.length} <span>Total</span>
          </div>
        </div>

        {/* ── Stats Row ── */}
        {orders.length > 0 && (
          <div className="cord-stats">
            {["pending","shipped","delivered","cancelled"].map(s => (
              <div key={s} className={`cord-stat cord-stat--${s}`}>
                <span className="cord-stat-icon">{getStatusIcon(s)}</span>
                <span className="cord-stat-num">{statusCounts[s] || 0}</span>
                <span className="cord-stat-label">{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Error banner (non-fatal) ── */}
        {error && (
          <div className="cord-alert">❌ {error}</div>
        )}

        {/* ── Filter Tabs ── */}
        {orders.length > 0 && (
          <div className="cord-filters">
            {["all","pending","shipped","delivered","cancelled"].map(f => (
              <button
                key={f}
                className={`cord-filter-btn ${filter === f ? 'cord-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "📋 All" : `${getStatusIcon(f)} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
                <span className="cord-filter-count">
                  {f === "all" ? orders.length : (statusCounts[f] || 0)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {filteredOrders.length === 0 ? (
          <div className="cord-empty">
            <div className="cord-empty-icon">📭</div>
            <h3>{filter === "all" ? "No orders yet" : `No ${filter} orders`}</h3>
            <p>
              {filter === "all"
                ? "You haven't placed any orders yet. Browse the shop to get started!"
                : `You have no orders with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="cord-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className={`cord-card cord-card--${order.status}`}>

                {/* Status strip */}
                <div className={`cord-card-strip cord-strip--${order.status}`}></div>

                {/* Left: Product info */}
                <div className="cord-card-left">
                  <div className="cord-product-icon">
                    {order.productId?.image
                      ? <img src={order.productId.image} alt={order.productId.name} />
                      : <span>🌾</span>
                    }
                  </div>
                  <div className="cord-product-info">
                    <h5>{order.productId?.name || "Unknown Product"}</h5>
                    <p className="cord-price">₹{order.productId?.price || 0} per unit</p>
                    <p className="cord-farmer">
                      <span>👨‍🌾</span>
                      {order.farmerId?.name || "N/A"}
                      {order.farmerId?.phone && (
                        <span className="cord-phone">· {order.farmerId.phone}</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: Status + actions */}
                <div className="cord-card-right">
                  <div className="cord-qty-badge">
                    Qty: <strong>{order.quantity}</strong>
                  </div>

                  <div className={`cord-status-badge cord-status--${order.status}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>

                  <div className="cord-actions">
                    {order.status === "pending" && (
                      <button
                        className="cord-btn cord-btn--cancel"
                        onClick={() => updateStatus(order._id, "cancelled")}
                        disabled={actionLoading === order._id}
                      >
                        {actionLoading === order._id
                          ? <span className="cord-btn-spinner"></span>
                          : "✕ Cancel"}
                      </button>
                    )}
                    {order.status === "shipped" && (
                      <button
                        className="cord-btn cord-btn--received"
                        onClick={() => updateStatus(order._id, "delivered")}
                        disabled={actionLoading === order._id}
                      >
                        {actionLoading === order._id
                          ? <span className="cord-btn-spinner"></span>
                          : "✓ Mark Received"}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}
