import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './AIQualityAdvisor.css';

export default function AIAdvisor() {
  const user    = JSON.parse(localStorage.getItem('user'));
  const token   = localStorage.getItem('token');
  const role    = user?.role || 'customer';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const AI_KEY  = import.meta.env.VITE_GEMINI_KEY;

  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [chatLoading,  setChatLoading]  = useState(false);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageResult,  setImageResult]  = useState('');
  const [analysing,    setAnalysing]    = useState(false);
  const [dragOver,     setDragOver]     = useState(false);
  const [products,     setProducts]     = useState([]);
  const [myOrders,     setMyOrders]     = useState([]);
  const [dataLoaded,   setDataLoaded]   = useState(false);

  const chatboxRef = useRef(null);
  const fileRef    = useRef(null);

  // ── Gemini API endpoint ──
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

  useEffect(() => {
    if (chatboxRef.current)
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
  }, [messages]);

  // ── Load real data from YOUR existing backend ──
  useEffect(() => {
    const load = async () => {
      try {
        const prodRes = await axios.get(`${API_URL}/products`);
        setProducts(prodRes.data || []);
        if (user?._id) {
          const ep = role === 'farmer'
            ? `${API_URL}/orders/farmer/${user._id}`
            : `${API_URL}/orders/customer/${user._id}`;
          const ordRes = await axios.get(ep);
          setMyOrders(ordRes.data.orders || []);
        }
      } catch (e) {
        console.error('Data load error:', e.message);
      } finally {
        setDataLoaded(true);
      }
    };
    load();
  }, []);

  // ── Build system prompt ──
  const buildSystem = () => {
    const mktList = products.slice(0, 20).map(p =>
      `• ${p.name}: ₹${p.price}/unit (stock: ${p.quantity || '?'}, farmer: ${p.farmerId?.name || 'N/A'})`
    ).join('\n') || 'No products available';

    if (role === 'farmer') {
      const mine = products
        .filter(p => p.farmerId?._id === user?._id || p.farmerId === user?._id)
        .map(p => `• ${p.name}: ₹${p.price}, stock: ${p.quantity}`)
        .join('\n') || 'None listed yet';

      const orders = myOrders.slice(0, 10).map(o =>
        `• ${o.productId?.name || 'product'}: qty ${o.quantity}, status: ${o.status}, buyer: ${o.customerId?.name || 'N/A'}`
      ).join('\n') || 'No orders yet';

      return `You are an expert AgroLink marketplace advisor for FARMER named "${user?.name}".

MY LISTED PRODUCTS:
${mine}

MY RECEIVED ORDERS:
${orders}

ALL MARKETPLACE PRODUCTS (for price comparison):
${mktList}

Help with: pricing strategy, product listings, order management, crop health, seasonal tips.
Always reference actual product names and prices from the data above.
Use ₹ for Indian Rupees. Be concise and practical.`;
    }

    const orders = myOrders.slice(0, 10).map(o =>
      `• ${o.productId?.name || 'product'}: qty ${o.quantity}, ₹${o.productId?.price || 0}, status: ${o.status}`
    ).join('\n') || 'No orders yet';

    return `You are an expert AgroLink shopping advisor for CUSTOMER named "${user?.name}".

PRODUCTS AVAILABLE RIGHT NOW:
${mktList}

MY ORDER HISTORY:
${orders}

Help with: product recommendations from list above, nutrition, freshness, storage, recipes, fair pricing.
Always reference real available products and actual prices. Use ₹. Be friendly.`;
  };

  // ── Build image prompt ──
  const buildImagePrompt = () => {
    const prices = products.slice(0, 12).map(p =>
      `• ${p.name}: ₹${p.price}`
    ).join('\n') || 'No marketplace data';

    if (role === 'farmer') {
      return `You are an agricultural expert. Analyse this crop/product image.

CURRENT MARKETPLACE PRICES:
${prices}

Provide:
1. **Crop Identification** — name and variety
2. **Quality Score** — rate 1-10 with reasons
3. **Suggested Price** — based on marketplace prices above (₹)
4. **Ready-to-use Listing Description** — 2-3 sentences
5. **Storage Tip** — to maintain freshness
6. **Improvement Tip** — to get better prices

Be specific for an Indian farmer selling online.`;
    }

    return `You are a product quality expert. Analyse this farm product image.

CURRENT MARKETPLACE PRICES:
${prices}

Provide:
1. **Product Identification** — what is this?
2. **Freshness & Quality** — rate 1-10
3. **Fair Price Check** — compare with marketplace prices (₹)
4. **Top 3 Nutritional Benefits**
5. **Home Storage** — how long and how
6. **Quick Indian Recipe** — one simple idea

Be friendly and helpful.`;
  };

 

