// src/algorithms/dynamicPricing.js
//
// ═══════════════════════════════════════════════════════
//  DYNAMIC PRICING ENGINE
//  Stage: Early startup (rules-based, no ML needed yet)
//
//  Adjusts price based on:
//    1. Stock depletion rate     (scarcity premium)
//    2. Time-to-expiry           (urgency discount)
//    3. Demand velocity          (recent order rate)
//    4. Day of week              (weekend premium)
//
//  Why not ML yet?
//    - Not enough data at seed stage
//    - Rules are explainable to farmers
//    - Easy to tune without retraining
//    - Hooks are ready to swap ML in later
// ═══════════════════════════════════════════════════════

/**
 * Calculate the dynamic multiplier for a crop's base price.
 *
 * @param {Object} crop - crop row from DB
 * @param {Object} context - { recentOrderCount, hoursSinceHarvest }
 * @returns {{ multiplier: number, reason: string, adjustedPrice: number }}
 */
export function calculatePriceMultiplier(crop, context = {}) {
  const factors = []
  let multiplier = 1.0

  // ─── Factor 1: Stock Depletion Rate ─────────────────
  // Under 30% left → scarcity premium
  // Under 10% left → high scarcity premium
  const stockPct = crop.stock_left_kg / crop.harvested_qty_kg

  if (stockPct < 0.10) {
    multiplier *= 1.25
    factors.push({ factor: 'high_scarcity', weight: '+25%' })
  } else if (stockPct < 0.30) {
    multiplier *= 1.12
    factors.push({ factor: 'scarcity', weight: '+12%' })
  } else if (stockPct > 0.80) {
    // Too much stock? Slight discount to move it
    multiplier *= 0.95
    factors.push({ factor: 'high_availability', weight: '-5%' })
  }

  // ─── Factor 2: Time to Expiry ────────────────────────
  // Crops expire in 24h. As expiry approaches, discount.
  const now = new Date()
  const expiresAt = new Date(crop.expires_at)
  const hoursLeft = (expiresAt - now) / (1000 * 60 * 60)

  if (hoursLeft < 2) {
    multiplier *= 0.60   // Last 2 hours: 40% off to clear stock
    factors.push({ factor: 'near_expiry', weight: '-40%' })
  } else if (hoursLeft < 4) {
    multiplier *= 0.80
    factors.push({ factor: 'expiry_discount', weight: '-20%' })
  } else if (hoursLeft < 6) {
    multiplier *= 0.90
    factors.push({ factor: 'mild_expiry_discount', weight: '-10%' })
  }

  // ─── Factor 3: Demand Velocity ────────────────────────
  // recentOrderCount = orders in last 1 hour for this crop
  const { recentOrderCount = 0 } = context

  if (recentOrderCount > 10) {
    multiplier *= 1.08
    factors.push({ factor: 'high_demand', weight: '+8%' })
  } else if (recentOrderCount > 5) {
    multiplier *= 1.04
    factors.push({ factor: 'moderate_demand', weight: '+4%' })
  }

  // ─── Factor 4: Day of Week ────────────────────────────
  const dayOfWeek = now.getDay()  // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

  if (isWeekend) {
    multiplier *= 1.05
    factors.push({ factor: 'weekend_premium', weight: '+5%' })
  }

  // ─── Cap multiplier between 0.5x and 1.4x ────────────
  multiplier = Math.max(0.5, Math.min(1.4, multiplier))
  const adjustedPrice = +(crop.price_per_kg * multiplier).toFixed(2)

  return {
    basePrice:     crop.price_per_kg,
    multiplier:    +multiplier.toFixed(3),
    adjustedPrice,
    factors,
    isSale:        adjustedPrice < crop.price_per_kg,
    isPremium:     adjustedPrice > crop.price_per_kg,
  }
}

/**
 * Bulk apply dynamic pricing to a list of crops.
 * Attach recentOrderCounts from cache/DB before calling.
 */
export function applyDynamicPricing(crops, orderCountMap = {}) {
  return crops.map(crop => {
    const recentOrderCount = orderCountMap[crop.id] || 0
    const pricing = calculatePriceMultiplier(crop, { recentOrderCount })
    return {
      ...crop,
      display_price:   pricing.adjustedPrice,
      original_price:  pricing.basePrice,
      pricing_factors: pricing.factors,
      is_sale:         pricing.isSale,
    }
  })
}

/*
 * ─── FUTURE: Replace rule weights with ML model ──────
 *
 * When you have 6+ months of order data:
 *
 * import { PricingModel } from '../ml/pricingModel.js'
 * const model = new PricingModel()
 * await model.load('models/pricing_v1.pkl')
 *
 * export async function calculatePriceMultiplier(crop, context) {
 *   return model.predict({ ...crop, ...context })
 * }
 */
