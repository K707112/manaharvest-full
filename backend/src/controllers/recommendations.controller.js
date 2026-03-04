// src/controllers/recommendations.controller.js
import { supabaseAdmin } from '../config/supabase.js'
import { getPersonalizedRecommendations, getSimilarCrops } from '../algorithms/recommendations.js'

export async function getRecommendations(req, res, next) {
  try {
    const exclude = req.query.exclude?.split(',') || []
    const data = await getPersonalizedRecommendations(req.user.id, exclude)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function getSimilar(req, res, next) {
  try {
    const data = await getSimilarCrops(req.params.cropId)
    res.json({ success: true, data })
  } catch (err) { next(err) }
}

export async function trackEvent(req, res, next) {
  try {
    const { event_type, crop_id, metadata } = req.body
    await supabaseAdmin.from('user_events').insert({
      user_id:    req.user.id,
      session_id: req.headers['x-session-id'],
      event_type,
      crop_id,
      metadata,
    })
    res.json({ success: true })
  } catch (err) { next(err) }
}
