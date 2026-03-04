// src/routes/subscriptions.routes.js
import { Router } from 'express'
import { body, param } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate } from '../middleware/auth.js'
import {
  createSubscription,
  getMySubscription,
  pauseSubscription,
  cancelSubscription,
  updateSubscription,
} from '../controllers/subscriptions.controller.js'

const router = Router()
router.use(authenticate)

router.get('/me', getMySubscription)
router.post('/',
  body('plan').isIn(['small','medium','large']),
  body('address_id').isUUID(),
  body('delivery_slot').isIn(['morning','afternoon','evening']),
  validate, createSubscription
)
router.patch('/:id',
  param('id').isUUID(),
  body('plan').optional().isIn(['small','medium','large']),
  body('delivery_slot').optional().isIn(['morning','afternoon','evening']),
  validate, updateSubscription
)
router.post('/:id/pause',
  param('id').isUUID(),
  body('pause_until').isISO8601(),
  validate, pauseSubscription
)
router.delete('/:id', param('id').isUUID(), validate, cancelSubscription)

export default router
