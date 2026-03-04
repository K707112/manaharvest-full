-- ═══════════════════════════════════════════════════════════
--  ManaHarvest — Supabase RPC Functions
--  Run in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ─── Atomic stock decrement ─────────────────────────────────
-- Prevents race conditions when multiple orders arrive at once
CREATE OR REPLACE FUNCTION decrement_stock(p_crop_id UUID, p_qty NUMERIC)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE crops
  SET stock_left_kg = stock_left_kg - p_qty
  WHERE id = p_crop_id AND stock_left_kg >= p_qty;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for crop %', p_crop_id
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

-- ─── Atomic view counter ────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_view_count(p_crop_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE crops SET view_count = view_count + 1 WHERE id = p_crop_id;
END;
$$;

-- ─── Atomic wallet update (prevents negative balance) ───────
CREATE OR REPLACE FUNCTION update_wallet(p_user_id UUID, p_delta NUMERIC)
RETURNS NUMERIC LANGUAGE plpgsql AS $$
DECLARE v_new_balance NUMERIC;
BEGIN
  UPDATE users
  SET wallet_balance = wallet_balance + p_delta
  WHERE id = p_user_id AND (wallet_balance + p_delta) >= 0
  RETURNING wallet_balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient wallet balance'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN v_new_balance;
END;
$$;

-- ─── Daily revenue summary view ─────────────────────────────
CREATE OR REPLACE VIEW daily_revenue AS
SELECT
  DATE(created_at)                          AS date,
  COUNT(*)                                  AS order_count,
  SUM(total) FILTER (WHERE status != 'cancelled') AS revenue,
  SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
  AVG(total)                                AS avg_order_value
FROM orders
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ─── Farmer performance view ─────────────────────────────────
CREATE OR REPLACE VIEW farmer_performance AS
SELECT
  f.id,
  f.name,
  f.village,
  COUNT(DISTINCT c.id)        AS total_crops_listed,
  SUM(c.harvested_qty_kg - c.stock_left_kg) AS total_kg_sold,
  COUNT(DISTINCT oi.order_id) AS total_orders_fulfilled,
  AVG(r.rating)               AS avg_rating,
  f.updated_at
FROM farmers f
LEFT JOIN crops c       ON c.farmer_id = f.id
LEFT JOIN order_items oi ON oi.batch_id = c.batch_id
LEFT JOIN reviews r      ON r.farmer_id = f.id
GROUP BY f.id, f.name, f.village, f.updated_at;
