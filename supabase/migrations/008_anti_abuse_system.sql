-- =============================================================================
-- Curio Medicine Finder - Anti-Abuse System
-- Migration: 008_anti_abuse_system.sql
-- =============================================================================
-- This migration adds anti-abuse protection for the Alay crowdsourced reporting:
-- 1. Abuse flags table for tracking suspicious activity
-- 2. Report moderation table for admin review
-- 3. Trust score adjustment functions
-- 4. Rate limiting check function
-- 5. Duplicate detection function
-- 6. Consensus calculation function
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------

-- Abuse flag types
CREATE TYPE abuse_flag_type AS ENUM (
  'rate_exceeded',
  'duplicate_report',
  'low_trust_reporter',
  'multiple_negative_votes',
  'suspicious_pattern',
  'location_spoofing',
  'rapid_conflicting_reports'
);

-- Moderation status
CREATE TYPE moderation_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'escalated'
);

-- -----------------------------------------------------------------------------
-- ABUSE FLAGS TABLE
-- -----------------------------------------------------------------------------

-- Logs suspicious activity for review
CREATE TABLE abuse_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES inventory_reports(id) ON DELETE CASCADE,
  flag_type abuse_flag_type NOT NULL,
  severity INTEGER NOT NULL DEFAULT 1 CHECK (severity >= 1 AND severity <= 5),
  details JSONB NOT NULL DEFAULT '{}',
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for abuse flags
CREATE INDEX idx_abuse_flags_user ON abuse_flags (user_id);
CREATE INDEX idx_abuse_flags_report ON abuse_flags (report_id);
CREATE INDEX idx_abuse_flags_type ON abuse_flags (flag_type);
CREATE INDEX idx_abuse_flags_unresolved ON abuse_flags (created_at) WHERE resolved_at IS NULL;

-- -----------------------------------------------------------------------------
-- REPORT MODERATION TABLE
-- -----------------------------------------------------------------------------

-- Admin moderation queue for flagged reports
CREATE TABLE report_moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES inventory_reports(id) ON DELETE CASCADE,
  status moderation_status NOT NULL DEFAULT 'pending',
  moderator_id UUID REFERENCES auth.users(id),
  reason TEXT,
  action_taken TEXT,
  original_data JSONB, -- Store original report data before any changes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  moderated_at TIMESTAMPTZ,
  UNIQUE(report_id) -- One moderation entry per report
);

-- Indexes for moderation
CREATE INDEX idx_moderation_status ON report_moderation (status);
CREATE INDEX idx_moderation_pending ON report_moderation (created_at) WHERE status = 'pending';

-- -----------------------------------------------------------------------------
-- TRUST SCORE HISTORY (for auditing)
-- -----------------------------------------------------------------------------

