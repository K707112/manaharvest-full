// src/services/inventory.service.js
import { supabaseAdmin } from '../config/supabase.js'

export async function deductInventory(items) {
  // Ideally use a Postgres function/transaction. Using sequential updates for now.
  for (const item of items) {
    const { error } = await supabaseAdmin.rpc('decrement_stock', {
      p_crop_id: item.crop_id,
      p_qty:     item.qty_kg,
    })
    if (error) throw error
  }
}
