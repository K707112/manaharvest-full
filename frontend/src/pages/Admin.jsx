// src/pages/Admin.jsx — Full Admin Panel with Image Upload
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://gydtxzxjmejsdoculytc.supabase.co'
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5ZHR4enhqbWVqc2RvY3VseXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MjIxODAsImV4cCI6MjA4ODA5ODE4MH0.WtobeYIslYzJRJ-mN_y_jE9JJhG2mc-xpwrFxeHdE24'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

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

const STATUS_COLORS = {
  harvesting: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  packed:     { bg: '#F3E5F5', text: '#6A1B9A', border: '#CE93D8' },
  transit:    { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' },
  delivered:  { bg: '#E3F2FD', text: '#1565C0', border: '#90CAF9' },
  cancelled:  { bg: '#FFEBEE', text: '#B71C1C', border: '#EF9A9A' },
  pending:    { bg: '#FFFDE7', text: '#F57F17', border: '#FFF176' },
  paid:       { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
}

function Badge({ label, type = 'harvesting' }) {
  const c = STATUS_COLORS[type] || STATUS_COLORS.harvesting
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ fontWeight: 700, fontSize: 17, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>{label}</label>}
      <input style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none' }} {...props} />
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', size = 'md', disabled }) {
  const styles = {
    primary: { background: '#2E7D32', color: 'white', border: 'none' },
    danger:  { background: '#B71C1C', color: 'white', border: 'none' },
    outline: { background: 'white', color: '#333', border: '1.5px solid #ddd' },
    orange:  { background: '#E65100', color: 'white', border: 'none' },
    blue:    { background: '#1565C0', color: 'white', border: 'none' },
  }
  const sizes = { sm: { padding: '5px 12px', fontSize: 12 }, md: { padding: '8px 16px', fontSize: 13 } }
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...styles[variant], ...sizes[size], borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: disabled ? 0.6 : 1, whiteSpace: 'nowrap' }}>
      {children}
    </button>
  )
}

// ── IMAGE UPLOAD COMPONENT ───────────────────────────────────
function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `crop-${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from('crop-images')
        .upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data: urlData } = supabase.storage
        .from('crop-images')
        .getPublicUrl(fileName)
      setPreview(urlData.publicUrl)
      onChange(urlData.publicUrl)
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Crop Photo</label>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {preview ? (
          <img src={preview} alt="crop" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #ddd' }} />
        ) : (
          <div style={{ width: 80, height: 80, background: '#f5f5f5', borderRadius: 10, border: '1.5px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🌿</div>
        )}
        <div>
          <label style={{
            background: '#2E7D32', color: 'white', padding: '8px 16px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
            opacity: uploading ? 0.6 : 1, display: 'inline-block'
          }}>
            {uploading ? 'Uploading…' : '📷 Upload Photo'}
            <input type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} disabled={uploading} />
          </label>
          {preview && (
            <button onClick={() => { setPreview(''); onChange('') }}
              style={{ marginLeft: 8, background: 'none', border: 'none', color: '#B71C1C', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              Remove
            </button>
          )}
          <div style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>JPG, PNG up to 5MB</div>
        </div>
      </div>
    </div>
  )
}

// ── STATS CARDS ─────────────────────────────────────────────
function StatsSection() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api('/admin/stats').then(r => setStats(r.data)).catch(() => {}) }, [])
  const cards = stats ? [
    { label: "Today's Orders",   value: stats.today_orders,   icon: '📦', color: '#2E7D32' },
    { label: 'Pending Orders',   value: stats.pending_orders, icon: '⏳', color: '#E65100' },
    { label: "Today's Revenue",  value: `₹${stats.today_revenue}`, icon: '💰', color: '#1565C0' },
    { label: 'Total Users',      value: stats.total_users,    icon: '👥', color: '#6A1B9A' },
    { label: 'Active Crops',     value: stats.active_crops,   icon: '🌾', color: '#2E7D32' },
    { label: 'Total Farmers',    value: stats.total_farmers,  icon: '👨‍🌾', color: '#795548' },
  ] : []
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: 'white', borderRadius: 12, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${c.color}` }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: c.color }}>{stats ? c.value : '…'}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}

