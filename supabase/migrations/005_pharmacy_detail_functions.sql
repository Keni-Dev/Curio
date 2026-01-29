-- =============================================================================
-- Curio Medicine Finder - Additional Database Functions
-- Migration: 005_pharmacy_detail_functions.sql
-- =============================================================================
-- This migration adds functions needed for the pharmacy detail page:
-- 1. get_pharmacy_by_slug - Fetch pharmacy by URL slug
-- =============================================================================

-- -----------------------------------------------------------------------------
-- GET PHARMACY BY SLUG
-- -----------------------------------------------------------------------------
-- Fetches a single pharmacy by its URL slug.
-- Used for the pharmacy detail page.

CREATE OR REPLACE FUNCTION get_pharmacy_by_slug(
  p_slug VARCHAR(255)
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  slug VARCHAR(255),
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  city VARCHAR(100),
  phone VARCHAR(20),
  type pharmacy_type,
  chain_name VARCHAR(100),
  operating_hours JSONB,
  is_24_hours BOOLEAN,
  is_verified BOOLEAN,
  logo_url TEXT,
  rating DECIMAL(2,1),
  total_reports INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    ST_Y(p.location::geometry) AS lat,
    ST_X(p.location::geometry) AS lng,
    p.address,
    p.city,
    p.phone,
    p.type,
    p.chain_name,
    p.operating_hours,
    p.is_24_hours,
    p.is_verified,
    p.logo_url,
    p.rating,
    p.total_reports,
    p.created_at,
    p.updated_at
  FROM pharmacies p
  WHERE p.slug = p_slug
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION get_pharmacy_by_slug IS 'Fetch a single pharmacy by its URL-friendly slug';

-- -----------------------------------------------------------------------------
-- GET PHARMACY CONTRIBUTORS
-- -----------------------------------------------------------------------------
-- Returns top contributors who have reported stock at a specific pharmacy.

CREATE OR REPLACE FUNCTION get_pharmacy_contributors(
  p_pharmacy_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  display_name VARCHAR(100),
  avatar_url TEXT,
  alay_level user_level,
  contribution_count BIGINT,
  last_contributed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.id AS user_id,
    pr.display_name,
    pr.avatar_url,
    pr.level AS alay_level,
    COUNT(ir.id) AS contribution_count,
    MAX(ir.created_at) AS last_contributed_at
  FROM inventory_reports ir
  INNER JOIN profiles pr ON pr.id = ir.reported_by
  WHERE ir.pharmacy_id = p_pharmacy_id
  GROUP BY pr.id, pr.display_name, pr.avatar_url, pr.level
  ORDER BY contribution_count DESC, last_contributed_at DESC
  LIMIT p_limit;
END;
$$;

COMMENT ON FUNCTION get_pharmacy_contributors IS 'Get top contributors who have reported stock at a pharmacy';
