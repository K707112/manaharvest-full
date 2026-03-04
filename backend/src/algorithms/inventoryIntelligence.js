// src/algorithms/inventoryIntelligence.js
//
// ═══════════════════════════════════════════════════════
//  INVENTORY INTELLIGENCE
//
//  1. Freshness Score   — how fresh is this batch right now
//  2. Depletion Rate    — how fast is it selling
//  3. Sell-Through Prediction — will it sell out before expiry?
//  4. Restock Alerts    — notify farmer to harvest more
//  5. Waste Risk Score  — predict unsold stock
// ═══════════════════════════════════════════════════════

import { supabaseAdmin } from '../config/supabase.js'
import { logger } from '../utils/logger.js'

/**
 * Freshness score: 100 at harvest, drops to 0 at expiry.
 * Decay curve is non-linear — quality drops faster as time passes.
 *
 * @param {string} harvestTime  ISO string
 * @param {string} expiresAt    ISO string
 * @returns {number} 0–100
 */
export function calculateFreshnessScore(harvestTime, expiresAt) {
  const now       = Date.now()
  const harvested = new Date(harvestTime).getTime()
  const expires   = new Date(expiresAt).getTime()
  const totalLife = expires - harvested

  if (now >= expires) return 0
  if (now <= harvested) return 100

  const elapsed = now - harvested
  const ratio   = elapsed / totalLife  // 0 = just harvested, 1 = expired

  // Exponential decay — faster drop in last 25% of life
  const score = Math.round(100 * Math.pow(1 - ratio, 1.5))
  return Math.max(0, Math.min(100, score))
}

/**
 * Estimate the depletion rate (kg sold per hour)
 * based on the rate between harvest_time and now.
 *
 * @param {Object} crop
 * @returns {{ kgPerHour: number, projectedSellout: Date|null }}
 */
export function estimateDepletionRate(crop) {
  const now          = Date.now()
  const harvestTime  = new Date(crop.harvest_time).getTime()
  const hoursElapsed = (now - harvestTime) / (1000 * 60 * 60)

  if (hoursElapsed < 0.1) return { kgPerHour: 0, projectedSellout: null }

  const kgSold      = crop.harvested_qty_kg - crop.stock_left_kg
  const kgPerHour   = kgSold / hoursElapsed

  let projectedSellout = null
  if (kgPerHour > 0 && crop.stock_left_kg > 0) {
    const hoursToSellout = crop.stock_left_kg / kgPerHour
    projectedSellout     = new Date(now + hoursToSellout * 60 * 60 * 1000)
  }

  return {
    kgPerHour: +kgPerHour.toFixed(3),
    projectedSellout,
    kgSold: +kgSold.toFixed(2),
    sellThrough: +((kgSold / crop.harvested_qty_kg) * 100).toFixed(1),
  }
}

/**
 * Waste risk: will stock expire unsold?
 * Returns a risk level + recommendation.
 *
 * @param {Object} crop
 * @returns {{ riskLevel: 'low'|'medium'|'high', action: string }}
 */
export function assessWasteRisk(crop) {
  const { kgPerHour, projectedSellout } = estimateDepletionRate(crop)
  const expiresAt = new Date(crop.expires_at)

  if (crop.stock_left_kg === 0) {
    return { riskLevel: 'none', action: 'Sold out', wasted_kg: 0 }
  }

  // Selling fast enough to clear before expiry
  if (projectedSellout && projectedSellout < expiresAt) {
    return { riskLevel: 'low', action: 'On track to sell out', wasted_kg: 0 }
  }

  // Estimate unsold kg at expiry
  const hoursLeft  = (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
  const willSell   = kgPerHour * hoursLeft
  const wastedKg   = Math.max(0, crop.stock_left_kg - willSell)
  const wastedPct  = wastedKg / crop.harvested_qty_kg

  if (wastedPct > 0.5) {
    return {
      riskLevel: 'high',
      action: `Apply urgency discount. Estimated waste: ${wastedKg.toFixed(1)}kg`,
      wasted_kg: +wastedKg.toFixed(2),
    }
  } else if (wastedPct > 0.2) {
    return {
      riskLevel: 'medium',
      action: `Consider 10% discount in next 2 hours`,
      wasted_kg: +wastedKg.toFixed(2),
    }
  }
  return { riskLevel: 'low', action: 'Selling normally', wasted_kg: 0 }
}

/**
 * Run full intelligence scan on all active crops.
 * Called by cron job every 30 minutes.
 * Flags crops that need price adjustments or alerts.
 */
export async function runInventoryIntelligence() {
  const { data: crops, error } = await supabaseAdmin
    .from('crops')
    .select('*')
    .eq('is_available', true)
    .gt('expires_at', new Date().toISOString())

  if (error || !crops) return

  const alerts = []

  for (const crop of crops) {
    const freshness  = calculateFreshnessScore(crop.harvest_time, crop.expires_at)
    const depletion  = estimateDepletionRate(crop)
    const wasteRisk  = assessWasteRisk(crop)

    // Mark as unavailable if expired or out of stock
    if (freshness === 0 || crop.stock_left_kg <= 0) {
      await supabaseAdmin
        .from('crops').update({ is_available: false }).eq('id', crop.id)
      continue
    }

    // Flag high waste risk
    if (wasteRisk.riskLevel === 'high') {
      alerts.push({
        crop_id:    crop.id,
        crop_name:  crop.name,
        batch_id:   crop.batch_id,
        alert_type: 'waste_risk',
        message:    wasteRisk.action,
        data:       { ...depletion, ...wasteRisk, freshness },
      })

      logger.warn(`⚠️ Waste risk: ${crop.name} (${crop.batch_id}) — ${wasteRisk.action}`)
    }
  }

  return alerts
}
