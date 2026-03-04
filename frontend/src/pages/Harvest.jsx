// src/pages/Harvest.jsx — connected to real backend
import { useState, useEffect } from 'react'
import { Clock, ShoppingCart, Search } from 'lucide-react'
import { cropsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

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
  const [added, setAdded]     = useState({})
  const { addToCart, cart }   = useAuth()

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

  const categories = ['all', ...new Set(crops.map(c => c.category).filter(Boolean))]

  const filtered = crops.filter(p => {
    const matchCat    = cat === 'all' || p.category === cat
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
                        p.farmers?.name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleAdd = (crop) => {
    // Map backend crop fields to cart format
    addToCart({
      id:       crop.id,
      name:     crop.name,
      emoji:    crop.emoji || '🌿',
      price:    crop.dynamic_price || crop.price_per_kg,
      unit:     'kg',
      batchId:  crop.batch_id,
    })
    setAdded(a => ({ ...a, [crop.id]: true }))
    setTimeout(() => setAdded(a => ({ ...a, [crop.id]: false })), 1500)
    cropsAPI.incrementView(crop.id).catch(() => {})
  }

  return (
    <div className="page-enter" style={{ paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green) 0%, #1B5E20 100%)', padding: '48px 0 40px', color: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ width: 10, height: 10, background: '#A5D6A7', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                  Live Today – {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 700, marginBottom: 8 }}>Today's Harvest</h1>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>All harvested this morning. Orders close at 2:00 PM.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 16, padding: '16px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 4 }}>Orders close in</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{time}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container section">
        {/* Search & Filter */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="form-input" placeholder="Search crops, farms…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 500,
                background: cat === c ? 'var(--green)' : 'white',
                color: cat === c ? 'white' : 'var(--text-muted)',
                border: cat === c ? 'none' : '1.5px solid var(--border)',
                cursor: 'pointer', transition: 'all .2s', textTransform: 'capitalize'
              }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌾</div>
            <p>Loading today's harvest…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: 20, borderRadius: 12, textAlign: 'center', marginBottom: 24 }}>
            ⚠️ {error} — Make sure your backend is running at port 4000.
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {filtered.map(p => (
              <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform .2s, box-shadow .2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                <div style={{ height: 6, background: 'var(--green)' }} />
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ fontSize: 48 }}>{p.emoji || '🌿'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                      {p.freshness_score && (
                        <span className="badge badge-green" style={{ fontSize: 11 }}>
                          <Clock size={10} /> {Math.round(p.freshness_score)}% fresh
                        </span>
                      )}
                      {p.stock_left_kg < 25 && (
                        <span className="badge badge-orange" style={{ fontSize: 11 }}>Only {p.stock_left_kg}kg left</span>
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{p.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                    {p.farmers?.name} · {p.farmers?.village}
                  </p>
                  {p.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{p.description}</p>
                  )}

                  {/* Batch ID */}
                  <Link to={`/batch/${p.batch_id}`} style={{ display: 'block', marginBottom: 14 }}>
                    <div style={{ background: 'var(--cream)', borderRadius: 8, padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Batch ID</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', fontFamily: 'monospace' }}>{p.batch_id}</span>
                    </div>
                  </Link>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
                    {p.is_organic && <span className="badge badge-green" style={{ fontSize: 10 }}>Organic</span>}
                    {p.waste_risk === 'low' && <span className="badge badge-green" style={{ fontSize: 10 }}>Fresh Stock</span>}
                  </div>

                  {/* Price & Cart */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>
                      ₹{p.dynamic_price || p.price_per_kg}
                      <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/kg</span>
                    </span>
                    <button onClick={() => handleAdd(p)} className="btn btn-primary btn-sm"
                      style={{ background: added[p.id] ? '#388E3C' : 'var(--green)' }}>
                      {added[p.id] ? '✓ Added' : <><ShoppingCart size={14} /> Add</>}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p>No crops match your search.</p>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  )
}
