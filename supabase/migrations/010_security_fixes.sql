-- =============================================================================
-- SECURITY FIXES
-- =============================================================================
-- This migration fixes security linter errors:
-- 1. security_definer_view - admin_moderation_queue view
-- 2. rls_disabled_in_public - spatial_ref_sys table (PostGIS)

-- -----------------------------------------------------------------------------
-- FIX 1: Change admin_moderation_queue to SECURITY INVOKER
-- -----------------------------------------------------------------------------
-- Drop and recreate the view with explicit SECURITY INVOKER
-- This ensures RLS policies of the querying user are enforced

DROP VIEW IF EXISTS admin_moderation_queue;

CREATE VIEW admin_moderation_queue 
WITH (security_invoker = true) AS
SELECT 
  rm.id AS moderation_id,
  rm.status AS moderation_status,
  rm.reason AS flag_reason,
  rm.created_at AS flagged_at,
  ir.id AS report_id,
  ir.status AS stock_status,
  ir.created_at AS report_created_at,
  ir.helpful_count,
  ir.not_helpful_count,
  ir.distance_from_pharmacy,
  p.name AS pharmacy_name,
  m.generic_name AS medicine_name,
  m.brand_name,
  u.display_name AS reporter_name,
  u.trust_score AS reporter_trust,
  u.level AS reporter_level,
  u.alay_points AS reporter_points,
  (
    SELECT COUNT(*) 
    FROM abuse_flags af 
    WHERE af.user_id = ir.reported_by 
    AND af.resolved_at IS NULL
  ) AS reporter_pending_flags
FROM report_moderation rm
JOIN inventory_reports ir ON rm.report_id = ir.id
JOIN pharmacies p ON ir.pharmacy_id = p.id
JOIN medicines m ON ir.medicine_id = m.id
JOIN profiles u ON ir.reported_by = u.id
WHERE rm.status = 'pending'
ORDER BY rm.created_at DESC;

-- Re-grant access to the view
GRANT SELECT ON admin_moderation_queue TO authenticated;

-- -----------------------------------------------------------------------------
-- FIX 2: Hide spatial_ref_sys from PostgREST API
-- -----------------------------------------------------------------------------
-- spatial_ref_sys is a PostGIS system table owned by the extension.
-- We can't enable RLS on it (not the owner), but we can hide it from the API
-- by revoking access from the api schemas or moving it out of public schema.
-- 
-- The recommended Supabase approach is to revoke access from anon/authenticated.
-- If that fails due to permissions, the table can be ignored as it only contains
-- coordinate system reference data (not sensitive).
--
-- Note: If this error persists, you may need to run this as superuser in the
-- Supabase Dashboard SQL Editor, or simply accept this as a known limitation
-- since spatial_ref_sys contains only public coordinate reference data.

DO $$
BEGIN
  -- Try to revoke access (may fail if we don't have permission)
  EXECUTE 'REVOKE SELECT ON public.spatial_ref_sys FROM anon, authenticated';
EXCEPTION
  WHEN insufficient_privilege THEN
    -- If we can't revoke, log a notice but continue
    RAISE NOTICE 'Cannot revoke access to spatial_ref_sys - owned by PostGIS extension. This table only contains public coordinate reference data and is not a security risk.';
END $$;
