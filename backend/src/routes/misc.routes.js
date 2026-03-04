// src/routes/users.routes.js
import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getProfile, updateProfile, getWallet, addAddress, getAddresses } from '../controllers/users.controller.js'
const router = Router()
router.use(authenticate)
router.get('/me', getProfile)
router.patch('/me', updateProfile)
router.get('/me/wallet', getWallet)
router.get('/me/addresses', getAddresses)
router.post('/me/addresses', addAddress)
export default router

// ─────────────────────────────────────────────────────────
// src/routes/tracking.routes.js
import { Router as R2 } from 'express'
import { authenticate as auth2 } from '../middleware/auth.js'
import { trackOrder, getStatusHistory } from '../controllers/tracking.controller.js'
const r2 = R2()
r2.use(auth2)
r2.get('/:orderNumber', trackOrder)
r2.get('/:orderNumber/history', getStatusHistory)
export { r2 as default }

// ─────────────────────────────────────────────────────────
// src/routes/recommendations.routes.js
import { Router as R3 } from 'express'
import { authenticate as auth3 } from '../middleware/auth.js'
import { getRecommendations, trackEvent } from '../controllers/recommendations.controller.js'
const r3 = R3()
r3.get('/', auth3, getRecommendations)
r3.post('/events', auth3, trackEvent)
export { r3 as default }

// ─────────────────────────────────────────────────────────
// src/routes/admin.routes.js
import { Router as R4 } from 'express'
import { authenticate as auth4, requireRole as role4 } from '../middleware/auth.js'
import { getDashboardStats, listAllOrders, verifyFarmer } from '../controllers/admin.controller.js'
const r4 = R4()
r4.use(auth4, role4('admin'))
r4.get('/stats', getDashboardStats)
r4.get('/orders', listAllOrders)
r4.patch('/farmers/:id/verify', verifyFarmer)
export { r4 as default }
