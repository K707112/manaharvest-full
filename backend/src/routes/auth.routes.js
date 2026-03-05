// src/routes/auth.routes.js
import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import {
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
  loginWithPassword,
} from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

// POST /auth/otp/send  — send OTP to phone number
router.post('/otp/send',
  body('phone').isMobilePhone('en-IN').withMessage('Valid Indian phone number required'),
  validate,
  sendOtp
)

// POST /auth/otp/verify  — verify OTP, returns access + refresh token
router.post('/otp/verify',
  body('phone').isMobilePhone('en-IN'),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('6-digit OTP required'),
  body('name').optional().isString().trim(),
  body('password').optional().isString(),
  validate,
  verifyOtp
)

// POST /auth/login  — login with phone + password
router.post('/login',
  body('phone').isMobilePhone('en-IN').withMessage('Valid Indian phone number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  loginWithPassword
)

// POST /auth/token/refresh  — get new access token
router.post('/token/refresh', refreshToken)

// POST /auth/logout  — invalidate refresh token
router.post('/logout', authenticate, logout)

export default router