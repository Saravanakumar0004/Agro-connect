import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Custom CSS

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="custom-navbar navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand" to="/">
         AgroConnect
        </Link>

        <button
          className={`navbar-toggler custom-toggler ${isOpen ? 'open' : ''}`}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation"
        >
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3"></div>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="customNavbar">
          <ul className="navbar-nav ms-auto">
            {/* Home Link Always Visible */}
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Login</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">Register</Link>
                </li>
              </>
            )}

            {user && (
              <>
                {user.role === "farmer" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/add-product">Add Product</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/farmer-orders">My Product Orders</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-orders">My  Orders</Link>
                    </li>
                  </>
                )}

                {user.role === "customer" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/shop">Shop</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/my-orders">My Orders</Link>
                    </li>
                  </>
                )}

                {user.role === "admin" && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link" to="/admin-dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link" to="/manage-users">Manage Users</Link>
                    </li>
                  </>
                )}

                <li className="nav-item">
                  <Link className="nav-link username" to="/account">Welcome {user.name}</Link>
                </li>
                <li className="nav-item mt-1">
                  <button className="btn-yellow ms-2" onClick={handleLogout}>Logout</button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
