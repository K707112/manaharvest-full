// src/middleware/errorHandler.js
import { logger } from '../utils/logger.js'

export class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message)
    this.statusCode = statusCode
    this.code       = code
    this.isOperational = true
  }
}

export function errorHandler(err, req, res, _next) {
  const status = err.statusCode || 500
  const isDev  = process.env.NODE_ENV === 'development'

  // Log server errors
  if (status >= 500) {
    logger.error({
      message: err.message,
      stack:   err.stack,
      path:    req.path,
      method:  req.method,
    })
  }

  res.status(status).json({
    success: false,
    error: {
      message: err.isOperational ? err.message : 'Something went wrong',
      code:    err.code || 'INTERNAL_ERROR',
      ...(isDev && { stack: err.stack }),
    }
  })
}

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.path} not found`, code: 'NOT_FOUND' }
  })
}

// ─────────────────────────────────────────────────────────
// src/middleware/validate.js
import { validationResult } from 'express-validator'

export function validate(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code:    'VALIDATION_ERROR',
        fields:  errors.array().map(e => ({ field: e.path, message: e.msg })),
      }
    })
  }
  next()
}

// ─────────────────────────────────────────────────────────
// src/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit'

export const rateLimiter = rateLimit({
  windowMs:         parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:              parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    success: false,
    error: { message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' }
  }
})

// Stricter for OTP endpoints
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minute
  max:      3,
  message: {
    success: false,
    error: { message: 'Too many OTP requests. Wait 1 minute.', code: 'OTP_RATE_LIMITED' }
  }
})