CREATE TABLE trust_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_score DECIMAL(3,2) NOT NULL,
  new_score DECIMAL(3,2) NOT NULL,
  change_reason TEXT NOT NULL,
  related_report_id UUID REFERENCES inventory_reports(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_history_user ON trust_score_history (user_id);
CREATE INDEX idx_trust_history_created ON trust_score_history (created_at DESC);

-- -----------------------------------------------------------------------------
-- RATE LIMITING FUNCTION
-- -----------------------------------------------------------------------------

/**
 * Check if a user can submit a new report
 * Returns: { can_report: boolean, reason: text, cooldown_ends_at: timestamptz, reports_today: int }
 */
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_pharmacy_id UUID DEFAULT NULL,
  p_medicine_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_cooldown_seconds INTEGER := 30; -- 30 second cooldown between reports
  v_max_reports_per_day INTEGER := 50;
  v_last_report TIMESTAMPTZ;
  v_reports_today INTEGER;
  v_cooldown_ends TIMESTAMPTZ;
  v_today_start TIMESTAMPTZ;
BEGIN
  v_today_start := date_trunc('day', NOW() AT TIME ZONE 'Asia/Manila');

  -- Get last report timestamp
  SELECT created_at INTO v_last_report
  FROM inventory_reports
  WHERE reported_by = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  -- Count reports today
  SELECT COUNT(*) INTO v_reports_today
  FROM inventory_reports
  WHERE reported_by = p_user_id
    AND created_at >= v_today_start;

  -- Check cooldown
  IF v_last_report IS NOT NULL AND 
     v_last_report + (v_cooldown_seconds || ' seconds')::INTERVAL > NOW() 
  THEN
    v_cooldown_ends := v_last_report + (v_cooldown_seconds || ' seconds')::INTERVAL;
    RETURN jsonb_build_object(
      'can_report', false,
      'reason', 'cooldown',
      'cooldown_ends_at', v_cooldown_ends,
      'reports_today', v_reports_today,
      'max_reports_today', v_max_reports_per_day
    );
  END IF;

  -- Check daily limit
  IF v_reports_today >= v_max_reports_per_day THEN
    RETURN jsonb_build_object(
      'can_report', false,
      'reason', 'daily_limit_reached',
      'cooldown_ends_at', NULL,
      'reports_today', v_reports_today,
      'max_reports_today', v_max_reports_per_day
    );
  END IF;

  -- Can report
  RETURN jsonb_build_object(
    'can_report', true,
    'reason', NULL,
    'cooldown_ends_at', NULL,
    'reports_today', v_reports_today,
    'max_reports_today', v_max_reports_per_day
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- DUPLICATE CHECK FUNCTION
-- -----------------------------------------------------------------------------

/**
 * Check for existing report by same user for same pharmacy/medicine within 24 hours
 * Returns the existing report if found, or null
 */
CREATE OR REPLACE FUNCTION check_duplicate_report(
  p_user_id UUID,
  p_pharmacy_id UUID,
  p_medicine_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_existing_report RECORD;
BEGIN
  SELECT 
    id,
    status,
    created_at,
    expires_at
  INTO v_existing_report
  FROM inventory_reports
  WHERE reported_by = p_user_id
    AND pharmacy_id = p_pharmacy_id
    AND medicine_id = p_medicine_id
    AND created_at >= NOW() - INTERVAL '24 hours'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_existing_report.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_duplicate', true,
      'existing_report', jsonb_build_object(
        'id', v_existing_report.id,
        'status', v_existing_report.status,
        'created_at', v_existing_report.created_at,
        'expires_at', v_existing_report.expires_at
      )
    );
  END IF;

  RETURN jsonb_build_object(
    'has_duplicate', false,
    'existing_report', NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- CONSENSUS CALCULATION FUNCTION
-- -----------------------------------------------------------------------------

/**
 * Calculate consensus stock status for a pharmacy/medicine
 * Uses trust-weighted voting from recent reports
 */
CREATE OR REPLACE FUNCTION calculate_stock_consensus(
  p_pharmacy_id UUID,
  p_medicine_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_in_stock_weight DECIMAL := 0;
  v_low_stock_weight DECIMAL := 0;
  v_out_of_stock_weight DECIMAL := 0;
  v_total_weight DECIMAL := 0;
  v_report RECORD;
  v_trust_weight DECIMAL;
  v_freshness_weight DECIMAL;
  v_vote_weight DECIMAL;
  v_combined_weight DECIMAL;
  v_consensus_status TEXT;
  v_confidence DECIMAL;
BEGIN
  -- Iterate through recent valid reports
  FOR v_report IN
    SELECT 
      ir.id,
      ir.status,
      ir.created_at,
      ir.expires_at,
      ir.helpful_count,
      ir.not_helpful_count,
      ir.distance_from_pharmacy,
      p.trust_score,
      p.level
    FROM inventory_reports ir
    JOIN profiles p ON ir.reported_by = p.id
    WHERE ir.pharmacy_id = p_pharmacy_id
      AND ir.medicine_id = p_medicine_id
      AND ir.expires_at > NOW()
    ORDER BY ir.created_at DESC
    LIMIT 10
  LOOP
    -- Calculate trust weight based on user level
    v_trust_weight := CASE v_report.level
      WHEN 'Legend' THEN 3.0
      WHEN 'Champion' THEN 2.0
      WHEN 'Scout' THEN 1.5
      ELSE 1.0
    END * v_report.trust_score;

    -- Calculate freshness weight (exponential decay over 4 hours)
    v_freshness_weight := GREATEST(0.1, 
      EXP(-1 * EXTRACT(EPOCH FROM (NOW() - v_report.created_at)) / (4 * 3600))
    );

    -- Calculate vote weight
    IF (v_report.helpful_count + v_report.not_helpful_count) > 0 THEN
      v_vote_weight := (v_report.helpful_count + 1)::DECIMAL / 
        (v_report.helpful_count + v_report.not_helpful_count + 2);
    ELSE
      v_vote_weight := 0.5; -- Neutral if no votes
    END IF;

    -- Combine weights
    v_combined_weight := v_trust_weight * v_freshness_weight * v_vote_weight;

    -- Add to appropriate status
    CASE v_report.status
      WHEN 'in_stock' THEN v_in_stock_weight := v_in_stock_weight + v_combined_weight;
      WHEN 'low_stock' THEN v_low_stock_weight := v_low_stock_weight + v_combined_weight;
      WHEN 'out_of_stock' THEN v_out_of_stock_weight := v_out_of_stock_weight + v_combined_weight;
    END CASE;

    v_total_weight := v_total_weight + v_combined_weight;
  END LOOP;

  -- No reports found
  IF v_total_weight = 0 THEN
    RETURN jsonb_build_object(
      'status', 'unknown',
      'confidence', 0,
      'in_stock_weight', 0,
      'low_stock_weight', 0,
      'out_of_stock_weight', 0,
      'total_reports', 0
    );
  END IF;

  -- Determine consensus status (require 1.5x weight difference)
  IF v_in_stock_weight > v_out_of_stock_weight * 1.5 AND 
     v_in_stock_weight > v_low_stock_weight * 1.5 
  THEN
    v_consensus_status := 'in_stock';
    v_confidence := v_in_stock_weight / v_total_weight;
  ELSIF v_out_of_stock_weight > v_in_stock_weight * 1.5 AND 
        v_out_of_stock_weight > v_low_stock_weight * 1.5 
  THEN
    v_consensus_status := 'out_of_stock';
    v_confidence := v_out_of_stock_weight / v_total_weight;
  ELSE
    v_consensus_status := 'low_stock'; -- Uncertain defaults to low_stock
    v_confidence := v_low_stock_weight / v_total_weight;
  END IF;

  RETURN jsonb_build_object(
    'status', v_consensus_status,
    'confidence', ROUND(v_confidence, 2),
    'in_stock_weight', ROUND(v_in_stock_weight, 2),
    'low_stock_weight', ROUND(v_low_stock_weight, 2),
    'out_of_stock_weight', ROUND(v_out_of_stock_weight, 2),
    'total_reports', (
      SELECT COUNT(*) 
      FROM inventory_reports 
      WHERE pharmacy_id = p_pharmacy_id 
        AND medicine_id = p_medicine_id 
        AND expires_at > NOW()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- TRUST SCORE UPDATE FUNCTION
-- -----------------------------------------------------------------------------

/**
 * Update user trust score based on report accuracy
 * Called when votes indicate report accuracy/inaccuracy
 */
CREATE OR REPLACE FUNCTION update_user_trust_score(
  p_user_id UUID,
  p_report_id UUID,
  p_is_accurate BOOLEAN
)
RETURNS VOID AS $$
DECLARE
  v_old_score DECIMAL(3,2);
  v_new_score DECIMAL(3,2);
  v_adjustment DECIMAL(3,2);
BEGIN
  -- Get current trust score
  SELECT trust_score INTO v_old_score
  FROM profiles
  WHERE id = p_user_id;

  -- Calculate adjustment
  IF p_is_accurate THEN
    v_adjustment := 0.02; -- Small boost for accurate reports
  ELSE
    v_adjustment := -0.05; -- Larger penalty for inaccurate reports
  END IF;

  -- Calculate new score (bounded 0-1)
  v_new_score := GREATEST(0, LEAST(1, v_old_score + v_adjustment));

  -- Update profile
  UPDATE profiles
  SET trust_score = v_new_score
  WHERE id = p_user_id;

  -- Log history
  INSERT INTO trust_score_history (user_id, old_score, new_score, change_reason, related_report_id)
  VALUES (
    p_user_id,
    v_old_score,
    v_new_score,
    CASE WHEN p_is_accurate THEN 'accurate_report' ELSE 'inaccurate_report' END,
    p_report_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- FLAG SUSPICIOUS ACTIVITY FUNCTION
-- -----------------------------------------------------------------------------

/**
 * Create an abuse flag for suspicious activity
 */
CREATE OR REPLACE FUNCTION flag_suspicious_activity(
  p_user_id UUID,
  p_report_id UUID,
  p_flag_type abuse_flag_type,
  p_severity INTEGER DEFAULT 1,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_flag_id UUID;
BEGIN
  INSERT INTO abuse_flags (user_id, report_id, flag_type, severity, details)
  VALUES (p_user_id, p_report_id, p_flag_type, p_severity, p_details)
  RETURNING id INTO v_flag_id;

  -- If high severity, add to moderation queue
  IF p_severity >= 3 AND p_report_id IS NOT NULL THEN
    INSERT INTO report_moderation (report_id, reason, original_data)
    VALUES (
      p_report_id,
      p_flag_type::TEXT,
      (SELECT row_to_json(ir) FROM inventory_reports ir WHERE ir.id = p_report_id)
    )
    ON CONFLICT (report_id) DO UPDATE
    SET reason = EXCLUDED.reason || ', ' || report_moderation.reason;
  END IF;

  RETURN v_flag_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- AUTOMATIC FLAGGING TRIGGER
-- -----------------------------------------------------------------------------

/**
 * Automatically flag reports based on suspicious patterns
 */
CREATE OR REPLACE FUNCTION check_report_for_abuse()
RETURNS TRIGGER AS $$
DECLARE
  v_user_trust_score DECIMAL(3,2);
  v_recent_reports INTEGER;
  v_conflicting_reports INTEGER;
BEGIN
  -- Get user trust score
  SELECT trust_score INTO v_user_trust_score
  FROM profiles
  WHERE id = NEW.reported_by;

  -- Flag if user has very low trust score
  IF v_user_trust_score < 0.2 THEN
    PERFORM flag_suspicious_activity(
      NEW.reported_by,
      NEW.id,
      'low_trust_reporter',
      2,
      jsonb_build_object('trust_score', v_user_trust_score)
    );
  END IF;

  -- Check for rapid conflicting reports (same pharmacy, different status in 1 hour)
  SELECT COUNT(*) INTO v_conflicting_reports
  FROM inventory_reports
  WHERE reported_by = NEW.reported_by
    AND pharmacy_id = NEW.pharmacy_id
    AND medicine_id = NEW.medicine_id
    AND id != NEW.id
    AND status != NEW.status
    AND created_at >= NOW() - INTERVAL '1 hour';

  IF v_conflicting_reports > 0 THEN
    PERFORM flag_suspicious_activity(
      NEW.reported_by,
      NEW.id,
      'rapid_conflicting_reports',
      3,
      jsonb_build_object('conflicting_count', v_conflicting_reports)
    );
  END IF;

  -- Flag if distance from pharmacy is suspicious (> 1km but location provided)
  IF NEW.distance_from_pharmacy IS NOT NULL AND NEW.distance_from_pharmacy > 1000 THEN
    PERFORM flag_suspicious_activity(
      NEW.reported_by,
      NEW.id,
      'location_spoofing',
      4,
      jsonb_build_object('distance', NEW.distance_from_pharmacy)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply automatic abuse checking
CREATE TRIGGER trigger_check_report_abuse
  AFTER INSERT ON inventory_reports
  FOR EACH ROW EXECUTE FUNCTION check_report_for_abuse();

-- -----------------------------------------------------------------------------
-- VOTE-BASED TRUST UPDATE TRIGGER
-- -----------------------------------------------------------------------------

/**
 * Update trust score when a report receives too many negative votes
 */
CREATE OR REPLACE FUNCTION check_votes_for_trust_update()
RETURNS TRIGGER AS $$
DECLARE
  v_reporter_id UUID;
  v_total_votes INTEGER;
  v_negative_ratio DECIMAL;
BEGIN
  -- Get reporter ID
  SELECT reported_by INTO v_reporter_id
  FROM inventory_reports
  WHERE id = NEW.report_id;

  -- Check if report has enough votes and high negative ratio
  SELECT 
    (helpful_count + not_helpful_count),
    CASE WHEN (helpful_count + not_helpful_count) > 0 
      THEN not_helpful_count::DECIMAL / (helpful_count + not_helpful_count)
      ELSE 0 
    END
  INTO v_total_votes, v_negative_ratio
  FROM inventory_reports
  WHERE id = NEW.report_id;

  -- If 3+ votes and >66% negative, flag and reduce trust
  IF v_total_votes >= 3 AND v_negative_ratio > 0.66 THEN
    -- Flag the activity
    PERFORM flag_suspicious_activity(
      v_reporter_id,
      NEW.report_id,
      'multiple_negative_votes',
      2,
      jsonb_build_object('negative_ratio', v_negative_ratio, 'total_votes', v_total_votes)
    );
    
    -- Reduce trust score
    PERFORM update_user_trust_score(v_reporter_id, NEW.report_id, false);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply vote checking trigger
CREATE TRIGGER trigger_check_votes_trust
  AFTER INSERT OR UPDATE ON helpful_votes
  FOR EACH ROW EXECUTE FUNCTION check_votes_for_trust_update();

-- -----------------------------------------------------------------------------
-- RLS POLICIES
-- -----------------------------------------------------------------------------

-- Enable RLS on new tables
ALTER TABLE abuse_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_score_history ENABLE ROW LEVEL SECURITY;

-- Abuse flags: Only admins can view/modify
CREATE POLICY "Admins can view abuse flags"
  ON abuse_flags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND level = 'Legend' -- Only Legend users (admins) can view
    )
  );

-- Report moderation: Only admins
CREATE POLICY "Admins can view moderation queue"
  ON report_moderation FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND level = 'Legend'
    )
  );

CREATE POLICY "Admins can update moderation"
  ON report_moderation FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND level = 'Legend'
    )
  );

-- Trust score history: Users can view their own
CREATE POLICY "Users can view own trust history"
  ON trust_score_history FOR SELECT
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- ADMIN VIEW FOR MODERATION
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW admin_moderation_queue AS
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

-- Grant access to the view
GRANT SELECT ON admin_moderation_queue TO authenticated;

-- -----------------------------------------------------------------------------
-- COMMENTS
-- -----------------------------------------------------------------------------

COMMENT ON TABLE abuse_flags IS 'Logs suspicious activity for anti-abuse system';
COMMENT ON TABLE report_moderation IS 'Admin moderation queue for flagged reports';
COMMENT ON TABLE trust_score_history IS 'Audit trail for user trust score changes';

COMMENT ON FUNCTION check_rate_limit IS 'Check if user can submit a new report (rate limiting)';
COMMENT ON FUNCTION check_duplicate_report IS 'Check for existing report within 24 hours';
COMMENT ON FUNCTION calculate_stock_consensus IS 'Calculate trust-weighted consensus for stock status';
COMMENT ON FUNCTION update_user_trust_score IS 'Update user trust score based on report accuracy';
COMMENT ON FUNCTION flag_suspicious_activity IS 'Create abuse flag for suspicious activity';
