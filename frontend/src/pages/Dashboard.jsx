// src/pages/Dashboard.jsx — connected to real backend
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { ordersAPI, usersAPI, subscriptionsAPI } from '../services/api'
import { Package, CreditCard, MapPin, Clock, Gift, Star, Copy, Check, Truck } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [tab, setTab]         = useState('orders')
  const [orders, setOrders]   = useState([])
  const [wallet, setWallet]   = useState(null)
  const [addresses, setAddresses] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!user) return <Navigate to="/login" state={{ from: '/dashboard' }} replace />

  useEffect(() => {
    setLoading(true)
    if (tab === 'orders') {
      ordersAPI.getAll()
        .then(r => setOrders(r.data || []))
        .finally(() => setLoading(false))
    } else if (tab === 'wallet') {
      usersAPI.getWallet()
        .then(r => setWallet(r.data))
        .finally(() => setLoading(false))
    } else if (tab === 'address') {
      usersAPI.getAddresses()
        .then(r => setAddresses(r.data || []))
        .finally(() => setLoading(false))
    } else if (tab === 'subscription') {
      subscriptionsAPI.getMine()
        .then(r => setSubscription(r.data))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [tab])

  const statusColors = {
    harvesting: '#2E7D32', packed: '#6A1B9A', transit: '#E65100', delivered: '#1565C0', cancelled: '#B71C1C'
  }

  const tabs = [
    { id: 'orders',       label: 'My Orders',         icon: <Package size={16} /> },
    { id: 'tracking',     label: 'Track Order',        icon: <Truck size={16}/> },
    { id: 'subscription', label: 'Subscription',      icon: <Clock size={16} /> },
    { id: 'wallet',       label: 'Wallet & Referral', icon: <CreditCard size={16} /> },
    { id: 'address',      label: 'Addresses',         icon: <MapPin size={16} /> },
  ]

  return (
    <div className="page-enter" style={{ paddingTop: 80, minHeight: '100vh', background: 'var(--cream)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--green) 0%, #1B5E20 100%)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>👤</div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              Hey, {user.name?.split(' ')[0]}! 👋
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{user.phone}</p>
          </div>
          <button onClick={logout} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13 }}>
            Logout
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }} className="dashboard-grid">
          {/* Sidebar */}
          <div className="card" style={{ padding: 12, position: 'sticky', top: 80 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 14,
                fontWeight: tab === t.id ? 600 : 400,
                background: tab === t.id ? 'var(--green-pale)' : 'transparent',
                color: tab === t.id ? 'var(--green)' : 'var(--text)',
                transition: 'all .2s', textAlign: 'left'
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div>
            {loading && (
              <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
                <p>Loading…</p>
              </div>
            )}

            {/* Orders Tab */}
            {!loading && tab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 4 }}>My Orders</h2>
                {orders.length === 0 && (
                  <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                    <p style={{ color: 'var(--text-muted)' }}>No orders yet. Start shopping!</p>
                  </div>
                )}
                {orders.map(order => (
                  <div key={order.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{order.order_number}</div>
                      <span style={{
                        background: (statusColors[order.status] || '#666') + '15',
                        color: statusColors[order.status] || '#666',
                        padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600
                      }}>
                        {order.status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {order.order_items?.map(i => `${i.name} (${i.qty_kg}kg)`).join(', ')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(order.created_at).toLocaleDateString('en-IN')}</span>
                      <span style={{ fontWeight: 700, color: 'var(--green)' }}>₹{order.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Subscription Tab */}
            {!loading && tab === 'subscription' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>My Subscription</h2>
                {!subscription ? (
                  <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No active subscription.</p>
                    <a href="/subscribe" style={{ background: 'var(--green)', color: 'white', padding: '10px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                      Browse Plans
                    </a>
                  </div>
                ) : (
                  <div className="card" style={{ padding: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 18, textTransform: 'capitalize' }}>{subscription.plan} Plan</h3>
                      <span className="badge badge-green">Active</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>₹{subscription.price_per_week}/week · {subscription.delivery_slot} delivery</p>
                    {subscription.next_delivery_at && (
                      <p style={{ fontSize: 13, marginTop: 8 }}>Next delivery: <strong>{new Date(subscription.next_delivery_at).toLocaleDateString('en-IN')}</strong></p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Wallet Tab */}
            {!loading && tab === 'wallet' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Wallet</h2>
                <div className="card" style={{ padding: 24, marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Balance</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--green)' }}>
                    ₹{wallet?.balance ?? 0}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Referral code: <strong>{user.referral_code}</strong></div>
                </div>
                {wallet?.transactions?.length > 0 && (
                  <div className="card" style={{ padding: 20 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Transactions</h3>
                    {wallet.transactions.map((tx, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{tx.reason?.replace(/_/g, ' ')}</span>
                        <span style={{ fontWeight: 600, color: tx.type === 'credit' ? 'var(--green)' : '#C62828' }}>
                          {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Tracking */}
            {tab === 'tracking' && (
              <div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, marginBottom: 16, color: '#3E2723' }}>Track Your Order 🛵</h2>
                {orders.length === 0 ? (
                  <div style={{ background: 'white', borderRadius: 16, padding: 40, textAlign: 'center', border: '1.5px solid #EFEBE9' }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                    <p style={{ color: '#888', marginBottom: 20 }}>No active orders to track.</p>
                    <button onClick={() => navigate('/harvest')} style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                      Order Now →
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {orders.map(order => {
                      const steps = ['confirmed','harvesting','packed','transit','delivered']
                      const stepIdx = { pending:0, harvesting:1, packed:2, transit:3, delivered:4 }[order.status] ?? 0
                      const pct = Math.round((stepIdx / 4) * 100)
                      const icons = ['✅','🌾','📦','🛵','🎉']
                      const labels = ['Confirmed','Harvesting','Packed','In Transit','Delivered']
                      return (
                        <div key={order.id} style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1.5px solid #EFEBE9', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                          <div style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', padding: '16px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                              <span style={{ color: 'white', fontFamily: 'monospace', fontWeight: 700 }}>{order.order_number}</span>
                              <span style={{ color: '#F9A825', fontWeight: 700, fontSize: 13 }}>₹{order.total}</span>
                            </div>
                            <div style={{ height: 5, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden', marginBottom: 4 }}>
                              <div style={{ height: '100%', background: '#F9A825', borderRadius: 99, width: `${pct}%`, transition: 'width 1s' }} />
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>{pct}% complete</div>
                          </div>
                          <div style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                              {labels.map((l, i) => (
                                <div key={l} style={{ textAlign: 'center', flex: 1 }}>
                                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: i <= stepIdx ? '#2E7D32' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 14 }}>
                                    {i < stepIdx ? '✓' : icons[i]}
                                  </div>
                                  <div style={{ fontSize: 9, color: i <= stepIdx ? '#2E7D32' : '#aaa', fontWeight: i === stepIdx ? 700 : 400 }}>{l}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
                              {order.order_items?.map(i => `${i.name} (${i.qty_kg}kg)`).join(', ')}
                            </div>
                            <button onClick={() => navigate(`/track?order=${order.order_number}`)}
                              style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: '#E8F5E9', color: '#2E7D32', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                              View Full Tracking →
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Address Tab */}
            {!loading && tab === 'address' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 16 }}>My Addresses</h2>
                {addresses.length === 0 ? (
                  <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
                    <p style={{ color: 'var(--text-muted)' }}>No saved addresses yet.</p>
                  </div>
                ) : (
                  addresses.map(addr => (
                    <div key={addr.id} className="card" style={{ padding: 20, marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{addr.label || 'Home'}</span>
                        {addr.is_default && <span className="badge badge-green">Default</span>}
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: 14, margin: 0 }}>
                        {addr.line1}, {addr.area}, {addr.city} – {addr.pincode}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
