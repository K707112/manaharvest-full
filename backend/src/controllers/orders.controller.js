// src/controllers/orders.controller.js
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'
import { calculateOrderTotal } from '../services/pricing.service.js'
import { deductInventory }     from '../services/inventory.service.js'
import { applyWallet }         from '../services/wallet.service.js'
import { notifyOrderCreated }  from '../services/notifications.service.js'
import { logger } from '../utils/logger.js'

// GET /orders
export async function getMyOrders(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        id, order_number, status, total, payment_status,
        delivery_slot, estimated_at, delivered_at, created_at,
        order_items ( id, name, qty_kg, price_per_kg, subtotal, batch_id )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// GET /orders/:id
export async function getOrderById(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items ( * ),
        addresses ( label, line1, line2, area, city, pincode )
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)   // Ownership check
      .single()

    if (error || !data) throw new AppError('Order not found', 404)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

// POST /orders — atomic order creation
export async function createOrder(req, res, next) {
  try {
    const { items, address_id, delivery_slot, use_wallet = false } = req.body
    const userId = req.user.id

    // 1. Validate all crops exist and have sufficient stock
    const cropIds = items.map(i => i.crop_id)
    const { data: crops, error: cropErr } = await supabaseAdmin
      .from('crops')
      .select('id, name, price_per_kg, stock_left_kg, is_available, expires_at, batch_id')
      .in('id', cropIds)

    if (cropErr) throw cropErr

    for (const item of items) {
      const crop = crops.find(c => c.id === item.crop_id)
      if (!crop)             throw new AppError(`Crop ${item.crop_id} not found`, 404)
      if (!crop.is_available) throw new AppError(`${crop.name} is no longer available`, 400, 'CROP_UNAVAILABLE')
      if (new Date(crop.expires_at) < new Date())
        throw new AppError(`${crop.name} has expired for today`, 400, 'CROP_EXPIRED')
      if (crop.stock_left_kg < item.qty_kg)
        throw new AppError(`Only ${crop.stock_left_kg}kg of ${crop.name} remaining`, 400, 'INSUFFICIENT_STOCK')
    }

    // 2. Validate address belongs to user
    const { data: address } = await supabaseAdmin
      .from('addresses').select('id').eq('id', address_id).eq('user_id', userId).single()
    if (!address) throw new AppError('Address not found', 404)

    // 3. Calculate totals
    const orderItems = items.map(item => {
      const crop = crops.find(c => c.id === item.crop_id)
      return {
        crop_id:      item.crop_id,
        batch_id:     crop.batch_id,
        name:         crop.name,
        qty_kg:       item.qty_kg,
        price_per_kg: crop.price_per_kg,
        subtotal:     +(item.qty_kg * crop.price_per_kg).toFixed(2),
      }
    })

    const { subtotal, deliveryFee, walletDeduction, total } =
      await calculateOrderTotal(orderItems, userId, use_wallet)

    // 4. Create order (database transaction via RPC ideally — using sequential inserts for now)
    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id:       userId,
        address_id,
        delivery_slot,
        status:        'harvesting',
        subtotal,
        delivery_fee:  deliveryFee,
        wallet_used:   walletDeduction,
        total,
        payment_status: total === 0 ? 'paid' : 'pending',
      })
      .select()
      .single()

    if (orderErr) throw orderErr

    // 5. Insert order items
    const { error: itemErr } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems.map(i => ({ ...i, order_id: order.id })))

    if (itemErr) throw itemErr

    // 6. Deduct inventory atomically
    await deductInventory(items)

    // 7. Deduct wallet if used
    if (walletDeduction > 0) {
      await applyWallet(userId, walletDeduction, 'debit', 'order_payment', order.id)
    }

    // 8. Record status history
    await supabaseAdmin.from('order_status_history').insert({
      order_id: order.id, status: 'harvesting', note: 'Order placed'
    })

    // 9. Notify (async, non-blocking)
    notifyOrderCreated(order, req.user).catch(e => logger.warn('Notify failed:', e.message))

    res.status(201).json({
      success: true,
      data: { ...order, order_items: orderItems },
      message: `Order ${order.order_number} placed successfully!`,
    })

  } catch (err) { next(err) }
}

// PATCH /orders/:id/status  (admin/farmer)
export async function updateOrderStatus(req, res, next) {
  try {
    const { status, note } = req.body

    const STATUS_FLOW = {
      harvesting: ['packed','cancelled'],
      packed:     ['transit','cancelled'],
      transit:    ['delivered'],
      delivered:  [],
      cancelled:  [],
    }

    const { data: order } = await supabaseAdmin
      .from('orders').select('status').eq('id', req.params.id).single()

    if (!order) throw new AppError('Order not found', 404)
    if (!STATUS_FLOW[order.status]?.includes(status))
      throw new AppError(`Cannot transition ${order.status} → ${status}`, 400, 'INVALID_STATUS_TRANSITION')

    const updates = { status }
    if (status === 'delivered') updates.delivered_at = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    await supabaseAdmin.from('order_status_history').insert({
      order_id: req.params.id, status, note, changed_by: req.user.id
    })

    // Grant cashback on delivery (5% for medium plan subscribers)
    if (status === 'delivered') {
      await grantDeliveryCashback(data)
    }

    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function cancelOrder(req, res, next) {
  try {
    const { data: order } = await supabaseAdmin
      .from('orders').select('*').eq('id', req.params.id).eq('user_id', req.user.id).single()

    if (!order) throw new AppError('Order not found', 404)
    if (!['harvesting','packed'].includes(order.status))
      throw new AppError('Order cannot be cancelled at this stage', 400)

    await supabaseAdmin.from('orders').update({ status: 'cancelled' }).eq('id', req.params.id)

    // Refund to wallet if already paid
    if (order.payment_status === 'paid') {
      await applyWallet(order.user_id, order.total, 'credit', 'cancellation_refund', order.id)
    }

    res.json({ success: true, message: 'Order cancelled and refunded to wallet.' })
  } catch (err) { next(err) }
}

export async function reorder(req, res, next) {
  try {
    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('order_items(*), address_id, delivery_slot')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single()

    if (!order) throw new AppError('Original order not found', 404)

    // Get current crop IDs by name (batch IDs change daily)
    const names = order.order_items.map(i => i.name)
    const { data: todayCrops } = await supabaseAdmin
      .from('crops')
      .select('id, name, stock_left_kg')
      .in('name', names)
      .eq('is_available', true)
      .gt('stock_left_kg', 0)

    const items = order.order_items
      .map(item => {
        const crop = todayCrops?.find(c => c.name === item.name)
        if (!crop || crop.stock_left_kg < item.qty_kg) return null
        return { crop_id: crop.id, qty_kg: item.qty_kg }
      })
      .filter(Boolean)

    if (items.length === 0)
      throw new AppError('None of your previous items are available today', 400, 'REORDER_UNAVAILABLE')

    req.body = { items, address_id: order.address_id, delivery_slot: order.delivery_slot }
    return createOrder(req, res, next)
  } catch (err) { next(err) }
}

async function grantDeliveryCashback(order) {
  const { data: sub } = await supabaseAdmin
    .from('subscriptions')
    .select('plan')
    .eq('user_id', order.user_id)
    .eq('is_active', true)
    .single()

  const cashbackPct = sub?.plan === 'medium' ? 0.05 : sub?.plan === 'large' ? 0.10 : 0
  if (cashbackPct === 0) return

  const cashback = +(order.subtotal * cashbackPct).toFixed(2)
  await applyWallet(order.user_id, cashback, 'credit', 'delivery_cashback', order.id)
}
