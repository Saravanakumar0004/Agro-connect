import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import './FarmerOrders.css';

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const storedUser = localStorage.getItem("user");
  const farmer = storedUser ? JSON.parse(storedUser) : null;
  const farmerId = farmer?._id;

  useEffect(() => {
    async function fetchOrders() {
      try {
        if (!farmerId) { setError("No farmer logged in"); setLoading(false); return; }
        const res = await axios.get(`${API_URL}/orders/farmer/${farmerId}`);
        setOrders(res.data.orders || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [farmerId, API_URL]);

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

  const getStatusIcon = (status) => ({
    pending:   "🕐",
    shipped:   "🚚",
    delivered: "✅",
    cancelled: "❌"
  }[status] || "📦");

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const totalRevenue = orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + ((o.productId?.price || 0) * (o.quantity || 1)), 0);

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => o.status === filter);

  // ── Loading ──
  if (loading) return (
    <>
      <Navbar />
      <div className="ford-loading">
        <div className="ford-spinner"></div>
        <p>Loading orders…</p>
      </div>
    </>
  );

  // ── Error ──
  if (error && orders.length === 0) return (
    <>
      <Navbar />
      <div className="ford-empty">
        <div className="ford-empty-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{error}</p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />

      <div className="ford-wrapper">

        {/* ── Page Header ── */}
        <div className="ford-page-header">
          <div className="ford-page-header-icon">👨‍🌾</div>
          <div className="ford-header-text">
            <h1>Product Orders</h1>
            <p>Manage and fulfill your customer orders</p>
          </div>
          <div className="ford-header-meta">
            <div className="ford-header-stat">
              <span>{orders.length}</span>
              <p>Orders</p>
            </div>
            <div className="ford-header-divider"></div>
            <div className="ford-header-stat">
              <span>₹{totalRevenue.toLocaleString()}</span>
              <p>Revenue</p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        {orders.length > 0 && (
          <div className="ford-stats">
            {["pending","shipped","delivered","cancelled"].map(s => (
              <div key={s} className={`ford-stat ford-stat--${s}`}>
                <span className="ford-stat-icon">{getStatusIcon(s)}</span>
                <span className="ford-stat-num">{statusCounts[s] || 0}</span>
                <span className="ford-stat-label">
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Non-fatal error ── */}
        {error && orders.length > 0 && (
          <div className="ford-alert">❌ {error}</div>
        )}

        {/* ── Filter Tabs ── */}
        {orders.length > 0 && (
          <div className="ford-filters">
            {["all","pending","shipped","delivered","cancelled"].map(f => (
              <button
                key={f}
                className={`ford-filter-btn ${filter === f ? 'ford-filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "📋 All" : `${getStatusIcon(f)} ${f.charAt(0).toUpperCase() + f.slice(1)}`}
                <span className="ford-filter-count">
                  {f === "all" ? orders.length : (statusCounts[f] || 0)}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ── Empty State ── */}
        {filteredOrders.length === 0 ? (
          <div className="ford-empty">
            <div className="ford-empty-icon">📭</div>
            <h3>{filter === "all" ? "No orders yet" : `No ${filter} orders`}</h3>
            <p>
              {filter === "all"
                ? "You haven't received any orders yet."
                : `No orders with status "${filter}" found.`}
            </p>
          </div>
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="ford-table-wrap">
              <table className="ford-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className={`ford-row ford-row--${order.status}`}>
                      <td>
                        <div className="ford-product-cell">
                          <div className="ford-product-dot ford-dot--green"></div>
                          <span>{order.productId?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="ford-price">₹{order.productId?.price || 0}</td>
                      <td>
                        <span className="ford-qty-pill">{order.quantity}</span>
                      </td>
                      <td className="ford-customer">{order.customerId?.name || "N/A"}</td>
                      <td className="ford-phone">{order.customerId?.phone || "N/A"}</td>
                      <td className="ford-address">{order.address || "N/A"}</td>
                      <td>
                        <span className={`ford-status-badge ford-status--${order.status}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        {order.status === "pending" && (
                          <button
                            className="ford-btn ford-btn--ship"
                            onClick={() => updateStatus(order._id, "shipped")}
                            disabled={actionLoading === order._id}
                          >
                            {actionLoading === order._id
                              ? <span className="ford-btn-spinner"></span>
                              : "🚚 Ship"}
                          </button>
                        )}
                        {order.status === "shipped" && (
                          <span className="ford-shipped-label">In transit</span>
                        )}
                        {order.status === "delivered" && (
                          <span className="ford-delivered-label">✓ Done</span>
                        )}
                        {order.status === "cancelled" && (
                          <span className="ford-cancelled-label">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="ford-mobile-list">
              {filteredOrders.map((order) => (
                <div key={order._id} className={`ford-mobile-card ford-mobile--${order.status}`}>
                  <div className="ford-mobile-top">
                    <div className="ford-mobile-product">
                      <div className="ford-product-icon">🌾</div>
                      <div>
                        <h5>{order.productId?.name || "Unknown"}</h5>
                        <p className="ford-mobile-price">₹{order.productId?.price || 0} × {order.quantity}</p>
                      </div>
                    </div>
                    <span className={`ford-status-badge ford-status--${order.status}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="ford-mobile-details">
                    <div className="ford-mobile-row">
                      <span>👤 {order.customerId?.name || "N/A"}</span>
                      <span>📞 {order.customerId?.phone || "N/A"}</span>
                    </div>
                    <div className="ford-mobile-address">
                      📍 {order.address || "N/A"}
                    </div>
                  </div>
                  {order.status === "pending" && (
                    <button
                      className="ford-btn ford-btn--ship ford-btn--full"
                      onClick={() => updateStatus(order._id, "shipped")}
                      disabled={actionLoading === order._id}
                    >
                      {actionLoading === order._id
                        ? <><span className="ford-btn-spinner"></span> Updating…</>
                        : "🚚 Mark as Shipped"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </>
  );
}
