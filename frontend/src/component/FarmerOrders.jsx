import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import './FarmerOrders.css';

export default function FarmerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Use env variable or fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  console.log("API URL:", API_URL);

  const storedUser = localStorage.getItem("user");
  const farmer = storedUser ? JSON.parse(storedUser) : null;
  const farmerId = farmer?._id;

  useEffect(() => {
    async function fetchOrders() {
      try {
        if (!farmerId) {
          setError("No farmer logged in");
          setLoading(false);
          return;
        }

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
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status } : o))
      );
    } catch {
      alert("Failed to update order status");
    }
  };

  if (loading) return <p className="center-text">Loading orders...</p>;
  if (error) return <p className="center-text text-danger">{error}</p>;

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <h2>My Orders</h2>
        {orders.length === 0 ? (
          <p className="center-text">No orders found</p>
        ) : (
          <div className="table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.productId?.name || "Unknown"}</td>
                    <td>₹{order.productId?.price || 0}</td>
                    <td>{order.quantity}</td>
                    <td>{order.customerId?.name || "N/A"}</td>
                    <td>{order.customerId?.phone || "N/A"}</td>
                    <td>{order.address || "N/A"}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                      {order.status === "pending" && (
                        <button
                          className="btn btn-sm btn-shipped"
                          onClick={() => updateStatus(order._id, "shipped")}
                        >
                          Mark Shipped
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
