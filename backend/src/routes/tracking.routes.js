// src/routes/tracking.routes.js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { trackOrder, getStatusHistory } from '../controllers/tracking.controller.js'

const router = Router()

router.use(authenticate)

router.get('/:orderNumber',         trackOrder)
router.get('/:orderNumber/history', getStatusHistory)

export default router
