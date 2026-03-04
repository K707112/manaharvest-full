// src/jobs/index.js
import cron from 'node-cron'
import { logger } from '../utils/logger.js'
import { runInventoryIntelligence } from '../algorithms/inventoryIntelligence.js'
import { supabaseAdmin } from '../config/supabase.js'
import { curateWeeklyBox } from '../algorithms/subscriptionCurator.js'

export function startCronJobs() {

  // ─── Every 30 min: Run inventory intelligence ────────
  // Flags waste risk, marks expired crops unavailable
  cron.schedule('*/30 * * * *', async () => {
    logger.info('⏰ Job: inventory intelligence')
    try {
      const alerts = await runInventoryIntelligence()
      if (alerts?.length) logger.warn(`⚠️ ${alerts.length} inventory alerts`)
    } catch (err) {
      logger.error('Inventory job failed:', err.message)
    }
  })

  // ─── Every day at 6 AM: Mark expired crops ──────────
  cron.schedule('0 6 * * *', async () => {
    logger.info('⏰ Job: expire old crops')
    try {
      const { error } = await supabaseAdmin
        .from('crops')
        .update({ is_available: false })
        .lt('expires_at', new Date().toISOString())
        .eq('is_available', true)

      if (error) throw error
      logger.info('✅ Expired crops marked unavailable')
    } catch (err) {
      logger.error('Expire crops job failed:', err.message)
    }
  })

  // ─── Every Sunday at 5 AM: Generate weekly sub boxes ─
  cron.schedule('0 5 * * 0', async () => {
    logger.info('⏰ Job: generate weekly subscription boxes')
    try {
      const { data: activeSubs } = await supabaseAdmin
        .from('subscriptions')
        .select('id, user_id, plan')
        .eq('is_active', true)
        .or('paused_until.is.null,paused_until.lt.now()')

      if (!activeSubs?.length) return

      let created = 0
      for (const sub of activeSubs) {
        try {
          const box = await curateWeeklyBox({ userId: sub.user_id, plan: sub.plan })
          // Store for fulfillment (simplified — real impl would create pending orders)
          await supabaseAdmin.from('subscriptions')
            .update({ next_delivery_at: getNextSunday() }).eq('id', sub.id)
          created++
        } catch (e) {
          logger.warn(`Sub box failed for ${sub.id}: ${e.message}`)
        }
      }

      logger.info(`✅ Generated ${created}/${activeSubs.length} subscription boxes`)
    } catch (err) {
      logger.error('Subscription job failed:', err.message)
    }
  })

  // ─── Every day at 11 PM: Daily analytics snapshot ───
  cron.schedule('0 23 * * *', async () => {
    logger.info('⏰ Job: daily analytics snapshot')
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('total, status')
        .gte('created_at', `${today}T00:00:00Z`)

      const revenue  = orders?.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0) || 0
      const total    = orders?.length || 0
      const cancelled = orders?.filter(o => o.status === 'cancelled').length || 0

      logger.info(`📊 Daily snapshot — Orders: ${total}, Revenue: ₹${revenue.toFixed(0)}, Cancelled: ${cancelled}`)
    } catch (err) {
      logger.error('Analytics job failed:', err.message)
    }
  })

  logger.info('✅ Cron jobs registered: inventory, expiry, subscriptions, analytics')
}

function getNextSunday() {
  const d = new Date()
  d.setDate(d.getDate() + (7 - d.getDay() || 7))
  d.setHours(8, 0, 0, 0)
  return d.toISOString()
}
