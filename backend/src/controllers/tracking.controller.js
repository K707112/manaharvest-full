// src/controllers/tracking.controller.js
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'
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
        step_index:   stepIndex,
        steps:        trackingStepsConfig,
        is_delivered: data.status === 'delivered',
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
