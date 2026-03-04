// src/routes/farmers.routes.js
import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  listFarmers, getFarmerById, getFarmerCrops,
} from '../controllers/farmers.controller.js'

const router = Router()
router.get('/', listFarmers)
router.get('/:id', getFarmerById)
router.get('/:id/crops', getFarmerCrops)
export default router
