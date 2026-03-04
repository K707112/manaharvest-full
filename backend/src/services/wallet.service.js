// src/services/wallet.service.js
import { supabaseAdmin } from '../config/supabase.js'

export async function applyWallet(userId, amount, type, reason, refId) {
  const { data: user } = await supabaseAdmin
    .from('users').select('wallet_balance').eq('id', userId).single()

  const newBalance = type === 'credit'
    ? +(user.wallet_balance + amount).toFixed(2)
    : +(user.wallet_balance - amount).toFixed(2)

  if (newBalance < 0) throw new Error('Insufficient wallet balance')

  await Promise.all([
    supabaseAdmin.from('users')
      .update({ wallet_balance: newBalance }).eq('id', userId),
    supabaseAdmin.from('wallet_transactions').insert({
      user_id:       userId,
      type,
      amount,
      reason,
      ref_id:        refId,
      balance_after: newBalance,
    }),
  ])

  return newBalance
}
