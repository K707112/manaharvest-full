// src/pages/AdminOrders.jsx — Full Admin Order Dashboard
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { Package, Truck, CheckCircle, Clock, XCircle, Download, RefreshCw, Search, Filter } from 'lucide-react'

const BASE = 'https://manaharvest-full.vercel.app/api/v1'
async function api(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    ...options,
  })
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e?.error?.message || `Error ${res.status}`) }
  return res.json()
}

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: '#F57F17', bg: '#FFFDE7', icon: <Clock size={14}/>,       next: 'harvesting' },
  harvesting: { label: 'Harvesting', color: '#2E7D32', bg: '#E8F5E9', icon: <Package size={14}/>,     next: 'packed' },
  packed:     { label: 'Packed',     color: '#6A1B9A', bg: '#F3E5F5', icon: <Package size={14}/>,     next: 'transit' },
  transit:    { label: 'In Transit', color: '#E65100', bg: '#FFF3E0', icon: <Truck size={14}/>,       next: 'delivered' },
  delivered:  { label: 'Delivered',  color: '#1565C0', bg: '#E3F2FD', icon: <CheckCircle size={14}/>, next: null },
  cancelled:  { label: 'Cancelled',  color: '#B71C1C', bg: '#FFEBEE', icon: <XCircle size={14}/>,    next: null },
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: c.bg, color: c.color, padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
      {c.icon} {c.label}
    </span>
  )
}

