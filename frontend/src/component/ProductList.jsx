import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import './ProductList.css'; // Import the updated CSS

export default function ProductList() {
  const [products, setProducts] = useState([]);

  // Use env variable or fallback
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get(`${API_URL}/products`);
        setProducts(res.data);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      }
    }
    fetchProducts();
  }, [API_URL]);

  return (
    <div className="container mt-4">
      <div className="row">
        {products.map((product, index) => (
          <div
            className="col-lg-3 col-md-4 col-sm-6 mb-4"
            key={product._id}
            style={{ "--animation-delay": `${index * 0.1}s` }}
          >
            <div className="card product-card">
              <div className="card-img-wrapper">
                <img
                  src={`${API_URL}/products/${product._id}/image`}
                  alt={product.name}
                  className="card-img-top"
                />
              </div>
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">₹{product.price}</p>
                <Link
                  to={`/product/${product._id}`}
                  className="btn btn-primary w-100"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