// ── ORDERS TAB ──────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const q = filter !== 'all' ? `?status=${filter}` : ''
    api(`/admin/orders${q}`).then(r => setOrders(r.data || [])).finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      load()
    } catch (e) { alert(e.message) } finally { setUpdating(null) }
  }

  const NEXT = { harvesting: 'packed', packed: 'transit', transit: 'delivered' }
  const FILTERS = ['all', 'harvesting', 'packed', 'transit', 'delivered', 'cancelled']

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: filter === f ? '#2E7D32' : 'white', color: filter === f ? 'white' : '#555',
            border: filter === f ? 'none' : '1.5px solid #ddd', textTransform: 'capitalize'
          }}>{f === 'all' ? 'All Orders' : f}</button>
        ))}
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading orders…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#2E7D32' }}>{o.order_number}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600 }}>{o.users?.name}</div>
                    <div style={{ color: '#888', fontSize: 11 }}>{o.users?.phone}</div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#555', maxWidth: 180 }}>
                    {o.order_items?.map(i => `${i.name} (${i.qty_kg}kg)`).join(', ')}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>₹{o.total}</td>
                  <td style={{ padding: '12px 14px' }}><Badge label={o.status} type={o.status} /></td>
                  <td style={{ padding: '12px 14px' }}><Badge label={o.payment_status} type={o.payment_status} /></td>
                  <td style={{ padding: '12px 14px', color: '#888', fontSize: 11 }}>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {NEXT[o.status] && (
                      <Btn size="sm" variant="primary" disabled={updating === o.id}
                        onClick={() => updateStatus(o.id, NEXT[o.status])}>
                        → {NEXT[o.status]}
                      </Btn>
                    )}
                    {o.status === 'harvesting' && (
                      <span style={{ marginLeft: 6 }}>
                        <Btn size="sm" variant="danger" disabled={updating === o.id}
                          onClick={() => updateStatus(o.id, 'cancelled')}>Cancel</Btn>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No orders found.</div>}
        </div>
      )}
    </div>
  )
}

