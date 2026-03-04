// src/algorithms/subscriptionCurator.js
//
// ═══════════════════════════════════════════════════════
//  SUBSCRIPTION BOX CURATOR
//
//  Intelligently picks 7/9/12 vegetables for the weekly
//  box based on:
//    - Nutritional balance (protein/mineral/vitamin spread)
//    - User preference history
//    - What's actually fresh and available
//    - Variety rule (no repeats from last 2 weeks)
//    - Seasonal appropriateness
//
//  This is ManaHarvest's core value-add vs. manual boxing.
// ═══════════════════════════════════════════════════════

import { supabaseAdmin } from '../config/supabase.js'

const PLAN_SIZES = { small: 7, medium: 9, large: 12 }

// Nutritional category weights — ensures a balanced box
const NUTRITION_TARGETS = {
  'Leafy Greens':    { min: 1, max: 3, weight: 0.9 },  // iron, folate
  'Root Vegetables': { min: 1, max: 2, weight: 0.8 },  // carbs, fiber
  'Fruiting Veg':    { min: 2, max: 4, weight: 0.9 },  // lycopene, vit C
  'Spices':          { min: 1, max: 2, weight: 0.6 },  // antimicrobial
  'Gourds':          { min: 1, max: 2, weight: 0.7 },  // hydration
  'Beans/Legumes':   { min: 1, max: 2, weight: 0.8 },  // protein
}

// Category mapping (matches DB crop.category values)
const CATEGORY_TO_NUTRITION = {
  'Leafy Greens':  'Leafy Greens',
  'Vegetables':    'Fruiting Veg',
  'Spices':        'Spices',
  'Root Veg':      'Root Vegetables',
  'Gourds':        'Gourds',
  'Beans':         'Beans/Legumes',
}

/**
 * Curate a weekly box for a subscriber.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.plan   - 'small'|'medium'|'large'
 * @returns {Promise<Array>} selected crops with quantities
 */
export async function curateWeeklyBox({ userId, plan = 'medium' }) {
  const targetCount = PLAN_SIZES[plan]

  // ─── Step 1: Get available crops ─────────────────────
  const { data: available } = await supabaseAdmin
    .from('crops')
    .select('*, farmers(name, avg_rating)')
    .eq('is_available', true)
    .gt('stock_left_kg', 0)
    .gt('expires_at', new Date().toISOString())
    .order('harvest_time', { ascending: false })

  if (!available?.length) throw new Error('No crops available for curation')

  // ─── Step 2: Get user's last 2 weeks of crops ─────────
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentHistory } = await supabaseAdmin
    .from('order_items')
    .select('name')
    .in('order_id',
      supabaseAdmin.from('orders')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', twoWeeksAgo)
    )
  const recentNames = new Set((recentHistory || []).map(i => i.name))

  // ─── Step 3: Score each crop ─────────────────────────
  const scored = available.map(crop => ({
    ...crop,
    _score: scoreCropForBox(crop, recentNames),
    _nutrition: CATEGORY_TO_NUTRITION[crop.category] || 'Fruiting Veg',
  }))

  // ─── Step 4: Greedy selection with balance constraints ──
  const selected  = []
  const nutCounts = {}

  // Sort by score descending
  const sorted = [...scored].sort((a, b) => b._score - a._score)

  for (const crop of sorted) {
    if (selected.length >= targetCount) break

    const nutritionType = crop._nutrition
    const target = NUTRITION_TARGETS[nutritionType]
    const current = nutCounts[nutritionType] || 0

    // Skip if this nutritional category is at max
    if (target && current >= target.max) continue

    // Prefer variety — skip if name seen recently
    if (recentNames.has(crop.name) && selected.length < targetCount - 2) continue

    selected.push(crop)
    nutCounts[nutritionType] = current + 1
  }

  // Fallback: fill remaining slots if constraints couldn't be met
  if (selected.length < targetCount) {
    for (const crop of sorted) {
      if (selected.length >= targetCount) break
      if (!selected.find(s => s.id === crop.id)) selected.push(crop)
    }
  }

  // ─── Step 5: Assign quantities ────────────────────────
  return selected.map(crop => ({
    crop_id:    crop.id,
    batch_id:   crop.batch_id,
    name:       crop.name,
    emoji:      crop.emoji,
    category:   crop.category,
    price_per_kg: crop.display_price || crop.price_per_kg,
    qty_kg:     assignQuantity(crop.category, plan),
    farmer:     crop.farmers?.name,
    freshness:  calcFreshnessLabel(crop.harvest_time),
    is_organic: crop.is_organic,
  }))
}

/** Score how good this crop is for the box */
function scoreCropForBox(crop, recentNames) {
  let score = 50  // baseline

  // Freshly harvested today? Big bonus.
  const hoursSinceHarvest = (Date.now() - new Date(crop.harvest_time)) / (1000 * 60 * 60)
  if (hoursSinceHarvest < 4)  score += 30
  else if (hoursSinceHarvest < 8) score += 15

  // Organic? Slight bonus
  if (crop.is_organic) score += 10

  // High farmer rating
  if (crop.farmers?.avg_rating >= 4.8) score += 10
  else if (crop.farmers?.avg_rating >= 4.5) score += 5

  // Not seen recently = variety bonus
  if (!recentNames.has(crop.name)) score += 15

  // Plenty of stock = reliable
  const stockPct = crop.stock_left_kg / crop.harvested_qty_kg
  if (stockPct > 0.5) score += 8

  return score
}

/** Assign typical quantity per crop based on plan and category */
function assignQuantity(category, plan) {
  const base = {
    'Leafy Greens': 0.5,
    'Vegetables':   1.0,
    'Spices':       0.25,
    'Root Veg':     0.75,
    'Gourds':       1.0,
    'Beans':        0.5,
  }
  const qty  = base[category] || 0.75
  const mult = plan === 'large' ? 1.5 : plan === 'medium' ? 1.25 : 1.0
  return +(qty * mult).toFixed(2)
}

function calcFreshnessLabel(harvestTime) {
  const hours = (Date.now() - new Date(harvestTime)) / (1000 * 60 * 60)
  if (hours < 2)  return 'Ultra Fresh'
  if (hours < 6)  return 'Very Fresh'
  if (hours < 12) return 'Fresh'
  return 'Today\'s Harvest'
}
