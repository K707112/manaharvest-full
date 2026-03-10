// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs:        parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:             parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  validate:        false,   // ← fixes Vercel X-Forwarded-For error
  message: {
    success: false,
    error: { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' }
  }
})

// Stricter for OTP endpoints
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max:      3,
  validate: false,        // ← fixes Vercel X-Forwarded-For error
  message: {
    success: false,
    error: { message: 'Too many OTP requests. Wait 1 minute.', code: 'OTP_RATE_LIMITED' }
  }
})