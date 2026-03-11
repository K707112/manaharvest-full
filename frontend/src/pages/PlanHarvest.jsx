// src/pages/PlanHarvest.jsx
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Minus, Plus, X, ChevronRight } from 'lucide-react'
import { cropsAPI, ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PLANS = {
  small:  { name: 'Small Family',  price: 399, maxKg: 5,  color: '#1565C0', bg: '#E3F2FD', emoji: '🥬' },
  medium: { name: 'Medium Family', price: 699, maxKg: 9,  color: '#2E7D32', bg: '#E8F5E9', emoji: '🧺' },
  large:  { name: 'Large Family',  price: 999, maxKg: 15, color: '#6A1B9A', bg: '#F3E5F5', emoji: '🏡' },
}

export default function PlanHarvest() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const { user }                = useAuth()
  const planId                  = searchParams.get('plan') || 'medium'
  const plan                    = PLANS[planId] || PLANS.medium

  const [crops, setCrops]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [cat, setCat]           = useState('All')
  const [selected, setSelected] = useState({})
  const [step, setStep]         = useState('select')
  const [placing, setPlacing]   = useState(false)
  const [address, setAddress]   = useState({
    name: user?.name || '', phone: user?.phone || '', addr: '', slot: 'morning'
  })

  useEffect(() => {
    cropsAPI.getAll({ limit: 50 })
      .then(r => setCrops(r.data || []))
      .catch(() => setCrops([]))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['All', ...new Set(crops.map(c => c.category).filter(Boolean))]

  const filtered = crops.filter(p =>
    p.is_available !== false &&
    (cat === 'All' || p.category === cat)
  )

  const totalKg     = +Object.values(selected).reduce((s, q) => s + q, 0).toFixed(1)
  const kgLeft      = +(plan.maxKg - totalKg).toFixed(1)
  const selectedItems = Object.entries(selected)
    .map(([id, qty]) => { const c = crops.find(x => x.id === id); return c ? { ...c, qty } : null })
    .filter(Boolean)

  const setQty = (cropId, qty) => {
    qty = +qty.toFixed(1)
    if (qty <= 0) {
      setSelected(p => { const n = { ...p }; delete n[cropId]; return n })
    } else {
      const newTotal = +(totalKg - (selected[cropId] || 0) + qty).toFixed(1)
      if (newTotal > plan.maxKg) return
      setSelected(p => ({ ...p, [cropId]: qty }))
    }
  }

  const placeOrder = async () => {
    if (!user) { navigate('/login'); return }
    if (!address.addr.trim()) { alert('Please enter delivery address'); return }
    setPlacing(true)
    try {
      await ordersAPI.create({
        plan_id: planId, plan_price: plan.price,
        items: selectedItems.map(i => ({ crop_id: i.id, qty_kg: i.qty, price_per_kg: i.dynamic_price || i.price_per_kg })),
        delivery_address: address.addr, delivery_slot: address.slot, total: plan.price,
      })
      navigate('/dashboard?order=success')
    } catch (e) {
      alert(e.message)
    } finally {
      setPlacing(false)
    }
  }

  const catIcon = (c) => {
    if (c === 'All') return '🛒'
    if (/leaf|leafy|green/i.test(c)) return '🥬'
    if (/fruit/i.test(c)) return '🍅'
    if (/root/i.test(c)) return '🥕'
    if (/herb/i.test(c)) return '🌿'
    return '🌾'
  }

  /* ── SELECT STEP ──────────────────────────────────────────────── */
  if (step === 'select') return (
    <div style={{ paddingTop: 64, height: '100dvh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>

      {/* Plan bar */}
      <div style={{ background: plan.color, color: 'white', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
          {plan.emoji} {plan.name} · ₹{plan.price}/wk
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ flex: 1, maxWidth: 100, height: 6, background: 'rgba(255,255,255,0.3)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99, transition: 'width .3s',
              background: kgLeft <= 0 ? '#FF5252' : 'rgba(255,255,255,0.9)',
              width: `${Math.min(100, (totalKg / plan.maxKg) * 100)}%`
            }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
            {totalKg}/{plan.maxKg}kg
          </span>
        </div>
      </div>

      {/* Sidebar + Grid */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Category sidebar */}
        <div style={{ width: 76, flexShrink: 0, overflowY: 'auto', background: '#fff', borderRight: '1px solid #eee' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              width: '100%', padding: '12px 4px', border: 'none', cursor: 'pointer',
              background: cat === c ? plan.bg : 'white',
              borderLeft: `3px solid ${cat === c ? plan.color : 'transparent'}`,
              fontSize: 10, fontWeight: cat === c ? 700 : 400,
              color: cat === c ? plan.color : '#666',
              textAlign: 'center', lineHeight: 1.4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
            }}>
              <span style={{ fontSize: 22 }}>{catIcon(c)}</span>
              <span>{c}</span>
            </button>
          ))}
        </div>

        {/* Products */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px 80px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
              <div style={{ fontSize: 40 }}>🌾</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>Loading harvest…</div>
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
              <div style={{ fontSize: 36 }}>🌱</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>No items in this category</div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {filtered.map(p => {
              const qty   = selected[p.id] || 0
              const price = p.dynamic_price || p.price_per_kg || 0
              return (
                <div key={p.id} style={{
                  background: 'white', borderRadius: 12, overflow: 'hidden',
                  border: qty > 0 ? `1.5px solid ${plan.color}` : '1px solid #eee',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'border .15s'
                }}>
                  <div style={{ position: 'relative' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }} />
                      : <div style={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, background: '#fafafa' }}>{p.emoji || '🌿'}</div>
                    }
                    {p.is_organic && (
                      <span style={{ position: 'absolute', top: 5, left: 5, background: '#2E7D32', color: 'white', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>ORG</span>
                    )}
                  </div>
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1565C0', marginBottom: 2 }}>1 kg</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2, lineHeight: 1.3 }}>{p.name}</div>
                    {p.farmers?.name && <div style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>🌾 {p.farmers.name}</div>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>₹{price}</span>
                        <span style={{ fontSize: 10, color: '#888' }}>/kg</span>
                      </div>
                      {qty === 0 ? (
                        <button onClick={() => setQty(p.id, 0.5)} disabled={kgLeft <= 0}
                          style={{
                            padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700,
                            border: `1.5px solid ${kgLeft <= 0 ? '#ccc' : plan.color}`,
                            background: 'white', color: kgLeft <= 0 ? '#ccc' : plan.color,
                            cursor: kgLeft <= 0 ? 'not-allowed' : 'pointer'
                          }}>
                          {kgLeft <= 0 ? 'FULL' : 'ADD'}
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', background: plan.color, borderRadius: 7, padding: '4px 6px', gap: 4 }}>
                          <button onClick={() => setQty(p.id, qty - 0.5)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: 0, display: 'flex' }}>
                            <Minus size={13} />
                          </button>
                          <span style={{ color: 'white', fontWeight: 700, fontSize: 12, minWidth: 26, textAlign: 'center' }}>
                            {qty < 1 ? `${qty * 1000}g` : `${qty}k`}
                          </span>
                          <button onClick={() => setQty(p.id, qty + 0.5)} disabled={kgLeft <= 0} style={{ background: 'none', border: 'none', color: kgLeft <= 0 ? 'rgba(255,255,255,0.3)' : 'white', cursor: kgLeft <= 0 ? 'not-allowed' : 'pointer', padding: 0, display: 'flex' }}>
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* View Cart bar */}
      {selectedItems.length > 0 && (
        <div onClick={() => setStep('summary')} style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: plan.color, padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: 'pointer', zIndex: 99, boxShadow: '0 -2px 16px rgba(0,0,0,0.15)'
        }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 10px', color: 'white', fontWeight: 700, fontSize: 13 }}>
            {selectedItems.length} {selectedItems.length === 1 ? 'item' : 'items'}
          </div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>View cart</div>
          <div style={{ display: 'flex', alignItems: 'center', color: 'white', fontWeight: 700, fontSize: 13 }}>
            {totalKg}kg <ChevronRight size={18} />
          </div>
        </div>
      )}
    </div>
  )

  /* ── SUMMARY STEP ─────────────────────────────────────────────── */
  return (
    <div style={{ paddingTop: 64, minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: plan.color, color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setStep('select')} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          ← Back
        </button>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Order Summary</span>
      </div>

      <div style={{ padding: '14px 14px 32px', maxWidth: 560, margin: '0 auto' }}>
        {/* Items list */}
        <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', marginBottom: 12, border: '1px solid #eee' }}>
          <div style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13, borderBottom: '1px solid #f0f0f0', color: '#333' }}>
            🧺 Your Box · {selectedItems.length} items · {totalKg}kg
          </div>
          {selectedItems.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '11px 16px',
              borderBottom: i < selectedItems.length - 1 ? '1px solid #f8f8f8' : 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />
                  : <span style={{ fontSize: 28 }}>{item.emoji || '🌿'}</span>
                }
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{item.qty < 1 ? `${item.qty * 1000}g` : `${item.qty}kg`} · ₹{item.dynamic_price || item.price_per_kg}/kg</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: plan.color }}>₹{((item.dynamic_price || item.price_per_kg) * item.qty).toFixed(0)}</span>
                <button onClick={() => setQty(item.id, 0)} style={{ background: '#ffebee', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#c62828', display: 'flex' }}>
                  <X size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Plan price box */}
        <div style={{ background: plan.bg, borderRadius: 12, padding: '12px 16px', marginBottom: 12, border: `1px solid ${plan.color}33` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#666', marginBottom: 4 }}>
            <span>Estimated items value</span>
            <span>₹{selectedItems.reduce((s, i) => s + (i.dynamic_price || i.price_per_kg) * i.qty, 0).toFixed(0)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, color: plan.color }}>
            <span>You pay ({plan.name})</span>
            <span>₹{plan.price}</span>
          </div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>Fixed weekly plan price ✅</div>
        </div>

        {/* Delivery form */}
        <div style={{ background: 'white', borderRadius: 14, padding: 16, marginBottom: 14, border: '1px solid #eee' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📦 Delivery Details</div>
          {[
            { label: 'FULL NAME', key: 'name', placeholder: 'Your name' },
            { label: 'PHONE', key: 'phone', placeholder: '+91 98765 43210' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#666', display: 'block', marginBottom: 4 }}>{f.label}</label>
              <input className="form-input" value={address[f.key]} onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))} placeholder={f.placeholder} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#666', display: 'block', marginBottom: 4 }}>DELIVERY ADDRESS</label>
            <textarea value={address.addr} onChange={e => setAddress(a => ({ ...a, addr: e.target.value }))}
              rows={3} placeholder="Flat, Building, Street, Area, City, PIN"
              style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #C8E6C9', borderRadius: 10, fontSize: 13, boxSizing: 'border-box', resize: 'none', fontFamily: 'inherit' }} />
          </div>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#666', display: 'block', marginBottom: 8 }}>DELIVERY SLOT</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { id: 'morning', emoji: '🌅', label: 'Morning', sub: '7–10 AM' },
              { id: 'noon',    emoji: '☀️', label: 'Noon',    sub: '12–3 PM' },
              { id: 'evening', emoji: '🌇', label: 'Evening', sub: '5–8 PM' },
            ].map(s => (
              <button key={s.id} onClick={() => setAddress(a => ({ ...a, slot: s.id }))}
                style={{
                  padding: '9px 4px', borderRadius: 10, fontSize: 11, cursor: 'pointer', textAlign: 'center',
                  border: address.slot === s.id ? `2px solid ${plan.color}` : '1.5px solid #ddd',
                  background: address.slot === s.id ? plan.bg : 'white',
                  color: address.slot === s.id ? plan.color : '#666',
                  fontWeight: address.slot === s.id ? 700 : 400,
                }}>
                <div style={{ fontSize: 18 }}>{s.emoji}</div>
                <div>{s.label}</div>
                <div style={{ fontSize: 9, opacity: 0.7 }}>{s.sub}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={placeOrder} disabled={placing || !address.addr.trim()}
          style={{
            width: '100%', padding: '15px', borderRadius: 12, border: 'none',
            background: !address.addr.trim() ? '#ccc' : plan.color,
            color: 'white', fontWeight: 700, fontSize: 15,
            cursor: !address.addr.trim() ? 'not-allowed' : 'pointer',
          }}>
          {placing ? '⏳ Placing Order…' : `🌿 Place Order — ₹${plan.price}`}
        </button>
      </div>
    </div>
  )
}