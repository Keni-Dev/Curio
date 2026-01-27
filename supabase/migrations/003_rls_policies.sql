-- =============================================================================
-- Curio Medicine Finder - Row Level Security Policies
-- Migration: 003_rls_policies.sql
-- =============================================================================
-- This migration sets up Row Level Security (RLS) policies for:
-- 1. pharmacies - Public read, admin write
-- 2. medicines - Public read, admin write
-- 3. inventory_reports - Public read, authenticated insert, owner update/delete
-- 4. profiles - Own profile read/update
-- 5. helpful_votes - One vote per user per report
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENABLE ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------

ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpful_votes ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- PHARMACIES POLICIES
-- -----------------------------------------------------------------------------
-- Public read access (anyone can view pharmacies)
-- Only service role can write (admin operations)

-- Allow anyone to read pharmacies
CREATE POLICY "Pharmacies are viewable by everyone"
  ON pharmacies
  FOR SELECT
  USING (true);

-- Only service role can insert pharmacies (done via admin dashboard)
CREATE POLICY "Pharmacies can be inserted by service role"
  ON pharmacies
  FOR INSERT
  WITH CHECK (false); -- Blocked for regular users, use service_role key for admin

-- Only service role can update pharmacies
CREATE POLICY "Pharmacies can be updated by service role"
  ON pharmacies
  FOR UPDATE
  USING (false);

-- Only service role can delete pharmacies
CREATE POLICY "Pharmacies can be deleted by service role"
  ON pharmacies
  FOR DELETE
  USING (false);

-- -----------------------------------------------------------------------------
-- MEDICINES POLICIES
-- -----------------------------------------------------------------------------
-- Public read access (anyone can search medicines)
-- Only service role can write (admin operations)

-- Allow anyone to read medicines
CREATE POLICY "Medicines are viewable by everyone"
  ON medicines
  FOR SELECT
  USING (true);

-- Only service role can insert medicines
CREATE POLICY "Medicines can be inserted by service role"
  ON medicines
  FOR INSERT
  WITH CHECK (false);

-- Only service role can update medicines
CREATE POLICY "Medicines can be updated by service role"
  ON medicines
  FOR UPDATE
  USING (false);

-- Only service role can delete medicines
CREATE POLICY "Medicines can be deleted by service role"
  ON medicines
  FOR DELETE
  USING (false);

-- -----------------------------------------------------------------------------
-- INVENTORY REPORTS POLICIES
-- -----------------------------------------------------------------------------
-- Public read (anyone can view stock reports)
-- Authenticated users can insert (crowdsourced reporting)
-- Reporters can update/delete their own reports (within expiry)

-- Allow anyone to read inventory reports
CREATE POLICY "Inventory reports are viewable by everyone"
  ON inventory_reports
  FOR SELECT
  USING (true);

-- Authenticated users can insert inventory reports
CREATE POLICY "Authenticated users can create inventory reports"
  ON inventory_reports
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = reported_by
  );

-- Users can update their own reports (only if not expired)
CREATE POLICY "Users can update their own reports"
  ON inventory_reports
  FOR UPDATE
  USING (
    auth.uid() = reported_by 
    AND expires_at > NOW()
  )
  WITH CHECK (
    auth.uid() = reported_by
  );

-- Users can delete their own reports
CREATE POLICY "Users can delete their own reports"
  ON inventory_reports
  FOR DELETE
  USING (auth.uid() = reported_by);

-- -----------------------------------------------------------------------------
-- PROFILES POLICIES
-- -----------------------------------------------------------------------------
-- Users can read any profile (for leaderboard display)
-- Users can only update their own profile

-- Allow anyone to read profiles (for public leaderboard)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile (handled by trigger, but allow for edge cases)
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- HELPFUL VOTES POLICIES
-- -----------------------------------------------------------------------------
-- Authenticated users can read votes (for count display)
-- One vote per user per report (enforced by unique constraint + policy)

-- Allow anyone to read vote counts (aggregated in reports)
CREATE POLICY "Votes are viewable by everyone"
  ON helpful_votes
  FOR SELECT
  USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
  ON helpful_votes
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = user_id
    -- Cannot vote on own reports
    AND NOT EXISTS (
      SELECT 1 FROM inventory_reports ir 
      WHERE ir.id = report_id 
      AND ir.reported_by = auth.uid()
    )
  );

-- Users can update their own votes (change vote)
CREATE POLICY "Users can update their own votes"
  ON helpful_votes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes (remove vote)
CREATE POLICY "Users can delete their own votes"
  ON helpful_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- REALTIME SUBSCRIPTIONS
-- -----------------------------------------------------------------------------
-- Enable realtime for inventory_reports table

-- This requires running in Supabase dashboard:
-- ALTER PUBLICATION supabase_realtime ADD TABLE inventory_reports;

-- For local development, you can run this if you have permissions:
DO $$
BEGIN
  -- Check if publication exists and add table
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Add inventory_reports to realtime publication if not already added
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'inventory_reports'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE inventory_reports;
    END IF;
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- Silently ignore if we don't have permission (Supabase dashboard required)
    RAISE NOTICE 'Realtime publication must be configured via Supabase dashboard';
END;
$$;

-- -----------------------------------------------------------------------------
-- GRANT STATEMENTS
-- -----------------------------------------------------------------------------
-- Ensure anon and authenticated roles have proper access

-- Pharmacies
GRANT SELECT ON pharmacies TO anon, authenticated;

-- Medicines  
GRANT SELECT ON medicines TO anon, authenticated;

-- Inventory reports
GRANT SELECT ON inventory_reports TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON inventory_reports TO authenticated;

-- Profiles
GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON profiles TO authenticated;

-- Helpful votes
GRANT SELECT ON helpful_votes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON helpful_votes TO authenticated;

-- Functions
GRANT EXECUTE ON FUNCTION find_nearby_pharmacies TO anon, authenticated;
GRANT EXECUTE ON FUNCTION search_medicines TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_pharmacy_stock TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_medicine_availability TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_leaderboard TO anon, authenticated;
