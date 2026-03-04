-- ═══════════════════════════════════════════════════════════
--  ManaHarvest — Supabase Database Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- fuzzy search

-- ─── ENUM Types ─────────────────────────────────────────────
CREATE TYPE order_status    AS ENUM ('harvesting','packed','transit','delivered','cancelled');
CREATE TYPE plan_type       AS ENUM ('small','medium','large');
CREATE TYPE delivery_slot   AS ENUM ('morning','afternoon','evening');
CREATE TYPE payment_status  AS ENUM ('pending','paid','failed','refunded');
CREATE TYPE user_role       AS ENUM ('customer','farmer','admin');

-- ═══════════════════════════════════════════════════════════
--  USERS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT UNIQUE,
  phone           TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  role            user_role DEFAULT 'customer',
  wallet_balance  NUMERIC(10,2) DEFAULT 0 CHECK (wallet_balance >= 0),
  referral_code   TEXT UNIQUE,
  referred_by     UUID REFERENCES users(id),
  is_active       BOOLEAN DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE addresses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label        TEXT DEFAULT 'Home',
  line1        TEXT NOT NULL,
  line2        TEXT,
  area         TEXT NOT NULL,
  city         TEXT NOT NULL,
  pincode      TEXT NOT NULL,
  lat          NUMERIC(9,6),
  lng          NUMERIC(9,6),
  is_default   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  FARMERS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE farmers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id),
  name             TEXT NOT NULL,
  village          TEXT NOT NULL,
  district         TEXT NOT NULL,
  state            TEXT DEFAULT 'Andhra Pradesh',
  land_acres       NUMERIC(6,2),
  speciality       TEXT,
  story            TEXT,
  years_farming    INT,
  is_verified      BOOLEAN DEFAULT false,
  is_active        BOOLEAN DEFAULT true,
  avg_rating       NUMERIC(3,2) DEFAULT 0,
  total_orders     INT DEFAULT 0,
  soil_type        TEXT,
  lat              NUMERIC(9,6),
  lng              NUMERIC(9,6),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  CROPS / BATCHES  (core of the platform)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE crops (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id         TEXT UNIQUE NOT NULL,        -- e.g. MH-0228-TOM
  farmer_id        UUID NOT NULL REFERENCES farmers(id),
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  description      TEXT,
  emoji            TEXT,
  is_organic       BOOLEAN DEFAULT false,
  soil_type        TEXT,
  price_per_kg     NUMERIC(8,2) NOT NULL,
  harvested_qty_kg NUMERIC(8,2) NOT NULL,
  stock_left_kg    NUMERIC(8,2) NOT NULL,
  harvest_time     TIMESTAMPTZ NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,         -- auto = harvest_time + 24h
  is_available     BOOLEAN DEFAULT true,
  view_count       INT DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT stock_valid CHECK (stock_left_kg >= 0 AND stock_left_kg <= harvested_qty_kg)
);

-- Auto-generate batch_id trigger
CREATE OR REPLACE FUNCTION generate_batch_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.batch_id := 'MH-' ||
    TO_CHAR(NOW(), 'MMDD') || '-' ||
    UPPER(SUBSTRING(NEW.name FROM 1 FOR 3));
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_batch_id
  BEFORE INSERT ON crops
  FOR EACH ROW
  WHEN (NEW.batch_id IS NULL OR NEW.batch_id = '')
  EXECUTE FUNCTION generate_batch_id();

-- Auto-set expires_at = harvest_time + 24 hours
CREATE OR REPLACE FUNCTION set_expires_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := NEW.harvest_time + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_expires_at
  BEFORE INSERT ON crops
  FOR EACH ROW EXECUTE FUNCTION set_expires_at();

