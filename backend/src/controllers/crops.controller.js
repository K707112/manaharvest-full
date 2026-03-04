// src/controllers/crops.controller.js
import { supabaseAdmin } from '../config/supabase.js'
import { AppError } from '../middleware/errorHandler.js'
import { applyDynamicPricing } from '../algorithms/dynamicPricing.js'
import {
  calculateFreshnessScore,
  estimateDepletionRate,
  assessWasteRisk,
} from '../algorithms/inventoryIntelligence.js'

export async function listCrops(req, res, next) {
  try {
    const { category, farmer_id, organic, limit = 20, offset = 0 } = req.query

    let query = supabaseAdmin
      .from('crops')
      .select('*, farmers(id, name, village, avg_rating)')
      .eq('is_available', true)
      .gt('stock_left_kg', 0)
      .gt('expires_at', new Date().toISOString())
      .order('harvest_time', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) query = query.eq('category', category)
    if (farmer_id) query = query.eq('farmer_id', farmer_id)
    if (organic === 'true') query = query.eq('is_organic', true)

    const { data: crops, error, count } = await query

    if (error) throw error

    // Enrich with intelligence
    const enriched = (crops || []).map(crop => ({
      ...crop,
      freshness_score:  calculateFreshnessScore(crop.harvest_time, crop.expires_at),
      depletion:        estimateDepletionRate(crop),
      waste_risk:       assessWasteRisk(crop).riskLevel,
    }))

    // Apply dynamic pricing
    const priced = applyDynamicPricing(enriched)

    res.json({ success: true, data: priced, meta: { limit, offset } })
  } catch (err) { next(err) }
}

export async function getCropById(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('crops')
      .select('*, farmers(*)')
      .eq('id', req.params.id)
      .single()

    if (error || !data) throw new AppError('Crop not found', 404)

    const enriched = {
      ...data,
      freshness_score: calculateFreshnessScore(data.harvest_time, data.expires_at),
      depletion:       estimateDepletionRate(data),
    }

    res.json({ success: true, data: applyDynamicPricing([enriched])[0] })
  } catch (err) { next(err) }
}

export async function getBatchDetail(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('crops')
      .select('*, farmers(*)')
      .eq('batch_id', req.params.batchId)
      .single()

    if (error || !data) throw new AppError('Batch not found', 404)

    const sold = data.harvested_qty_kg - data.stock_left_kg

    res.json({
      success: true,
      data: {
        ...data,
        sold_kg:         +sold.toFixed(2),
        sold_pct:        +((sold / data.harvested_qty_kg) * 100).toFixed(1),
        freshness_score: calculateFreshnessScore(data.harvest_time, data.expires_at),
        depletion:       estimateDepletionRate(data),
      }
    })
  } catch (err) { next(err) }
}

export async function searchCrops(req, res, next) {
  try {
    const { q } = req.query

    // Uses pg_trgm index for fuzzy search
    const { data, error } = await supabaseAdmin
      .from('crops')
      .select('id, batch_id, name, emoji, category, price_per_kg, stock_left_kg, is_available')
      .ilike('name', `%${q}%`)
      .eq('is_available', true)
      .limit(10)

    if (error) throw error
    res.json({ success: true, data: data || [] })
  } catch (err) { next(err) }
}

export async function createCrop(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('crops')
      .insert({
        ...req.body,
        farmer_id: req.body.farmer_id || req.user.farmer_id,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ success: true, data })
  } catch (err) { next(err) }
}

export async function updateStock(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('crops')
      .update({ stock_left_kg: req.body.stock_left_kg })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function incrementView(req, res, next) {
  try {
    await supabaseAdmin.rpc('increment_view_count', { p_crop_id: req.params.id })
    res.json({ success: true })
  } catch (err) { next(err) }
}
