-- =============================================================================
-- Curio Medicine Finder - Pharmacies With Medicine Function
-- Migration: 009_get_pharmacies_with_medicine.sql
-- =============================================================================
-- This migration creates a function to find pharmacies that have a specific
-- medicine in stock, along with stock status, price, and distance.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- GET PHARMACIES WITH MEDICINE
-- -----------------------------------------------------------------------------
-- Returns pharmacies that have stock reports for a specific medicine.
-- Includes stock status, price, distance from user, and last reported time.

CREATE OR REPLACE FUNCTION get_pharmacies_with_medicine(
  p_medicine_id UUID,
  p_user_lat DOUBLE PRECISION,
  p_user_lng DOUBLE PRECISION,
  p_radius_meters INTEGER DEFAULT 10000
)
RETURNS TABLE (
  pharmacy_id UUID,
  pharmacy_name VARCHAR(255),
  pharmacy_slug VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(20),
  pharmacy_type pharmacy_type,
  chain_name VARCHAR(100),
  is_24_hours BOOLEAN,
  is_verified BOOLEAN,
  logo_url TEXT,
  distance_meters DOUBLE PRECISION,
  stock_status stock_status,
  price DECIMAL(10,2),
  last_reported_at TIMESTAMPTZ,
  report_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH latest_reports AS (
    -- Get the most recent report for each pharmacy for this medicine
    SELECT DISTINCT ON (ir.pharmacy_id)
      ir.pharmacy_id,
      ir.status,
      ir.price,
      ir.created_at,
      ir.expires_at
    FROM inventory_reports ir
    WHERE ir.medicine_id = p_medicine_id
      AND ir.expires_at > NOW()
    ORDER BY ir.pharmacy_id, ir.created_at DESC
  ),
  report_counts AS (
    -- Count total reports per pharmacy for this medicine
    SELECT
      ir.pharmacy_id,
      COUNT(*) AS cnt
    FROM inventory_reports ir
    WHERE ir.medicine_id = p_medicine_id
    GROUP BY ir.pharmacy_id
  )
  SELECT
    p.id AS pharmacy_id,
    p.name AS pharmacy_name,
    p.slug AS pharmacy_slug,
    p.address,
    p.city,
    p.phone,
    p.type AS pharmacy_type,
    p.chain_name,
    p.is_24_hours,
    p.is_verified,
    p.logo_url,
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography
    ) AS distance_meters,
    COALESCE(lr.status, 'out_of_stock'::stock_status) AS stock_status,
    lr.price,
    lr.created_at AS last_reported_at,
    COALESCE(rc.cnt, 0) AS report_count
  FROM pharmacies p
  LEFT JOIN latest_reports lr ON p.id = lr.pharmacy_id
  LEFT JOIN report_counts rc ON p.id = rc.pharmacy_id
  WHERE ST_DWithin(
    p.location,
    ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography,
    p_radius_meters
  )
  AND (lr.pharmacy_id IS NOT NULL OR p_radius_meters <= 5000) -- Only include pharmacies without reports if radius is small
  ORDER BY
    CASE 
      WHEN lr.status = 'in_stock' THEN 0
      WHEN lr.status = 'low_stock' THEN 1
      ELSE 2
    END,
    distance_meters ASC;
END;
$$;

COMMENT ON FUNCTION get_pharmacies_with_medicine IS 'Find pharmacies within radius that have stock reports for a specific medicine';

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION get_pharmacies_with_medicine TO authenticated;
GRANT EXECUTE ON FUNCTION get_pharmacies_with_medicine TO anon;
