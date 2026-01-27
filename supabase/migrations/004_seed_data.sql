-- =============================================================================
-- Curio Medicine Finder - Seed Data
-- Migration: 004_seed_data.sql
-- =============================================================================
-- This migration inserts sample data for development and testing:
-- 1. 6 pharmacies around Malolos, Bulacan (near BulSU)
-- 2. 10 common OTC medicines
-- 3. Sample inventory reports
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PHARMACIES
-- -----------------------------------------------------------------------------
-- Located around Malolos, Bulacan city center and near BulSU
-- Default location: 14.8527, 120.8150 (Malolos city center)

INSERT INTO pharmacies (id, name, slug, location, address, city, phone, type, chain_name, operating_hours, is_24_hours, is_verified) VALUES

-- Mercury Drug (Chain) - Near BulSU Main Gate
(
  'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
  'Mercury Drug - BulSU',
  'mercury-drug-bulsu',
  ST_SetSRID(ST_MakePoint(120.8145, 14.8532), 4326)::geography,
  'MacArthur Highway, Brgy. Guinhawa',
  'Malolos',
  '(044) 791-1234',
  'Chain',
  'Mercury Drug',
  '{"monday": "7:00 AM - 10:00 PM", "tuesday": "7:00 AM - 10:00 PM", "wednesday": "7:00 AM - 10:00 PM", "thursday": "7:00 AM - 10:00 PM", "friday": "7:00 AM - 10:00 PM", "saturday": "8:00 AM - 10:00 PM", "sunday": "8:00 AM - 9:00 PM"}',
  false,
  true
),

-- Watsons (Chain) - SM Malolos
(
  'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e',
  'Watsons - SM City Malolos',
  'watsons-sm-malolos',
  ST_SetSRID(ST_MakePoint(120.8203, 14.8478), 4326)::geography,
  'SM City Malolos, MacArthur Highway',
  'Malolos',
  '(044) 796-5678',
  'Chain',
  'Watsons',
  '{"monday": "10:00 AM - 9:00 PM", "tuesday": "10:00 AM - 9:00 PM", "wednesday": "10:00 AM - 9:00 PM", "thursday": "10:00 AM - 9:00 PM", "friday": "10:00 AM - 10:00 PM", "saturday": "10:00 AM - 10:00 PM", "sunday": "10:00 AM - 9:00 PM"}',
  false,
  true
),

-- Rose Pharmacy (Chain) - Robinsons Malolos
(
  'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f',
  'Rose Pharmacy - Robinsons Malolos',
  'rose-pharmacy-robinsons-malolos',
  ST_SetSRID(ST_MakePoint(120.8098, 14.8561), 4326)::geography,
  'Robinsons Place Malolos, Paseo del Congreso',
  'Malolos',
  '(044) 794-9012',
  'Chain',
  'Rose Pharmacy',
  '{"monday": "10:00 AM - 9:00 PM", "tuesday": "10:00 AM - 9:00 PM", "wednesday": "10:00 AM - 9:00 PM", "thursday": "10:00 AM - 9:00 PM", "friday": "10:00 AM - 9:00 PM", "saturday": "10:00 AM - 9:00 PM", "sunday": "10:00 AM - 9:00 PM"}',
  false,
  true
),

-- Generics Pharmacy (Generics) - Near Malolos Public Market
(
  'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a',
  'TGP - The Generics Pharmacy Malolos',
  'tgp-malolos',
  ST_SetSRID(ST_MakePoint(120.8167, 14.8498), 4326)::geography,
  'F. Estrella St., Brgy. Sto. Rosario',
  'Malolos',
  '(044) 792-3456',
  'Generics',
  'The Generics Pharmacy',
  '{"monday": "8:00 AM - 8:00 PM", "tuesday": "8:00 AM - 8:00 PM", "wednesday": "8:00 AM - 8:00 PM", "thursday": "8:00 AM - 8:00 PM", "friday": "8:00 AM - 8:00 PM", "saturday": "8:00 AM - 6:00 PM", "sunday": "Closed"}',
  false,
  true
),

-- Independent Pharmacy - Guinhawa area
(
  'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b',
  'Santos Drugstore',
  'santos-drugstore-guinhawa',
  ST_SetSRID(ST_MakePoint(120.8134, 14.8545), 4326)::geography,
  '123 Guinhawa St., Brgy. Guinhawa',
  'Malolos',
  '(044) 793-7890',
  'Independent',
  NULL,
  '{"monday": "7:00 AM - 9:00 PM", "tuesday": "7:00 AM - 9:00 PM", "wednesday": "7:00 AM - 9:00 PM", "thursday": "7:00 AM - 9:00 PM", "friday": "7:00 AM - 9:00 PM", "saturday": "7:00 AM - 9:00 PM", "sunday": "8:00 AM - 6:00 PM"}',
  false,
  false
),

