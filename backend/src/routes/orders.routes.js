// src/routes/orders.routes.js
import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
  reorder,
} from '../controllers/orders.controller.js'

const router = Router()

// All order routes require auth
router.use(authenticate)

router.get('/', getMyOrders)

router.get('/:id',
  param('id').isUUID(), validate,
  getOrderById
)

router.post('/',
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.crop_id').isUUID(),
  body('items.*.qty_kg').isFloat({ min: 0.25 }),
  body('address_id').isUUID(),
  body('delivery_slot').isIn(['morning','afternoon','evening']),
  body('use_wallet').optional().isBoolean(),
  validate,
  createOrder
)

router.post('/:id/reorder',
  param('id').isUUID(), validate,
  reorder
)

router.patch('/:id/cancel',
  param('id').isUUID(), validate,
  cancelOrder
)

// Admin + farmer only: update status
router.patch('/:id/status',
  requireRole('admin','farmer'),
  param('id').isUUID(),
  body('status').isIn(['harvesting','packed','transit','delivered','cancelled']),
  body('note').optional().isString(),
  validate,
  updateOrderStatus
)

export default router
