-- Seed data for camp zones and pitches
-- Run this after the migrations have been applied

-- Note: Replace camp_id values with actual camp UUIDs from your camps table
-- This is sample data matching the frontend camps.ts data

-- First, let's create a helper function to get camp ID by name (for demo purposes)
-- In production, you would use actual UUIDs

-- Sample zone data for Khao Yai Camping (assuming camp exists with name 'เขาใหญ่ แคมป์ปิ้ง')
DO $$
DECLARE
  khao_yai_camp_id uuid;
  kanchanaburi_camp_id uuid;
  saraburi_camp_id uuid;
  zone_a_id uuid;
  zone_b_id uuid;
  zone_c_id uuid;
  zone_river_id uuid;
  zone_forest_id uuid;
  zone_mist_id uuid;
  zone_cafe_id uuid;
BEGIN
  -- Get camp IDs (adjust these queries based on your actual camp data)
  SELECT id INTO khao_yai_camp_id FROM camps WHERE name LIKE '%เขาใหญ่%' LIMIT 1;
  SELECT id INTO kanchanaburi_camp_id FROM camps WHERE name LIKE '%ริมแคว%' LIMIT 1;
  SELECT id INTO saraburi_camp_id FROM camps WHERE name LIKE '%ม่อนล่อง%' LIMIT 1;

  -- If camps exist, insert zones and pitches
  IF khao_yai_camp_id IS NOT NULL THEN
    -- Zone A - Riverside
    INSERT INTO camp_zones (id, camp_id, name, name_en, description, description_en, features, price_modifier, sort_order)
    VALUES (
      gen_random_uuid(),
      khao_yai_camp_id,
      'โซน A - ริมลำธาร',
      'Zone A - Riverside',
      'พื้นที่ติดลำธาร เสียงน้ำไหลผ่อนคลาย อากาศเย็นสบาย',
      'Waterfront area with relaxing stream sounds and cool breeze',
      ARRAY['riverside', 'shaded', 'water-nearby'],
      15,
      1
    ) RETURNING id INTO zone_a_id;

    -- Pitches for Zone A
    INSERT INTO camp_pitches (zone_id, name, size, max_tents, status, features, sort_order) VALUES
      (zone_a_id, 'A1', 'large', 2, 'available', ARRAY['riverside', 'shaded'], 1),
      (zone_a_id, 'A2', 'large', 2, 'available', ARRAY['riverside', 'shaded'], 2),
      (zone_a_id, 'A3', 'medium', 1, 'available', ARRAY['riverside'], 3),
      (zone_a_id, 'A4', 'medium', 1, 'available', ARRAY['riverside'], 4),
      (zone_a_id, 'A5', 'small', 1, 'available', ARRAY['water-nearby'], 5);

    -- Zone B - Mountain View
    INSERT INTO camp_zones (id, camp_id, name, name_en, description, description_en, features, price_modifier, sort_order)
    VALUES (
      gen_random_uuid(),
      khao_yai_camp_id,
      'โซน B - วิวภูเขา',
      'Zone B - Mountain View',
      'พื้นที่บนเนินสูง มองเห็นวิวภูเขาสวยงาม เหมาะกับการดูดาว',
      'Elevated area with beautiful mountain views, perfect for stargazing',
      ARRAY['sunrise-view', 'power-hookup'],
      10,
      2
    ) RETURNING id INTO zone_b_id;

    -- Pitches for Zone B
    INSERT INTO camp_pitches (zone_id, name, size, max_tents, status, features, sort_order) VALUES
      (zone_b_id, 'B1', 'large', 2, 'available', ARRAY['sunrise-view', 'power-hookup'], 1),
      (zone_b_id, 'B2', 'large', 2, 'available', ARRAY['sunrise-view', 'power-hookup'], 2),
      (zone_b_id, 'B3', 'medium', 1, 'available', ARRAY['sunrise-view'], 3),
      (zone_b_id, 'B4', 'medium', 1, 'available', ARRAY['power-hookup'], 4),
      (zone_b_id, 'B5', 'small', 1, 'available', ARRAY['sunrise-view'], 5),
      (zone_b_id, 'B6', 'small', 1, 'available', ARRAY[]::text[], 6);

    -- Zone C - Standard
    INSERT INTO camp_zones (id, camp_id, name, name_en, description, description_en, features, price_modifier, sort_order)
    VALUES (
      gen_random_uuid(),
      khao_yai_camp_id,
      'โซน C - ทั่วไป',
      'Zone C - Standard',
      'พื้นที่มาตรฐาน ใกล้ห้องน้ำและร้านค้า สะดวกสบาย',
      'Standard area close to restrooms and facilities, convenient location',
      ARRAY['water-nearby'],
      0,
      3
    ) RETURNING id INTO zone_c_id;

    -- Pitches for Zone C
    INSERT INTO camp_pitches (zone_id, name, size, max_tents, status, features, sort_order) VALUES
      (zone_c_id, 'C1', 'large', 2, 'available', ARRAY['water-nearby'], 1),
      (zone_c_id, 'C2', 'medium', 1, 'available', ARRAY['water-nearby'], 2),
      (zone_c_id, 'C3', 'medium', 1, 'available', ARRAY[]::text[], 3),
      (zone_c_id, 'C4', 'small', 1, 'available', ARRAY[]::text[], 4),
      (zone_c_id, 'C5', 'small', 1, 'available', ARRAY[]::text[], 5),
      (zone_c_id, 'C6', 'small', 1, 'available', ARRAY[]::text[], 6),
      (zone_c_id, 'C7', 'small', 1, 'available', ARRAY[]::text[], 7),
      (zone_c_id, 'C8', 'small', 1, 'available', ARRAY[]::text[], 8);

    RAISE NOTICE 'Inserted zones and pitches for Khao Yai Camp';
  END IF;

  IF kanchanaburi_camp_id IS NOT NULL THEN
    -- Riverside Zone
    INSERT INTO camp_zones (id, camp_id, name, name_en, description, description_en, features, price_modifier, sort_order)
    VALUES (
      gen_random_uuid(),
      kanchanaburi_camp_id,
      'โซน ริมแม่น้ำ',
      'Riverside Zone',
      'พื้นที่ติดแม่น้ำแคว ตกปลาได้ บรรยากาศสงบ',
      'Right by River Kwai, fishing allowed, peaceful atmosphere',
      ARRAY['riverside', 'shaded'],
      20,
      1
    ) RETURNING id INTO zone_river_id;

    INSERT INTO camp_pitches (zone_id, name, size, max_tents, status, features, sort_order) VALUES
      (zone_river_id, 'R1', 'large', 2, 'available', ARRAY['riverside', 'shaded'], 1),
      (zone_river_id, 'R2', 'large', 2, 'available', ARRAY['riverside', 'shaded'], 2),
      (zone_river_id, 'R3', 'medium', 1, 'available', ARRAY['riverside'], 3),
      (zone_river_id, 'R4', 'medium', 1, 'available', ARRAY['riverside'], 4);

    -- Forest Zone
    INSERT INTO camp_zones (id, camp_id, name, name_en, description, description_en, features, price_modifier, sort_order)
    VALUES (
      gen_random_uuid(),
      kanchanaburi_camp_id,
      'โซน ในป่า',
      'Forest Zone',
      'พื้นที่ร่มรื่นใต้ต้นไม้ใหญ่ เย็นสบายตลอดวัน',
      'Shaded area under large trees, cool throughout the day',
      ARRAY['shaded'],
      5,
      2
    ) RETURNING id INTO zone_forest_id;

    INSERT INTO camp_pitches (zone_id, name, size, max_tents, status, features, sort_order) VALUES
      (zone_forest_id, 'F1', 'medium', 1, 'available', ARRAY['shaded'], 1),
      (zone_forest_id, 'F2', 'medium', 1, 'available', ARRAY['shaded'], 2),
      (zone_forest_id, 'F3', 'small', 1, 'available', ARRAY['shaded'], 3),
      (zone_forest_id, 'F4', 'small', 1, 'available', ARRAY['shaded'], 4),
      (zone_forest_id, 'F5', 'small', 1, 'available', ARRAY[]::text[], 5);

    RAISE NOTICE 'Inserted zones and pitches for Kanchanaburi Camp';
  END IF;

  IF saraburi_camp_id IS NOT NULL THEN
    -- Sea of Mist Zone
    INSERT INTO camp_zones (id, camp_id, name, name_en, description, description_en, features, price_modifier, sort_order)
    VALUES (
      gen_random_uuid(),
      saraburi_camp_id,
      'โซน ทะเลหมอก',
      'Sea of Mist Zone',
      'พื้นที่ชมทะเลหมอกยามเช้า ตื่นมาเห็นวิวสวยทันที',
      'Wake up to stunning sea of mist views every morning',
      ARRAY['sunrise-view'],
      25,
      1
    ) RETURNING id INTO zone_mist_id;

    INSERT INTO camp_pitches (zone_id, name, size, max_tents, status, features, sort_order) VALUES
      (zone_mist_id, 'M1', 'large', 2, 'available', ARRAY['sunrise-view'], 1),
      (zone_mist_id, 'M2', 'large', 2, 'available', ARRAY['sunrise-view'], 2),
      (zone_mist_id, 'M3', 'medium', 1, 'available', ARRAY['sunrise-view'], 3);

    -- Near Cafe Zone
    INSERT INTO camp_zones (id, camp_id, name, name_en, description, description_en, features, price_modifier, sort_order)
    VALUES (
      gen_random_uuid(),
      saraburi_camp_id,
      'โซน ใกล้คาเฟ่',
      'Near Cafe Zone',
      'พื้นที่ใกล้คาเฟ่และสิ่งอำนวยความสะดวก',
      'Convenient location near cafe and facilities',
      ARRAY['water-nearby', 'power-hookup'],
      0,
      2
    ) RETURNING id INTO zone_cafe_id;

    INSERT INTO camp_pitches (zone_id, name, size, max_tents, status, features, sort_order) VALUES
      (zone_cafe_id, 'K1', 'medium', 1, 'available', ARRAY['power-hookup'], 1),
      (zone_cafe_id, 'K2', 'medium', 1, 'available', ARRAY['power-hookup'], 2),
      (zone_cafe_id, 'K3', 'small', 1, 'available', ARRAY['water-nearby'], 3),
      (zone_cafe_id, 'K4', 'small', 1, 'available', ARRAY['water-nearby'], 4),
      (zone_cafe_id, 'K5', 'small', 1, 'available', ARRAY[]::text[], 5);

    RAISE NOTICE 'Inserted zones and pitches for Saraburi Camp';
  END IF;

END $$;
