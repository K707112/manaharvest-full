// src/services/pricing.service.js
import { supabaseAdmin } from '../config/supabase.js'

const DELIVERY_FEE = 0  // Free delivery always (for now)

export async function calculateOrderTotal(orderItems, userId, useWallet) {
  const subtotal     = orderItems.reduce((sum, i) => sum + i.subtotal, 0)
  const deliveryFee  = DELIVERY_FEE

  let walletDeduction = 0
  if (useWallet) {
    const { data: user } = await supabaseAdmin
      .from('users').select('wallet_balance').eq('id', userId).single()
    walletDeduction = Math.min(user?.wallet_balance || 0, subtotal + deliveryFee)
  }

  return {
    subtotal:         +subtotal.toFixed(2),
    deliveryFee,
    walletDeduction:  +walletDeduction.toFixed(2),
    total:            +(subtotal + deliveryFee - walletDeduction).toFixed(2),
  }
}

// ─────────────────────────────────────────────────────────
// src/services/inventory.service.js
export async function deductInventory(items) {
  // Ideally use a Postgres function/transaction. Using sequential updates for now.
  for (const item of items) {
    const { error } = await supabaseAdmin.rpc('decrement_stock', {
      p_crop_id: item.crop_id,
      p_qty:     item.qty_kg,
    })
    // Fallback if RPC not available:
    // await supabaseAdmin.from('crops')
    //   .update({ stock_left_kg: supabaseAdmin.raw('stock_left_kg - ?', [item.qty_kg]) })
    //   .eq('id', item.crop_id)
    if (error) throw error
  }
}

// ─────────────────────────────────────────────────────────
// src/services/wallet.service.js
export async function applyWallet(userId, amount, type, reason, refId) {
  // Get current balance
  const { data: user } = await supabaseAdmin
    .from('users').select('wallet_balance').eq('id', userId).single()

  const newBalance = type === 'credit'
    ? +(user.wallet_balance + amount).toFixed(2)
    : +(user.wallet_balance - amount).toFixed(2)

  if (newBalance < 0) throw new Error('Insufficient wallet balance')

  // Update balance + record transaction
  await Promise.all([
    supabaseAdmin.from('users')
      .update({ wallet_balance: newBalance }).eq('id', userId),
    supabaseAdmin.from('wallet_transactions').insert({
      user_id:       userId,
      type,
      amount,
      reason,
      ref_id:        refId,
      balance_after: newBalance,
    }),
  ])

  return newBalance
}

// ─────────────────────────────────────────────────────────
// src/services/notifications.service.js
import { logger } from '../utils/logger.js'

export async function notifyOrderCreated(order, user) {
  // TODO: integrate SMS (MSG91 / Twilio) and/or WhatsApp
  logger.info(`📱 Notify ${user.phone}: Order ${order.order_number} placed`)
  // await smsGateway.send(user.phone, `Your order ${order.order_number} is being harvested!`)
}

export async function notifyStatusUpdate(order, user, newStatus) {
  const messages = {
    packed:    `📦 ${order.order_number} is packed and ready for delivery!`,
    transit:   `🚚 ${order.order_number} is on the way. Estimated: ${order.estimated_at}`,
    delivered: `✅ Delivered! Rate your experience.`,
  }
  const msg = messages[newStatus]
  if (msg) {
    logger.info(`📱 Notify ${user.phone}: ${msg}`)
    // await smsGateway.send(user.phone, msg)
  }
}
