-- =============================================================================
-- Curio Medicine Finder - Database Functions
-- Migration: 002_functions.sql
-- =============================================================================
-- This migration creates database functions for:
-- 1. find_nearby_pharmacies - Geospatial search using PostGIS
-- 2. search_medicines - Full-text search with ranking
-- 3. get_pharmacy_stock - Current stock status for a pharmacy
-- =============================================================================

-- -----------------------------------------------------------------------------
-- FIND NEARBY PHARMACIES
-- -----------------------------------------------------------------------------
-- Uses PostGIS ST_DWithin for efficient geospatial queries.
-- Returns pharmacies within radius_meters of user location, ordered by distance.

CREATE OR REPLACE FUNCTION find_nearby_pharmacies(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters INTEGER DEFAULT 2000
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
  distance_meters DOUBLE PRECISION
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
    ST_Distance(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters
  FROM pharmacies p
  WHERE ST_DWithin(
    p.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distance_meters ASC;
END;
$$;

COMMENT ON FUNCTION find_nearby_pharmacies IS 'Find pharmacies within a radius of user location using PostGIS';

-- -----------------------------------------------------------------------------
-- SEARCH MEDICINES
-- -----------------------------------------------------------------------------
-- Full-text search with weighted ranking.
-- Searches brand name, generic name, category, tags, and description.
-- Returns results ordered by relevance (rank).

CREATE OR REPLACE FUNCTION search_medicines(
  search_query TEXT,
  result_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  brand_name VARCHAR(255),
  generic_name VARCHAR(255),
  dosage VARCHAR(100),
  form medicine_form,
  category medicine_category,
  tags TEXT[],
  requires_prescription BOOLEAN,
  description TEXT,
  rank REAL
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  tsquery_val TSQUERY;
BEGIN
  -- Handle empty query
  IF search_query IS NULL OR TRIM(search_query) = '' THEN
    RETURN QUERY
    SELECT
      m.id,
      m.brand_name,
      m.generic_name,
      m.dosage,
      m.form,
      m.category,
      m.tags,
      m.requires_prescription,
      m.description,
      0::REAL AS rank
    FROM medicines m
    ORDER BY m.generic_name ASC
    LIMIT result_limit;
    RETURN;
  END IF;

  -- Convert search query to tsquery
  -- Try websearch_to_tsquery first, fallback to plainto_tsquery
  BEGIN
    tsquery_val := websearch_to_tsquery('english', search_query);
  EXCEPTION WHEN OTHERS THEN
    tsquery_val := plainto_tsquery('english', search_query);
  END;

  RETURN QUERY
  SELECT
    m.id,
    m.brand_name,
    m.generic_name,
    m.dosage,
    m.form,
    m.category,
    m.tags,
    m.requires_prescription,
    m.description,
    ts_rank_cd(m.search_vector, tsquery_val) AS rank
  FROM medicines m
  WHERE m.search_vector @@ tsquery_val
     OR m.brand_name ILIKE '%' || search_query || '%'
     OR m.generic_name ILIKE '%' || search_query || '%'
     OR search_query ILIKE ANY(m.tags)
  ORDER BY 
    -- Exact matches first
    CASE 
      WHEN m.brand_name ILIKE search_query THEN 0
      WHEN m.generic_name ILIKE search_query THEN 0
      ELSE 1
    END,
    -- Then by search rank
    ts_rank_cd(m.search_vector, tsquery_val) DESC,
    -- Then alphabetically
    m.generic_name ASC
  LIMIT result_limit;
END;
$$;

COMMENT ON FUNCTION search_medicines IS 'Full-text search for medicines with weighted ranking';

-- -----------------------------------------------------------------------------
-- GET PHARMACY STOCK
-- -----------------------------------------------------------------------------
-- Returns current (non-expired) stock reports for a pharmacy.
-- Joins with medicines and profiles for additional info.
-- Orders by most recent report first.

CREATE OR REPLACE FUNCTION get_pharmacy_stock(
  p_pharmacy_id UUID
)
RETURNS TABLE (
  medicine_id UUID,
  brand_name VARCHAR(255),
  generic_name VARCHAR(255),
  status stock_status,
  price DECIMAL(10,2),
  reported_by UUID,
  reporter_name VARCHAR(100),
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  helpful_count INTEGER,
  not_helpful_count INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (ir.medicine_id)
    ir.medicine_id,
    m.brand_name,
    m.generic_name,
    ir.status,
    ir.price,
    ir.reported_by,
    p.display_name AS reporter_name,
    ir.created_at,
    ir.expires_at,
    ir.helpful_count,
    ir.not_helpful_count
  FROM inventory_reports ir
  INNER JOIN medicines m ON m.id = ir.medicine_id
  LEFT JOIN profiles p ON p.id = ir.reported_by
  WHERE ir.pharmacy_id = p_pharmacy_id
    AND ir.expires_at > NOW()
  ORDER BY ir.medicine_id, ir.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_pharmacy_stock IS 'Get current (non-expired) stock status for a pharmacy';

-- -----------------------------------------------------------------------------
-- HELPER FUNCTION: Get medicine availability
-- -----------------------------------------------------------------------------
-- Returns count of pharmacies with each medicine in stock
-- Useful for "Available at X pharmacies" display

CREATE OR REPLACE FUNCTION get_medicine_availability(
  user_lat DOUBLE PRECISION DEFAULT NULL,
  user_lng DOUBLE PRECISION DEFAULT NULL,
  radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  medicine_id UUID,
  brand_name VARCHAR(255),
  generic_name VARCHAR(255),
  available_count BIGINT,
  nearest_pharmacy_id UUID,
  nearest_pharmacy_name VARCHAR(255),
  nearest_distance DOUBLE PRECISION
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  WITH available_stock AS (
    SELECT DISTINCT ON (ir.medicine_id, ir.pharmacy_id)
      ir.medicine_id,
      ir.pharmacy_id,
      ir.status
    FROM inventory_reports ir
    WHERE ir.expires_at > NOW()
      AND ir.status IN ('in_stock', 'low_stock')
    ORDER BY ir.medicine_id, ir.pharmacy_id, ir.created_at DESC
  ),
  pharmacy_distances AS (
    SELECT
      p.id AS pharmacy_id,
      p.name AS pharmacy_name,
      CASE 
        WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL 
        THEN ST_Distance(
          p.location,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        )
        ELSE NULL
      END AS distance
    FROM pharmacies p
    WHERE user_lat IS NULL 
       OR user_lng IS NULL 
       OR ST_DWithin(
            p.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_meters
          )
  )
  SELECT
    m.id AS medicine_id,
    m.brand_name,
    m.generic_name,
    COUNT(DISTINCT avs.pharmacy_id) AS available_count,
    (
      SELECT pd.pharmacy_id 
      FROM available_stock avs2
      INNER JOIN pharmacy_distances pd ON pd.pharmacy_id = avs2.pharmacy_id
      WHERE avs2.medicine_id = m.id
      ORDER BY pd.distance ASC NULLS LAST
      LIMIT 1
    ) AS nearest_pharmacy_id,
    (
      SELECT pd.pharmacy_name 
      FROM available_stock avs2
      INNER JOIN pharmacy_distances pd ON pd.pharmacy_id = avs2.pharmacy_id
      WHERE avs2.medicine_id = m.id
      ORDER BY pd.distance ASC NULLS LAST
      LIMIT 1
    ) AS nearest_pharmacy_name,
    (
      SELECT pd.distance 
      FROM available_stock avs2
      INNER JOIN pharmacy_distances pd ON pd.pharmacy_id = avs2.pharmacy_id
      WHERE avs2.medicine_id = m.id
      ORDER BY pd.distance ASC NULLS LAST
      LIMIT 1
    ) AS nearest_distance
  FROM medicines m
  LEFT JOIN available_stock avs ON avs.medicine_id = m.id
  GROUP BY m.id, m.brand_name, m.generic_name;
END;
$$;

COMMENT ON FUNCTION get_medicine_availability IS 'Get availability count and nearest pharmacy for all medicines';

-- -----------------------------------------------------------------------------
-- HELPER FUNCTION: User leaderboard
-- -----------------------------------------------------------------------------
-- Returns top contributors for gamification display

CREATE OR REPLACE FUNCTION get_leaderboard(
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  display_name VARCHAR(100),
  avatar_url TEXT,
  alay_points INTEGER,
  level user_level,
  contribution_count INTEGER
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.alay_points DESC) AS rank,
    p.id AS user_id,
    p.display_name,
    p.avatar_url,
    p.alay_points,
    p.level,
    p.contribution_count
  FROM profiles p
  WHERE p.alay_points > 0
  ORDER BY p.alay_points DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

COMMENT ON FUNCTION get_leaderboard IS 'Get top contributors ranked by Alay points';
