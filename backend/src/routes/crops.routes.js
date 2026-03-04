// src/routes/crops.routes.js
import { Router } from 'express'
import { query, param, body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  listCrops,
  getCropById,
  getBatchDetail,
  createCrop,
  updateStock,
  searchCrops,
  incrementView,
} from '../controllers/crops.controller.js'

const router = Router()

// Public routes
router.get('/',
  query('category').optional().isString(),
  query('farmer_id').optional().isUUID(),
  query('organic').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('offset').optional().isInt({ min: 0 }),
  validate,
  listCrops
)

router.get('/search',
  query('q').isString().trim().isLength({ min: 1 }).withMessage('Search query required'),
  validate,
  searchCrops
)

router.get('/batch/:batchId', getBatchDetail)
router.get('/:id', param('id').isUUID(), validate, getCropById)
router.post('/:id/view', param('id').isUUID(), validate, incrementView)

// Farmer/admin only
router.post('/',
  authenticate,
  requireRole('farmer','admin'),
  body('name').notEmpty(),
  body('category').notEmpty(),
  body('price_per_kg').isFloat({ min: 0.1 }),
  body('harvested_qty_kg').isFloat({ min: 0.1 }),
  body('harvest_time').isISO8601(),
  validate,
  createCrop
)

router.patch('/:id/stock',
  authenticate,
  requireRole('farmer','admin'),
  param('id').isUUID(),
  body('stock_left_kg').isFloat({ min: 0 }),
  validate,
  updateStock
)

export default router
