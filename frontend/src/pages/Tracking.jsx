// src/pages/Tracking.jsx — connected to real backend
import { useState } from 'react'
import { Search, CheckCircle, Package, Truck } from 'lucide-react'
import { trackingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Tracking() {
  const [query, setQuery]     = useState('')
  const [order, setOrder]     = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [error, setError]     = useState('')
  const { user }              = useAuth()

  const search = async () => {
    if (!query.trim()) return
    setLoading(true); setOrder(null); setNotFound(false); setError('')
    try {
      const res = await trackingAPI.track(query.trim())
      setOrder(res.data)
    } catch (err) {
      if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) setNotFound(true)
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const statusColors = {
    harvesting: '#2E7D32', packed: '#6A1B9A', transit: '#E65100', delivered: '#1565C0', cancelled: '#B71C1C'
  }

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh' }}>
      <div style={{ background: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)', padding: '56px 0 48px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
            Track Your Order
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Enter your order number to see real-time status.</p>

          {!user && (
            <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: 10, padding: '10px 20px', display: 'inline-block', marginBottom: 16, fontSize: 13, color: '#F57F17' }}>
              ⚠️ Please <a href="/login" style={{ color: 'var(--green)', fontWeight: 600 }}>login</a> to track your orders.
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, maxWidth: 500, margin: '0 auto', flexWrap: 'wrap' }}>
            <input className="form-input" style={{ flex: 1, background: 'white' }}
              placeholder="e.g. MH-0001" value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()} />
            <button className="btn btn-primary" onClick={search} disabled={loading}>
              {loading ? '…' : <><Search size={16} /> Track</>}
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        {error && (
          <div style={{ background: '#FFEBEE', color: '#C62828', padding: 20, borderRadius: 12, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            ⚠️ {error}
          </div>
        )}

        {notFound && (
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
            <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Order Not Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Check the order number and try again.</p>
          </div>
        )}

        {order && (
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header */}
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Order Number</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18 }}>{order.order_number}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Slot: {order.delivery_slot}</div>
                </div>
                <div style={{
                  background: (statusColors[order.status] || '#666') + '15',
                  color: statusColors[order.status] || '#666',
                  padding: '6px 16px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                  border: `1.5px solid ${(statusColors[order.status] || '#666')}30`
                }}>
                  {order.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                  <span>Progress</span>
                  <span>{order.step_index + 1}/{order.steps?.length} steps</span>
                </div>
                <div style={{ height: 8, background: 'var(--cream)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${((order.step_index + 1) / (order.steps?.length || 4)) * 100}%`, background: 'var(--green)', borderRadius: 99, transition: 'width .5s' }} />
                </div>
              </div>
            </div>

            {/* Steps timeline */}
            {order.steps && (
              <div className="card" style={{ padding: 28 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Delivery Timeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {order.steps.map((step, i) => {
                    const done = i <= order.step_index
                    return (
                      <div key={step.key} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                        {i < order.steps.length - 1 && (
                          <div style={{ position: 'absolute', left: 15, top: 30, bottom: -4, width: 2, background: done ? 'var(--green)' : 'var(--border)', zIndex: 0 }} />
                        )}
                        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1, background: done ? 'var(--green)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 16 }}>{step.icon}</span>
                        </div>
                        <div style={{ paddingBottom: 24 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: done ? 'var(--text)' : 'var(--text-muted)' }}>{step.label}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{step.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Order items */}
            {order.order_items?.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Order Items</h3>
                {order.order_items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 14 }}>{item.name} <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>({item.qty_kg}kg)</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
