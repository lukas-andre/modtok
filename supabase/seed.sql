-- ============================================================================
-- Modtok Test Seeds - Provider Minimalista Model
-- ============================================================================
-- Fecha: 2025-10-29
-- Descripción: Seeds mínimos para testing del modelo Provider minimalista
--
-- Incluye:
-- - House topologies básicas
-- - 3 fabricantes de prueba
-- - Manufacturer profiles con capabilities
-- - Coverage regions
-- - 2 casas de ejemplo
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. HOUSE TOPOLOGIES
-- ============================================================================

INSERT INTO house_topologies (code, description, bedrooms, bathrooms, is_active, display_order) VALUES
  ('1D/1B', '1 Dormitorio, 1 Baño', 1, 1, true, 1),
  ('2D/1B', '2 Dormitorios, 1 Baño', 2, 1, true, 2),
  ('2D/2B', '2 Dormitorios, 2 Baños', 2, 2, true, 3),
  ('3D/2B', '3 Dormitorios, 2 Baños', 3, 2, true, 4),
  ('3D/3B', '3 Dormitorios, 3 Baños', 3, 3, true, 5),
  ('4D/2B', '4 Dormitorios, 2 Baños', 4, 2, true, 6),
  ('4D/3B', '4 Dormitorios, 3 Baños', 4, 3, true, 7)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. TEST MANUFACTURERS (Provider Minimalista)
-- ============================================================================