// ── STATS CARDS ──
function StatsRow({ orders }) {
  const stats = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    packing:   orders.filter(o => o.status === 'harvesting' || o.status === 'packed').length,
    transit:   orders.filter(o => o.status === 'transit').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue:   orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total || 0), 0),
    pending_payment: orders.filter(o => o.payment_status === 'pending').length,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
      {[
        { label: 'Total Orders',    value: stats.total,           color: '#3E2723', bg: '#EFEBE9', icon: '📦' },
        { label: 'To Pack',         value: stats.packing,         color: '#6A1B9A', bg: '#F3E5F5', icon: '📋' },
        { label: 'Out for Delivery',value: stats.transit,         color: '#E65100', bg: '#FFF3E0', icon: '🛵' },
        { label: 'Delivered',       value: stats.delivered,       color: '#1565C0', bg: '#E3F2FD', icon: '✅' },
        { label: 'Revenue Collected',value: `₹${stats.revenue}`, color: '#2E7D32', bg: '#E8F5E9', icon: '💰' },
        { label: 'Pending Payment', value: stats.pending_payment, color: '#F57F17', bg: '#FFFDE7', icon: '⏳' },
      ].map(s => (
        <div key={s.label} style={{ background: s.bg, borderRadius: 14, padding: '16px 18px', borderLeft: `4px solid ${s.color}` }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: s.color }}>{s.value}</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{s.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── PACKING LIST ──
function PackingList({ orders }) {
  const topack = orders.filter(o => ['pending','harvesting','packed'].includes(o.status))

  const allItems = {}
  topack.forEach(order => {
    order.order_items?.forEach(item => {
      if (!allItems[item.name]) allItems[item.name] = { name: item.name, total_kg: 0, orders: [] }
      allItems[item.name].total_kg += item.qty_kg || 0
      allItems[item.name].orders.push(order.order_number)
    })
  })

  const printList = () => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Packing List — ${new Date().toLocaleDateString('en-IN')}</title>
      <style>body{font-family:Arial;padding:20px} h1{color:#1B5E20} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#E8F5E9}</style>
      </head><body>
      <h1>🌾 ManaHarvest — Packing List</h1>
      <p>Date: ${new Date().toLocaleDateString('en-IN')} | Orders to pack: ${topack.length}</p>
      <h2>Vegetables to Procure</h2>
      <table><tr><th>Vegetable</th><th>Total KG</th><th>Orders</th></tr>
      ${Object.values(allItems).map(i => `<tr><td>${i.name}</td><td><b>${i.total_kg.toFixed(1)} kg</b></td><td>${i.orders.join(', ')}</td></tr>`).join('')}
      </table>
      <h2>Order Details</h2>
      <table><tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Items</th><th>Address</th><th>Slot</th></tr>
      ${topack.map(o => `<tr><td>${o.order_number}</td><td>${o.users?.name}</td><td>${o.users?.phone}</td><td>${o.order_items?.map(i=>`${i.name}(${i.qty_kg}kg)`).join(', ')}</td><td>${o.delivery_address || '-'}</td><td>${o.delivery_slot || '-'}</td></tr>`).join('')}
      </table>
      </body></html>
    `)
    win.print()
  }

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1.5px solid #EFEBE9', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: '#3E2723', margin: 0 }}>📋 Today's Packing List ({topack.length} orders)</h3>
        <button onClick={printList}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
          <Download size={14}/> Print List
        </button>
      </div>

      {Object.values(allItems).length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 20 }}>No orders to pack today</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {Object.values(allItems).map(item => (
            <div key={item.name} style={{ background: '#F1F8E9', borderRadius: 12, padding: '14px', border: '1px solid #C8E6C9' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1B5E20', marginBottom: 4 }}>{item.name}</div>
              <div style={{ fontWeight: 900, fontSize: 22, color: '#2E7D32' }}>{item.total_kg.toFixed(1)} kg</div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>for {item.orders.length} order{item.orders.length > 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── DELIVERY MAP (Zone wise) ──
function DeliveryZones({ orders }) {
  const transit = orders.filter(o => o.status === 'transit')
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1.5px solid #EFEBE9', marginBottom: 20 }}>
      <h3 style={{ fontWeight: 700, fontSize: 16, color: '#3E2723', marginBottom: 14 }}>🛵 Out for Delivery ({transit.length})</h3>
      {transit.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 16 }}>No orders in transit</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {transit.map(o => (
            <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFF3E0', borderRadius: 12, padding: '12px 16px', border: '1px solid #FFE082' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#3E2723' }}>{o.users?.name}</div>
                <div style={{ fontSize: 12, color: '#888' }}>📍 {o.delivery_address || 'No address'}</div>
                <div style={{ fontSize: 11, color: '#E65100', fontWeight: 600, marginTop: 2 }}>Slot: {o.delivery_slot || 'Morning'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#888' }}>{o.order_number}</div>
                <div style={{ fontWeight: 700, color: '#2E7D32' }}>₹{o.total}</div>
                <div style={{ fontSize: 11, color: '#aaa' }}>{o.users?.phone}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MAIN ORDERS TABLE ──
function OrdersTable({ orders, onUpdateStatus, updating }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = orders.filter(o => {
    const matchSearch = o.order_number?.includes(search) ||
      o.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.users?.phone?.includes(search)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1.5px solid #EFEBE9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, color: '#3E2723', margin: 0 }}>All Orders ({filtered.length})</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }}/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders…"
              style={{ paddingLeft: 32, paddingRight: 12, height: 36, border: '1.5px solid #EFEBE9', borderRadius: 10, fontSize: 13, outline: 'none', width: 200 }}/>
          </div>
          {/* Status filter */}
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ height: 36, border: '1.5px solid #EFEBE9', borderRadius: 10, fontSize: 13, padding: '0 12px', background: 'white', outline: 'none' }}>
            <option value="all">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FFFBF5' }}>
              {['Order', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Delivery', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#5D4037', fontSize: 11, borderBottom: '2px solid #EFEBE9', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const config = STATUS_CONFIG[o.status]
              return (
                <tr key={o.id} style={{ borderBottom: '1px solid #f5f5f5', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFFBF5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2E7D32', fontSize: 12 }}>{o.order_number}</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600, color: '#3E2723' }}>{o.users?.name}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{o.users?.phone}</div>
                  </td>
                  <td style={{ padding: '12px 14px', maxWidth: 180 }}>
                    <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                      {o.order_items?.map(i => `${i.name} ${i.qty_kg}kg`).join(', ')}
                    </div>
                    <div style={{ fontSize: 10, color: '#aaa', marginTop: 2 }}>📍 {o.delivery_address?.slice(0, 30)}{o.delivery_address?.length > 30 ? '…' : ''}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2E7D32', fontSize: 15 }}>₹{o.total}</td>
                  <td style={{ padding: '12px 14px' }}><StatusBadge status={o.status}/></td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: o.payment_status === 'paid' ? '#E8F5E9' : '#FFFDE7', color: o.payment_status === 'paid' ? '#2E7D32' : '#F57F17', padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>
                      {o.payment_status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#555' }}>{o.delivery_slot || 'Morning'}</div>
                    <div style={{ fontSize: 10, color: '#aaa' }}>{o.delivery_date ? new Date(o.delivery_date).toLocaleDateString('en-IN') : 'Tomorrow'}</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {config?.next && (
                        <button
                          onClick={() => onUpdateStatus(o.id, config.next)}
                          disabled={updating === o.id}
                          style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#2E7D32', color: 'white', fontWeight: 600, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          {updating === o.id ? '…' : `→ ${STATUS_CONFIG[config.next]?.label}`}
                        </button>
                      )}
                      {o.status === 'transit' && (
                        <button
                          onClick={() => {
                            const msg = `🛵 Your ManaHarvest order ${o.order_number} is out for delivery! Arriving soon. Track: https://k707112.github.io/manaharvest-full/#/track`
                            window.open(`https://wa.me/91${o.users?.phone?.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
                          }}
                          style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#25D366', color: 'white', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                          📱 Notify
                        </button>
                      )}
                      {o.status === 'pending' && (
                        <button
                          onClick={() => onUpdateStatus(o.id, 'cancelled')}
                          disabled={updating === o.id}
                          style={{ padding: '5px 10px', borderRadius: 8, border: 'none', background: '#FFEBEE', color: '#B71C1C', fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#aaa' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
            <p>No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── REVENUE CHART (Simple) ──
function RevenueBar({ orders }) {
  const days = {}
  orders.filter(o => o.payment_status === 'paid').forEach(o => {
    const d = new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    days[d] = (days[d] || 0) + (o.total || 0)
  })
  const entries = Object.entries(days).slice(-7)
  const max = Math.max(...entries.map(([,v]) => v), 1)

  if (entries.length === 0) return null

  return (
    <div style={{ background: 'white', borderRadius: 16, padding: '20px', border: '1.5px solid #EFEBE9', marginBottom: 20 }}>
      <h3 style={{ fontWeight: 700, fontSize: 16, color: '#3E2723', marginBottom: 16 }}>📊 Revenue (Last 7 Days)</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100 }}>
        {entries.map(([day, val]) => (
          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, color: '#2E7D32', fontWeight: 700 }}>₹{val >= 1000 ? (val/1000).toFixed(1)+'k' : val}</div>
            <div style={{ width: '100%', background: '#2E7D32', borderRadius: '4px 4px 0 0', height: `${(val / max) * 80}px`, minHeight: 4, transition: 'height .3s' }} />
            <div style={{ fontSize: 9, color: '#888', textAlign: 'center' }}>{day}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN PAGE ──
export default function AdminOrders() {
  const { user }              = useAuth()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)
  const [view, setView]       = useState('dashboard') // 'dashboard' | 'orders'
  const [lastRefresh, setLastRefresh] = useState(new Date())

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <h2>Access Denied</h2>
    </div>
  )

  const load = useCallback(() => {
    setLoading(true)
    api('/admin/orders?limit=100')
      .then(r => { setOrders(r.data || []); setLastRefresh(new Date()) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    const t = setInterval(load, 120000)
    return () => clearInterval(t)
  }, [load])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      load()
    } catch (e) { alert(e.message) }
    finally { setUpdating(null) }
  }

  const todayOrders = orders.filter(o => {
    const d = new Date(o.created_at)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF5', paddingTop: 80 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1B5E20,#2E7D32)', padding: '24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 700, margin: 0 }}>📦 Order Dashboard</h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: '4px 0 0' }}>
              Last updated: {lastRefresh.toLocaleTimeString('en-IN')} · Auto-refreshes every 2 min
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 4, display: 'flex', gap: 2 }}>
              {[{ id: 'dashboard', label: '📊 Dashboard' }, { id: 'orders', label: '📋 All Orders' }].map(v => (
                <button key={v.id} onClick={() => setView(v.id)}
                  style={{ padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: view === v.id ? 'white' : 'transparent', color: view === v.id ? '#2E7D32' : 'rgba(255,255,255,0.8)' }}>
                  {v.label}
                </button>
              ))}
            </div>
            <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
              <RefreshCw size={14}/> Refresh
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🌾</div>
            <p>Loading orders…</p>
          </div>
        ) : (
          <>
            {view === 'dashboard' && (
              <>
                {/* Today badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#E8F5E9', padding: '6px 16px', borderRadius: 99, marginBottom: 20, border: '1px solid #C8E6C9' }}>
                  <span style={{ width: 8, height: 8, background: '#2E7D32', borderRadius: '50%', display: 'inline-block' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2E7D32' }}>TODAY: {todayOrders.length} new orders</span>
                </div>

                <StatsRow orders={orders} />
                <RevenueBar orders={orders} />
                <PackingList orders={orders} />
                <DeliveryZones orders={orders} />
              </>
            )}

            {view === 'orders' && (
              <OrdersTable orders={orders} onUpdateStatus={updateStatus} updating={updating} />
            )}
          </>
        )}
      </div>
    </div>
  )
}