-- ═══════════════════════════════════════════════════════════
--  SUBSCRIPTIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE subscriptions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id),
  plan             plan_type NOT NULL,
  price_per_week   NUMERIC(10,2) NOT NULL,
  delivery_slot    delivery_slot NOT NULL,
  address_id       UUID NOT NULL REFERENCES addresses(id),
  is_active        BOOLEAN DEFAULT true,
  paused_until     TIMESTAMPTZ,
  next_delivery_at TIMESTAMPTZ,
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  ORDERS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT UNIQUE NOT NULL,         -- MH-XXXX
  user_id          UUID NOT NULL REFERENCES users(id),
  subscription_id  UUID REFERENCES subscriptions(id),
  address_id       UUID NOT NULL REFERENCES addresses(id),
  status           order_status DEFAULT 'harvesting',
  subtotal         NUMERIC(10,2) NOT NULL,
  delivery_fee     NUMERIC(8,2) DEFAULT 0,
  discount         NUMERIC(8,2) DEFAULT 0,
  wallet_used      NUMERIC(8,2) DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  payment_status   payment_status DEFAULT 'pending',
  payment_id       TEXT,
  delivery_slot    delivery_slot,
  estimated_at     TIMESTAMPTZ,
  delivered_at     TIMESTAMPTZ,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate order number: MH-0001, MH-0002...
CREATE SEQUENCE order_number_seq START 1000;
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.order_number := 'MH-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

CREATE TABLE order_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  crop_id     UUID NOT NULL REFERENCES crops(id),
  batch_id    TEXT NOT NULL,
  name        TEXT NOT NULL,
  qty_kg      NUMERIC(6,2) NOT NULL,
  price_per_kg NUMERIC(8,2) NOT NULL,
  subtotal    NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Status history for full audit trail
CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  note        TEXT,
  changed_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  WALLET TRANSACTIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE wallet_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  type        TEXT NOT NULL CHECK (type IN ('credit','debit')),
  amount      NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  reason      TEXT NOT NULL,             -- 'referral_bonus' | 'cashback' | 'order_payment'
  ref_id      TEXT,                      -- order_id or referral_id
  balance_after NUMERIC(10,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  REFERRALS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE referrals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id   UUID NOT NULL REFERENCES users(id),
  referred_id   UUID NOT NULL REFERENCES users(id),
  bonus_paid    BOOLEAN DEFAULT false,
  bonus_amount  NUMERIC(8,2) DEFAULT 50,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  REVIEWS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id),
  order_id    UUID NOT NULL REFERENCES orders(id),
  farmer_id   UUID REFERENCES farmers(id),
  crop_id     UUID REFERENCES crops(id),
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  AI / RECOMMENDATIONS  (Phase 2 — schema ready now)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE user_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id),
  session_id  TEXT,
  event_type  TEXT NOT NULL,   -- 'view'|'add_cart'|'purchase'|'search'
  crop_id     UUID REFERENCES crops(id),
  metadata    JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE crop_embeddings (
  crop_id     UUID PRIMARY KEY REFERENCES crops(id),
  embedding   JSONB,           -- store as JSON array until pgvector added
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
--  INDEXES — for performance at scale
-- ═══════════════════════════════════════════════════════════
CREATE INDEX idx_crops_farmer      ON crops(farmer_id);
CREATE INDEX idx_crops_category    ON crops(category);
CREATE INDEX idx_crops_available   ON crops(is_available, expires_at);
CREATE INDEX idx_crops_harvest     ON crops(harvest_time DESC);
CREATE INDEX idx_orders_user       ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status     ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_user_events_user  ON user_events(user_id, created_at DESC);
CREATE INDEX idx_user_events_type  ON user_events(event_type);
CREATE INDEX idx_crops_name_trgm   ON crops USING GIN (name gin_trgm_ops);  -- fuzzy search

-- ═══════════════════════════════════════════════════════════
--  ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY user_self ON users
  USING (auth.uid()::TEXT = id::TEXT);

-- Users see only their own orders
CREATE POLICY orders_self ON orders
  USING (auth.uid()::TEXT = user_id::TEXT);

-- Addresses: users own their data
CREATE POLICY addr_self ON addresses
  USING (auth.uid()::TEXT = user_id::TEXT);

-- Crops are public
ALTER TABLE crops    ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmers  ENABLE ROW LEVEL SECURITY;
CREATE POLICY crops_public   ON crops   FOR SELECT USING (true);
CREATE POLICY farmers_public ON farmers FOR SELECT USING (true);

-- ═══════════════════════════════════════════════════════════
--  UPDATED_AT auto-trigger
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','farmers','crops','orders','subscriptions'] LOOP
    EXECUTE FORMAT('CREATE TRIGGER trg_updated_at_%s BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', t, t);
  END LOOP;
END $$;
