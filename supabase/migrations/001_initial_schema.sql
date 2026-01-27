-- =============================================================================
-- Curio Medicine Finder - Database Schema
-- Migration: 001_initial_schema.sql
-- =============================================================================
-- This migration creates the initial database schema including:
-- 1. Extensions (PostGIS, uuid-ossp)
-- 2. Custom enum types
-- 3. Core tables (pharmacies, medicines, inventory_reports, profiles, helpful_votes)
-- 4. Indexes for performance
-- 5. Triggers for automatic timestamp updates and search vector maintenance
-- =============================================================================

-- -----------------------------------------------------------------------------
-- EXTENSIONS
-- -----------------------------------------------------------------------------

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for fuzzy text matching (similarity search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Note: gen_random_uuid() is built-in to PostgreSQL 13+, no extension needed

-- -----------------------------------------------------------------------------
-- CUSTOM ENUM TYPES
-- -----------------------------------------------------------------------------

-- Pharmacy type classification
CREATE TYPE pharmacy_type AS ENUM (
  'Chain',
  'Independent',
  'Hospital',
  'Generics'
);

-- Medicine dosage form
CREATE TYPE medicine_form AS ENUM (
  'Tablet',
  'Capsule',
  'Syrup',
  'Suspension',
  'Injection',
  'Cream',
  'Ointment',
  'Drops',
  'Inhaler',
  'Patch',
  'Suppository',
  'Other'
);

-- Medicine category for filtering
CREATE TYPE medicine_category AS ENUM (
  'Pain Relief',
  'Antibiotics',
  'Cardiovascular',
  'Diabetes',
  'Respiratory',
  'Gastrointestinal',
  'Vitamins',
  'Dermatology',
  'Mental Health',
  'Allergy',
  'Other'
);

-- Stock availability status
CREATE TYPE stock_status AS ENUM (
  'in_stock',
  'low_stock',
  'out_of_stock'
);

-- User gamification levels (Alay system)
CREATE TYPE user_level AS ENUM (
  'Baguhan',   -- 0-99 points (Beginner)
  'Scout',     -- 100-499 points
  'Champion',  -- 500-1999 points
  'Legend'     -- 2000+ points
);

-- -----------------------------------------------------------------------------
-- CORE TABLES
-- -----------------------------------------------------------------------------

-- Pharmacies table with PostGIS location
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Malolos',
  phone VARCHAR(20),
  type pharmacy_type NOT NULL DEFAULT 'Independent',
  chain_name VARCHAR(100),
  operating_hours JSONB,
  is_24_hours BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  logo_url TEXT,
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
  total_reports INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Medicines table with full-text search support
CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_name VARCHAR(255),
  generic_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  form medicine_form,
  category medicine_category,
  tags TEXT[] DEFAULT '{}',
  requires_prescription BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  side_effects TEXT[],
  contraindications TEXT[],
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory reports (crowdsourced stock data)
CREATE TABLE inventory_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status stock_status NOT NULL,
  price DECIMAL(10,2) CHECK (price > 0),
  notes TEXT,
  reporter_location GEOGRAPHY(POINT, 4326),
  distance_from_pharmacy DECIMAL(10,2),
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '4 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User profiles (extends auth.users for Alay gamification)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  alay_points INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  contribution_count INTEGER NOT NULL DEFAULT 0,
  level user_level NOT NULL DEFAULT 'Baguhan',
  trust_score DECIMAL(3,2) NOT NULL DEFAULT 0.50 CHECK (trust_score >= 0 AND trust_score <= 1),
  last_contribution_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Helpful votes on inventory reports
CREATE TABLE helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES inventory_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(report_id, user_id) -- One vote per user per report
);

-- -----------------------------------------------------------------------------
-- INDEXES
-- -----------------------------------------------------------------------------

-- Pharmacies
CREATE INDEX idx_pharmacies_location ON pharmacies USING GIST (location);
CREATE INDEX idx_pharmacies_city ON pharmacies (city);
CREATE INDEX idx_pharmacies_type ON pharmacies (type);
CREATE INDEX idx_pharmacies_slug ON pharmacies (slug);
CREATE INDEX idx_pharmacies_is_24_hours ON pharmacies (is_24_hours);

-- Medicines
CREATE INDEX idx_medicines_search_vector ON medicines USING GIN (search_vector);
CREATE INDEX idx_medicines_generic_name ON medicines (generic_name);
CREATE INDEX idx_medicines_brand_name ON medicines (brand_name);
CREATE INDEX idx_medicines_category ON medicines (category);
CREATE INDEX idx_medicines_tags ON medicines USING GIN (tags);

-- Inventory reports
CREATE INDEX idx_inventory_pharmacy ON inventory_reports (pharmacy_id);
CREATE INDEX idx_inventory_medicine ON inventory_reports (medicine_id);
CREATE INDEX idx_inventory_reporter ON inventory_reports (reported_by);
CREATE INDEX idx_inventory_status ON inventory_reports (status);
CREATE INDEX idx_inventory_expires ON inventory_reports (expires_at);
CREATE INDEX idx_inventory_created ON inventory_reports (created_at DESC);
-- Composite index for finding current stock
CREATE INDEX idx_inventory_current_stock ON inventory_reports (pharmacy_id, medicine_id, expires_at DESC);

