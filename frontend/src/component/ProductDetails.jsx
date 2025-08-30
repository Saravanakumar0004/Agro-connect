import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductList from "./ProductList";
import axios from "axios";
import Navbar from "./Navbar";
import './ProductDetails.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Use env variable or fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  console.log("API URL:", API_URL);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("❌ Error fetching product details:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, API_URL]);

  if (loading) return <p className="center-text">Loading product details...</p>;
  if (error) return <p className="center-text text-danger">{error}</p>;
  if (!product) return <p className="center-text">Product not found</p>;

  const { farmerId } = product;

  return (
    <>
      <Navbar />
      <div className="container mt-4 product-details-container">
        <div className="row">
          {/* Product Image */}
          <div className="col-md-6">
            <div className="image-card mb-3">
              <img
                src={`${API_URL}/products/${id}/image`}
                alt={product.name}
                className="product-image"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="col-md-6">
            <div className="info-card p-4">
              <h2 className="product-name">{product.name}</h2>
              <p className="product-description">{product.description}</p>
              <h4 className="product-price">₹{product.price}</h4>

              {/* Farmer Info */}
              {farmerId ? (
                <div className="farmer-info card p-3 mt-4 shadow-sm">
                  <p><strong>Farmer Name:</strong> {farmerId.name}</p>
                  <p>
                    <strong>Contact:</strong>{" "}
                    {farmerId.phone ? (
                      <a href={`tel:${farmerId.phone}`}>{farmerId.phone}</a>
                    ) : "N/A"}
                  </p>
                  <p><strong>Location:</strong> {farmerId.location}</p>
                </div>
              ) : (
                <p><strong>Farmer:</strong> N/A</p>
              )}

              <button
                className="btn btn-success mt-4"
                onClick={() => navigate(`/order/${product._id}`)}
              >
                Order Now
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <h3 className="mt-5 mb-3">Other Products</h3>
        <ProductList />
      </div>
    </>
  );
}
