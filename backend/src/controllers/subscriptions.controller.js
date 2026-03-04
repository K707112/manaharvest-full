// src/controllers/subscriptions.controller.js
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'
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
      user_id:          req.user.id,
      plan,
      price_per_week:   PLAN_PRICES[plan],
      address_id,
      delivery_slot,
      next_delivery_at: next_delivery,
    }).select().single()
    if (error) throw error

    const box = await curateWeeklyBox({ userId: req.user.id, plan })
    res.status(201).json({ success: true, data: { ...data, curated_box: box } })
  } catch (err) { next(err) }
}

export async function getMySubscription(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('subscriptions').select('*, addresses(*)')
      .eq('user_id', req.user.id).eq('is_active', true).single()
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