-- Hospital Pharmacy - Bulacan Medical Center
(
  'f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c',
  'Bulacan Medical Center Pharmacy',
  'bulacan-medical-center-pharmacy',
  ST_SetSRID(ST_MakePoint(120.8089, 14.8612), 4326)::geography,
  'Bulacan Medical Center, Brgy. Longos',
  'Malolos',
  '(044) 791-0000',
  'Hospital',
  NULL,
  '{"monday": "24 hours", "tuesday": "24 hours", "wednesday": "24 hours", "thursday": "24 hours", "friday": "24 hours", "saturday": "24 hours", "sunday": "24 hours"}',
  true,
  true
);

-- -----------------------------------------------------------------------------
-- MEDICINES
-- -----------------------------------------------------------------------------
-- Common OTC medicines in the Philippines

INSERT INTO medicines (id, brand_name, generic_name, dosage, form, category, tags, requires_prescription, description, side_effects) VALUES

-- Pain Relief
(
  '11111111-1111-1111-1111-111111111111',
  'Biogesic',
  'Paracetamol',
  '500mg',
  'Tablet',
  'Pain Relief',
  ARRAY['fever', 'headache', 'body pain', 'lagnat', 'sakit ng ulo'],
  false,
  'For relief of mild to moderate pain and fever. Safe for most ages when used as directed.',
  ARRAY['Rare allergic reactions', 'Liver damage with overdose']
),
(
  '22222222-2222-2222-2222-222222222222',
  'Advil',
  'Ibuprofen',
  '200mg',
  'Tablet',
  'Pain Relief',
  ARRAY['fever', 'headache', 'muscle pain', 'toothache', 'menstrual cramps', 'dysmenorrhea'],
  false,
  'Non-steroidal anti-inflammatory drug (NSAID) for pain and fever.',
  ARRAY['Stomach upset', 'Nausea', 'Dizziness']
),
(
  '33333333-3333-3333-3333-333333333333',
  'Dolfenal',
  'Mefenamic Acid',
  '500mg',
  'Capsule',
  'Pain Relief',
  ARRAY['dysmenorrhea', 'muscle pain', 'dental pain', 'regla'],
  false,
  'NSAID for relief of mild to moderate pain especially menstrual pain.',
  ARRAY['Stomach upset', 'Drowsiness', 'Dizziness']
),

-- Respiratory
(
  '44444444-4444-4444-4444-444444444444',
  'Neozep',
  'Paracetamol + Phenylephrine + Chlorphenamine',
  '500mg/10mg/2mg',
  'Tablet',
  'Respiratory',
  ARRAY['colds', 'flu', 'sipon', 'ubo', 'runny nose', 'sore throat'],
  false,
  'Multi-symptom relief for colds and flu including fever, nasal congestion, and runny nose.',
  ARRAY['Drowsiness', 'Dry mouth', 'Dizziness']
),
(
  '55555555-5555-5555-5555-555555555555',
  'Solmux',
  'Carbocisteine',
  '500mg',
  'Capsule',
  'Respiratory',
  ARRAY['cough', 'phlegm', 'ubo', 'plema', 'mucus'],
  false,
  'Mucolytic that helps thin and loosen mucus in the airways.',
  ARRAY['Nausea', 'Diarrhea', 'Stomach discomfort']
),

-- Gastrointestinal
(
  '66666666-6666-6666-6666-666666666666',
  'Kremil-S',
  'Aluminum Hydroxide + Magnesium Hydroxide + Simethicone',
  '178mg/233mg/30mg',
  'Tablet',
  'Gastrointestinal',
  ARRAY['acidity', 'heartburn', 'gas', 'bloating', 'hyperacidity', 'kabag'],
  false,
  'Antacid with anti-gas for relief of hyperacidity and bloating.',
  ARRAY['Constipation', 'Diarrhea']
),
(
  '77777777-7777-7777-7777-777777777777',
  'Diatabs',
  'Loperamide',
  '2mg',
  'Capsule',
  'Gastrointestinal',
  ARRAY['diarrhea', 'LBM', 'loose bowel movement', 'pagtatae'],
  false,
  'Antidiarrheal medication for acute and chronic diarrhea.',
  ARRAY['Constipation', 'Abdominal cramps', 'Nausea']
),

