// src/config/supabase.js
// Two clients: anon (user-scoped) + service (admin operations)

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY']
required.forEach(key => {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`)
})

// ── Public client (respects RLS) ──
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: { persistSession: false },
    db:   { schema: 'public' },
  }
)

// ── Service client (bypasses RLS — server only) ──
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth:         { persistSession: false, autoRefreshToken: false },
    db:           { schema: 'public' },
    global: {
      headers: { 'x-my-custom-header': 'manaharvest-server' },
    },
  }
)

// ── Health check ──
export async function checkDbConnection() {
  const { error } = await supabase.from('crops').select('id').limit(1)
  if (error) throw new Error(`DB connection failed: ${error.message}`)
  return true
}
