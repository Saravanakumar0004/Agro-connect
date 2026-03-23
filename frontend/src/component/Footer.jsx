import React from 'react';
import './Footer.css';
import { Link } from "react-router-dom";


function Footer() {
    return (
      <>
        <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              🌿 <strong>AgroLink</strong>
              <p>Connecting farms to families.</p>
            </div>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/shop">Shop</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} AgroLink. All rights reserved.
          </div>
        </div>
      </footer>
      </>
    );
}

export default Footer;