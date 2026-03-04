// src/controllers/admin.controller.js
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'

// ── DASHBOARD STATS ─────────────────────────────────────────
export async function getDashboardStats(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const [ordersRes, usersRes, cropsRes, revenueRes, farmersRes, pendingRes] = await Promise.all([
      supabaseAdmin.from('orders').select('id', { count: 'exact' }).gte('created_at', today),
      supabaseAdmin.from('users').select('id', { count: 'exact' }),
      supabaseAdmin.from('crops').select('id', { count: 'exact' }).eq('is_available', true),
      supabaseAdmin.from('orders').select('total').gte('created_at', today).eq('payment_status', 'paid'),
      supabaseAdmin.from('farmers').select('id', { count: 'exact' }).eq('is_active', true),
      supabaseAdmin.from('orders').select('id', { count: 'exact' }).eq('status', 'harvesting'),
    ])
    const todayRevenue = (revenueRes.data || []).reduce((s, o) => s + Number(o.total), 0)
    res.json({
      success: true,
      data: {
        today_orders:   ordersRes.count  || 0,
        total_users:    usersRes.count   || 0,
        active_crops:   cropsRes.count   || 0,
        today_revenue:  +todayRevenue.toFixed(2),
        total_farmers:  farmersRes.count || 0,
        pending_orders: pendingRes.count || 0,
      }
    })
  } catch (err) { next(err) }
}

// ── ORDERS ──────────────────────────────────────────────────
export async function listAllOrders(req, res, next) {
  try {
    const { status, limit = 50, offset = 0 } = req.query
    let query = supabaseAdmin
      .from('orders')
      .select('*, users(name, phone), order_items(name, qty_kg, price_per_kg, subtotal)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status, note } = req.body
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, ...(status === 'delivered' ? { delivered_at: new Date().toISOString() } : {}) })
      .eq('id', req.params.id)
      .select('*, users(name, phone)')
      .single()
    if (error) throw error
    await supabaseAdmin.from('order_status_history').insert({
      order_id: req.params.id, status, note: note || `Status updated to ${status}`, changed_by: req.user.id
    })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// ── FARMERS ─────────────────────────────────────────────────
export async function listAllFarmers(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function createFarmer(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .insert(req.body)
      .select()
      .single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

export async function updateFarmer(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function verifyFarmer(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .update({ is_verified: true })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function deleteFarmer(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from('farmers')
      .update({ is_active: false })
      .eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true, message: 'Farmer deactivated' })
  } catch (err) { next(err) }
}

// ── CROPS ────────────────────────────────────────────────────
export async function listAllCrops(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('crops')
      .select('*, farmers(name, village)')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function createCrop(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('crops')
      .insert({
        ...req.body,
        harvest_time: req.body.harvest_time || new Date().toISOString(),
        expires_at:   req.body.expires_at   || new Date(Date.now() + 86400000).toISOString(),
      })
      .select('*, farmers(name)')
      .single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

export async function updateCrop(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('crops')
      .update(req.body)
      .eq('id', req.params.id)
      .select('*, farmers(name)')
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function deleteCrop(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from('crops')
      .update({ is_available: false })
      .eq('id', req.params.id)
    if (error) throw error
    res.json({ success: true, message: 'Crop removed from listing' })
  } catch (err) { next(err) }
}

// ── USERS ────────────────────────────────────────────────────
export async function listAllUsers(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, phone, email, role, wallet_balance, referral_code, is_active, created_at, last_login_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const { data: user } = await supabaseAdmin.from('users').select('is_active').eq('id', req.params.id).single()
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', req.params.id)
      .select()
      .single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
