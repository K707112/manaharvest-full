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
