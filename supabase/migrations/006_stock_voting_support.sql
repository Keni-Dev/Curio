-- =============================================================================
-- Migration: Add Anonymous Voting Support
-- Purpose: Support anonymous voting via device fingerprint for non-authenticated users
-- =============================================================================

-- Add device_fingerprint column to helpful_votes for anonymous voting
ALTER TABLE helpful_votes 
  ALTER COLUMN user_id DROP NOT NULL;

-- Add device_fingerprint column
ALTER TABLE helpful_votes 
  ADD COLUMN device_fingerprint VARCHAR(64);

-- Add unique constraint for device fingerprint per report (anonymous users)
CREATE UNIQUE INDEX idx_votes_device_fingerprint 
  ON helpful_votes (report_id, device_fingerprint) 
  WHERE device_fingerprint IS NOT NULL;

-- Update constraint comment
COMMENT ON TABLE helpful_votes IS 
  'Tracks helpful/not helpful votes on inventory reports. Supports both authenticated users (user_id) and anonymous users (device_fingerprint).';

-- =============================================================================
-- RPC Function: Increment Helpful Count (Anonymous)
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_helpful_count(
  p_report_id UUID,
  p_is_helpful BOOLEAN,
  p_device_fingerprint VARCHAR(64) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_existing_vote_id UUID;
  v_result JSON;
  v_report RECORD;
BEGIN
  -- Check if this device has already voted (anonymous vote)
  IF p_device_fingerprint IS NOT NULL THEN
    SELECT id INTO v_existing_vote_id 
    FROM helpful_votes 
    WHERE report_id = p_report_id 
      AND device_fingerprint = p_device_fingerprint;
    
    IF v_existing_vote_id IS NOT NULL THEN
      RETURN json_build_object(
        'success', false,
        'error', 'already_voted',
        'message', 'This device has already voted on this report'
      );
    END IF;
    
    -- Insert anonymous vote
    INSERT INTO helpful_votes (report_id, is_helpful, device_fingerprint)
    VALUES (p_report_id, p_is_helpful, p_device_fingerprint);
  ELSE
    -- For authenticated users, check user_id (handled by existing upsert logic)
    RETURN json_build_object(
      'success', false,
      'error', 'invalid_request',
      'message', 'Device fingerprint required for anonymous voting'
    );
  END IF;
  
  -- Get updated counts
  SELECT helpful_count, not_helpful_count 
  INTO v_report
  FROM inventory_reports 
  WHERE id = p_report_id;
  
  RETURN json_build_object(
    'success', true,
    'helpful_count', v_report.helpful_count,
    'not_helpful_count', v_report.not_helpful_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION increment_helpful_count TO anon, authenticated;

-- =============================================================================
-- RPC Function: Get Stock Confidence Score
-- =============================================================================

CREATE OR REPLACE FUNCTION get_stock_confidence(
  p_report_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_report RECORD;
  v_freshness DECIMAL;
  v_vote_ratio DECIMAL;
  v_confidence DECIMAL;
  v_age_hours DECIMAL;
BEGIN
  -- Get report data
  SELECT 
    helpful_count,
    not_helpful_count,
    created_at,
    expires_at,
    status
  INTO v_report
  FROM inventory_reports
  WHERE id = p_report_id;
  
  IF v_report IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'not_found'
    );
  END IF;
  
  -- Calculate age in hours
  v_age_hours := EXTRACT(EPOCH FROM (NOW() - v_report.created_at)) / 3600;
  
  -- Calculate freshness (exponential decay over 4 hours)
  -- Freshness = e^(-λt) where λ = ln(2)/2 for 4-hour decay
  v_freshness := EXP(-0.347 * v_age_hours);
  IF v_freshness < 0 THEN v_freshness := 0; END IF;
  IF v_freshness > 1 THEN v_freshness := 1; END IF;
  
  -- Calculate vote ratio component
  IF (v_report.helpful_count + v_report.not_helpful_count) > 0 THEN
    v_vote_ratio := v_report.helpful_count::DECIMAL / 
                    (v_report.helpful_count + v_report.not_helpful_count)::DECIMAL;
  ELSE
    v_vote_ratio := 0.5;
  END IF;
  
  -- Calculate confidence: freshness + vote bonus
  v_confidence := v_freshness + ((v_vote_ratio - 0.5) * 0.3);
  IF v_confidence < 0 THEN v_confidence := 0; END IF;
  IF v_confidence > 1 THEN v_confidence := 1; END IF;
  
  RETURN json_build_object(
    'success', true,
    'report_id', p_report_id,
    'freshness', ROUND(v_freshness, 3),
    'vote_ratio', ROUND(v_vote_ratio, 3),
    'confidence', ROUND(v_confidence, 3),
    'age_hours', ROUND(v_age_hours, 2),
    'helpful_count', v_report.helpful_count,
    'not_helpful_count', v_report.not_helpful_count,
    'status', v_report.status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_stock_confidence TO anon, authenticated;

-- =============================================================================
-- Index for expired reports cleanup
-- =============================================================================

-- Simple index on expires_at for efficient filtering
CREATE INDEX IF NOT EXISTS idx_inventory_expired 
  ON inventory_reports (expires_at);
