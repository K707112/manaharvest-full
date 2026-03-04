// src/controllers/users.controller.js
import { supabaseAdmin } from '../config/supabase.js'

export async function getProfile(req, res) {
  res.json({ success: true, data: req.user })
}

export async function updateProfile(req, res, next) {
  try {
    const allowed = ['name', 'email']
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    )
    const { data, error } = await supabaseAdmin
      .from('users').update(updates).eq('id', req.user.id).select().single()
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function getWallet(req, res, next) {
  try {
    const [userRes, txRes] = await Promise.all([
      supabaseAdmin.from('users').select('wallet_balance').eq('id', req.user.id).single(),
      supabaseAdmin.from('wallet_transactions')
        .select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(20),
    ])
    res.json({ success: true, data: { balance: userRes.data?.wallet_balance, transactions: txRes.data } })
  } catch (err) { next(err) }
}

export async function getAddresses(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('addresses').select('*').eq('user_id', req.user.id).order('is_default', { ascending: false })
    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function addAddress(req, res, next) {
  try {
    const { line1, line2, area, city, pincode, label, is_default } = req.body
    if (is_default) {
      await supabaseAdmin.from('addresses')
        .update({ is_default: false }).eq('user_id', req.user.id)
    }
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .insert({ user_id: req.user.id, line1, line2, area, city, pincode, label, is_default })
      .select().single()
    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}
