// src/server.js
import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'

import { checkDbConnection } from './config/supabase.js'
import { logger } from './utils/logger.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { registerRoutes } from './routes/index.js'
import { startCronJobs } from './jobs/index.js'

const app  = express()
app.set('trust proxy', 1)
const PORT = process.env.PORT || 4000
const VER  = process.env.API_VERSION || 'v1'

// ── Security headers ────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || '').split(','),
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
}))
app.options('*', cors())

// ── Request parsing ─────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(compression())

// ── Logging ─────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// ── Rate limiting ────────────────────────────────────────────
app.use(`/api/${VER}`, rateLimiter)

// ── Health check (no auth needed) ───────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await checkDbConnection()
    res.json({
      status:  'ok',
      db:      'connected',
      version: VER,
      env:     process.env.NODE_ENV,
      uptime:  process.uptime(),
    })
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message })
  }
})

// ── API Routes ───────────────────────────────────────────────
registerRoutes(app, VER)

// ── 404 + Error handlers ─────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Boot ─────────────────────────────────────────────────────
async function boot() {
  try {
    await checkDbConnection()
    logger.info('✅ Database connected')

    app.listen(PORT, () => {
      logger.info(`🚀 ManaHarvest API running on port ${PORT}`)
      logger.info(`📍 Base URL: http://localhost:${PORT}/api/${VER}`)
    })

    startCronJobs()
    logger.info('⏰ Background jobs started')

  } catch (err) {
    logger.error('💥 Failed to start server:', err.message)
    process.exit(1)
  }
}

boot()

export default app
