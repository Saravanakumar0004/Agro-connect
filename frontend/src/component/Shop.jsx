import React from 'react';
import Navbar from './Navbar';
import ProductList from './ProductList';
import Footer from './Footer';

function Shop() {
  return (
    <>
      <Navbar />

      <div style={{
        maxWidth: '1260px',
        margin: '0 auto',
        padding: '32px 28px 88px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif"
      }}>

        {/* ── Hero Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2d14 0%, #1a4a22 25%, #2d7a35 60%, #1e5225 100%)',
          borderRadius: '28px',
          padding: '56px 48px',
          marginBottom: '40px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(15,45,20,0.38), 0 6px 20px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)'
        }}>

          {/* Orb decoration */}
          <div style={{
            position: 'absolute',
            width: '420px',
            height: '420px',
            background: 'radial-gradient(circle, rgba(255,235,59,0.11) 0%, rgba(76,175,80,0.07) 45%, transparent 70%)',
            top: '-140px',
            right: '-80px',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>

          {/* Bottom-left orb */}
          <div style={{
            position: 'absolute',
            width: '280px',
            height: '280px',
            background: 'radial-gradient(circle, rgba(76,175,80,0.1) 0%, transparent 70%)',
            bottom: '-100px',
            left: '-60px',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}></div>

          {/* Hero content */}
          <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.6px',
              padding: '6px 16px',
              borderRadius: '50px',
              marginBottom: '20px',
              backdropFilter: 'blur(8px)'
            }}>
              🌿 Fresh From The Farm
            </div>

            {/* Heading */}
            <h1 style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#fff',
              letterSpacing: '-1px',
              lineHeight: 1.15,
              margin: '0 0 14px',
              textShadow: '0 4px 20px rgba(0,0,0,0.4)'
            }}>
              Farm Fresh{' '}
              <span style={{
                background: 'linear-gradient(90deg, #a5d6a7, #ffe033)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Marketplace
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.65,
              maxWidth: '520px',
              margin: '0 0 32px',
              fontWeight: 400
            }}>
              Browse verified farm products directly from local farmers —
              no middlemen, fair prices.
            </p>

            {/* Stats row */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0,
              background: 'rgba(255,255,255,0.09)',
              border: '1px solid rgba(255,255,255,0.16)',
              borderRadius: '16px',
              padding: '14px 28px',
              backdropFilter: 'blur(10px)'
            }}>
              {/* Stat 1 */}
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#ffe033',
                  lineHeight: 1,
                  letterSpacing: '-0.5px'
                }}>500+</div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '4px'
                }}>Farmers</div>
              </div>

              {/* Divider */}
              <div style={{
                width: '1px',
                height: '32px',
                background: 'rgba(255,255,255,0.18)'
              }}></div>

              {/* Stat 2 */}
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#ffe033',
                  lineHeight: 1,
                  letterSpacing: '-0.5px'
                }}>Fresh</div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '4px'
                }}>Daily Picks</div>
              </div>

              {/* Divider */}
              <div style={{
                width: '1px',
                height: '32px',
                background: 'rgba(255,255,255,0.18)'
              }}></div>

              {/* Stat 3 */}
              <div style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#ffe033',
                  lineHeight: 1,
                  letterSpacing: '-0.5px'
                }}>0%</div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.55)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '4px'
                }}>Commission</div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Products ── */}
        <div>
          <ProductList />
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Shop;
