// src/controllers/farmers.controller.js
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'

export async function listFarmers(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers')
      .select('id, name, village, district, speciality, years_farming, avg_rating, total_orders, is_verified, land_acres')
      .eq('is_active', true)
      .order('avg_rating', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function getFarmerById(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers').select('*').eq('id', req.params.id).single()
    if (error || !data) throw new AppError('Farmer not found', 404)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function getFarmerCrops(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('crops')
      .select('id, batch_id, name, emoji, price_per_kg, stock_left_kg, harvest_time, is_available')
      .eq('farmer_id', req.params.id)
      .eq('is_available', true)
      .gt('expires_at', new Date().toISOString())
    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// src/controllers/users.controller.js
export async function getProfile(req, res) {
  res.json({ success: true, data: req.user })
}

export async function updateProfile(req, res, next) {
  try {
    const allowed = ['name', 'email']
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )
    const { data, error } = await supabaseAdmin
      .from('users').update(updates).eq('id', req.user.id).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function getWallet(req, res, next) {
  try {
    const [userRes, txRes] = await Promise.all([
      supabaseAdmin.from('users').select('wallet_balance').eq('id', req.user.id).single(),
      supabaseAdmin.from('wallet_transactions')
        .select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(20),
    ])
    res.json({ success: true, data: { balance: userRes.data?.wallet_balance, transactions: txRes.data } })
  } catch (err) { next(err) }
}

export async function getAddresses(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('addresses').select('*').eq('user_id', req.user.id).order('is_default', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function addAddress(req, res, next) {
  try {
    const { line1, line2, area, city, pincode, label, is_default } = req.body
    if (is_default) {
      await supabaseAdmin.from('addresses')
        .update({ is_default: false }).eq('user_id', req.user.id)
    }
    const { data, error } = await supabaseAdmin
      .from('addresses').insert({ user_id: req.user.id, line1, line2, area, city, pincode, label, is_default }).select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// src/controllers/tracking.controller.js
import { trackingStepsConfig } from '../utils/helpers.js'

export async function trackOrder(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('id, order_number, status, estimated_at, delivered_at, delivery_slot, order_items(name, qty_kg), addresses(line1, area, city)')
      .eq('order_number', req.params.orderNumber)
      .eq('user_id', req.user.id)
      .single()

    if (error || !data) throw new AppError('Order not found', 404)

    const stepIndex = trackingStepsConfig.findIndex(s => s.key === data.status)
    res.json({
      success: true,
      data: {
        ...data,
        step_index:     stepIndex,
        steps:          trackingStepsConfig,
        is_delivered:   data.status === 'delivered',
      }
    })
  } catch (err) { next(err) }
}

export async function getStatusHistory(req, res, next) {
  try {
    const { data: order } = await supabaseAdmin
      .from('orders').select('id').eq('order_number', req.params.orderNumber).eq('user_id', req.user.id).single()
    if (!order) throw new AppError('Order not found', 404)

    const { data, error } = await supabaseAdmin
      .from('order_status_history').select('status, note, created_at').eq('order_id', order.id).order('created_at')
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// src/controllers/recommendations.controller.js
import { getPersonalizedRecommendations, getSimilarCrops } from '../algorithms/recommendations.js'

export async function getRecommendations(req, res, next) {
  try {
    const exclude = req.query.exclude?.split(',') || []
    const data = await getPersonalizedRecommendations(req.user.id, exclude)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function trackEvent(req, res, next) {
  try {
    const { event_type, crop_id, metadata } = req.body
    await supabaseAdmin.from('user_events').insert({
      user_id: req.user.id, session_id: req.headers['x-session-id'],
      event_type, crop_id, metadata,
    })
    res.json({ success: true })
  } catch (err) { next(err) }
}

// ─────────────────────────────────────────────────────────
// src/controllers/subscriptions.controller.js
import { curateWeeklyBox } from '../algorithms/subscriptionCurator.js'

const PLAN_PRICES = { small: 399, medium: 699, large: 999 }

export async function createSubscription(req, res, next) {
  try {
    const { plan, address_id, delivery_slot } = req.body
    const { data: existing } = await supabaseAdmin
      .from('subscriptions').select('id').eq('user_id', req.user.id).eq('is_active', true).single()
    if (existing) throw new AppError('Active subscription already exists', 400)

    const next_delivery = getNextDeliveryDate(delivery_slot)
    const { data, error } = await supabaseAdmin.from('subscriptions').insert({
      user_id: req.user.id, plan, price_per_week: PLAN_PRICES[plan],
      address_id, delivery_slot, next_delivery_at: next_delivery,
    }).select().single()
    if (error) throw error

    // Auto-curate first box
    const box = await curateWeeklyBox({ userId: req.user.id, plan })
    res.status(201).json({ success: true, data: { ...data, curated_box: box } })
  } catch (err) { next(err) }
}

export async function getMySubscription(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions').select('*, addresses(*)').eq('user_id', req.user.id).eq('is_active', true).single()
    if (error || !data) return res.json({ success: true, data: null, message: 'No active subscription' })
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function pauseSubscription(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('subscriptions')
      .update({ paused_until: req.body.pause_until })
      .eq('id', req.params.id).eq('user_id', req.user.id).select().single()
    if (error) throw error
    res.json({ success: true, data, message: `Subscription paused until ${req.body.pause_until}` })
  } catch (err) { next(err) }
}

export async function cancelSubscription(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('subscriptions')
      .update({ is_active: false, cancelled_at: new Date() })
      .eq('id', req.params.id).eq('user_id', req.user.id).select().single()
    if (error) throw error
    res.json({ success: true, data, message: 'Subscription cancelled' })
  } catch (err) { next(err) }
}

export async function updateSubscription(req, res, next) {
  try {
    const updates = {}
    if (req.body.plan) {
      updates.plan = req.body.plan
      updates.price_per_week = PLAN_PRICES[req.body.plan]
    }
    if (req.body.delivery_slot) updates.delivery_slot = req.body.delivery_slot
    const { data, error } = await supabaseAdmin.from('subscriptions')
      .update(updates).eq('id', req.params.id).eq('user_id', req.user.id).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

function getNextDeliveryDate(slot) {
  const next = new Date()
  next.setDate(next.getDate() + (7 - next.getDay()) % 7 || 7)  // next Sunday
  if (slot === 'morning') next.setHours(8, 0, 0, 0)
  else if (slot === 'afternoon') next.setHours(13, 0, 0, 0)
  else next.setHours(17, 0, 0, 0)
  return next.toISOString()
}

// ─────────────────────────────────────────────────────────
// src/controllers/admin.controller.js
export async function getDashboardStats(req, res, next) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const [ordersRes, usersRes, cropsRes, revenueRes] = await Promise.all([
      supabaseAdmin.from('orders').select('id', { count: 'exact' }).gte('created_at', today),
      supabaseAdmin.from('users').select('id', { count: 'exact' }),
      supabaseAdmin.from('crops').select('id', { count: 'exact' }).eq('is_available', true),
      supabaseAdmin.from('orders').select('total').gte('created_at', today).eq('payment_status', 'paid'),
    ])
    const todayRevenue = (revenueRes.data || []).reduce((s, o) => s + o.total, 0)
    res.json({ success: true, data: {
      today_orders:  ordersRes.count,
      total_users:   usersRes.count,
      active_crops:  cropsRes.count,
      today_revenue: +todayRevenue.toFixed(2),
    }})
  } catch (err) { next(err) }
}

export async function listAllOrders(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders').select('*, users(name, phone), order_items(name, qty_kg)')
      .order('created_at', { ascending: false }).limit(50)
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function verifyFarmer(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('farmers').update({ is_verified: true }).eq('id', req.params.id).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}
