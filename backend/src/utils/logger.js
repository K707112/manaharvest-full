// src/utils/logger.js
import winston from 'winston'

const { combine, timestamp, colorize, printf, json } = winston.format

const devFormat = printf(({ level, message, timestamp, ...rest }) => {
  const extra = Object.keys(rest).length ? ' ' + JSON.stringify(rest) : ''
  return `${timestamp} [${level}] ${message}${extra}`
})

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production'
    ? combine(timestamp(), json())
    : combine(timestamp({ format: 'HH:mm:ss' }), colorize(), devFormat),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
          new winston.transports.File({ filename: 'logs/combined.log' }),
        ]
      : []),
  ],
})

// ─────────────────────────────────────────────────────────
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
  { key: 'harvesting', label: 'Harvesting',       icon: '🌾', desc: 'Farm is harvesting your order' },
  { key: 'packed',     label: 'Packed',            icon: '📦', desc: 'Packed & quality checked' },
  { key: 'transit',    label: 'Out for Delivery',  icon: '🚚', desc: 'On the way to your door' },
  { key: 'delivered',  label: 'Delivered',         icon: '✅', desc: 'Order delivered successfully' },
]
