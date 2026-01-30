-- =============================================================================
-- Curio Medicine Finder - Demo Seed Data
-- Migration: 007_demo_seed_data.sql
-- =============================================================================
-- This migration adds demo inventory reports for testing the stock status feature.
-- It creates demo users and populates inventory with various freshness levels.
-- =============================================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- CREATE DEMO USERS
-- -----------------------------------------------------------------------------

DO $$
DECLARE
  demo_user_id_1 UUID := 'd0000001-d000-d000-d000-d00000000001';
  demo_user_id_2 UUID := 'd0000002-d000-d000-d000-d00000000002';
  demo_user_id_3 UUID := 'd0000003-d000-d000-d000-d00000000003';
BEGIN
  -- Insert demo users into auth.users
  INSERT INTO auth.users (
    id, 
    instance_id,
    aud,
    role,
    email, 
    encrypted_password, 
    email_confirmed_at, 
    created_at, 
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  )
  VALUES 
    (
      demo_user_id_1, 
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'maria.santos@demo.curio.ph', 
      extensions.crypt('demo123', extensions.gen_salt('bf')), 
      NOW(), 
      NOW(), 
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"display_name": "Maria Santos"}'
    ),
    (
      demo_user_id_2, 
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'juan.delacruz@demo.curio.ph', 
      extensions.crypt('demo123', extensions.gen_salt('bf')), 
      NOW(), 
      NOW(), 
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"display_name": "Juan Dela Cruz"}'
    ),
    (
      demo_user_id_3, 
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'ana.reyes@demo.curio.ph', 
      extensions.crypt('demo123', extensions.gen_salt('bf')), 
      NOW(), 
      NOW(), 
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"display_name": "Ana Reyes"}'
    )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create profiles for demo users
  INSERT INTO profiles (id, display_name, avatar_url, alay_points, streak_days, contribution_count, level, trust_score, last_contribution_at)
  VALUES 
    (demo_user_id_1, 'Maria Santos', NULL, 470, 5, 47, 'Scout', 0.85, NOW() - INTERVAL '10 minutes'),
    (demo_user_id_2, 'Juan Dela Cruz', NULL, 230, 3, 23, 'Scout', 0.72, NOW() - INTERVAL '2 hours'),
    (demo_user_id_3, 'Ana Reyes', NULL, 890, 12, 89, 'Champion', 0.92, NOW() - INTERVAL '30 minutes')
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    alay_points = EXCLUDED.alay_points,
    contribution_count = EXCLUDED.contribution_count,
    level = EXCLUDED.level;
    
  RAISE NOTICE 'Demo users created successfully';
END $$;

-- -----------------------------------------------------------------------------
-- INVENTORY REPORTS - TGP Malolos (The pharmacy in your screenshot)
-- -----------------------------------------------------------------------------

-- Clear old demo data for this pharmacy first
DELETE FROM inventory_reports 
WHERE pharmacy_id = 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a'
  AND reported_by IN (
    'd0000001-d000-d000-d000-d00000000001',
    'd0000002-d000-d000-d000-d00000000002',
    'd0000003-d000-d000-d000-d00000000003'
  );

-- Insert fresh reports (reported within last 1 hour) - FRESH
INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes, helpful_count, not_helpful_count, created_at, expires_at)
VALUES 
-- Biogesic - In Stock - Very Fresh (5 min ago)
(
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  '11111111-1111-1111-1111-111111111111',
  'd0000001-d000-d000-d000-d00000000001',
  'in_stock',
  3.50,
  'Generic paracetamol available, very affordable!',
  12,
  1,
  NOW() - INTERVAL '5 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '5 minutes'
),
-- Neozep - In Stock - Fresh (25 min ago)
(
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  '44444444-4444-4444-4444-444444444444',
  'd0000003-d000-d000-d000-d00000000003',
  'in_stock',
  8.00,
  'May stock pa, 3 boxes nakita ko',
  8,
  0,
  NOW() - INTERVAL '25 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '25 minutes'
),
-- Vitamin C - Low Stock - Fresh (40 min ago)
(
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'd0000001-d000-d000-d000-d00000000001',
  'low_stock',
  2.00,
  'Konti na lang natitira, bilisan niyo!',
  5,
  2,
  NOW() - INTERVAL '40 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '40 minutes'
);

