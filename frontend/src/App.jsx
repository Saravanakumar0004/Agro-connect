import { Link } from 'react-router-dom';
import './App.css';
import Navbar from './component/Navbar';
import ProductList from './component/ProductList';
import { useEffect, useState } from 'react';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status and listen for changes
  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };

    checkLogin(); // run on mount
    window.addEventListener("storage", checkLogin);

    return () => {
      window.removeEventListener("storage", checkLogin);
    };
  }, []);

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        {/* Hero Section */}
        <section className="hero text-center py-5">
          <h1>Welcome to AgroLink</h1>
          <p className="lead">
            Connecting Farmers Directly to Customers – Local and Global
          </p>
          <Link to="/shop" className="btn btn-browse mt-3">Browse Products</Link>
        </section>

        {/* Why AgroLink Section */}
        <section className="why-agrolink my-5">
          <h2 className="text-center">Why Choose AgroLink?</h2>
          <div className="row mt-4">
            <div className="col-md-4 text-center">
              <i className="fas fa-seedling fa-2x mb-2"></i>
              <h5>Direct Contact</h5>
              <p>No middlemen. Farmers earn fair prices, customers pay less.</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="fas fa-globe fa-2x mb-2"></i>
              <h5>Global Reach</h5>
              <p>Export and import support for farmers and international buyers.</p>
            </div>
            <div className="col-md-4 text-center">
              <i className="fas fa-hand-holding-usd fa-2x mb-2"></i>
              <h5>Transparent Pricing</h5>
              <p>Dynamic and commission-free pricing for all products.</p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works my-5">
          <h2 className="text-center">How It Works</h2>
          <div className="row mt-4">
            <div className="col-md-4 text-center">
              <h5>1. Farmers Upload Products</h5>
              <p>Farmers list products with quantity, price, and location.</p>
            </div>
            <div className="col-md-4 text-center">
              <h5>2. Customers Browse & Order</h5>
              <p>Customers find the products they need and place direct orders.</p>
            </div>
            <div className="col-md-4 text-center">
              <h5>3. Secure Delivery & Payment</h5>
              <p>Payments are safe, and orders are tracked until delivery.</p>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="featured-products my-5">
          <h2 className="text-center">Featured Products</h2>
          <ProductList />
        </section>

        {/* CTA OR Welcome Back */}
        {!isLoggedIn ? (
          <section className="cta text-center py-5">
            <h3>Join AgroLink Today!</h3>
            <p>Whether you are a farmer or a customer, start connecting globally.</p>

            <div className="d-flex justify-content-center gap-3 mt-3">
              <Link to="/register?role=farmer" className="btn btn-success">
                👨‍🌾 Register as Farmer
              </Link>
              <Link to="/register?role=customer" className="btn btn-primary">
                🛒 Register as Customer
              </Link>
            </div>
          </section>
        ) : (
          <div className="text-center py-5">
            <h4>Welcome back to AgroLink!</h4>
            <button
              className="btn btn-danger mt-3"
              onClick={() => {
                localStorage.removeItem("authToken");
                setIsLoggedIn(false);
              }}
            >
              Logout
            </button>
          </div>
        )}

      </div>
    </>
  );
}

export default App;
