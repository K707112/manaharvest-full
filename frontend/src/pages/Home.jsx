// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Star, Clock, Truck } from 'lucide-react'
import { cropsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { emoji: '🍅', label: 'Tomatoes',  q: 'tomato' },
  { emoji: '🥬', label: 'Leafy',     q: 'spinach' },
  { emoji: '🥕', label: 'Roots',     q: 'carrot' },
  { emoji: '🌽', label: 'Grains',    q: 'corn' },
  { emoji: '🥦', label: 'Gourds',    q: 'gourd' },
  { emoji: '🧅', label: 'Onion',     q: 'onion' },
  { emoji: '🌶️', label: 'Chillies', q: 'chilli' },
  { emoji: '🫛', label: 'Beans',     q: 'beans' },
]

const PLANS = [
  { id: 'small',  price: 399, label: 'Small Box',  kg: '5kg',  color: '#1565C0', bg: '#E3F2FD', icon: '🥬', tag: 'Starter' },
  { id: 'medium', price: 699, label: 'Family Box', kg: '9kg',  color: '#2E7D32', bg: '#E8F5E9', icon: '🧺', tag: 'Popular' },
  { id: 'large',  price: 999, label: 'Big Box',    kg: '15kg', color: '#6A1B9A', bg: '#F3E5F5', icon: '🏡', tag: 'Best Value' },
]

export default function Home() {
  const [query, setQuery]     = useState('')
  const [crops, setCrops]     = useState([])
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()
  const { user }              = useAuth()

  useEffect(() => {
    cropsAPI.getAll({ limit: 8 })
      .then(r => setCrops(r.data || []))
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) navigate(`/harvest?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div style={{ background: '#fafafa', paddingTop: 60, paddingBottom: 0 }}>

      {/* ── Hero ── */}
      <div style={{
        background: 'linear-gradient(160deg, #1B5E20 0%, #2E7D32 60%, #388E3C 100%)',
        padding: '32px 16px 28px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
          {/* Greeting */}
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginBottom: 4 }}>
            {user ? `Hello, ${user.name.split(' ')[0]} 👋` : '🌿 Farm to your doorstep'}
          </div>
          <h1 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)', fontWeight: 700, margin: '0 0 20px', lineHeight: 1.2 }}>
            Fresh from <span style={{ color: '#A5D6A7' }}>village fields</span><br />to your home 🥬
          </h1>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 500 }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for tomatoes, spinach, carrots…"
              style={{
                width: '100%', height: 48, paddingLeft: 46, paddingRight: 110,
                borderRadius: 12, border: 'none', fontSize: 14,
                background: 'white', boxSizing: 'border-box',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button type="submit" style={{
              position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)',
              height: 36, padding: '0 18px', borderRadius: 8, border: 'none',
              background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
            }}>Search</button>
          </form>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, marginTop: 20, flexWrap: 'wrap' }}>
            {[
              { icon: <Truck size={13} />, text: 'Free delivery' },
              { icon: <Clock size={13} />, text: 'Harvested today' },
              { icon: <Star size={13} />, text: '4.9 rating' },
            ].map(s => (
              <div key={s.text} style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                {s.icon} {s.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories ── */}
      <div style={{ background: 'white', padding: '20px 16px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, margin: 0, color: '#222' }}>What are you looking for?</h2>
            <button onClick={() => navigate('/harvest')} style={{ background: 'none', border: 'none', color: '#2E7D32', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }} className="cat-grid">
            {CATEGORIES.map(c => (
              <button key={c.label} onClick={() => navigate(`/harvest?q=${c.q}`)}
                style={{
                  background: '#f9fafb', border: '1.5px solid #f0f0f0', borderRadius: 12,
                  padding: '14px 8px', cursor: 'pointer', textAlign: 'center',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2E7D32'; e.currentTarget.style.background = '#F1F8E9' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.background = '#f9fafb' }}
              >
                <div style={{ fontSize: 26, marginBottom: 4 }}>{c.emoji}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#444' }}>{c.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Weekly Box Plans ── */}
      <div style={{ padding: '24px 16px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 2px', color: '#222' }}>Weekly Veggie Boxes</h2>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Delivered every Monday</p>
            </div>
            <button onClick={() => navigate('/subscribe')} style={{ background: 'none', border: 'none', color: '#2E7D32', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              All plans <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }} className="plans-row">
            {PLANS.map(p => (
              <div key={p.id} onClick={() => navigate(`/plan-harvest?plan=${p.id}`)}
                style={{
                  background: 'white', borderRadius: 14, overflow: 'hidden',
                  border: '1.5px solid #eee', cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div style={{ background: p.bg, padding: '16px 16px 12px', textAlign: 'center' }}>
                  <div style={{ background: p.color, color: 'white', fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 99, display: 'inline-block', marginBottom: 8, letterSpacing: 0.5 }}>{p.tag}</div>
                  <div style={{ fontSize: 32, marginBottom: 4 }}>{p.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: p.color }}>{p.label}</div>
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontWeight: 800, fontSize: 20, color: '#222' }}>₹{p.price}</span>
                    <span style={{ fontSize: 11, color: '#888' }}>/week</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>Up to {p.kg}</div>
                  <button style={{
                    width: '100%', padding: '8px', borderRadius: 8, border: 'none',
                    background: p.color, color: 'white', fontWeight: 700, fontSize: 12,
                    cursor: 'pointer',
                  }}>Select →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Today's Harvest ── */}
      <div style={{ padding: '4px 16px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontWeight: 700, fontSize: 16, margin: '0 0 2px', color: '#222' }}>Today's Harvest 🌾</h2>
              <p style={{ fontSize: 12, color: '#888', margin: 0 }}>Picked this morning</p>
            </div>
            <button onClick={() => navigate('/harvest')} style={{ background: 'none', border: 'none', color: '#2E7D32', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              See all <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#ccc', fontSize: 32 }}>🌿</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {crops.map(crop => (
                <div key={crop.id} onClick={() => navigate('/harvest')}
                  style={{
                    background: 'white', borderRadius: 14, overflow: 'hidden',
                    border: '1px solid #eee', cursor: 'pointer',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)', transition: 'all .2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {crop.image_url
                    ? <img src={crop.image_url} alt={crop.name} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
                    : <div style={{ height: 80, background: '#f1f8e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>{crop.emoji || '🌿'}</div>
                  }
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#222', marginBottom: 2 }}>{crop.name}</div>
                    <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>{crop.farmers?.name || 'Local Farm'}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#2E7D32' }}>₹{crop.dynamic_price || crop.price_per_kg}<span style={{ fontWeight: 400, fontSize: 10, color: '#aaa' }}>/kg</span></span>
                      {crop.is_organic && <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>Organic</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Banner ── */}
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div onClick={() => navigate('/farmers')} style={{
            background: 'linear-gradient(135deg, #795548 0%, #5D4037 100%)',
            borderRadius: 16, padding: '24px 24px', cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            overflow: 'hidden', position: 'relative',
          }}>
            <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 80, opacity: 0.15 }}>👨‍🌾</div>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 4 }}>Meet the people behind your food</div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: 18, fontFamily: 'Georgia, serif' }}>Our Village Farmers 👨‍🌾</div>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>12+ farmers from Telangana & AP</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 99, color: 'white', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              Meet them →
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) {
          .cat-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .plans-row { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 601px) and (max-width: 900px) {
          .cat-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .plans-row { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}