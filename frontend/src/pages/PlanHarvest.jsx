// src/pages/PlanHarvest.jsx
// Harvest selection page for subscription plans
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Search, Minus, Plus, Check } from 'lucide-react'
import { cropsAPI, ordersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PLANS = {
  small:  { name: 'Small Family',  price: 399, maxKg: 5,  color: '#1565C0', bg: '#E3F2FD' },
  medium: { name: 'Medium Family', price: 699, maxKg: 9,  color: '#2E7D32', bg: '#E8F5E9' },
  large:  { name: 'Large Family',  price: 999, maxKg: 15, color: '#6A1B9A', bg: '#F3E5F5' },
}

export default function PlanHarvest() {
  const [searchParams]        = useSearchParams()
  const navigate              = useNavigate()
  const { user }              = useAuth()
  const planId                = searchParams.get('plan') || 'medium'
  const plan                  = PLANS[planId]

  const [crops, setCrops]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [cat, setCat]         = useState('all')
  const [selected, setSelected] = useState({}) // cropId → qty (kg)
  const [step, setStep]       = useState('select') // 'select' | 'summary'
  const [placing, setPlacing] = useState(false)
  const [address, setAddress] = useState({ name: user?.name || '', phone: user?.phone || '', addr: '', slot: 'morning' })

  useEffect(() => {
    cropsAPI.getAll({ limit: 50 })
      .then(r => setCrops(r.data || []))
      .finally(() => setLoading(false))
  }, [])

  const categories = ['all', ...new Set(crops.map(c => c.category).filter(Boolean))]
  const filtered = crops.filter(p => {
    const matchCat = cat === 'all' || p.category === cat
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch && p.is_available
  })

  const totalKg = Object.values(selected).reduce((s, q) => s + q, 0)
  const selectedItems = Object.entries(selected).map(([id, qty]) => {
    const crop = crops.find(c => c.id === id)
    return crop ? { ...crop, qty } : null
  }).filter(Boolean)
  const totalPrice = selectedItems.reduce((s, i) => s + (i.dynamic_price || i.price_per_kg) * i.qty, 0)

  const setQty = (cropId, qty) => {
    if (qty <= 0) {
      setSelected(p => { const n = { ...p }; delete n[cropId]; return n })
    } else {
      const newTotal = totalKg - (selected[cropId] || 0) + qty
      if (newTotal > plan.maxKg) return
      setSelected(p => ({ ...p, [cropId]: qty }))
    }
  }

  const placeOrder = async () => {
    if (!user) { navigate('/login'); return }
    if (selectedItems.length === 0) { alert('Please select at least one item!'); return }
    setPlacing(true)
    try {
      await ordersAPI.create({
        plan_id: planId,
        plan_price: plan.price,
        items: selectedItems.map(i => ({ crop_id: i.id, qty_kg: i.qty, price_per_kg: i.dynamic_price || i.price_per_kg })),
        delivery_address: address.addr,
        delivery_slot: address.slot,
        total: plan.price,
      })
      navigate('/dashboard?order=success')
    } catch (e) {
      alert(e.message)
    } finally {
      setPlacing(false)
    }
  }

  const kgLeft = plan.maxKg - totalKg

  return (
    <div className="page-enter" style={{ paddingTop: 80, paddingBottom: step === 'select' ? 100 : 0 }}>
      {/* Plan Banner */}
      <div style={{ background: plan.bg, borderBottom: `3px solid ${plan.color}`, padding: '14px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ background: plan.color, color: 'white', padding: '5px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700 }}>
              {plan.name} — ₹{plan.price}/week
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 140, height: 8, background: '#ddd', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99, transition: 'width .3s',
                  background: totalKg >= plan.maxKg ? '#B71C1C' : plan.color,
                  width: `${Math.min(100, (totalKg / plan.maxKg) * 100)}%`
                }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: totalKg >= plan.maxKg ? '#B71C1C' : plan.color }}>
                {totalKg.toFixed(1)}/{plan.maxKg}kg
              </span>
            </div>
            <span style={{ fontSize: 13, color: plan.color, fontWeight: 600 }}>
              {kgLeft > 0 ? `${kgLeft.toFixed(1)}kg left` : '⚠️ Box full'}
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', padding: '36px 0', color: 'white' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 6 }}>
            Build Your Fresh Box 🧺
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>
            Select vegetables up to {plan.maxKg}kg. All harvested this morning.
          </p>
        </div>
      </div>

      {step === 'select' && (
        <div className="container section">
          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
              <input className="form-input" placeholder="Search crops…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {categories.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: '8px 16px', borderRadius: 99, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  background: cat === c ? 'var(--green)' : 'white',
                  color: cat === c ? 'white' : '#666',
                  border: cat === c ? 'none' : '1.5px solid #ddd',
                  textTransform: 'capitalize'
                }}>{c}</button>
              ))}
            </div>
          </div>

          {loading && <div style={{ textAlign: 'center', padding: 60, color: '#888', fontSize: 32 }}>🌾</div>}

          {/* Crops Grid */}
          {!loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
              {filtered.map(p => {
                const qty = selected[p.id] || 0
                const isSelected = qty > 0
                return (
                  <div key={p.id} style={{
                    background: 'white', borderRadius: 16, overflow: 'hidden',
                    border: isSelected ? `2px solid ${plan.color}` : '1px solid #eee',
                    boxShadow: isSelected ? `0 4px 20px ${plan.color}22` : '0 1px 8px rgba(0,0,0,0.06)',
                    transition: 'all .2s'
                  }}>
                    {/* Image or emoji */}
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                      : <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56, background: '#f9fafb' }}>{p.emoji || '🌿'}</div>
                    }
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <h3 style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{p.name}</h3>
                        {isSelected && <Check size={16} color={plan.color} />}
                      </div>
                      <p style={{ fontSize: 12, color: '#888', margin: '0 0 10px' }}>{p.farmers?.name} · {p.farmers?.village}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--green)' }}>
                          ₹{p.dynamic_price || p.price_per_kg}<span style={{ fontSize: 11, color: '#888', fontWeight: 400 }}>/kg</span>
                        </span>
                        {p.is_organic && <span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600 }}>Organic</span>}
                      </div>

                      {/* Qty selector */}
                      {qty === 0 ? (
                        <button
                          onClick={() => setQty(p.id, 0.5)}
                          disabled={kgLeft <= 0}
                          style={{
                            width: '100%', padding: '9px', borderRadius: 99, border: 'none',
                            background: kgLeft <= 0 ? '#eee' : plan.color,
                            color: kgLeft <= 0 ? '#aaa' : 'white',
                            fontWeight: 600, fontSize: 13, cursor: kgLeft <= 0 ? 'not-allowed' : 'pointer'
                          }}>
                          {kgLeft <= 0 ? 'Box Full' : '+ Add to Box'}
                        </button>
                      ) : (
                        <div>
                          {/* Quick qty buttons */}
                          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                            {[0.2, 0.5, 1, 2].map(q => (
                              <button key={q} onClick={() => setQty(p.id, q)}
                                style={{
                                  flex: 1, padding: '5px 0', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                                  border: qty === q ? `2px solid ${plan.color}` : '1.5px solid #ddd',
                                  background: qty === q ? plan.bg : 'white',
                                  color: qty === q ? plan.color : '#666'
                                }}>
                                {q < 1 ? `${q * 1000}g` : `${q}kg`}
                              </button>
                            ))}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button onClick={() => setQty(p.id, +(qty - 0.5).toFixed(1))}
                              style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${plan.color}`, background: 'white', color: plan.color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Minus size={14} />
                            </button>
                            <span style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: plan.color }}>{qty}kg</span>
                            <button onClick={() => setQty(p.id, +(qty + 0.5).toFixed(1))}
                              disabled={kgLeft <= 0}
                              style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${plan.color}`, background: plan.color, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: kgLeft <= 0 ? 0.4 : 1 }}>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Order Summary Step */}
      {step === 'summary' && (
        <div className="container section">
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Order Summary</h2>

            {/* Selected items */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eee', marginBottom: 20, overflow: 'hidden' }}>
              {selectedItems.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: i < selectedItems.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                      : <span style={{ fontSize: 28 }}>{item.emoji || '🌿'}</span>
                    }
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                      <div style={{ fontSize: 12, color: '#888' }}>₹{item.dynamic_price || item.price_per_kg}/kg × {item.qty}kg</div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>₹{((item.dynamic_price || item.price_per_kg) * item.qty).toFixed(0)}</span>
                </div>
              ))}
            </div>

            {/* Plan price */}
            <div style={{ background: plan.bg, borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: `1px solid ${plan.color}33` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#666' }}>
                <span>Items total ({totalKg}kg)</span>
                <span>₹{totalPrice.toFixed(0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18, color: plan.color }}>
                <span>{plan.name} Plan Price</span>
                <span>₹{plan.price}/week</span>
              </div>
            </div>

            {/* Delivery details */}
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #eee', padding: '20px', marginBottom: 20 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Delivery Details</h3>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>FULL NAME</label>
                <input className="form-input" value={address.name} onChange={e => setAddress(a => ({ ...a, name: e.target.value }))} placeholder="Your name" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>PHONE</label>
                <input className="form-input" value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} placeholder="Phone number" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>DELIVERY ADDRESS</label>
                <textarea value={address.addr} onChange={e => setAddress(a => ({ ...a, addr: e.target.value }))}
                  rows={3} placeholder="Flat, Building, Street, Area, City, PIN"
                  style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #C8E6C9', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', resize: 'none', fontFamily: 'var(--font-body)' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>DELIVERY SLOT</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {[
                    { id: 'morning', label: '🌅 Morning', sub: '7–10 AM' },
                    { id: 'noon',    label: '☀️ Noon',    sub: '12–3 PM' },
                    { id: 'evening', label: '🌇 Evening', sub: '5–8 PM' },
                  ].map(s => (
                    <button key={s.id} onClick={() => setAddress(a => ({ ...a, slot: s.id }))}
                      style={{
                        padding: '10px 6px', borderRadius: 10, fontSize: 12, cursor: 'pointer', textAlign: 'center',
                        border: address.slot === s.id ? `2px solid ${plan.color}` : '1.5px solid #ddd',
                        background: address.slot === s.id ? plan.bg : 'white',
                        color: address.slot === s.id ? plan.color : '#666',
                        fontWeight: address.slot === s.id ? 700 : 400,
                      }}>
                      <div>{s.label}</div>
                      <div style={{ fontSize: 10, opacity: 0.7 }}>{s.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('select')}
                style={{ flex: 1, padding: '14px', borderRadius: 99, border: '1.5px solid #ddd', background: 'white', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#555' }}>
                ← Edit Selection
              </button>
              <button onClick={placeOrder} disabled={placing || !address.addr}
                style={{
                  flex: 2, padding: '14px', borderRadius: 99, border: 'none',
                  background: !address.addr ? '#ccc' : plan.color,
                  color: 'white', fontWeight: 700, fontSize: 15, cursor: !address.addr ? 'not-allowed' : 'pointer',
                }}>
                {placing ? 'Placing Order…' : `🌿 Place Order — ₹${plan.price}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky bottom bar (select step) */}
      {step === 'select' && selectedItems.length > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: 'white', borderTop: '2px solid #eee',
          padding: '14px 24px', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {selectedItems.length} items · {totalKg.toFixed(1)}kg selected
              </div>
              <div style={{ fontSize: 12, color: '#888' }}>
                {selectedItems.map(i => i.name).join(', ')}
              </div>
            </div>
            <button onClick={() => setStep('summary')}
              style={{
                padding: '13px 32px', borderRadius: 99, border: 'none',
                background: plan.color, color: 'white',
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                boxShadow: `0 4px 16px ${plan.color}44`
              }}>
              <ShoppingCart size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
              Review Order →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}