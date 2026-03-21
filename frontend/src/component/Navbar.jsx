import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Add scrolled class for shadow depth
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getRoleColor = (role) => ({
    farmer:   "nav-role--farmer",
    customer: "nav-role--customer",
    admin:    "nav-role--admin"
  }[role] || "");

  return (
    <nav className={`custom-navbar navbar navbar-expand-lg ${scrolled ? 'custom-navbar--scrolled' : ''}`}>
      <div className="container">

        {/* ── Brand ── */}
        <Link className="navbar-brand" to="/">
          <span className="nav-brand-icon">🌿</span>
          <span className="nav-brand-text">AgroConnect</span>
        </Link>

        {/* ── Hamburger ── */}
        <button
          className={`navbar-toggler custom-toggler ${isOpen ? 'open' : ''}`}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
        >
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </button>

        {/* ── Nav Links ── */}
        <div
          className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}
          id="customNavbar"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">

            {/* Home — always visible */}
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/') ? 'nav-link--active' : ''}`}
                to="/"
              >
                Home
              </Link>
            </li>

            {/* ── Guest links ── */}
            {!user && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/login') ? 'nav-link--active' : ''}`}
                    to="/login"
                  >
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link--cta" to="/register">
                    Get Started
                  </Link>
                </li>
              </>
            )}

            {/* ── Farmer links ── */}
            {user?.role === "farmer" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/add-product') ? 'nav-link--active' : ''}`}
                    to="/add-product"
                  >
                    + Add Product
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/farmer-orders') ? 'nav-link--active' : ''}`}
                    to="/farmer-orders"
                  >
                    Product Orders
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/my-orders') ? 'nav-link--active' : ''}`}
                    to="/my-orders"
                  >
                    My Orders
                  </Link>
                </li>
              </>
            )}

            {/* ── Customer links ── */}
            {user?.role === "customer" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/shop') ? 'nav-link--active' : ''}`}
                    to="/shop"
                  >
                    Shop
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/my-orders') ? 'nav-link--active' : ''}`}
                    to="/my-orders"
                  >
                    My Orders
                  </Link>
                </li>
              </>
            )}

            {/* ── Admin links ── */}
            {user?.role === "admin" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/admin-dashboard') ? 'nav-link--active' : ''}`}
                    to="/admin-dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive('/manage-users') ? 'nav-link--active' : ''}`}
                    to="/manage-users"
                  >
                    Manage Users
                  </Link>
                </li>
              </>
            )}

            {/* ── Logged-in user: avatar + logout ── */}
            {user && (
              <>
                {/* Divider */}
                <li className="nav-item nav-divider" aria-hidden="true"></li>

                {/* User avatar pill */}
                <li className="nav-item">
                  <Link
                    className={`nav-user-pill ${getRoleColor(user.role)}`}
                    to="/account"
                  >
                    <span className="nav-user-avatar">
                      {user.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                    <span className="nav-user-name">
                      {user.name?.split(' ')[0]}
                    </span>
                    <span className="nav-user-role">
                      {user.role === 'farmer' ? '🌾' : user.role === 'admin' ? '🛡️' : '🛒'}
                    </span>
                  </Link>
                </li>

                {/* Logout */}
                <li className="nav-item">
                  <button className="btn-yellow" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>

      </div>
    </nav>
  );
}
