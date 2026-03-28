import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import './OrderPage.css';
import Footer from "./Footer";

const PAYMENT_METHODS = {
  GPAY: 'gpay',
  COD:  'cod',
};

/* ─────────────────────────────────────────────
   UPI deep-link helpers
   Strategy 1 : upi://pay  — opens any UPI app
   Strategy 2 : intent://  — Android intent (Chrome on Android)
   Strategy 3 : gpay://    — GPay-specific scheme
   Fallback   : GPay web   — works on desktop / iOS without app
───────────────────────────────────────────── */
function buildUpiParams({ phone, amount, name, note }) {
  return {
    pa: `${phone}@gpay`,
    pn: encodeURIComponent(name  || 'Farmer'),
    am: amount.toFixed(2),
    cu: 'INR',
    tn: encodeURIComponent(note  || 'Farm product order'),
  };
}

function buildUpiLink(params) {
  const p = buildUpiParams(params);
  return `upi://pay?pa=${p.pa}&pn=${p.pn}&am=${p.am}&cu=${p.cu}&tn=${p.tn}`;
}

function buildIntentLink(params) {
  const p = buildUpiParams(params);
  // Android intent that targets com.google.android.apps.nbu.paisa.user (GPay)
  return (
    `intent://pay?pa=${p.pa}&pn=${p.pn}&am=${p.am}&cu=${p.cu}&tn=${p.tn}` +
    `#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`
  );
}

function buildGpayWebLink(params) {
  const p = buildUpiParams(params);
  // GPay web payment link — opens app on mobile, shows QR on desktop
  return `https://pay.google.com/gp/v/send/${p.pa}?amount=${p.am}&currencyCode=${p.cu}`;
}

/* Detect Android to choose the right scheme */
function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

