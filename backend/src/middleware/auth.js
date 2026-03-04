// src/middleware/auth.js
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from './errorHandler.js'

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer '))
      throw new AppError('No access token provided', 401)

    const token = header.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    // Fetch user from DB (ensures they're still active)
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, phone, role, is_active, wallet_balance')
      .eq('id', payload.sub)
      .single()

    if (error || !user)
      throw new AppError('User not found', 401)

    if (!user.is_active)
      throw new AppError('Account suspended', 403)

    req.user = user
    next()
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError)
      return next(new AppError('Invalid or expired token', 401))
    next(err)
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError('Not authenticated', 401))
    if (!roles.includes(req.user.role))
      return next(new AppError(`Access denied. Required role: ${roles.join(' or ')}`, 403))
    next()
  }
}
