import { Link } from 'react-router-dom';
import './App.css';
import Navbar from './component/Navbar';
import ProductList from './component/ProductList';
import { useEffect, useState } from 'react';
import Footer from './component/Footer';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const token = localStorage.getItem("authToken");
      setIsLoggedIn(!!token);
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        {/* ── Hero ── */}
        <section className="hero text-center">
          <div className="hero-badge">🌿 Farm to Table, Direct</div>
          <h1>Welcome to <span className="hero-brand">AgroLink</span></h1>
          <p className="lead">
            Connecting Farmers Directly to Customers – Local and Global
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-browse">
              🛒 Browse Products
            </Link>
            <Link to="/register" className="btn btn-hero-outline">
              Get Started Free →
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><span>500+</span><p>Farmers</p></div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat"><span>12K+</span><p>Products</p></div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat"><span>50+</span><p>Countries</p></div>
          </div>
        </section>

        {/* ── Why AgroLink ── */}
        <section className="why-agrolink my-5">
          <div className="section-label">Why Us</div>
          <h2 className="text-center">Why Choose AgroLink?</h2>
          <p className="section-subtitle text-center">
            We remove barriers between farmers and customers — fair, fast, transparent.
          </p>
          <div className="row mt-4">
            <div className="col-md-4 text-center">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-seedling"></i>
                </div>
                <h5>Direct Contact</h5>
                <p>No middlemen. Farmers earn fair prices, customers pay less.</p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="feature-card feature-card--mid">
                <div className="feature-icon">
                  <i className="fas fa-globe"></i>
                </div>
                <h5>Global Reach</h5>
                <p>Export and import support for farmers and international buyers.</p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-hand-holding-usd"></i>
                </div>
                <h5>Transparent Pricing</h5>
                <p>Dynamic and commission-free pricing for all products.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="how-it-works my-5">
          <div className="section-label">Process</div>
          <h2 className="text-center">How It Works</h2>
          <p className="section-subtitle text-center">
            Three simple steps to connect farmers with customers worldwide.
          </p>
          <div className="row mt-4">
            <div className="col-md-4 text-center">
              <div className="step-card">
                <div className="step-number">01</div>
                <div className="step-icon">📦</div>
                <h5>Farmers Upload Products</h5>
                <p>Farmers list products with quantity, price, and location.</p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="step-card step-card--mid">
                <div className="step-number">02</div>
                <div className="step-icon">🔍</div>
                <h5>Customers Browse & Order</h5>
                <p>Customers find the products they need and place direct orders.</p>
              </div>
            </div>
            <div className="col-md-4 text-center">
              <div className="step-card">
                <div className="step-number">03</div>
                <div className="step-icon">🚚</div>
                <h5>Secure Delivery & Payment</h5>
                <p>Payments are safe, and orders are tracked until delivery.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Products — 4 only ── */}
        <section className="featured-products my-5">
          <div className="section-label">Catalogue</div>
          <h2 className="text-center">Featured Products</h2>
          <p className="section-subtitle text-center">
            Fresh picks from verified farmers, updated daily.
          </p>

          {/* limit=4 hides toolbar and shows only 4 cards */}
          <ProductList limit={4} />

          {/* View All CTA */}
          <div className="fp-view-all">
            <p className="fp-view-all-hint">✨ Showing 4 featured picks · Many more await</p>
            <Link to="/shop" className="fp-view-all-btn">
              🛒 Browse All Products →
            </Link>
          </div>
        </section>

        {/* ── CTA / Welcome Back ── */}
        {!isLoggedIn ? (
          <section className="cta text-center">
            <div className="cta-inner">
              <div className="cta-badge">🚀 Join 500+ Farmers Today</div>
              <h3>Start Connecting Globally</h3>
              <p>Whether you are a farmer or a customer, the world market is one click away.</p>
              <div className="cta-buttons">
                <Link to="/register?role=farmer" className="btn cta-btn-farmer">
                  👨‍🌾 Register as Farmer
                </Link>
                <Link to="/register?role=customer" className="btn cta-btn-customer">
                  🛒 Register as Customer
                </Link>
              </div>
              <p className="cta-footnote">Free forever · No credit card required</p>
            </div>
          </section>
        ) : (
          <div className="welcome-back text-center">
            <div className="welcome-avatar">👋</div>
            <h4>Welcome back to AgroLink!</h4>
            <p>Ready to explore today's fresh listings?</p>
            <div className="welcome-actions">
              <Link to="/shop" className="btn welcome-btn-shop">Browse Shop</Link>
              <button
                className="btn welcome-btn-logout"
                onClick={() => {
                  localStorage.removeItem("authToken");
                  setIsLoggedIn(false);
                }}
              >
                Logout
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ── Footer ── */}
   <Footer />
    </>
  );
}

export default App;
