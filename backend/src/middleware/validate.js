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