-- Profiles
CREATE INDEX idx_profiles_level ON profiles (level);
CREATE INDEX idx_profiles_points ON profiles (alay_points DESC);
CREATE INDEX idx_profiles_trust ON profiles (trust_score);

-- Helpful votes
CREATE INDEX idx_votes_report ON helpful_votes (report_id);
CREATE INDEX idx_votes_user ON helpful_votes (user_id);

-- -----------------------------------------------------------------------------
-- TRIGGERS
-- -----------------------------------------------------------------------------

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER trigger_pharmacies_updated_at
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_medicines_updated_at
  BEFORE UPDATE ON medicines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to maintain medicine search vector
CREATE OR REPLACE FUNCTION update_medicine_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.brand_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.generic_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.category::text, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply search vector trigger to medicines
CREATE TRIGGER trigger_medicines_search_vector
  BEFORE INSERT OR UPDATE ON medicines
  FOR EACH ROW EXECUTE FUNCTION update_medicine_search_vector();

-- Function to update pharmacy report count and user stats
CREATE OR REPLACE FUNCTION update_report_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment pharmacy total_reports
    UPDATE pharmacies SET total_reports = total_reports + 1 WHERE id = NEW.pharmacy_id;
    
    -- Update user contribution stats
    UPDATE profiles 
    SET 
      contribution_count = contribution_count + 1,
      alay_points = alay_points + 10, -- Base points for reporting
      last_contribution_at = NOW()
    WHERE id = NEW.reported_by;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement pharmacy total_reports
    UPDATE pharmacies SET total_reports = GREATEST(total_reports - 1, 0) WHERE id = OLD.pharmacy_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply report stats trigger
CREATE TRIGGER trigger_inventory_report_stats
  AFTER INSERT OR DELETE ON inventory_reports
  FOR EACH ROW EXECUTE FUNCTION update_report_stats();

-- Function to update vote counts on inventory reports
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_helpful THEN
      UPDATE inventory_reports SET helpful_count = helpful_count + 1 WHERE id = NEW.report_id;
    ELSE
      UPDATE inventory_reports SET not_helpful_count = not_helpful_count + 1 WHERE id = NEW.report_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote change
    IF OLD.is_helpful AND NOT NEW.is_helpful THEN
      UPDATE inventory_reports 
      SET helpful_count = GREATEST(helpful_count - 1, 0),
          not_helpful_count = not_helpful_count + 1 
      WHERE id = NEW.report_id;
    ELSIF NOT OLD.is_helpful AND NEW.is_helpful THEN
      UPDATE inventory_reports 
      SET not_helpful_count = GREATEST(not_helpful_count - 1, 0),
          helpful_count = helpful_count + 1 
      WHERE id = NEW.report_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.is_helpful THEN
      UPDATE inventory_reports SET helpful_count = GREATEST(helpful_count - 1, 0) WHERE id = OLD.report_id;
    ELSE
      UPDATE inventory_reports SET not_helpful_count = GREATEST(not_helpful_count - 1, 0) WHERE id = OLD.report_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply vote counts trigger
CREATE TRIGGER trigger_helpful_votes_counts
  AFTER INSERT OR UPDATE OR DELETE ON helpful_votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- Function to update user level based on points
CREATE OR REPLACE FUNCTION update_user_level()
RETURNS TRIGGER AS $$
BEGIN
  NEW.level := CASE
    WHEN NEW.alay_points >= 2000 THEN 'Legend'::user_level
    WHEN NEW.alay_points >= 500 THEN 'Champion'::user_level
    WHEN NEW.alay_points >= 100 THEN 'Scout'::user_level
    ELSE 'Baguhan'::user_level
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply user level trigger
CREATE TRIGGER trigger_profiles_level
  BEFORE INSERT OR UPDATE OF alay_points ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_user_level();

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- -----------------------------------------------------------------------------
-- COMMENTS
-- -----------------------------------------------------------------------------

COMMENT ON TABLE pharmacies IS 'Pharmacy locations with PostGIS geospatial data';
COMMENT ON TABLE medicines IS 'Medicine catalog with full-text search support';
COMMENT ON TABLE inventory_reports IS 'Crowdsourced stock reports with 4-hour expiry';
COMMENT ON TABLE profiles IS 'User profiles for Alay gamification system';
COMMENT ON TABLE helpful_votes IS 'User votes on report accuracy';

COMMENT ON COLUMN pharmacies.location IS 'PostGIS geography point (SRID 4326)';
COMMENT ON COLUMN pharmacies.operating_hours IS 'JSON object with day keys (monday-sunday) and time values';
COMMENT ON COLUMN medicines.search_vector IS 'Auto-generated tsvector for full-text search';
COMMENT ON COLUMN inventory_reports.expires_at IS 'Report validity expires after 4 hours by default';
COMMENT ON COLUMN inventory_reports.distance_from_pharmacy IS 'Distance in meters between reporter and pharmacy (for anti-abuse)';
COMMENT ON COLUMN profiles.trust_score IS 'User trustworthiness score (0.0-1.0) for anti-abuse';
COMMENT ON COLUMN profiles.level IS 'Gamification level based on alay_points';
