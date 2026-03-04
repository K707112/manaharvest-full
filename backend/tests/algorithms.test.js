// tests/algorithms.test.js
import { calculatePriceMultiplier } from '../src/algorithms/dynamicPricing.js'
import { calculateFreshnessScore, estimateDepletionRate, assessWasteRisk } from '../src/algorithms/inventoryIntelligence.js'

const now = new Date()
const makeTime = (hoursAgo) => new Date(now - hoursAgo * 3600000).toISOString()
const makeExpiry = (hoursFromNow) => new Date(now.getTime() + hoursFromNow * 3600000).toISOString()

// ── Dynamic Pricing ──────────────────────────────────────
describe('Dynamic Pricing', () => {
  test('no multiplier change for normal stock and plenty of time', () => {
    const crop = {
      price_per_kg: 34, harvested_qty_kg: 80, stock_left_kg: 60,
      harvest_time: makeTime(2), expires_at: makeExpiry(20),
    }
    const result = calculatePriceMultiplier(crop)
    expect(result.multiplier).toBeGreaterThan(0.85)
    expect(result.multiplier).toBeLessThan(1.15)
  })

  test('scarcity premium when < 30% stock left', () => {
    const crop = {
      price_per_kg: 34, harvested_qty_kg: 80, stock_left_kg: 10,
      harvest_time: makeTime(2), expires_at: makeExpiry(20),
    }
    const result = calculatePriceMultiplier(crop)
    expect(result.multiplier).toBeGreaterThanOrEqual(1.12)
    expect(result.isPremium).toBe(true)
  })

  test('deep discount when near expiry (< 2 hours left)', () => {
    const crop = {
      price_per_kg: 34, harvested_qty_kg: 80, stock_left_kg: 40,
      harvest_time: makeTime(22), expires_at: makeExpiry(1),
    }
    const result = calculatePriceMultiplier(crop)
    expect(result.multiplier).toBeLessThanOrEqual(0.65)
    expect(result.isSale).toBe(true)
  })

  test('multiplier never exceeds 1.4x cap', () => {
    const crop = {
      price_per_kg: 34, harvested_qty_kg: 100, stock_left_kg: 2,
      harvest_time: makeTime(1), expires_at: makeExpiry(20),
    }
    const result = calculatePriceMultiplier(crop, { recentOrderCount: 20 })
    expect(result.multiplier).toBeLessThanOrEqual(1.4)
  })
})

// ── Freshness Score ──────────────────────────────────────
describe('Freshness Score', () => {
  test('returns 100 at harvest time', () => {
    const score = calculateFreshnessScore(makeTime(0), makeExpiry(24))
    expect(score).toBe(100)
  })

  test('returns 0 at expiry', () => {
    const score = calculateFreshnessScore(makeTime(24), makeExpiry(0))
    expect(score).toBe(0)
  })

  test('score at midpoint is between 40–80', () => {
    const score = calculateFreshnessScore(makeTime(12), makeExpiry(12))
    expect(score).toBeGreaterThan(40)
    expect(score).toBeLessThan(80)
  })
})

// ── Depletion Rate ───────────────────────────────────────
describe('Depletion Rate', () => {
  test('calculates kg per hour correctly', () => {
    const crop = { harvested_qty_kg: 80, stock_left_kg: 40, harvest_time: makeTime(4) }
    const result = estimateDepletionRate(crop)
    expect(result.kgPerHour).toBeCloseTo(10, 1)  // sold 40kg in 4 hours = 10/hr
  })

  test('returns null sellout if selling rate is 0', () => {
    const crop = { harvested_qty_kg: 80, stock_left_kg: 80, harvest_time: makeTime(0) }
    const result = estimateDepletionRate(crop)
    expect(result.projectedSellout).toBeNull()
  })
})

// ── Waste Risk ───────────────────────────────────────────
describe('Waste Risk Assessment', () => {
  test('sold-out crop returns no risk', () => {
    const crop = {
      harvested_qty_kg: 80, stock_left_kg: 0,
      harvest_time: makeTime(10), expires_at: makeExpiry(14),
    }
    const result = assessWasteRisk(crop)
    expect(result.riskLevel).toBe('none')
  })

  test('slow-selling crop near expiry has high risk', () => {
    const crop = {
      harvested_qty_kg: 80, stock_left_kg: 75,
      harvest_time: makeTime(20), expires_at: makeExpiry(2),
    }
    const result = assessWasteRisk(crop)
    expect(result.riskLevel).toBe('high')
  })
})