// ── callGeminiChat — update headers ──
const callGeminiChat = async (conversationMessages, systemPrompt) => {
  if (!AI_KEY) throw new Error('VITE_GEMINI_KEY not set in .env');

  const contents = [];

  if (systemPrompt) {
    contents.push({
      role: 'user',
      parts: [{ text: `[SYSTEM INSTRUCTIONS]:\n${systemPrompt}` }]
    });
    contents.push({
      role: 'model',
      parts: [{ text: 'Understood. I will follow these instructions.' }]
    });
  }

  for (const msg of conversationMessages) {
    const text = typeof msg.content === 'string' ? msg.content : (msg.text || '');
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text }]
    });
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': AI_KEY          // ← key in header not URL
    },
    body: JSON.stringify({
      contents,
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini error ${res.status}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
};

// ── callGeminiImage — update headers ──
const callGeminiImage = async (base64Data, mimeType, promptText) => {
  if (!AI_KEY) throw new Error('VITE_GEMINI_KEY not set in .env');

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': AI_KEY          // ← key in header not URL
    },
    body: JSON.stringify({
      contents: [{
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          },
          { text: promptText }
        ]
      }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.7 }
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Gemini error ${res.status}`);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
};

  // ── Send chat message ──
  const sendMessage = async () => {
    const text = input.trim();
    if (!text || chatLoading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setChatLoading(true);

    try {
      const history = [
        ...messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.text
        })),
        { role: 'user', content: text }
      ];

      const reply = await callGeminiChat(history, buildSystem());
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `❌ ${e.message}`
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── Analyse image ──
  const analyseImage = async () => {
    if (!imageFile || analysing) return;
    setAnalysing(true);
    setImageResult('');

    try {
      const b64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(imageFile);
      });

      const reply = await callGeminiImage(b64, imageFile.type, buildImagePrompt());
      setImageResult(reply);
    } catch (e) {
      setImageResult(`❌ ${e.message}`);
    } finally {
      setAnalysing(false);
    }
  };

  // ── File handlers ──
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageResult('');
  };

  const resetImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageResult('');
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Format text ──
  const formatText = (text) =>
    text.split('\n').map((line, i) => {
      if (!line.trim()) return <br key={i} />;
      const html = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return (
        <p key={i}
          dangerouslySetInnerHTML={{ __html: html }}
          style={{ margin: '3px 0', lineHeight: 1.7 }}
        />
      );
    });

  const roleColor = role === 'farmer' ? '#2e7d32' : '#1565c0';
  const roleLabel = role === 'farmer' ? '👨‍🌾 Farmer' : '🛒 Customer';

  const quickPrompts = role === 'farmer' ? [
    { l: '💰 Best price?',      t: 'What price should I set for my products based on current marketplace prices?' },
    { l: '📦 Write listing',    t: 'Help me write a good product description for my farm products.' },
    { l: '📈 What sells best?', t: 'Which products are selling best on the marketplace?' },
    { l: '🌿 Yellow leaves',    t: 'My crop has yellow leaves. What is the problem and how do I fix it?' },
    { l: '📋 My orders',        t: 'How should I manage and fulfill my pending orders?' },
    { l: '🌾 Improve quality',  t: 'How can I improve my crop quality to get better prices?' },
  ] : [
    { l: '🥕 Buy today?',       t: 'What farm products should I buy today from the marketplace?' },
    { l: '💰 Fair prices?',     t: 'Are the current marketplace prices fair?' },
    { l: '🥗 Recipe ideas',     t: 'Give me easy Indian recipes using fresh marketplace vegetables.' },
    { l: '📦 Store veggies',    t: 'How do I store fresh vegetables at home to keep them fresh longer?' },
    { l: '🌟 Most nutritious?', t: 'Which available products are the most nutritious to buy?' },
    { l: '🛒 Fresh now?',       t: 'Which products on the marketplace are freshest and most in season?' },
  ];

  return (
    <>
      <Navbar />

      <div className="adv-page">

        {/* ── Header ── */}
        <div className="adv-header-wrap">
          <div className="adv-header">
            <div className="adv-header-emblem">🌾</div>
            <div className="adv-header-text">
              <h1>AgroLink <span>Intelligence</span></h1>
              <p>AI advisor personalised from your marketplace data</p>
            </div>
            <div className="adv-header-right">
              <div className="adv-live-badge">
                <span className="adv-dot"></span>
                Live AI
              </div>
              <div className="adv-role-badge"
                style={{ background: roleColor+'20', borderColor: roleColor+'55', color: roleColor }}>
                {roleLabel}
              </div>
            </div>
          </div>

          {dataLoaded ? (
            <div className="adv-data-pills-header">
              <span className="adv-data-pill-h">📦 {products.length} products loaded</span>
              <span className="adv-data-pill-h">📋 {myOrders.length} orders loaded</span>
              <span className="adv-data-pill-h">✅ Context ready</span>
            </div>
          ) : (
            <div className="adv-data-loading">
              <span className="adv-spin"></span>
              Loading your marketplace data…
            </div>
          )}
        </div>

        {/* ── Grid ── */}
        <div className="adv-grid">

          {/* ══ LEFT — Image Analyser ══ */}
          <div className="adv-card">
            <div className="adv-card-label">
              <span>📸</span>
              {role === 'farmer' ? 'Crop Visual Analysis' : 'Product Visual Analysis'}
            </div>
            <h2>{role === 'farmer' ? 'Crop Analyser' : 'Product Checker'}</h2>
            <p className="adv-card-sub">
              {role === 'farmer'
                ? 'Upload a crop photo — get quality score, marketplace price suggestion, and ready-to-use listing'
                : 'Upload a product photo — get freshness check, fair price vs marketplace, nutrition and recipe'}
            </p>

            <div
              className={`adv-upload ${dragOver ? 'adv-upload--drag' : ''} ${imagePreview ? 'adv-upload--has-img' : ''}`}
              onClick={() => !imagePreview && fileRef.current?.click()}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
            >
              {imagePreview ? (
                <div className="adv-preview-wrap">
                  <img src={imagePreview} alt="Preview" className="adv-preview-img" />
                  <div className="adv-preview-overlay">
                    <button className="adv-change-img"
                      onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
                      🔄 Change Image
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="adv-upload-icon">📸</div>
                  <p><strong>Drop your image here</strong></p>
                  <p className="adv-upload-hint">or click to select from device</p>
                  <div className="adv-format-tags">
                    {['JPG','PNG','WEBP','HEIC'].map(f =>
                      <span key={f} className="adv-format-tag">{f}</span>
                    )}
                  </div>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
            </div>

            <div className="adv-btn-group">
              <button className="adv-btn-primary"
                onClick={analyseImage}
                disabled={!imageFile || analysing}>
                {analysing
                  ? <><span className="adv-spin adv-spin--light"></span> Analysing…</>
                  : <>🔍 Analyse {role === 'farmer' ? 'Crop' : 'Product'}</>
                }
              </button>
              <button className="adv-btn-reset" onClick={resetImage}>🔄 Clear</button>
            </div>

            {imageResult && (
              <div className="adv-result">
                <div className="adv-result-header">
                  <span className="adv-result-check">✓</span>
                  <span>Analysis Results</span>
                </div>
                <div className="adv-result-body">{formatText(imageResult)}</div>
              </div>
            )}
          </div>

          {/* ══ RIGHT — Chat ══ */}
          <div className="adv-card">
            <div className="adv-card-label">
              <span>💬</span> Smart Advisor Chat
            </div>
            <h2>{role === 'farmer' ? 'Farmer Advisor' : 'Shopping Advisor'}</h2>
            <p className="adv-card-sub">
              {role === 'farmer'
                ? 'Pricing, listings, orders, crop health — using your real marketplace data'
                : 'Product picks, nutrition, recipes, freshness — from your actual marketplace'}
            </p>

            <div className="adv-quick-prompts">
              {quickPrompts.map(p => (
                <button key={p.l} className="adv-quick-btn" onClick={() => setInput(p.t)}>
                  {p.l}
                </button>
              ))}
            </div>

            <div className="adv-chatbox" ref={chatboxRef}>
              {messages.length === 0 ? (
                <div className="adv-empty-state">
                  <div className="adv-empty-icon">💭</div>
                  <p>Hi {user?.name?.split(' ')[0] || 'there'}!{' '}
                    {dataLoaded
                      ? 'Marketplace data loaded. Ask me anything!'
                      : 'Loading your data…'}
                  </p>
                  {dataLoaded && (
                    <div className="adv-data-pills">
                      <span className="adv-data-pill">📦 {products.length} products</span>
                      <span className="adv-data-pill">📋 {myOrders.length} orders</span>
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i}
                    className={`adv-msg ${msg.role === 'user' ? 'adv-msg--user' : 'adv-msg--bot'}`}>
                    {msg.role === 'assistant' && <div className="adv-bot-avatar">🤖</div>}
                    <div className="adv-msg-bubble">
                      {msg.role === 'user' ? msg.text : formatText(msg.text)}
                    </div>
                    {msg.role === 'user' && (
                      <div className="adv-user-avatar">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="adv-msg adv-msg--bot">
                  <div className="adv-bot-avatar">🤖</div>
                  <div className="adv-msg-bubble adv-typing">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
            </div>

            <div className="adv-input-row">
              <input className="adv-input" type="text"
                placeholder={role === 'farmer'
                  ? 'Ask about pricing, crops, orders…'
                  : 'Ask about products, recipes, nutrition…'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button className="adv-btn-send" onClick={sendMessage}
                disabled={chatLoading || !input.trim()}>✈</button>
              <button className="adv-btn-clear"
                onClick={() => { setMessages([]); setInput(''); }}
                title="Clear chat">🗑</button>
            </div>
          </div>

        </div>

        <div className="adv-footer">AgroLink Intelligence </div>
      </div>
    </>
  );
}