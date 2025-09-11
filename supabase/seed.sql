-- Seed file for MODTOK development data
-- This file contains sample data for testing

-- Insert sample users (passwords are all 'password123')
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@modtok.cl', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'provider@modtok.cl', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'user@modtok.cl', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert sample profiles
INSERT INTO profiles (id, email, full_name, phone, role, status, company_name, bio, email_verified, phone_verified)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@modtok.cl', 'Admin User', '+56912345678', 'super_admin', 'active', 'MODTOK', 'Platform Administrator', true, true),
  ('22222222-2222-2222-2222-222222222222', 'provider@modtok.cl', 'Provider User', '+56987654321', 'provider', 'active', 'Casas Modulares Chile', 'Leading modular home manufacturer', true, true),
  ('33333333-3333-3333-3333-333333333333', 'user@modtok.cl', 'Regular User', '+56911223344', 'user', 'active', NULL, 'Looking for a modular home', true, false)
ON CONFLICT DO NOTHING;

-- Insert sample providers
INSERT INTO providers (
  profile_id, category_type, company_name, slug, description, tier, status,
  email, phone, website, city, region, years_experience, llave_en_mano, financing_available
)
VALUES 
  (
    '22222222-2222-2222-2222-222222222222',
    'fabricantes',
    'Casas Modulares Chile',
    'casas-modulares-chile',
    'Líder en construcción modular con más de 10 años de experiencia',
    'premium',
    'active',
    'contacto@casamodularchile.cl',
    '+56987654321',
    'https://www.casamodularchile.cl',
    'Santiago',
    'Región Metropolitana',
    10,
    true,
    true
  )
ON CONFLICT DO NOTHING;

-- Insert sample house topologies if not exists
INSERT INTO house_topologies (code, bedrooms, bathrooms, description, display_order)
SELECT * FROM (VALUES
  ('1B1B', 1, 1, '1 habitación, 1 baño', 1),
  ('2B1B', 2, 1, '2 habitaciones, 1 baño', 2),
  ('2B2B', 2, 2, '2 habitaciones, 2 baños', 3),
  ('3B2B', 3, 2, '3 habitaciones, 2 baños', 4)
) AS v(code, bedrooms, bathrooms, description, display_order)
WHERE NOT EXISTS (SELECT 1 FROM house_topologies WHERE code = v.code);

-- Insert sample houses
WITH provider AS (
  SELECT id FROM providers WHERE slug = 'casas-modulares-chile' LIMIT 1
),
topology AS (
  SELECT id FROM house_topologies WHERE code = '2B1B' LIMIT 1
)
INSERT INTO houses (
  provider_id, name, slug, model_code, description, tier, status,
  topology_id, bedrooms, bathrooms, area_m2, floors, price, currency,
  main_material, llave_en_mano, expandable, sustainable
)
SELECT 
  p.id,
  'Casa Modelo Patagonia',
  'casa-modelo-patagonia',
  'PAT-2024',
  'Casa modular de 2 dormitorios ideal para familias pequeñas',
  'premium',
  'active',
  t.id,
  2,
  1,
  65.5,
  1,
  35000000,
  'CLP',
  'Panel SIP',
  true,
  true,
  true
FROM provider p, topology t
ON CONFLICT DO NOTHING;