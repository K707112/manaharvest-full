// src/pages/Harvest.jsx — Blinkit/Zepto style
import { useState, useEffect, useRef } from 'react'
import { ShoppingCart, Search, Plus, Minus, Clock } from 'lucide-react'
import { cropsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Link, useSearchParams } from 'react-router-dom'

const PLAN_INFO = {
  small:  { name: 'Small Family',  price: 399,  maxKg: 5,  vegetables: 7,  color: '#1565C0', bg: '#E3F2FD' },
  medium: { name: 'Medium Family', price: 699,  maxKg: 9,  vegetables: 9,  color: '#2E7D32', bg: '#E8F5E9' },
  large:  { name: 'Large Family',  price: 999,  maxKg: 15, vegetables: 10, color: '#6A1B9A', bg: '#F3E5F5' },
}

const CAT_ICONS = {
  all: '🛒', vegetables: '🥬', fruits: '🍎', leafy: '🌿', roots: '🥕',
  gourds: '🥒', beans: '🫛', herbs: '🌿', default: '🌾'
}

function Countdown() {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setHours(14, 0, 0, 0)
  const diff = Math.max(0, cutoff - now)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `${h}h ${m}m`
}

export default function Harvest() {
  const [crops, setCrops]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('all')
  const [time, setTime]       = useState(Countdown())
  const [qtys, setQtys]       = useState({})       // cropId → qty (number)
  const [planCart, setPlanCart] = useState([])
  const { addToCart }         = useAuth()
  const [searchParams]        = useSearchParams()
  const planId                = searchParams.get('plan')
  const plan                  = planId ? PLAN_INFO[planId] : null
  const sidebarRef            = useRef(null)

  useEffect(() => {
    cropsAPI.getAll({ limit: 50 })
      .then(res => setCrops(res.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(Countdown()), 60000)
    return () => clearInterval(t)
  }, [])

  // Read search from URL param
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(q)
  }, [searchParams])

  const categories = ['all', ...new Set(crops.map(c => c.category).filter(Boolean))]

  const filtered = crops.filter(p => {
    const matchCat    = cat === 'all' || p.category === cat
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                        p.farmers?.name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const totalKg = planCart.reduce((s, i) => s + i.qty, 0)

  const getQty = (id) => qtys[id] || 0

  const increment = (crop) => {
    const newQty = getQty(crop.id) + 1
    if (plan && totalKg >= plan.maxKg) return
    setQtys(q => ({ ...q, [crop.id]: newQty }))
    addToCart({
      id: crop.id, name: crop.name, emoji: crop.emoji || '🌿',
      image: crop.image_url || null,
      price: crop.dynamic_price || crop.price_per_kg,
      unit: 'kg', qty: 1, batchId: crop.batch_id, planId: planId || null,
    })
    if (plan) {
      setPlanCart(prev => {
        const exists = prev.find(i => i.id === crop.id)
        if (exists) return prev.map(i => i.id === crop.id ? { ...i, qty: i.qty + 1 } : i)
        return [...prev, { id: crop.id, name: crop.name, qty: 1 }]
      })
    }
    cropsAPI.incrementView(crop.id).catch(() => {})
  }

  const decrement = (crop) => {
    const cur = getQty(crop.id)
    if (cur <= 0) return
    const newQty = cur - 1
    setQtys(q => ({ ...q, [crop.id]: newQty }))
    if (plan) {
      setPlanCart(prev => {
        const updated = prev.map(i => i.id === crop.id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0)
        return updated
      })
    }
  }

  const scrollCat = (c) => {
    setCat(c)
    setSearch('')
  }

  return (
    <div style={{ paddingTop: 60, background: '#f5f6f7', minHeight: '100vh' }}>

      {/* ── Plan Banner ── */}
      {plan && (
        <div style={{ background: plan.bg, borderBottom: `3px solid ${plan.color}`, padding: '10px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ background: plan.color, color: 'white', padding: '4px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
              {plan.name} — ₹{plan.price}/week
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 100, height: 6, background: '#ddd', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 99, background: plan.color, width: `${Math.min(100, (totalKg / plan.maxKg) * 100)}%`, transition: 'width .3s' }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: plan.color }}>{totalKg.toFixed(1)}/{plan.maxKg}kg</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Top Header ── */}
      <div style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', padding: '20px 16px 16px', color: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, background: '#A5D6A7', borderRadius: '50%', display: 'inline-block' }} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                  Live Today — {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, margin: 0 }}>Today's Harvest</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '4px 0 0' }}>
                All harvested this morning. Orders close at 2:00 PM.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 14px', textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 2 }}>Orders close in</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{time}</div>
            </div>
          </div>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search crops, farms…"
              style={{
                width: '100%', height: 42, paddingLeft: 42, paddingRight: 16,
                borderRadius: 10, border: 'none', fontSize: 14,
                background: 'white', boxSizing: 'border-box',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Body: Sidebar + Grid ── */}
      <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', minHeight: 'calc(100vh - 200px)' }}>

        {/* ── Left Sidebar ── */}
        <div ref={sidebarRef} style={{
          width: 80, flexShrink: 0,
          background: 'white',
          borderRight: '1px solid #eee',
          position: 'sticky', top: 60,
          height: 'calc(100vh - 60px)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column',
          scrollbarWidth: 'none',
        }}>
          {categories.map(c => {
            const icon = CAT_ICONS[c.toLowerCase()] || CAT_ICONS.default
            const active = cat === c
            return (
              <button key={c} onClick={() => scrollCat(c)} style={{
                width: '100%', padding: '14px 4px', border: 'none', cursor: 'pointer',
                background: active ? '#E8F5E9' : 'transparent',
                borderLeft: active ? '3px solid #2E7D32' : '3px solid transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                transition: 'all .15s',
              }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: active ? '#2E7D32' : '#888', textTransform: 'capitalize', lineHeight: 1.2, textAlign: 'center' }}>
                  {c === 'all' ? 'All' : c}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Right Products Grid ── */}
        <div style={{ flex: 1, padding: '12px 12px 100px' }}>

          {/* Section title */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: '#222', margin: 0, textTransform: 'capitalize' }}>
              {cat === 'all' ? 'All Crops' : cat} <span style={{ color: '#aaa', fontWeight: 400, fontSize: 13 }}>({filtered.length})</span>
            </h2>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: 48, color: '#aaa', fontSize: 32 }}>🌾</div>
          )}

          {error && (
            <div style={{ background: '#FFEBEE', color: '#C62828', padding: 16, borderRadius: 10, fontSize: 13, textAlign: 'center' }}>⚠️ {error}</div>
          )}

          {!loading && !error && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filtered.map(crop => {
                const qty = getQty(crop.id)
                const inPlan = planCart.find(i => i.id === crop.id)
                return (
                  <div key={crop.id} style={{
                    background: 'white', borderRadius: 12, overflow: 'hidden',
                    border: inPlan ? '1.5px solid #2E7D32' : '1px solid #eee',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    display: 'flex', flexDirection: 'column',
                    position: 'relative',
                  }}>
                    {/* Image */}
                    <div style={{ position: 'relative' }}>
                      {crop.image_url
                        ? <img src={crop.image_url} alt={crop.name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                        : <div style={{ height: 100, background: '#f1f8e9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>{crop.emoji || '🌿'}</div>
                      }
                      {/* Badges */}
                      <div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {crop.is_organic && (
                          <span style={{ background: '#2E7D32', color: 'white', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>Organic</span>
                        )}
                        {crop.stock_left_kg < 25 && (
                          <span style={{ background: '#FF6F00', color: 'white', fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>Only {crop.stock_left_kg}kg left</span>
                        )}
                      </div>
                      {/* Freshness */}
                      {crop.freshness_score && (
                        <div style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={9} /> {Math.round(crop.freshness_score)}%
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ padding: '10px 10px 8px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Quantity shown for plan */}
                      {inPlan && (
                        <div style={{ fontSize: 9, color: '#2E7D32', fontWeight: 700, marginBottom: 3 }}>✓ {inPlan.qty}kg in box</div>
                      )}

                      <div style={{ fontWeight: 700, fontSize: 13, color: '#222', marginBottom: 1, lineHeight: 1.2 }}>{crop.name}</div>
                      <div style={{ fontSize: 10, color: '#aaa', marginBottom: 6 }}>{crop.farmers?.name} · {crop.farmers?.village}</div>

                      {/* Batch */}
                      <Link to={`/batch/${crop.batch_id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ background: '#f5f5f5', borderRadius: 6, padding: '4px 6px', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 9, color: '#aaa' }}>Batch</span>
                          <span style={{ fontSize: 9, color: '#2E7D32', fontWeight: 600, fontFamily: 'monospace' }}>{crop.batch_id}</span>
                        </div>
                      </Link>

                      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: 15, color: '#222' }}>₹{crop.dynamic_price || crop.price_per_kg}</span>
                          <span style={{ fontSize: 10, color: '#aaa' }}>/kg</span>
                        </div>

                        {/* Add / Qty control */}
                        {qty === 0 ? (
                          <button onClick={() => increment(crop)}
                            disabled={plan && totalKg >= plan.maxKg}
                            style={{
                              height: 32, padding: '0 14px', borderRadius: 8, border: '1.5px solid #2E7D32',
                              background: 'white', color: '#2E7D32',
                              fontWeight: 700, fontSize: 13, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 4,
                              opacity: plan && totalKg >= plan.maxKg ? 0.4 : 1,
                            }}>
                            <Plus size={14} /> ADD
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#2E7D32', borderRadius: 8, padding: '4px 8px' }}>
                            <button onClick={() => decrement(crop)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}>
                              <Minus size={14} />
                            </button>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: 13, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                            <button onClick={() => increment(crop)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', padding: 0 }}>
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <p style={{ fontSize: 14 }}>No crops found</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Plan sticky bottom bar ── */}
      {plan && planCart.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 68, left: 0, right: 0, zIndex: 300,
          background: '#2E7D32', padding: '12px 20px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)'
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>
                {planCart.length} items · {totalKg.toFixed(1)}kg selected
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                {planCart.slice(0, 3).map(i => i.name).join(', ')}{planCart.length > 3 ? ` +${planCart.length - 3} more` : ''}
              </div>
            </div>
            <Link to="/cart" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'white', color: '#2E7D32', padding: '8px 20px', borderRadius: 99, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingCart size={14} /> View Cart →
              </button>
            </Link>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        ::-webkit-scrollbar { width: 0; }
        @media (min-width: 768px) {
          .harvest-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}