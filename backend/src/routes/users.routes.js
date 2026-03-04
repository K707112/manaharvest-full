// src/routes/users.routes.js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getProfile, updateProfile, getWallet, getAddresses, addAddress } from '../controllers/users.controller.js'

const router = Router()

router.use(authenticate)

router.get('/me',              getProfile)
router.patch('/me',            updateProfile)
router.get('/me/wallet',       getWallet)
router.get('/me/addresses',    getAddresses)
router.post('/me/addresses',   addAddress)

export default router
