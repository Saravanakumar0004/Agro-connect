import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import './OrderPage.css'; // Updated CSS

export default function OrderPage() {
  const { id } = useParams(); // productId
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    quantity: 1,
    address: "",
    phone: ""
  });

  // ✅ Use env variable or fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  console.log("API URL:", API_URL);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?._id) {
        alert("Please log in before placing an order.");
        navigate("/login");
        return;
      }

      const orderData = {
        customerId: user._id,
        productId: id,
        quantity: formData.quantity,
        address: formData.address,
        phone: formData.phone
      };

      const res = await axios.post(`${API_URL}/orders`, orderData);

      if (res.status === 201) {
        alert("✅ Order placed successfully!");
        navigate("/my-orders");
      }
    } catch (err) {
      console.error("❌ Error placing order:", err);
      alert("Failed to place order.");
    }
  };

  if (loading) return <p className="center-text">Loading product...</p>;
  if (!product) return <p className="center-text">Product not found.</p>;

  const farmerId = product.farmerId;

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <div className="order-card shadow-lg rounded">
          <div className="card-header text-center">
            <h2>Place Your Order</h2>
            <p>Order directly from the farmer and support local agriculture.</p>
            <p className="fw-bold">
              💰 Payment must be made directly to the farmer.
            </p>
            <p className="text-muted">
              📞 After placing your order, please contact the farmer to confirm and complete payment.
            </p>
          </div>

          <div className="card-body">
            <div className="product-preview text-center mb-4">
              <img 
                src={`${API_URL}/products/${id}/image`} 
                alt={product.name} 
                className="preview-img" 
              />
              <h4 className="mt-2 preview-title">{product.name}</h4>
              <p className="text-success">₹{product.price}</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                ></textarea>
              </div>

              {/* Farmer Info */}
              {farmerId ? (
                <div className="card p-3 mb-3 shadow-sm farmer-card">
                  <p><strong>Farmer Name:</strong> {farmerId.name}</p>
                  <p><strong>Location:</strong> {farmerId.location || "N/A"}</p>
                  {farmerId.phone ? (
                    <a 
                      href={`tel:${farmerId.phone}`} 
                      className="btn btn-outline-primary w-100"
                    >
                      📞 Call {farmerId.phone}
                    </a>
                  ) : (
                    <p><strong>Contact:</strong> N/A</p>
                  )}
                </div>
              ) : (
                <p><strong>Farmer:</strong> N/A</p>
              )}

              <button type="submit" className="btn btn-success w-100 mt-2">
                Place Order
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
