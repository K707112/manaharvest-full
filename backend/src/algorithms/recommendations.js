// src/algorithms/recommendations.js
//
// ═══════════════════════════════════════════════════════
//  RECOMMENDATION ENGINE — Hybrid Approach
//  Stage: Early startup  →  scales to full ML
//
//  Phase 1 (now):  Content-based + Popularity
//  Phase 2:        Collaborative filtering (matrix factorization)
//  Phase 3:        Neural embedding similarity (pgvector)
//
//  We build the full scoring pipeline now. Swapping in
//  ML models later requires only changing the scorers.
// ═══════════════════════════════════════════════════════

import { supabaseAdmin } from '../config/supabase.js'

const WEIGHTS = {
  category_match:    0.35,   // User buys spinach → show other leafy greens
  farmer_loyalty:    0.25,   // User loves Ramu's farm → show his other crops
  popularity:        0.20,   // Trending today
  freshness_boost:   0.10,   // Harvested recently
  organic_preference: 0.10,  // User prefers organic
}

/**
 * Get personalized crop recommendations for a user.
 *
 * @param {string} userId
 * @param {string[]} excludeCropIds - already in cart or shown
 * @param {number} limit
 * @returns {Promise<Array>} scored crop list
 */
export async function getPersonalizedRecommendations(userId, excludeCropIds = [], limit = 6) {

  // ─── Step 1: Fetch user's order history ─────────────
  const { data: history } = await supabaseAdmin
    .from('order_items')
    .select('crop_id, name, crops(category, farmer_id, is_organic)')
    .in('order_id',
      supabaseAdmin.from('orders').select('id').eq('user_id', userId).eq('status','delivered')
    )
    .limit(50)

  const userProfile = buildUserProfile(history || [])

  // ─── Step 2: Fetch available crops ──────────────────
  const { data: availableCrops } = await supabaseAdmin
    .from('crops')
    .select('*, farmers(name, village, avg_rating)')
    .eq('is_available', true)
    .gt('stock_left_kg', 0)
    .gt('expires_at', new Date().toISOString())
    .not('id', 'in', `(${excludeCropIds.join(',') || "''"})`)

  if (!availableCrops?.length) return []

  // ─── Step 3: Fetch popularity signals ───────────────
  const popularityMap = await getPopularityScores(availableCrops.map(c => c.id))

  // ─── Step 4: Score each crop ─────────────────────────
  const scored = availableCrops.map(crop => {
    const score = scoreCrop(crop, userProfile, popularityMap)
    return { ...crop, _score: score }
  })

  // ─── Step 5: Sort and return ─────────────────────────
  return scored
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
    .map(({ _score, ...crop }) => crop)
}

/** Build a preference profile from order history */
function buildUserProfile(history) {
  const categories   = {}
  const farmers      = {}
  let organicCount   = 0
  let totalItems     = history.length

  for (const item of history) {
    const cat      = item.crops?.category
    const farmerId = item.crops?.farmer_id
    const organic  = item.crops?.is_organic

    if (cat)      categories[cat]    = (categories[cat] || 0) + 1
    if (farmerId) farmers[farmerId]  = (farmers[farmerId] || 0) + 1
    if (organic)  organicCount++
  }

  return {
    categories,
    farmers,
    organicRatio: totalItems > 0 ? organicCount / totalItems : 0,
    hasHistory:   totalItems > 0,
  }
}

/** Score a single crop against a user profile */
function scoreCrop(crop, profile, popularityMap) {
  let score = 0

  // Category match
  const catFreq = (profile.categories[crop.category] || 0)
  const catScore = profile.hasHistory
    ? Math.min(catFreq / 5, 1.0)   // normalize: 5+ orders in category = full score
    : 0.5                           // no history: neutral
  score += WEIGHTS.category_match * catScore

  // Farmer loyalty
  const farmFreq  = (profile.farmers[crop.farmer_id] || 0)
  const farmScore = Math.min(farmFreq / 3, 1.0)
  score += WEIGHTS.farmer_loyalty * farmScore

  // Popularity (order count today)
  const popScore = popularityMap[crop.id] || 0
  score += WEIGHTS.popularity * popScore

  // Freshness (harvested in last 3 hours = max score)
  const harvestAge = (Date.now() - new Date(crop.harvest_time)) / (1000 * 60 * 60)
  const freshScore = Math.max(0, 1 - harvestAge / 3)
  score += WEIGHTS.freshness_boost * freshScore

  // Organic preference
  if (crop.is_organic && profile.organicRatio > 0.5) {
    score += WEIGHTS.organic_preference
  }

  return +score.toFixed(4)
}

/** Get normalized popularity scores from today's orders */
async function getPopularityScores(cropIds) {
  if (!cropIds.length) return {}

  const { data } = await supabaseAdmin
    .from('order_items')
    .select('crop_id')
    .in('crop_id', cropIds)
    .gte('created_at', new Date(new Date().setHours(0,0,0,0)).toISOString())

  const counts = {}
  for (const row of data || []) {
    counts[row.crop_id] = (counts[row.crop_id] || 0) + 1
  }

  // Normalize to 0–1
  const max = Math.max(...Object.values(counts), 1)
  const normalized = {}
  for (const [id, count] of Object.entries(counts)) {
    normalized[id] = count / max
  }
  return normalized
}

/**
 * Get "similar crops" for a crop detail page.
 * Pure content-based: same category + different farmer.
 */
export async function getSimilarCrops(cropId, limit = 4) {
  const { data: crop } = await supabaseAdmin
    .from('crops').select('category, farmer_id').eq('id', cropId).single()

  if (!crop) return []

  const { data } = await supabaseAdmin
    .from('crops')
    .select('id, name, emoji, price_per_kg, stock_left_kg, batch_id, farmers(name)')
    .eq('category', crop.category)
    .neq('id', cropId)
    .neq('farmer_id', crop.farmer_id)   // Different farmer = more variety
    .eq('is_available', true)
    .gt('stock_left_kg', 0)
    .limit(limit)

  return data || []
}

/*
 * ─── PHASE 2: Collaborative Filtering ────────────────────
 *
 * When you have 1000+ users with 5+ orders each:
 *
 * 1. Build user-item matrix (user_id × crop_name, value = buy_count)
 * 2. Use SVD / ALS matrix factorization
 * 3. Store user embeddings in user_profiles table
 * 4. Cosine similarity for neighbors
 *
 * import { CollaborativeFilter } from '../ml/collab.js'
 * const cf = new CollaborativeFilter()
 * const recs = cf.recommend(userId, topK=10)
 *
 * ─── PHASE 3: Neural Embeddings ──────────────────────────
 *
 * Enable pgvector in Supabase, store OpenAI embeddings
 * of crop descriptions in crop_embeddings table.
 * Use vector similarity search.
 *
 * SELECT crops.*, (embedding <-> user_embedding) AS distance
 * FROM crops JOIN crop_embeddings USING (crop_id)
 * ORDER BY distance LIMIT 10;
 */