/* Detect iOS */
function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function OrderPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [product,    setProduct]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState('');
  const [imgError,   setImgError]   = useState(false);
  const [payment,    setPayment]    = useState(PAYMENT_METHODS.GPAY);
  const [gpayDone,   setGpayDone]   = useState(false); // user tapped "Open GPay"

  const [formData, setFormData] = useState({
    quantity: 1,
    address:  '',
    phone:    '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  /* ── Fetch product ── */
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`${API_URL}/products/${id}`);
        setProduct(res.data);
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.phone) setFormData(p => ({ ...p, phone: user.phone }));
      } catch {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, API_URL]);

  /* ── Derived values ── */
  const totalAmount = product
    ? parseFloat((product.price * Number(formData.quantity)).toFixed(2))
    : 0;

  const farmerId    = product?.farmerId;
  const farmerPhone = farmerId?.phone || '';
  const farmerName  = farmerId?.name  || 'Farmer';

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If GPay is selected but user hasn't tapped "Open GPay" yet, nudge them
    if (payment === PAYMENT_METHODS.GPAY && !gpayDone && farmerPhone) {
      setError('Please complete your GPay payment first, then confirm your order.');
      return;
    }

    setSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?._id) { navigate('/login'); return; }

      const orderData = {
        customerId:    user._id,
        productId:     id,
        quantity:      Number(formData.quantity),
        address:       formData.address,
        phone:         formData.phone,
        paymentMethod: payment,
        paymentStatus: payment === PAYMENT_METHODS.GPAY ? 'paid' : 'pending',
      };

      const res = await axios.post(`${API_URL}/orders`, orderData);
      if (res.status === 201) {
        setSuccess(true);
        setTimeout(() => navigate('/my-orders'), 1800);
      }
    } catch {
      setError('Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenGpay = () => {
    const upiParams = {
      phone:  farmerPhone,
      amount: totalAmount,
      name:   farmerName,
      note:   `Order: ${product?.name}`,
    };

    if (isAndroid()) {
      /* Android: GPay intent → fallback upi:// after 2 s if app didn't open */
      const intentUrl = buildIntentLink(upiParams);
      const upiUrl    = buildUpiLink(upiParams);

      const a = document.createElement('a');
      a.href = intentUrl;
      a.style.display = 'none';
      document.body.appendChild(a);
      try { a.click(); } catch { window.location.href = upiUrl; }
      document.body.removeChild(a);

      const fallbackTimer = setTimeout(() => {
        window.location.href = upiUrl;
      }, 2000);

      const handleHide = () => {
        clearTimeout(fallbackTimer);
        document.removeEventListener('visibilitychange', handleHide);
      };
      document.addEventListener('visibilitychange', handleHide);

    } else if (isIOS()) {
      /* iOS: upi:// opens GPay if installed */
      window.location.href = buildUpiLink(upiParams);
    } else {
      /* Desktop: open GPay web link in new tab */
      window.open(buildGpayWebLink(upiParams), '_blank', 'noopener,noreferrer');
    }

    /* Mark payment initiated after 2.5 s regardless of platform */
    setTimeout(() => setGpayDone(true), 2500);
  };

  /* ── Loading ── */
  if (loading) return (
    <>
      <Navbar />
      <div className="op-loading">
        <div className="op-spinner" />
        <p>Loading product…</p>
      </div>
    </>
  );

  /* ── Not found ── */
  if (!product) return (
    <>
      <Navbar />
      <div className="op-state-msg">
        <span>🔍</span>
        <p>Product not found.</p>
      </div>
    </>
  );

  return (
    <>
      <Navbar />

      <div className="op-wrapper">

        {/* ── Page Header ── */}
        <div className="op-page-header">
          <div className="op-page-header-icon">🛒</div>
          <div className="op-header-text">
            <h1>Place Your Order</h1>
            <p>Order directly from the farmer and support local agriculture</p>
          </div>
        </div>

        <div className="op-layout">

          {/* ══ LEFT ══ */}
          <div className="op-left">

            {/* Product card */}
            <div className="op-product-card">
              <div className="op-product-img-wrap">
                {imgError ? (
                  <div className="op-img-fallback">🌾</div>
                ) : (
                  <img
                    src={`${API_URL}/products/${id}/image`}
                    alt={product.name}
                    className="op-product-img"
                    onError={() => setImgError(true)}
                  />
                )}
                <div className="op-product-img-overlay" />
              </div>

              <div className="op-product-info">
                <div className="op-product-tag">🌿 Farm Fresh</div>
                <h3 className="op-product-name">{product.name}</h3>
                <div className="op-product-price-row">
                  <span className="op-product-price">₹{product.price}</span>
                  <span className="op-product-per">per unit</span>
                </div>
                {product.description && (
                  <p className="op-product-desc">{product.description}</p>
                )}
              </div>
            </div>

            {/* Payment notice */}
            <div className="op-notice">
              <div className="op-notice-icon">💰</div>
              <div>
                <p className="op-notice-title">Pay Directly to the Farmer</p>
                <p className="op-notice-text">
                  Use GPay for instant UPI transfer to the farmer's number, or choose Cash on Delivery.
                </p>
              </div>
            </div>

            {/* Farmer card */}
            {farmerId ? (
              <div className="op-farmer-card">
                <div className="op-farmer-header">
                  <div className="op-farmer-avatar">
                    {farmerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="op-farmer-name">{farmerName}</p>
                    <p className="op-farmer-badge">👨‍🌾 Verified Farmer</p>
                  </div>
                </div>
                <div className="op-farmer-details">
                  {farmerId.location && (
                    <div className="op-farmer-row">
                      <span>📍</span>
                      <span>{farmerId.location}</span>
                    </div>
                  )}
                  {farmerPhone && (
                    <>
                      <div className="op-farmer-row">
                        <span>📱</span>
                        <span>UPI: <strong>{farmerPhone}@gpay</strong></span>
                      </div>
                      <a href={`tel:${farmerPhone}`} className="op-call-btn">
                        📞 Call {farmerPhone}
                      </a>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="op-farmer-na">👤 Farmer info not available</div>
            )}

          </div>

          {/* ══ RIGHT — Order form ══ */}
          <div className="op-right">
            <div className="op-form-card">

              <div className="op-form-header">
                <h2>Order Details</h2>
                <p>Fill in your delivery information</p>
              </div>

              {/* Alerts */}
              {success && (
                <div className="op-alert op-alert--success">
                  ✅ Order placed successfully! Redirecting to your orders…
                </div>
              )}
              {error && (
                <div className="op-alert op-alert--error">❌ {error}</div>
              )}

              <form onSubmit={handleSubmit} className="op-form">

                {/* Quantity */}
                <div className="op-field">
                  <label className="op-label"><span>📦</span> Quantity</label>
                  <input
                    type="number"
                    className="op-input"
                    min="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={e => {
                      setFormData({ ...formData, quantity: e.target.value });
                      setGpayDone(false); // amount changed → must re-pay
                    }}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="op-field">
                  <label className="op-label"><span>📞</span> Phone Number</label>
                  <input
                    type="text"
                    className="op-input"
                    placeholder="+91 00000 00000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {/* Address */}
                <div className="op-field">
                  <label className="op-label"><span>📍</span> Delivery Address</label>
                  <textarea
                    className="op-input op-textarea"
                    placeholder="Enter your full delivery address…"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                {/* ── Order Summary ── */}
                <div className="op-summary">
                  <div className="op-summary-row">
                    <span>Unit Price</span>
                    <span>₹{product.price}</span>
                  </div>
                  <div className="op-summary-row">
                    <span>Quantity</span>
                    <span>× {formData.quantity}</span>
                  </div>
                  <div className="op-summary-divider" />
                  <div className="op-summary-row op-summary-total">
                    <span>Total</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* ══ Payment Method ══ */}
                <div className="op-field">
                  <label className="op-label"><span>💳</span> Payment Method</label>

                  <div className="op-pay-options">

                    {/* GPay option */}
                    <div
                      className={`op-pay-option ${payment === PAYMENT_METHODS.GPAY ? 'op-pay-option--active' : ''}`}
                      onClick={() => { setPayment(PAYMENT_METHODS.GPAY); setGpayDone(false); }}
                    >
                      <div className="op-pay-radio">
                        <div className="op-pay-radio-dot" />
                      </div>
                      <div className="op-pay-icon op-pay-icon--gpay">💸</div>
                      <div className="op-pay-text">
                        <span className="op-pay-title">Google Pay (UPI)</span>
                        <span className="op-pay-sub">Instant transfer to farmer</span>
                      </div>
                      <span className="op-pay-badge op-pay-badge--gpay">Instant</span>
                    </div>

                    {/* COD option */}
                    <div
                      className={`op-pay-option ${payment === PAYMENT_METHODS.COD ? 'op-pay-option--active' : ''}`}
                      onClick={() => setPayment(PAYMENT_METHODS.COD)}
                    >
                      <div className="op-pay-radio">
                        <div className="op-pay-radio-dot" />
                      </div>
                      <div className="op-pay-icon op-pay-icon--cod">💵</div>
                      <div className="op-pay-text">
                        <span className="op-pay-title">Cash on Delivery</span>
                        <span className="op-pay-sub">Pay when you receive</span>
                      </div>
                      <span className="op-pay-badge op-pay-badge--cod">COD</span>
                    </div>

                  </div>

                  {/* ── GPay action block ── */}
                  {payment === PAYMENT_METHODS.GPAY && (
                    <div className={`op-gpay-block ${gpayDone ? 'op-gpay-block--done' : ''}`}>
                      {farmerPhone ? (
                        <>
                          <div className="op-gpay-upi-row">
                            <span className="op-gpay-upi-label">Farmer UPI</span>
                            <span className="op-gpay-upi-id">{farmerPhone}@gpay</span>
                          </div>

                          {gpayDone ? (
                            <div className="op-gpay-confirmed">
                              ✅ Payment initiated — click &ldquo;Place Order&rdquo; to confirm
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="op-gpay-btn"
                              onClick={handleOpenGpay}
                            >
                              <span className="op-gpay-logo">G</span>
                              Open Google Pay &mdash; ₹{totalAmount.toFixed(2)}
                            </button>
                          )}

                          {!gpayDone && (
                            <>
                              <p className="op-gpay-note">
                                Opens the GPay app · Complete payment · Return here to confirm your order
                              </p>
                              <button
                                type="button"
                                className="op-gpay-manual-btn"
                                onClick={() => setGpayDone(true)}
                              >
                                I've already paid via GPay
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <p className="op-gpay-no-phone">
                          ⚠️ Farmer's phone number is not available. Please choose Cash on Delivery or contact the farmer directly.
                        </p>
                      )}
                    </div>
                  )}

                  {/* COD info */}
                  {payment === PAYMENT_METHODS.COD && (
                    <div className="op-cod-info">
                      💵 You will pay <strong>₹{totalAmount.toFixed(2)}</strong> in cash when your order is delivered.
                    </div>
                  )}
                </div>

                {/* ── Submit ── */}
                <button
                  type="submit"
                  className={`op-submit-btn ${submitting ? 'op-submit-btn--loading' : ''}`}
                  disabled={submitting || success}
                >
                  {submitting ? (
                    <><span className="op-spinner-sm" /> Placing Order…</>
                  ) : success ? (
                    '✅ Order Placed!'
                  ) : (
                    '🛒 Place Order'
                  )}
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