// ── FARMERS TAB ─────────────────────────────────────────────
function FarmersTab() {
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const load = () => { setLoading(true); api('/admin/farmers').then(r => setFarmers(r.data || [])).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setForm({ state: 'Telangana', is_active: true, is_verified: false }); setModal('add') }
  const openEdit = (f) => { setForm({ ...f }); setModal(f) }

  const save = async () => {
    setSaving(true)
    try {
      if (modal === 'add') await api('/admin/farmers', { method: 'POST', body: JSON.stringify(form) })
      else await api(`/admin/farmers/${form.id}`, { method: 'PATCH', body: JSON.stringify(form) })
      setModal(null); load()
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  const verify     = async (id) => { await api(`/admin/farmers/${id}/verify`, { method: 'PATCH' }); load() }
  const deactivate = async (id) => { if (confirm('Deactivate this farmer?')) { await api(`/admin/farmers/${id}`, { method: 'DELETE' }); load() } }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ color: '#888', fontSize: 13 }}>{farmers.length} farmers total</div>
        <Btn onClick={openAdd}>+ Add Farmer</Btn>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading…</div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {farmers.map(f => (
            <div key={f.id} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ width: 44, height: 44, background: f.is_active ? '#E8F5E9' : '#f5f5f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>👨‍🌾</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.name}
                  {f.is_verified && <span style={{ marginLeft: 6, background: '#E8F5E9', color: '#2E7D32', fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>✓ Verified</span>}
                  {!f.is_active && <span style={{ marginLeft: 6, background: '#FFEBEE', color: '#B71C1C', fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>Inactive</span>}
                </div>
                <div style={{ color: '#888', fontSize: 12 }}>{f.village}, {f.district} · {f.speciality}</div>
                <div style={{ color: '#aaa', fontSize: 11 }}>{f.years_farming} yrs · {f.land_acres} acres · ⭐ {f.avg_rating || 'New'}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {!f.is_verified && <Btn size="sm" variant="blue" onClick={() => verify(f.id)}>✓ Verify</Btn>}
                <Btn size="sm" variant="outline" onClick={() => openEdit(f)}>Edit</Btn>
                {f.is_active && <Btn size="sm" variant="danger" onClick={() => deactivate(f.id)}>Deactivate</Btn>}
              </div>
            </div>
          ))}
          {farmers.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No farmers yet.</div>}
        </div>
      )}
      {modal && (
        <Modal title={modal === 'add' ? 'Add New Farmer' : `Edit — ${form.name}`} onClose={() => setModal(null)}>
          <Input label="Full Name *" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="Farmer name" />
          <Input label="Village *" value={form.village || ''} onChange={e => set('village', e.target.value)} placeholder="Village" />
          <Input label="District *" value={form.district || ''} onChange={e => set('district', e.target.value)} placeholder="District" />
          <Input label="State" value={form.state || ''} onChange={e => set('state', e.target.value)} placeholder="State" />
          <Input label="Speciality" value={form.speciality || ''} onChange={e => set('speciality', e.target.value)} placeholder="e.g. Tomatoes & Leafy Greens" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Years Farming" type="number" value={form.years_farming || ''} onChange={e => set('years_farming', e.target.value)} />
            <Input label="Land (Acres)" type="number" value={form.land_acres || ''} onChange={e => set('land_acres', e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Story</label>
            <textarea value={form.story || ''} onChange={e => set('story', e.target.value)} rows={3}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} placeholder="Farmer's story..." />
          </div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_verified || false} onChange={e => set('is_verified', e.target.checked)} /> Verified
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_active !== false} onChange={e => set('is_active', e.target.checked)} /> Active
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="outline" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Add Farmer' : 'Save Changes'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── CROPS TAB ────────────────────────────────────────────────
function CropsTab() {
  const [crops, setCrops]     = useState([])
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({})
  const [saving, setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api('/admin/crops'), api('/admin/farmers')])
      .then(([cr, fr]) => { setCrops(cr.data || []); setFarmers(fr.data || []) })
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openAdd  = () => { setForm({ is_organic: false, is_available: true, category: 'vegetables' }); setModal('add') }
  const openEdit = (c) => { setForm({ ...c, farmer_id: c.farmer_id }); setModal(c) }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        ...form,
        price_per_kg:     Number(form.price_per_kg),
        harvested_qty_kg: Number(form.harvested_qty_kg),
        stock_left_kg:    Number(form.stock_left_kg || form.harvested_qty_kg),
        harvest_time:     form.harvest_time || new Date().toISOString(),
        expires_at:       form.expires_at   || new Date(Date.now() + 86400000).toISOString(),
      }
      if (modal === 'add') await api('/admin/crops', { method: 'POST', body: JSON.stringify(payload) })
      else await api(`/admin/crops/${form.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      setModal(null); load()
    } catch (e) { alert(e.message) } finally { setSaving(false) }
  }

  const remove = async (id) => { if (confirm('Remove this crop from listing?')) { await api(`/admin/crops/${id}`, { method: 'DELETE' }); load() } }

  const CATEGORIES = ['vegetables', 'greens', 'herbs', 'root vegetables', 'fruits']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ color: '#888', fontSize: 13 }}>{crops.length} crops total</div>
        <Btn onClick={openAdd}>+ Add Crop</Btn>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {['Crop', 'Farmer', 'Category', 'Price/kg', 'Stock', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {crops.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {c.image_url
                        ? <img src={c.image_url} alt={c.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                        : <span style={{ fontSize: 28 }}>{c.emoji || '🌿'}</span>
                      }
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div style={{ color: '#aaa', fontSize: 11, fontFamily: 'monospace' }}>{c.batch_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#555' }}>{c.farmers?.name}<br /><span style={{ color: '#aaa', fontSize: 11 }}>{c.farmers?.village}</span></td>
                  <td style={{ padding: '12px 14px' }}><span style={{ background: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', borderRadius: 6, fontSize: 11 }}>{c.category}</span></td>
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>₹{c.price_per_kg}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <div>{c.stock_left_kg}kg left</div>
                    <div style={{ color: '#aaa', fontSize: 11 }}>of {c.harvested_qty_kg}kg</div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <Badge label={c.is_available ? 'Available' : 'Unavailable'} type={c.is_available ? 'delivered' : 'cancelled'} />
                    {c.is_organic && <div style={{ marginTop: 4 }}><Badge label="Organic" type="harvesting" /></div>}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn size="sm" variant="outline" onClick={() => openEdit(c)}>Edit</Btn>
                      {c.is_available && <Btn size="sm" variant="danger" onClick={() => remove(c.id)}>Remove</Btn>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {crops.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No crops yet.</div>}
        </div>
      )}

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Crop' : `Edit — ${form.name}`} onClose={() => setModal(null)}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Farmer *</label>
            <select value={form.farmer_id || ''} onChange={e => set('farmer_id', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, background: 'white', boxSizing: 'border-box' }}>
              <option value="">Select farmer…</option>
              {farmers.filter(f => f.is_active).map(f => <option key={f.id} value={f.id}>{f.name} — {f.village}</option>)}
            </select>
          </div>

          {/* Image Upload — replaces emoji */}
          <ImageUpload value={form.image_url || ''} onChange={v => set('image_url', v)} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Crop Name *" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Tomato" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 5 }}>Category *</label>
            <select value={form.category || 'vegetables'} onChange={e => set('category', e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, background: 'white', boxSizing: 'border-box' }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Description" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="Short description" />
          <Input label="Batch ID" value={form.batch_id || ''} onChange={e => set('batch_id', e.target.value)} placeholder="e.g. MH-0303-TOM" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input label="Price/kg (₹) *" type="number" value={form.price_per_kg || ''} onChange={e => set('price_per_kg', e.target.value)} />
            <Input label="Harvested (kg) *" type="number" value={form.harvested_qty_kg || ''} onChange={e => set('harvested_qty_kg', e.target.value)} />
            <Input label="Stock Left (kg)" type="number" value={form.stock_left_kg || ''} onChange={e => set('stock_left_kg', e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_organic || false} onChange={e => set('is_organic', e.target.checked)} /> Organic
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.is_available !== false} onChange={e => set('is_available', e.target.checked)} /> Available
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="outline" onClick={() => setModal(null)}>Cancel</Btn>
            <Btn onClick={save} disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? 'Add Crop' : 'Save Changes'}</Btn>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── USERS TAB ────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  const load = () => { setLoading(true); api('/admin/users').then(r => setUsers(r.data || [])).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])

  const toggle = async (id) => { await api(`/admin/users/${id}/toggle`, { method: 'PATCH' }); load() }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or email…"
          style={{ width: '100%', maxWidth: 340, padding: '9px 14px', border: '1.5px solid #ddd', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading…</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                {['User', 'Phone', 'Role', 'Wallet', 'Referral', 'Joined', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                    <div style={{ color: '#aaa', fontSize: 11 }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>{u.phone}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: u.role === 'admin' ? '#FFF3E0' : '#E3F2FD', color: u.role === 'admin' ? '#E65100' : '#1565C0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: '#2E7D32' }}>₹{u.wallet_balance || 0}</td>
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 12, color: '#888' }}>{u.referral_code}</td>
                  <td style={{ padding: '12px 14px', color: '#888', fontSize: 11 }}>{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px 14px' }}><Badge label={u.is_active ? 'Active' : 'Blocked'} type={u.is_active ? 'delivered' : 'cancelled'} /></td>
                  <td style={{ padding: '12px 14px' }}>
                    {u.role !== 'admin' && (
                      <Btn size="sm" variant={u.is_active ? 'danger' : 'blue'} onClick={() => toggle(u.id)}>
                        {u.is_active ? 'Block' : 'Unblock'}
                      </Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No users found.</div>}
        </div>
      )}
    </div>
  )
}

// ── MAIN ADMIN PAGE ──────────────────────────────────────────
const TABS = [
  { id: 'orders',  label: '📦 Orders'  },
  { id: 'farmers', label: '👨‍🌾 Farmers' },
  { id: 'crops',   label: '🌾 Crops'   },
  { id: 'users',   label: '👥 Users'   },
]

export default function Admin() {
  const { user } = useAuth()
  const [tab, setTab] = useState('orders')

  if (!user) return <Navigate to="/login" state={{ from: '/admin' }} replace />
  if (user.role !== 'admin') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 48 }}>🚫</div>
      <h2>Access Denied</h2>
      <p style={{ color: '#888' }}>You need admin role to access this page.</p>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fa', paddingTop: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)', padding: '28px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{ color: 'white', fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, margin: 0 }}>
            🌾 ManaHarvest Admin
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Welcome back, {user.name}</p>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        <StatsSection />
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'white', padding: 6, borderRadius: 12, width: 'fit-content', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 20px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === t.id ? '#2E7D32' : 'transparent',
              color: tab === t.id ? 'white' : '#666',
              transition: 'all .18s',
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ background: 'white', borderRadius: 14, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', minHeight: 400 }}>
          {tab === 'orders'  && <OrdersTab />}
          {tab === 'farmers' && <FarmersTab />}
          {tab === 'crops'   && <CropsTab />}
          {tab === 'users'   && <UsersTab />}
        </div>
      </div>
    </div>
  )
}