-- Provider 1: Modular SIP Chile (Premium manufacturer)
INSERT INTO providers (
  id,
  company_name,
  slug,
  email,
  phone,
  whatsapp,
  website,
  description,
  address,
  city,
  hq_region_code,
  is_manufacturer,
  is_service_provider,
  status,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Modular SIP Chile',
  'modular-sip-chile',
  'contacto@modularsipchile.cl',
  '+56912345678',
  '+56912345678',
  'https://modularsipchile.cl',
  'Especialistas en construcción modular con sistema SIP (Structural Insulated Panels). Más de 15 años de experiencia en Chile.',
  'Av. Providencia 1234',
  'Santiago',
  'RM',
  true,
  false,
  'active',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Provider 2: Tiny Houses del Sur (Tiny houses specialist)
INSERT INTO providers (
  id,
  company_name,
  slug,
  email,
  phone,
  whatsapp,
  website,
  description,
  address,
  city,
  hq_region_code,
  is_manufacturer,
  is_service_provider,
  status,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Tiny Houses del Sur',
  'tiny-houses-del-sur',
  'info@tinyhousesdelsur.cl',
  '+56987654321',
  '+56987654321',
  'https://tinyhousesdelsur.cl',
  'Construcción de tiny houses y casas móviles en el sur de Chile. Sustentabilidad y diseño personalizado.',
  'Camino Los Pellines 567',
  'Puerto Varas',
  'X',
  true,
  true,
  'active',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Provider 3: Prefabricados Valparaíso (Container specialist)
INSERT INTO providers (
  id,
  company_name,
  slug,
  email,
  phone,
  whatsapp,
  website,
  description,
  address,
  city,
  hq_region_code,
  is_manufacturer,
  is_service_provider,
  status,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Prefabricados Valparaíso',
  'prefabricados-valparaiso',
  'ventas@prefabvalpo.cl',
  '+56956781234',
  '+56956781234',
  'https://prefabvalpo.cl',
  'Soluciones modulares con contenedores marítimos. Proyectos comerciales y residenciales.',
  'Av. España 890',
  'Valparaíso',
  'V',
  true,
  false,
  'pending_review',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 3. MANUFACTURER PROFILES (Capabilities)
-- ============================================================================

-- Profile 1: Modular SIP Chile (Full service, SIP specialist)
INSERT INTO manufacturer_profiles (
  provider_id,
  -- Servicios Disponibles
  dise_std,
  dise_pers,
  insta_premontada,
  contr_terreno,
  instalacion,
  kit_autocons,
  ases_tecnica,
  ases_legal,
  logist_transporte,
  financiamiento,
  -- Especialidad
  tiny_houses,
  modulares_sip,
  modulares_container,
  modulares_hormigon,
  modulares_madera,
  prefabricada_tradicional,
  oficinas_modulares,
  -- Generales
  llave_en_mano,
  publica_precios,
  precio_ref_min_m2,
  precio_ref_max_m2,
  experiencia_years,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  -- Servicios
  true,  -- diseño estándar
  true,  -- diseño personalizado
  false, -- instalación premontada
  true,  -- contratista terreno
  true,  -- instalación
  false, -- kit autoconstrucción
  true,  -- asesoría técnica
  true,  -- asesoría legal
  true,  -- logística y transporte
  true,  -- financiamiento
  -- Especialidad
  false, -- tiny houses
  true,  -- modulares SIP ✓
  false, -- modulares container
  false, -- modulares hormigón
  true,  -- modulares madera
  false, -- prefabricada tradicional
  true,  -- oficinas modulares
  -- Generales
  true,  -- llave en mano
  true,  -- publica precios
  25000, -- precio_ref_min_m2 (CLP)
  45000, -- precio_ref_max_m2 (CLP)
  15,    -- experiencia_years
  now(),
  now()
) ON CONFLICT (provider_id) DO NOTHING;

-- Profile 2: Tiny Houses del Sur (Tiny specialist, services)
INSERT INTO manufacturer_profiles (
  provider_id,
  dise_std,
  dise_pers,
  insta_premontada,
  contr_terreno,
  instalacion,
  kit_autocons,
  ases_tecnica,
  ases_legal,
  logist_transporte,
  financiamiento,
  tiny_houses,
  modulares_sip,
  modulares_container,
  modulares_hormigon,
  modulares_madera,
  prefabricada_tradicional,
  oficinas_modulares,
  llave_en_mano,
  publica_precios,
  precio_ref_min_m2,
  precio_ref_max_m2,
  experiencia_years,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  true,  -- diseño estándar
  true,  -- diseño personalizado
  false,
  false,
  true,  -- instalación
  true,  -- kit autoconstrucción
  true,  -- asesoría técnica
  false,
  true,  -- logística
  false,
  true,  -- tiny houses ✓
  false,
  false,
  false,
  true,  -- modulares madera
  false,
  false,
  true,  -- llave en mano
  true,  -- publica precios
  18000, -- precio_ref_min_m2
  35000, -- precio_ref_max_m2
  8,     -- experiencia_years
  now(),
  now()
) ON CONFLICT (provider_id) DO NOTHING;

-- Profile 3: Prefabricados Valparaíso (Container specialist)
INSERT INTO manufacturer_profiles (
  provider_id,
  dise_std,
  dise_pers,
  insta_premontada,
  contr_terreno,
  instalacion,
  kit_autocons,
  ases_tecnica,
  ases_legal,
  logist_transporte,
  financiamiento,
  tiny_houses,
  modulares_sip,
  modulares_container,
  modulares_hormigon,
  modulares_madera,
  prefabricada_tradicional,
  oficinas_modulares,
  llave_en_mano,
  publica_precios,
  precio_ref_min_m2,
  precio_ref_max_m2,
  experiencia_years,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  true,  -- diseño estándar
  false,
  false,
  false,
  true,  -- instalación
  false,
  true,  -- asesoría técnica
  false,
  true,  -- logística
  false,
  false,
  false,
  true,  -- modulares container ✓
  false,
  false,
  false,
  true,  -- oficinas modulares
  false,
  false, -- no publica precios
  null,  -- no precio ref
  null,
  12,    -- experiencia_years
  now(),
  now()
) ON CONFLICT (provider_id) DO NOTHING;

-- ============================================================================
-- 4. PROVIDER COVERAGE REGIONS
-- ============================================================================

-- Modular SIP Chile: Cobertura nacional (RM, V, VI, VIII)
INSERT INTO provider_coverage_regions (provider_id, region_code) VALUES
  ('11111111-1111-1111-1111-111111111111', 'RM'),
  ('11111111-1111-1111-1111-111111111111', 'V'),
  ('11111111-1111-1111-1111-111111111111', 'VI'),
  ('11111111-1111-1111-1111-111111111111', 'VIII')
ON CONFLICT (provider_id, region_code) DO NOTHING;

-- Tiny Houses del Sur: Sur de Chile (X, XIV, IX)
INSERT INTO provider_coverage_regions (provider_id, region_code) VALUES
  ('22222222-2222-2222-2222-222222222222', 'X'),
  ('22222222-2222-2222-2222-222222222222', 'XIV'),
  ('22222222-2222-2222-2222-222222222222', 'IX')
ON CONFLICT (provider_id, region_code) DO NOTHING;

-- Prefabricados Valparaíso: Región de Valparaíso y RM
INSERT INTO provider_coverage_regions (provider_id, region_code) VALUES
  ('33333333-3333-3333-3333-333333333333', 'V'),
  ('33333333-3333-3333-3333-333333333333', 'RM')
ON CONFLICT (provider_id, region_code) DO NOTHING;

-- ============================================================================
-- 5. TEST HOUSES (2 examples)
-- ============================================================================

-- Get topology IDs
DO $$
DECLARE
  topology_2d2b UUID;
  topology_3d2b UUID;
BEGIN
  SELECT id INTO topology_2d2b FROM house_topologies WHERE code = '2D/2B' LIMIT 1;
  SELECT id INTO topology_3d2b FROM house_topologies WHERE code = '3D/2B' LIMIT 1;

  -- House 1: Casa Lago Premium (Modular SIP Chile)
  INSERT INTO houses (
    id,
    provider_id,
    topology_id,
    name,
    slug,
    sku,
    model_code,
    description,
    description_long,
    area_m2,
    bedrooms,
    bathrooms,
    floors,
    price,
    price_per_m2,
    currency,
    delivery_time_days,
    assembly_time_days,
    status,
    tier,
    stock_status,
    stock_quantity,
    is_available,
    features,
    created_at,
    updated_at
  ) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111', -- Modular SIP Chile
    topology_2d2b,
    'Casa Lago Premium',
    'casa-lago-premium',
    'MSC-LAG-001',
    'LAGO-2024',
    'Casa modular SIP de 2 dormitorios, ideal para escapadas al campo o la playa.',
    'Casa modular construida con sistema SIP de alta eficiencia energética. Incluye cocina equipada, living-comedor integrado, 2 dormitorios con closets y 2 baños completos. Terminaciones premium y aislación térmica superior.',
    60.5,
    2,
    2,
    1,
    25000000, -- 25M CLP
    413223,   -- CLP/m2
    'CLP',
    45,  -- días entrega
    15,  -- días montaje
    'active',
    'premium',
    'available',
    5,
    true,
    '{"ventanas": "DVH", "revestimiento_exterior": "siding", "techo": "zinc_alum", "aislacion": "sip_120mm", "calefaccion": "estufa_lena", "agua_caliente": "solar"}'::jsonb,
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;

  -- House 2: Tiny Modern (Tiny Houses del Sur)
  INSERT INTO houses (
    id,
    provider_id,
    topology_id,
    name,
    slug,
    sku,
    model_code,
    description,
    description_long,
    area_m2,
    bedrooms,
    bathrooms,
    floors,
    price,
    price_per_m2,
    currency,
    delivery_time_days,
    assembly_time_days,
    status,
    tier,
    stock_status,
    stock_quantity,
    is_available,
    features,
    created_at,
    updated_at
  ) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222', -- Tiny Houses del Sur
    topology_3d2b,
    'Tiny Modern',
    'tiny-modern',
    'THS-MOD-001',
    'TINY-2024',
    'Tiny house de 3 dormitorios en dos pisos, diseño moderno y sustentable.',
    'Tiny house con diseño contemporáneo de 2 pisos. Planta baja: living-comedor-cocina integrados + 1 dormitorio + 1 baño. Planta alta: 2 dormitorios en altillo + 1 baño. Incluye paneles solares y sistema de captación de aguas lluvia.',
    45.0,
    3,
    2,
    2,
    18000000, -- 18M CLP
    400000,   -- CLP/m2
    'CLP',
    60,  -- días entrega
    10,  -- días montaje
    'active',
    'standard',
    'available',
    3,
    true,
    '{"ventanas": "DVH", "revestimiento_exterior": "madera_reciclada", "techo": "chapa_ondulada", "aislacion": "lana_mineral", "calefaccion": "estufa_pellet", "agua_caliente": "solar", "paneles_solares": true, "captacion_lluvia": true}'::jsonb,
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;
END $$;

COMMIT;

-- ============================================================================
-- FIN DE SEEDS
-- ============================================================================
