# 🌿 ManaHarvest Backend API

Production-grade Node.js + Supabase backend for the ManaHarvest farm-direct delivery platform.

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, JWT_SECRET

# 3. Set up database
# → Supabase Dashboard → SQL Editor → Run schema.sql, then rpc_functions.sql

# 4. Run
npm run dev        # Development (nodemon)
npm start          # Production
npm test           # Run algorithm unit tests
```

---

## 🏗 Architecture

```
src/
├── server.js             ← Express app boot, middleware registration
├── config/
│   ├── supabase.js       ← Dual client (public + admin)
│   ├── schema.sql        ← Full DB schema + RLS policies
│   └── rpc_functions.sql ← Atomic DB functions (stock, wallet)
│
├── routes/               ← Thin route files (validation only)
│   ├── index.js          ← Central route registrar
│   ├── auth.routes.js
│   ├── crops.routes.js
│   ├── orders.routes.js
│   ├── subscriptions.routes.js
│   ├── farmers.routes.js
│   ├── users.routes.js
│   ├── tracking.routes.js
│   ├── recommendations.routes.js
│   └── admin.routes.js
│
├── controllers/          ← Request/response handlers
├── services/             ← Business logic (pricing, wallet, inventory)
│
├── algorithms/           ← 🧠 The intelligent core
│   ├── dynamicPricing.js          ← Stock + time + demand pricing
│   ├── recommendations.js         ← Hybrid recommendation engine
│   ├── inventoryIntelligence.js   ← Freshness + waste prediction
│   └── subscriptionCurator.js     ← Smart weekly box curation
│
├── middleware/
│   ├── auth.js           ← JWT verify + role guard
│   ├── errorHandler.js   ← Centralised error + AppError class
│   ├── validate.js       ← express-validator wrapper
│   └── rateLimiter.js    ← Global + per-endpoint limits
│
├── jobs/
│   └── index.js          ← Cron: inventory, expiry, subscriptions, analytics
│
└── utils/
    ├── logger.js         ← Winston (dev: color, prod: JSON)
    └── helpers.js        ← Referral codes, pagination, IST time
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/otp/send` | Send OTP to phone |
| POST | `/api/v1/auth/otp/verify` | Verify OTP → tokens |
| POST | `/api/v1/auth/token/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |

### Crops
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/crops` | List available crops (with dynamic pricing) |
| GET | `/api/v1/crops/:id` | Single crop with freshness score |
| GET | `/api/v1/crops/batch/:batchId` | Full batch transparency report |
| GET | `/api/v1/crops/search?q=tomato` | Fuzzy search |
| POST | `/api/v1/crops` | Create crop (farmer/admin) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/orders` | My orders |
| POST | `/api/v1/orders` | Place order (atomic inventory deduction) |
| POST | `/api/v1/orders/:id/reorder` | Reorder with today's crops |
| PATCH | `/api/v1/orders/:id/cancel` | Cancel + auto-refund to wallet |
| PATCH | `/api/v1/orders/:id/status` | Update status (admin/farmer) |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/subscriptions/me` | My active subscription |
| POST | `/api/v1/subscriptions` | Subscribe (auto-curates first box) |
| PATCH | `/api/v1/subscriptions/:id` | Upgrade/downgrade plan |
| POST | `/api/v1/subscriptions/:id/pause` | Pause until date |

---

## 🧠 Algorithms

### 1. Dynamic Pricing Engine
Rules-based pricing that adjusts in real-time:
- **Scarcity premium**: +12–25% when stock < 30%
- **Expiry discount**: -10–40% in last 6 hours
- **Demand velocity**: +4–8% when orders spike
- **Weekend premium**: +5% on Sat/Sun
- **Caps**: never below 0.5x or above 1.4x base price

### 2. Recommendation Engine (Hybrid)
Personalized using weighted scoring:
- `35%` — Category preference (from order history)
- `25%` — Farmer loyalty score
- `20%` — Today's popularity (order count)
- `10%` — Freshness (recently harvested)
- `10%` — Organic preference

**Phase 2 roadmap**: Collaborative filtering (matrix factorization)
**Phase 3 roadmap**: Neural embeddings via pgvector

### 3. Inventory Intelligence
Per-crop analysis running every 30 minutes:
- **Freshness score** (0–100): non-linear decay curve
- **Depletion rate**: kg sold per hour + projected sellout time
- **Waste risk**: `low | medium | high` with recommended actions

### 4. Subscription Box Curator
Weekly box generation with:
- Nutritional balance (leafy greens, protein, vitamins)
- Variety rule (no repeat from last 2 weeks)
- User preference weighting
- Per-plan quantity assignment

---

## 🛡 Security

- Helmet (HTTP security headers)
- JWT auth on all non-public routes
- Role-based access control (`customer | farmer | admin`)
- Row Level Security (RLS) on all Supabase tables
- Rate limiting: 100 req/15min global, 3 OTPs/min
- Input validation on all routes (express-validator)
- Atomic DB operations (RPC functions — no race conditions)

---

## ⏰ Background Jobs (node-cron)

| Schedule | Job |
|----------|-----|
| Every 30 min | Inventory intelligence scan + waste risk alerts |
| Daily 6 AM | Expire yesterday's crops |
| Sunday 5 AM | Generate weekly subscription boxes |
| Daily 11 PM | Analytics snapshot to logs |

---

## 📈 Phase Roadmap

### Phase 1 (Now) — ✅ Built
- Full REST API, JWT auth, OTP login
- Dynamic pricing (rules-based)
- Content-based recommendations
- Inventory intelligence
- Subscription box curation
- Background jobs

### Phase 2 (Month 3+)
- Redis for OTP store + caching
- Razorpay payment webhook integration
- Real SMS via MSG91/Twilio
- Collaborative filtering (with enough user data)
- Google Maps delivery tracking

### Phase 3 (Month 6+)
- pgvector for neural crop embeddings
- ML-based demand forecasting
- Farmer payout automation
- WhatsApp Business integration
- Multi-city expansion routing

---

## 🧪 Tests

```bash
npm test
```

Tests cover: Dynamic pricing edge cases, Freshness scoring, Depletion rate calculation, Waste risk assessment.
