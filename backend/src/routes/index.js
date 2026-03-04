// src/routes/index.js
import authRoutes         from './auth.routes.js'
import cropRoutes         from './crops.routes.js'
import farmerRoutes       from './farmers.routes.js'
import orderRoutes        from './orders.routes.js'
import subscriptionRoutes from './subscriptions.routes.js'
import userRoutes         from './users.routes.js'
import trackingRoutes     from './tracking.routes.js'
import recommendRoutes    from './recommendations.routes.js'
import adminRoutes        from './admin.routes.js'

export function registerRoutes(app, version) {
  const base = `/api/${version}`

  app.use(`${base}/auth`,            authRoutes)
  app.use(`${base}/crops`,           cropRoutes)
  app.use(`${base}/farmers`,         farmerRoutes)
  app.use(`${base}/orders`,          orderRoutes)
  app.use(`${base}/subscriptions`,   subscriptionRoutes)
  app.use(`${base}/users`,           userRoutes)
  app.use(`${base}/tracking`,        trackingRoutes)
  app.use(`${base}/recommendations`, recommendRoutes)
  app.use(`${base}/admin`,           adminRoutes)
}
