// src/pages/Tracking.jsx — Live Delivery Tracking
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, RefreshCw } from 'lucide-react'
import { trackingAPI, ordersAPI } from '../services/api'

const STEPS = [
  { key: 'confirmed',  label: 'Order Confirmed',     icon: '✅', desc: 'Your order has been received'             },
  { key: 'harvesting', label: 'Harvesting',           icon: '🌾', desc: 'Farmers are harvesting your vegetables'   },
  { key: 'packed',     label: 'Packed & Ready',       icon: '📦', desc: 'Your box is packed and ready'            },
  { key: 'transit',    label: 'Out for Delivery',     icon: '🛵', desc: 'On the way to your doorstep'             },
  { key: 'delivered',  label: 'Delivered',            icon: '🎉', desc: 'Enjoy your fresh vegetables!'            },
]

const STATUS_STEP = {
  pending:    0,
  harvesting: 1,
  packed:     2,
  transit:    3,
  delivered:  4,
  cancelled:  -1,
}

function TrackTimeline({ status }) {
  const current = STATUS_STEP[status] ?? 0

  if (status === 'cancelled') return (
    <div style={{ background: '#FFEBEE', borderRadius: 14, padding: '20px 24px', border: '1.5px solid #EF9A9A', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>❌</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#B71C1C' }}>Order Cancelled</div>
      <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>This order was cancelled. Contact us on WhatsApp for help.</div>
    </div>
  )

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '24px', border: '1.5px solid #EFEBE9' }}>
      {STEPS.map((step, i) => {
        const done    = i < current
        const active  = i === current
        const pending = i > current
        return (
          <div key={step.key} style={{ display: 'flex', gap: 16, marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
            {/* Left: icon + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: done ? '#2E7D32' : active ? '#F9A825' : '#f5f5f5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, border: active ? '3px solid #F9A825' : 'none',
                boxShadow: active ? '0 0 0 4px rgba(249,168,37,0.2)' : 'none',
                transition: 'all .3s',
              }}>
                {done ? '✓' : step.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width: 2, flex: 1, minHeight: 32, background: done ? '#2E7D32' : '#eee', margin: '4px 0', transition: 'background .3s' }} />
              )}
            </div>
            {/* Right: text */}
            <div style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0, paddingTop: 8 }}>
              <div style={{ fontWeight: active ? 900 : done ? 700 : 500, fontSize: 15, color: done ? '#2E7D32' : active ? '#F57F17' : '#aaa', marginBottom: 3 }}>
                {step.label}
                {active && <span style={{ marginLeft: 8, background: '#FFF8E1', color: '#F57F17', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>CURRENT</span>}
              </div>
              <div style={{ fontSize: 12, color: pending ? '#ccc' : '#888' }}>{step.desc}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function LiveMap({ address }) {
  const query = encodeURIComponent((address || 'Visakhapatnam') + ', Andhra Pradesh, India')
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1.5px solid #EFEBE9', marginBottom: 20 }}>
      <div style={{ background: '#E8F5E9', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #C8E6C9' }}>
        <MapPin size={14} color="#2E7D32" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#2E7D32' }}>Delivery Location</span>
      </div>
      <iframe
        title="delivery-map"
        width="100%"
        height="220"
        style={{ display: 'block', border: 'none' }}
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${query}&output=embed&z=14`}
      />
    </div>
  )
}

function OrderCard({ order }) {
  const stepIdx = STATUS_STEP[order.status] ?? 0
  const pct     = Math.round((stepIdx / (STEPS.length - 1)) * 100)

  const eta = () => {
    if (order.status === 'delivered') return 'Delivered!'
    if (order.status === 'transit')   return 'Arriving soon'
    if (order.status === 'packed')    return 'Leaving soon'
    const d = new Date(); d.setDate(d.getDate() + 1)
    return `Tomorrow by 10 AM`
  }

  return (
    <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1.5px solid #EFEBE9', marginBottom: 20 }}>
      {/* Top bar */}
      <div style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>ORDER NUMBER</div>
            <div style={{ color: 'white', fontFamily: 'monospace', fontWeight: 900, fontSize: 18 }}>{order.order_number}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginBottom: 3 }}>ETA</div>
            <div style={{ color: '#F9A825', fontWeight: 900, fontSize: 15 }}>{eta()}</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', background: '#F9A825', borderRadius: 99, width: `${pct}%`, transition: 'width 1s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Order placed</span>
          <span style={{ color: '#F9A825', fontSize: 10, fontWeight: 700 }}>{pct}% complete</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>Delivered</span>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {/* Status + items */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#FFFBF5', borderRadius: 12, padding: '12px 14px', border: '1px solid #EFEBE9' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 4 }}>STATUS</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#2E7D32', textTransform: 'capitalize' }}>
              {STEPS[stepIdx]?.icon} {STEPS[stepIdx]?.label}
            </div>
          </div>
          <div style={{ background: '#FFFBF5', borderRadius: 12, padding: '12px 14px', border: '1px solid #EFEBE9' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 4 }}>TOTAL</div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#2E7D32' }}>₹{order.total}</div>
          </div>
          <div style={{ background: '#FFFBF5', borderRadius: 12, padding: '12px 14px', border: '1px solid #EFEBE9' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 4 }}>DELIVERY SLOT</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#3E2723' }}>
              🕐 {order.delivery_slot || 'Morning'} slot
            </div>
          </div>
          <div style={{ background: '#FFFBF5', borderRadius: 12, padding: '12px 14px', border: '1px solid #EFEBE9' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', marginBottom: 4 }}>PAYMENT</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: order.payment_status === 'paid' ? '#2E7D32' : '#F57F17' }}>
              {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
            </div>
          </div>
        </div>

        {/* Items */}
        {order.order_items?.length > 0 && (
          <div style={{ background: '#F1F8E9', borderRadius: 12, padding: '14px 16px', marginBottom: 20, border: '1px solid #C8E6C9' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#2E7D32', marginBottom: 8 }}>🥬 YOUR VEGETABLES</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {order.order_items.map((item, i) => (
                <span key={i} style={{ background: 'white', border: '1px solid #C8E6C9', borderRadius: 99, padding: '4px 10px', fontSize: 12, color: '#2E7D32', fontWeight: 600 }}>
                  {item.name} {item.qty_kg}kg
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <TrackTimeline status={order.status} />

        {/* Map */}
        {order.delivery_address && order.status !== 'cancelled' && (
          <div style={{ marginTop: 20 }}>
            <LiveMap address={order.delivery_address} />
          </div>
        )}

        {/* Delivery address */}
        {order.delivery_address && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: '#FFFBF5', borderRadius: 12, padding: '12px 14px', border: '1px solid #EFEBE9', marginBottom: 16 }}>
            <MapPin size={16} color="#2E7D32" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 2 }}>DELIVERY ADDRESS</div>
              <div style={{ fontSize: 13, color: '#3E2723' }}>{order.delivery_address}</div>
            </div>
          </div>
        )}

        {/* Contact */}
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="https://wa.me/917075573757" target="_blank" rel="noreferrer"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 12, background: '#25D366', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            💬 WhatsApp Support
          </a>
          <a href="tel:+917075573757"
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '12px', borderRadius: 12, background: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: 13, textDecoration: 'none', border: '1.5px solid #C8E6C9' }}>
            <Phone size={14} /> Call Us
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Tracking() {
  const { user }              = useAuth()
  const navigate              = useNavigate()
  const [searchParams]        = useSearchParams()
  const [orderNum, setOrderNum] = useState(searchParams.get('order') || '')
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [searched, setSearched] = useState(false)

  // Auto-load logged-in user's orders
  useEffect(() => {
    if (user) {
      setLoading(true)
      ordersAPI.getAll()
        .then(r => { setOrders(r.data || []); setSearched(true) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [user])

  // Track by order number
  const track = async () => {
    if (!orderNum.trim()) { alert('Please enter order number'); return }
    setLoading(true)
    setError('')
    try {
      const r = await trackingAPI.track(orderNum.trim())
      setOrders([r.data])
      setSearched(true)
    } catch (e) {
      setError('Order not found. Please check the order number.')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const activeOrders    = orders.filter(o => !['delivered','cancelled'].includes(o.status))
  const pastOrders      = orders.filter(o =>  ['delivered','cancelled'].includes(o.status))

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh', background: '#FFFBF5' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', padding: '36px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 28, fontWeight: 700, color: 'white', margin: '0 0 10px' }}>
            🛵 Track Your Order
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 24 }}>
            Live updates from farm to your doorstep
          </p>
          {/* Search box */}
          <div style={{ display: 'flex', gap: 8, maxWidth: 460, margin: '0 auto' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#aaa', pointerEvents: 'none' }} />
              <input
                value={orderNum}
                onChange={e => setOrderNum(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && track()}
                placeholder="Enter order number (e.g. MH-001)"
                style={{ width: '100%', height: 48, paddingLeft: 42, paddingRight: 14, borderRadius: 12, border: 'none', fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace' }}
              />
            </div>
            <button onClick={track} disabled={loading}
              style={{ height: 48, padding: '0 20px', borderRadius: 12, border: 'none', background: '#F9A825', color: '#1B5E20', fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>
              {loading ? '…' : 'Track'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px' }}>
        {/* Not logged in prompt */}
        {!user && !searched && (
          <div style={{ background: 'white', borderRadius: 16, padding: '32px', textAlign: 'center', border: '1.5px solid #EFEBE9', marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📦</div>
            <h3 style={{ fontWeight: 700, fontSize: 17, color: '#3E2723', marginBottom: 8 }}>Track Your Order</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Enter your order number above or login to see all your orders</p>
            <button onClick={() => navigate('/login')}
              style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Login to Track →
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: '#FFEBEE', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ color: '#C62828', fontSize: 13, fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 48, color: '#aaa' }}>
            <div style={{ fontSize: 40, marginBottom: 12, animation: 'pulse 1s infinite' }}>🛵</div>
            <p>Finding your order…</p>
          </div>
        )}

        {/* Active Orders */}
        {!loading && activeOrders.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 16, color: '#3E2723', margin: 0 }}>
                Active Orders ({activeOrders.length})
              </h2>
              <button onClick={() => {
                setLoading(true)
                ordersAPI.getAll().then(r => setOrders(r.data || [])).finally(() => setLoading(false))
              }} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#2E7D32', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                <RefreshCw size={12}/> Refresh
              </button>
            </div>
            {activeOrders.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        )}

        {/* Past Orders */}
        {!loading && pastOrders.length > 0 && (
          <div>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: '#888', margin: '8px 0 12px' }}>
              Past Orders ({pastOrders.length})
            </h2>
            {pastOrders.slice(0, 3).map(o => (
              <div key={o.id} style={{ background: 'white', borderRadius: 14, padding: '16px 20px', marginBottom: 10, border: '1.5px solid #EFEBE9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#888', fontSize: 13 }}>{o.order_number}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{o.order_items?.map(i => i.name).join(', ')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: o.status === 'delivered' ? '#2E7D32' : '#B71C1C', fontSize: 13 }}>
                    {o.status === 'delivered' ? '✅ Delivered' : '❌ Cancelled'}
                  </div>
                  <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>₹{o.total}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No orders */}
        {!loading && searched && orders.length === 0 && !error && (
          <div style={{ background: 'white', borderRadius: 16, padding: '40px', textAlign: 'center', border: '1.5px solid #EFEBE9' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🌿</div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: '#3E2723', marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Start by ordering fresh vegetables!</p>
            <button onClick={() => navigate('/harvest')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Order Now →
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}