-- Insert aging reports (1.5-3 hours ago) - AGING
INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes, helpful_count, not_helpful_count, created_at, expires_at)
VALUES 
-- Solmux - In Stock - Aging (1.5 hours ago)
(
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  '55555555-5555-5555-5555-555555555555',
  'd0000002-d000-d000-d000-d00000000002',
  'in_stock',
  6.50,
  'Meron kanina, medyo marami pa',
  15,
  3,
  NOW() - INTERVAL '1 hour 30 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '1 hour 30 minutes'
),
-- Kremil-S - Low Stock - Aging (2 hours ago)
(
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  '66666666-6666-6666-6666-666666666666',
  'd0000003-d000-d000-d000-d00000000003',
  'low_stock',
  5.00,
  'May 2 boxes pa lang nung pumunta ako',
  9,
  1,
  NOW() - INTERVAL '2 hours',
  NOW() + INTERVAL '4 hours' - INTERVAL '2 hours'
);

-- Insert stale reports (3-3.5 hours ago) - STALE
INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes, helpful_count, not_helpful_count, created_at, expires_at)
VALUES 
-- Dolfenal - Out of Stock - Stale (3 hours ago)
(
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  '33333333-3333-3333-3333-333333333333',
  'd0000002-d000-d000-d000-d00000000002',
  'out_of_stock',
  NULL,
  'Wala raw po, try Mercury Drug daw',
  6,
  4,
  NOW() - INTERVAL '3 hours',
  NOW() + INTERVAL '4 hours' - INTERVAL '3 hours'
),
-- Diatabs - In Stock - Stale (3.5 hours ago)
(
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  '77777777-7777-7777-7777-777777777777',
  'd0000001-d000-d000-d000-d00000000001',
  'in_stock',
  4.50,
  'Meron nung umaga',
  3,
  2,
  NOW() - INTERVAL '3 hours 30 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '3 hours 30 minutes'
);

-- -----------------------------------------------------------------------------
-- INVENTORY REPORTS - Mercury Drug BulSU
-- -----------------------------------------------------------------------------

DELETE FROM inventory_reports 
WHERE pharmacy_id = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
  AND reported_by IN (
    'd0000001-d000-d000-d000-d00000000001',
    'd0000002-d000-d000-d000-d00000000002',
    'd0000003-d000-d000-d000-d00000000003'
  );

INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes, helpful_count, not_helpful_count, created_at, expires_at)
VALUES 
-- Biogesic - In Stock
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  '11111111-1111-1111-1111-111111111111',
  'd0000003-d000-d000-d000-d00000000003',
  'in_stock',
  8.50,
  'Always available here',
  25,
  2,
  NOW() - INTERVAL '15 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '15 minutes'
),
-- Advil - In Stock
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  '22222222-2222-2222-2222-222222222222',
  'd0000001-d000-d000-d000-d00000000001',
  'in_stock',
  15.00,
  NULL,
  18,
  1,
  NOW() - INTERVAL '45 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '45 minutes'
),
-- Neozep - Low Stock
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  '44444444-4444-4444-4444-444444444444',
  'd0000002-d000-d000-d000-d00000000002',
  'low_stock',
  12.00,
  'Last few packs, may restock bukas',
  10,
  0,
  NOW() - INTERVAL '1 hour',
  NOW() + INTERVAL '4 hours' - INTERVAL '1 hour'
),
-- Claritin - In Stock
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  '88888888-8888-8888-8888-888888888888',
  'd0000003-d000-d000-d000-d00000000003',
  'in_stock',
  28.00,
  'Branded and generic available',
  14,
  3,
  NOW() - INTERVAL '2 hours 15 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '2 hours 15 minutes'
),
-- Enervon - Out of Stock
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  '99999999-9999-9999-9999-999999999999',
  'd0000001-d000-d000-d000-d00000000001',
  'out_of_stock',
  NULL,
  'Sold out, try Watsons',
  7,
  5,
  NOW() - INTERVAL '3 hours 15 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '3 hours 15 minutes'
);

-- -----------------------------------------------------------------------------
-- INVENTORY REPORTS - Watsons SM Malolos
-- -----------------------------------------------------------------------------

DELETE FROM inventory_reports 
WHERE pharmacy_id = 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e'
  AND reported_by IN (
    'd0000001-d000-d000-d000-d00000000001',
    'd0000002-d000-d000-d000-d00000000002',
    'd0000003-d000-d000-d000-d00000000003'
  );

INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes, helpful_count, not_helpful_count, created_at, expires_at)
VALUES 
-- Biogesic
(
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  '11111111-1111-1111-1111-111111111111',
  'd0000002-d000-d000-d000-d00000000002',
  'in_stock',
  9.00,
  'Available sa counter',
  20,
  0,
  NOW() - INTERVAL '20 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '20 minutes'
),
-- Dolfenal
(
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  '33333333-3333-3333-3333-333333333333',
  'd0000003-d000-d000-d000-d00000000003',
  'in_stock',
  18.50,
  NULL,
  12,
  1,
  NOW() - INTERVAL '55 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '55 minutes'
),
-- Claritin
(
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  '88888888-8888-8888-8888-888888888888',
  'd0000001-d000-d000-d000-d00000000001',
  'in_stock',
  25.00,
  'Original brand',
  16,
  2,
  NOW() - INTERVAL '1 hour 40 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '1 hour 40 minutes'
),
-- Enervon
(
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  '99999999-9999-9999-9999-999999999999',
  'd0000002-d000-d000-d000-d00000000002',
  'in_stock',
  12.00,
  'With C and regular available',
  8,
  0,
  NOW() - INTERVAL '2 hours 30 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '2 hours 30 minutes'
);

-- -----------------------------------------------------------------------------
-- INVENTORY REPORTS - Bulacan Medical Center Pharmacy (Hospital)
-- -----------------------------------------------------------------------------

DELETE FROM inventory_reports 
WHERE pharmacy_id = 'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c'
  AND reported_by IN (
    'd0000001-d000-d000-d000-d00000000001',
    'd0000002-d000-d000-d000-d00000000002',
    'd0000003-d000-d000-d000-d00000000003'
  );

INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes, helpful_count, not_helpful_count, created_at, expires_at)
VALUES 
-- Biogesic - In Stock - Fresh (10 min ago)
(
  'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
  '11111111-1111-1111-1111-111111111111',
  'd0000001-d000-d000-d000-d00000000001',
  'in_stock',
  7.50,
  '24/7 available sa hospital pharmacy',
  18,
  1,
  NOW() - INTERVAL '10 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '10 minutes'
),
-- Advil - In Stock - Fresh (30 min ago)
(
  'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
  '22222222-2222-2222-2222-222222222222',
  'd0000003-d000-d000-d000-d00000000003',
  'in_stock',
  16.00,
  'Maraming stock, hospital grade',
  22,
  2,
  NOW() - INTERVAL '30 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '30 minutes'
),
-- Dolfenal - Low Stock - Fresh (45 min ago)
(
  'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
  '33333333-3333-3333-3333-333333333333',
  'd0000002-d000-d000-d000-d00000000002',
  'low_stock',
  19.00,
  'Konti na lang, may resupply bukas',
  8,
  1,
  NOW() - INTERVAL '45 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '45 minutes'
),
-- Neozep - In Stock - Aging (1.5 hours ago)
(
  'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
  '44444444-4444-4444-4444-444444444444',
  'd0000001-d000-d000-d000-d00000000001',
  'in_stock',
  11.00,
  'Available sa outpatient pharmacy',
  14,
  0,
  NOW() - INTERVAL '1 hour 30 minutes',
  NOW() + INTERVAL '4 hours' - INTERVAL '1 hour 30 minutes'
),
-- Kremil-S - In Stock - Aging (2 hours ago)
(
  'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
  '66666666-6666-6666-6666-666666666666',
  'd0000003-d000-d000-d000-d00000000003',
  'in_stock',
  8.00,
  'OTC section',
  11,
  2,
  NOW() - INTERVAL '2 hours',
  NOW() + INTERVAL '4 hours' - INTERVAL '2 hours'
),
-- Claritin - Out of Stock - Stale (3 hours ago)
(
  'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
  '88888888-8888-8888-8888-888888888888',
  'd0000002-d000-d000-d000-d00000000002',
  'out_of_stock',
  NULL,
  'Wala na, try Mercury Drug malapit',
  5,
  3,
  NOW() - INTERVAL '3 hours',
  NOW() + INTERVAL '4 hours' - INTERVAL '3 hours'
);

-- -----------------------------------------------------------------------------
-- HELPFUL VOTES (for demo reports)
-- -----------------------------------------------------------------------------

-- Note: We've already set helpful_count in the reports above.
-- In a real app, these would come from the helpful_votes table.
-- For demo, the counts are pre-populated.

DO $$
BEGIN
  RAISE NOTICE 'Demo seed data inserted successfully!';
  RAISE NOTICE 'TGP Malolos: 7 inventory reports';
  RAISE NOTICE 'Mercury Drug BulSU: 5 inventory reports';
  RAISE NOTICE 'Watsons SM Malolos: 4 inventory reports';
  RAISE NOTICE 'Bulacan Medical Center Pharmacy: 6 inventory reports';
END $$;
