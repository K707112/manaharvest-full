// src/routes/admin.routes.js
import { Router } from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import {
  getDashboardStats,
  listAllOrders, updateOrderStatus,
  listAllFarmers, createFarmer, updateFarmer, verifyFarmer, deleteFarmer,
  listAllCrops,  createCrop,  updateCrop,  deleteCrop,
  listAllUsers,  toggleUserStatus,
} from '../controllers/admin.controller.js'

const router = Router()
router.use(authenticate)
router.use(requireRole('admin'))

// Dashboard
router.get('/stats', getDashboardStats)

// Orders
router.get('/orders',            listAllOrders)
router.patch('/orders/:id/status', updateOrderStatus)

// Farmers
router.get('/farmers',           listAllFarmers)
router.post('/farmers',          createFarmer)
router.patch('/farmers/:id',     updateFarmer)
router.patch('/farmers/:id/verify', verifyFarmer)
router.delete('/farmers/:id',    deleteFarmer)

// Crops
router.get('/crops',             listAllCrops)
router.post('/crops',            createCrop)
router.patch('/crops/:id',       updateCrop)
router.delete('/crops/:id',      deleteCrop)

// Users
router.get('/users',             listAllUsers)
router.patch('/users/:id/toggle', toggleUserStatus)

export default router
