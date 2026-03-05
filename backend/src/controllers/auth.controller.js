// src/controllers/auth.controller.js
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import twilio from 'twilio'
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'
import { generateReferralCode } from '../utils/helpers.js'
import { logger } from '../utils/logger.js'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const otpStore = new Map()
const OTP_TTL = 5 * 60 * 1000

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function signTokens(userId) {
  const access = jwt.sign(
    { sub: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
  const refresh = jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  )
  return { access, refresh }
}

// POST /auth/otp/send
export async function sendOtp(req, res, next) {
  try {
    const { phone, isLogin } = req.body

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (!isLogin && existingUser) {
      throw new AppError('Phone already registered. Please login.', 400, 'ALREADY_REGISTERED')
    }

    if (isLogin && !existingUser) {
      throw new AppError('No account found. Please sign up first.', 400, 'NOT_REGISTERED')
    }

    const otp = generateOtp()
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + OTP_TTL,
      attempts:  0,
    })

    await twilioClient.messages.create({
      body: `Your ManaHarvest OTP is ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to:   `+91${phone}`
    })

    logger.info(`OTP sent to ${phone}`)
    res.json({ success: true, message: 'OTP sent successfully' })
  } catch (err) {
    next(err)
  }
}

// POST /auth/otp/verify
export async function verifyOtp(req, res, next) {
  try {
    const { phone, otp, name, password, referral_code } = req.body

    const record = otpStore.get(phone)
    if (!record) throw new AppError('OTP not found or expired', 400, 'OTP_NOT_FOUND')
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone)
      throw new AppError('OTP expired. Request a new one.', 400, 'OTP_EXPIRED')
    }
    if (++record.attempts > 3) {
      otpStore.delete(phone)
      throw new AppError('Too many wrong attempts. Request a new OTP.', 400, 'OTP_MAX_ATTEMPTS')
    }
    if (record.otp !== otp) throw new AppError('Incorrect OTP', 400, 'OTP_WRONG')

    otpStore.delete(phone)

    let { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    let isNewUser = false

    if (!user) {
      // New user — create account
      isNewUser = true
      let referrerId = null

      if (referral_code) {
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('referral_code', referral_code)
          .single()
        referrerId = referrer?.id || null
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : null

      const { data: newUser, error: createErr } = await supabaseAdmin
        .from('users')
        .insert({
          phone,
          name:          name || 'ManaHarvest Customer',
          password_hash: hashedPassword,
          referral_code: generateReferralCode(),
          referred_by:   referrerId,
        })
        .select()
        .single()

      if (createErr) throw createErr
      user = newUser

      if (referrerId) {
        await supabaseAdmin.from('referrals').insert({
          referrer_id: referrerId,
          referred_id: user.id,
        })
      }
    }

    // Update last login + save password if not set yet
    const updates = { last_login_at: new Date().toISOString() }
    if (password && !user.password_hash) {
      updates.password_hash = await bcrypt.hash(password, 10)
    }

    await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', user.id)

    const { access, refresh } = signTokens(user.id)

    res.json({
      success: true,
      is_new_user: isNewUser,
      user: {
        id:             user.id,
        name:           user.name,
        phone:          user.phone,
        role:           user.role,
        wallet_balance: user.wallet_balance,
        referral_code:  user.referral_code,
      },
      tokens: { access, refresh },
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/login
export async function loginWithPassword(req, res, next) {
  try {
    const { phone, password } = req.body

    if (!phone || !password) throw new AppError('Phone and password required', 400)

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (!user) throw new AppError('No account found with this phone number', 404)
    if (!user.password_hash) throw new AppError('Please sign up first', 400)

    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) throw new AppError('Wrong password', 401)

    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id)

    const { access, refresh } = signTokens(user.id)

    res.json({
      success: true,
      user: {
        id:             user.id,
        name:           user.name,
        phone:          user.phone,
        role:           user.role,
        wallet_balance: user.wallet_balance,
        referral_code:  user.referral_code,
      },
      tokens: { access, refresh },
    })
  } catch (err) {
    next(err)
  }
}

// POST /auth/token/refresh
export async function refreshToken(req, res, next) {
  try {
    const { refresh_token } = req.body
    if (!refresh_token) throw new AppError('Refresh token required', 400)

    const payload = jwt.verify(refresh_token, process.env.JWT_SECRET)
    if (payload.type !== 'refresh') throw new AppError('Invalid token type', 401)

    const { data: user } = await supabaseAdmin
      .from('users').select('id, is_active').eq('id', payload.sub).single()

    if (!user?.is_active) throw new AppError('Account suspended', 403)

    const { access, refresh } = signTokens(user.id)
    res.json({ success: true, tokens: { access, refresh } })
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError)
      return next(new AppError('Invalid refresh token', 401))
    next(err)
  }
}

// POST /auth/logout
export async function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully' })
}