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
   The key trick: we fire the upi:// scheme via a
   hidden <a> tag with target="_blank" so the OS
   intercepts it and launches GPay WITHOUT navigating
   away from the current page.
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

function buildGpayWebLink(params) {
  const p = buildUpiParams(params);
  return `https://pay.google.com/gp/v/send/${p.pa}?amount=${p.am}&currencyCode=${p.cu}`;
}

/* Detect mobile */
function isMobile() {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * launchUpi — opens GPay/any UPI app WITHOUT leaving the page.
 *
 * Problems with naive window.location.href = "upi://...":
 *   1. Chrome on Android navigates the tab → flash + snap-back
 *   2. Some browsers block programmatic clicks on hidden anchors
 *   3. Samsung Internet needs a slight delay before the scheme fires
 *
 * Solution:
 *   - Use a visible, in-flow anchor (opacity:0, pointer-events:none)
 *     so the browser doesn't treat it as a popup and block it
 *   - Dispatch a real MouseEvent (not just .click()) for max compat
 *   - target="_blank" so the OS intercepts the scheme in a new
 *     context; the current tab never navigates
 */
function launchUpi(upiUrl) {
  const a = document.createElement('a');
  a.href             = upiUrl;
  a.target           = '_blank';
  a.rel              = 'noopener noreferrer';
  // Must be in-flow (not display:none) or some browsers block it
  a.style.cssText    = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;z-index:-1;';
  document.body.appendChild(a);

  // Dispatch a real trusted-like MouseEvent for Samsung Internet / Firefox
  try {
    a.dispatchEvent(new MouseEvent('click', {
      bubbles: true, cancelable: true, view: window,
    }));
  } catch {
    a.click();
  }

  setTimeout(() => {
    if (document.body.contains(a)) document.body.removeChild(a);
  }, 1000);
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
  const [gpayDone,    setGpayDone]    = useState(false);
  const [gpayPending, setGpayPending] = useState(false); // waiting for user to return from GPay

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

    if (isMobile()) {
      // Fire upi:// via in-flow <a target="_blank"> so the OS launches GPay
      // while this tab stays exactly where it is — no flash, no snap-back.
      setGpayPending(true);
      launchUpi(buildUpiLink(upiParams));

      // When the user returns from GPay the page becomes visible again.
      // Use that signal to unlock the "Place Order" button.
      const onReturn = () => {
        if (document.visibilityState === 'visible') {
          setGpayDone(true);
          setGpayPending(false);
          document.removeEventListener('visibilitychange', onReturn);
        }
      };
      document.addEventListener('visibilitychange', onReturn);

      // Safety fallback: unlock after 8 s even if visibilitychange never fires
      setTimeout(() => {
        setGpayDone(true);
        setGpayPending(false);
        document.removeEventListener('visibilitychange', onReturn);
      }, 8000);

    } else {
      // Desktop: open GPay web in a new tab (shows QR to scan).
      window.open(buildGpayWebLink(upiParams), '_blank', 'noopener,noreferrer');
      // On desktop the user stays on this tab, unlock after 3 s
      setTimeout(() => setGpayDone(true), 3000);
    }
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
                      setGpayDone(false); setGpayPending(false); // amount changed → must re-pay
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
                      onClick={() => { setPayment(PAYMENT_METHODS.GPAY); setGpayDone(false); setGpayPending(false); }}
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
                              ✅ Payment done — now click &ldquo;Place Order&rdquo; below
                            </div>
                          ) : gpayPending ? (
                            <>
                              <div className="op-gpay-waiting">
                                <span className="op-spinner-sm op-spinner-blue" />
                                Waiting for you to complete payment in GPay…
                              </div>
                              <p className="op-gpay-note">
                                Complete the payment in GPay, then return to this page
                              </p>
                              <button
                                type="button"
                                className="op-gpay-manual-btn"
                                onClick={() => { setGpayDone(true); setGpayPending(false); }}
                              >
                                ✓ I've completed the payment
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="op-gpay-btn"
                              onClick={handleOpenGpay}
                            >
                              <span className="op-gpay-logo">G</span>
                              Pay ₹{totalAmount.toFixed(2)} via Google Pay
                            </button>
                          )}

                          {!gpayDone && !gpayPending && (
                            <>
                              <p className="op-gpay-note">
                                Tapping above opens GPay · Pay the farmer · Return here to confirm
                              </p>
                              <button
                                type="button"
                                className="op-gpay-manual-btn"
                                onClick={() => { setGpayDone(true); setGpayPending(false); }}
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
