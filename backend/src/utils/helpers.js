// src/utils/helpers.js
import { v4 as uuidv4 } from 'uuid'

export function generateReferralCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function paginate(page = 1, limit = 20) {
  const offset = (page - 1) * limit
  return { limit: Math.min(limit, 100), offset }
}

export function toIST(date = new Date()) {
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
}

export const trackingStepsConfig = [
  { key: 'harvesting', label: 'Harvesting',      icon: '🌾', desc: 'Farm is harvesting your order' },
  { key: 'packed',     label: 'Packed',           icon: '📦', desc: 'Packed & quality checked' },
  { key: 'transit',    label: 'Out for Delivery', icon: '🚚', desc: 'On the way to your door' },
  { key: 'delivered',  label: 'Delivered',        icon: '✅', desc: 'Order delivered successfully' },
]
