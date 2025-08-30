import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import './CustomerOrders.css';

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Use env variable or fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  console.log("API URL:", API_URL);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setError("User not logged in");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);
        if (!user._id) {
          setError("Invalid user ID");
          setLoading(false);
          return;
        }

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
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch {
      alert("Failed to update order status");
    }
  };

  if (loading) return <p className="center-text mt-5">Loading orders...</p>;
  if (error) return <p className="center-text mt-5 text-danger">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <h2 className="text-center mb-4">My Orders</h2>
        {orders.length === 0 ? (
          <p className="center-text">No orders found.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card shadow mb-3">
                <div className="order-info">
                  <h5>{order.productId?.name || "Unknown Product"}</h5>
                  <p>Price: ₹{order.productId?.price || 0}</p>
                  <p>Farmer: {order.farmerId?.name || "N/A"} ({order.farmerId?.phone || "N/A"})</p>
                  <p>Status: <span className={`status-badge ${order.status}`}>{order.status}</span></p>
                </div>
                <div className="order-actions">
                  <p>Qty: {order.quantity}</p>
                  {order.status === "pending" && (
                    <button
                      className="btn btn-cancel"
                      onClick={() => updateStatus(order._id, "cancelled")}
                    >
                      Cancel
                    </button>
                  )}
                  {order.status === "shipped" && (
                    <button
                      className="btn btn-received"
                      onClick={() => updateStatus(order._id, "delivered")}
                    >
                      Mark Received
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
