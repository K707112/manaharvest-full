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
    // Console only — no file writing (Vercel is serverless, no filesystem access)
    new winston.transports.Console(),
  ],
})