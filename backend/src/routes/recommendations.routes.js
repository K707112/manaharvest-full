// src/routes/recommendations.routes.js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getRecommendations, getSimilar, trackEvent } from '../controllers/recommendations.controller.js'

const router = Router()

router.use(authenticate)

router.get('/',                    getRecommendations)
router.get('/similar/:cropId',     getSimilar)
router.post('/events',             trackEvent)

export default router