-- Allergy
(
  '88888888-8888-8888-8888-888888888888',
  'Claritin',
  'Loratadine',
  '10mg',
  'Tablet',
  'Allergy',
  ARRAY['allergy', 'allergies', 'itching', 'hives', 'sneezing', 'runny nose', 'kati'],
  false,
  'Non-drowsy antihistamine for relief of allergy symptoms.',
  ARRAY['Headache', 'Dry mouth', 'Fatigue']
),

-- Vitamins
(
  '99999999-9999-9999-9999-999999999999',
  'Enervon',
  'Multivitamins + Iron',
  NULL,
  'Tablet',
  'Vitamins',
  ARRAY['vitamins', 'energy', 'immune system', 'bitamina', 'multivitamins'],
  false,
  'Daily multivitamin supplement with iron for energy and immunity.',
  ARRAY['Nausea', 'Constipation', 'Stomach upset']
),
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Ascorbic Acid (Generic)',
  'Vitamin C',
  '500mg',
  'Tablet',
  'Vitamins',
  ARRAY['vitamin c', 'immune', 'immunity', 'antioxidant', 'bitamina c'],
  false,
  'Vitamin C supplement for immune system support.',
  ARRAY['Stomach upset at high doses', 'Diarrhea']
);

-- -----------------------------------------------------------------------------
-- SAMPLE INVENTORY REPORTS
-- -----------------------------------------------------------------------------
-- Note: These require actual user IDs. For development, we'll create a function
-- that can be called after users are created.
-- 
-- For initial testing without users, you can run this after creating a test user:
--
-- INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price) VALUES
-- ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '11111111-1111-1111-1111-111111111111', '<USER_ID>', 'in_stock', 8.50),
-- ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '44444444-4444-4444-4444-444444444444', '<USER_ID>', 'in_stock', 12.00),
-- ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '11111111-1111-1111-1111-111111111111', '<USER_ID>', 'in_stock', 9.00);

-- Function to create sample inventory reports for a test user
CREATE OR REPLACE FUNCTION seed_inventory_reports(test_user_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mercury Drug - BulSU
  INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes) VALUES
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '11111111-1111-1111-1111-111111111111', test_user_id, 'in_stock', 8.50, 'Always available'),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '22222222-2222-2222-2222-222222222222', test_user_id, 'in_stock', 15.00, NULL),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '44444444-4444-4444-4444-444444444444', test_user_id, 'in_stock', 12.00, NULL),
  ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '55555555-5555-5555-5555-555555555555', test_user_id, 'low_stock', 9.75, 'Last few boxes');
  
  -- Watsons SM Malolos
  INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes) VALUES
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '11111111-1111-1111-1111-111111111111', test_user_id, 'in_stock', 9.00, NULL),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '33333333-3333-3333-3333-333333333333', test_user_id, 'in_stock', 18.50, NULL),
  ('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '88888888-8888-8888-8888-888888888888', test_user_id, 'in_stock', 25.00, NULL);
  
  -- TGP (Generics)
  INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes) VALUES
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', '11111111-1111-1111-1111-111111111111', test_user_id, 'in_stock', 3.50, 'Generic brand available'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', test_user_id, 'in_stock', 2.00, 'Very affordable'),
  ('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', '55555555-5555-5555-5555-555555555555', test_user_id, 'out_of_stock', NULL, 'Will restock next week');
  
  -- Hospital Pharmacy
  INSERT INTO inventory_reports (pharmacy_id, medicine_id, reported_by, status, price, notes) VALUES
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', '22222222-2222-2222-2222-222222222222', test_user_id, 'in_stock', 16.00, '24/7 available'),
  ('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', '66666666-6666-6666-6666-666666666666', test_user_id, 'in_stock', 8.00, NULL);
  
  RAISE NOTICE 'Seed inventory reports created for user %', test_user_id;
END;
$$;

COMMENT ON FUNCTION seed_inventory_reports IS 'Creates sample inventory reports for testing. Call with: SELECT seed_inventory_reports(''<USER_UUID>'');';

-- -----------------------------------------------------------------------------
-- DEVELOPMENT HELPER: Create test user profile
-- -----------------------------------------------------------------------------
-- This is helpful for local development to quickly set up a test scenario

CREATE OR REPLACE FUNCTION create_test_profile(
  p_user_id UUID,
  p_display_name VARCHAR(100) DEFAULT 'Test User'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO profiles (id, display_name, alay_points, contribution_count, level)
  VALUES (p_user_id, p_display_name, 150, 15, 'Scout')
  ON CONFLICT (id) DO UPDATE
  SET display_name = EXCLUDED.display_name;
  
  RAISE NOTICE 'Test profile created/updated for user %', p_user_id;
END;
$$;

COMMENT ON FUNCTION create_test_profile IS 'Creates a test user profile for development';
