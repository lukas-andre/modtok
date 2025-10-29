-- ============================================================================
-- Modtok Schema v3 - Core Business
-- ============================================================================
-- Fecha: 2025-10-29
-- Descripción: Migración completa que normaliza slots, cobertura, media,
--              ingestión y añade constraints de integridad.
--
-- Incluye:
-- - Lookups de regiones
-- - Normalización de cobertura geográfica
-- - Sistema de media assets polimórfico
-- - Sistema de slots normalizado (positions + orders + rotation)
-- - Sistema de ingestión n8n (raw_provider_leads + provider_aliases)
-- - Constraints y triggers de integridad
-- - View de visibilidad efectiva
-- ============================================================================

BEGIN;

-- ============================================================================
-- SECCIÓN A: LOOKUPS & NORMALIZACIÓN
-- ============================================================================

-- 1) Lookup de regiones de Chile
CREATE TABLE IF NOT EXISTS regions_lkp (
  code TEXT PRIMARY KEY,        -- "RM", "V", "VI", etc.
  name TEXT NOT NULL UNIQUE     -- "Región Metropolitana", etc.
);

-- 2) Normaliza coberturas de providers (reemplaza coverage_areas TEXT[])
CREATE TABLE IF NOT EXISTS provider_coverage_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL REFERENCES regions_lkp(code) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider_id, region_code)
);

CREATE INDEX IF NOT EXISTS idx_provider_coverage_provider
  ON provider_coverage_regions(provider_id);

-- 3) Media assets polimórfica (galerías, planos, PDFs, videos)
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('provider','house','service_product','blog','news')),
  owner_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('image','video','pdf','plan')),
  url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  sort_order INT DEFAULT 0,
  meta JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_assets_owner
  ON media_assets(owner_type, owner_id);

-- ============================================================================
-- SECCIÓN B: SLOTS NORMALIZADOS (compra/entitlement vs posiciones visibles)
-- ============================================================================

-- 1) Definición de posiciones visibles por tipo (configurable desde admin)
CREATE TABLE IF NOT EXISTS slot_positions (
  id SERIAL PRIMARY KEY,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('premium','destacado')),
  visible_count INT NOT NULL CHECK (visible_count > 0),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (slot_type)
);

COMMENT ON TABLE slot_positions IS 'Config de cuántos slots son visibles simultáneamente por tipo (ej: premium=2, destacado=4)';

-- 2) Orden/entitlement comprado (una fila = un "derecho" a entrar en la rotación)
CREATE TABLE IF NOT EXISTS slot_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_type TEXT NOT NULL CHECK (slot_type IN ('premium','destacado')),
  content_type TEXT NOT NULL CHECK (content_type IN ('provider','house','service_product')),
  content_id UUID NOT NULL,
  monthly_price NUMERIC(12,2) NOT NULL CHECK (monthly_price >= 0),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rotation_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_dates CHECK (end_date >= start_date)
);

COMMENT ON TABLE slot_orders IS 'Órdenes de slots comprados. N órdenes rotan mostrando X a la vez según slot_positions.';

-- Índice para búsquedas de slots activos
CREATE INDEX IF NOT EXISTS idx_slot_orders_active
  ON slot_orders(slot_type, is_active, start_date, end_date, rotation_order);

-- Evitar duplicados solapados (mismo contenido, mismo tipo, mismo período)
CREATE UNIQUE INDEX IF NOT EXISTS uq_slot_orders_no_overlap
  ON slot_orders (content_type, content_id, slot_type, start_date, end_date)
  WHERE is_active = true;

-- 3) Estado de rotación (opcional, para rotación server-side)
CREATE TABLE IF NOT EXISTS slot_rotation_state (
  slot_type TEXT PRIMARY KEY CHECK (slot_type IN ('premium','destacado')),
  last_rotation_at TIMESTAMPTZ,
  last_pointer INT DEFAULT 0
);

COMMENT ON TABLE slot_rotation_state IS 'Puntero de rotación server-side (opcional, si no rotas client-side)';

-- ============================================================================
-- SECCIÓN C: INGESTIÓN N8N (auditoría + deduplicación)
-- ============================================================================

-- 1) Guarda el payload crudo para auditoría y re-proceso
CREATE TABLE IF NOT EXISTS raw_provider_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at TIMESTAMPTZ DEFAULT now(),
  idempotency_key TEXT,
  payload JSONB NOT NULL,
  normalized JSONB,
  status TEXT DEFAULT 'received' CHECK (status IN ('received','matched','created','error')),
  error TEXT,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_raw_provider_leads_status
  ON raw_provider_leads(status, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_raw_provider_leads_idempotency
  ON raw_provider_leads(idempotency_key)
  WHERE idempotency_key IS NOT NULL;

COMMENT ON TABLE raw_provider_leads IS 'Auditoría de payloads de ingestión desde n8n. Permite re-proceso y debugging.';

-- 2) Llaves "alias" para resolver duplicados y acelerar matching
CREATE TABLE IF NOT EXISTS provider_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('website_domain','instagram','email')),
  value TEXT NOT NULL,  -- siempre normalizado (lowercase)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (kind, value)
);

CREATE INDEX IF NOT EXISTS idx_provider_aliases_provider
  ON provider_aliases(provider_id);

COMMENT ON TABLE provider_aliases IS 'Aliases normalizados para deduplicación (website_domain sin www, instagram sin @, email lowercase)';

-- ============================================================================
-- SECCIÓN D: CONSTRAINTS DE INTEGRIDAD
-- ============================================================================

-- 1) Asegurar valores legales de tier
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_provider_tier') THEN
    ALTER TABLE providers
      ADD CONSTRAINT chk_provider_tier CHECK (tier IN ('premium','destacado','standard'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_house_tier') THEN
    ALTER TABLE houses
      ADD CONSTRAINT chk_house_tier CHECK (tier IN ('premium','destacado','standard'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_service_tier') THEN
    ALTER TABLE service_products
      ADD CONSTRAINT chk_service_tier CHECK (tier IN ('premium','destacado','standard'));
  END IF;
END $$;

-- ============================================================================
-- SECCIÓN E: TRIGGERS DE INTEGRIDAD
-- ============================================================================

-- 1) "Sólo premium puede tener landing"
CREATE OR REPLACE FUNCTION enforce_landing_only_premium() RETURNS trigger AS $$
BEGIN
  IF NEW.has_landing_page = true AND NEW.tier <> 'premium' THEN
    RAISE EXCEPTION 'Solo items premium pueden tener landing page';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_landing_only_premium_prov ON providers;
CREATE TRIGGER trg_landing_only_premium_prov
  BEFORE INSERT OR UPDATE OF has_landing_page, tier ON providers
  FOR EACH ROW
  WHEN (NEW.has_landing_page = true)
  EXECUTE FUNCTION enforce_landing_only_premium();

DROP TRIGGER IF EXISTS trg_landing_only_premium_house ON houses;
CREATE TRIGGER trg_landing_only_premium_house
  BEFORE INSERT OR UPDATE OF has_landing_page, tier ON houses
  FOR EACH ROW
  WHEN (NEW.has_landing_page = true)
  EXECUTE FUNCTION enforce_landing_only_premium();

DROP TRIGGER IF EXISTS trg_landing_only_premium_srv ON service_products;
CREATE TRIGGER trg_landing_only_premium_srv
  BEFORE INSERT OR UPDATE OF has_landing_page, tier ON service_products
  FOR EACH ROW
  WHEN (NEW.has_landing_page = true)
  EXECUTE FUNCTION enforce_landing_only_premium();

-- 2) Auto-elevar flags de provider cuando se crea house/service
CREATE OR REPLACE FUNCTION ensure_provider_flags() RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'houses' THEN
    UPDATE providers
    SET is_manufacturer = true
    WHERE id = NEW.provider_id AND is_manufacturer = false;
  ELSIF TG_TABLE_NAME = 'service_products' THEN
    UPDATE providers
    SET is_service_provider = true
    WHERE id = NEW.provider_id AND is_service_provider = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_provider_flags_house ON houses;
CREATE TRIGGER trg_ensure_provider_flags_house
  AFTER INSERT ON houses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_provider_flags();

DROP TRIGGER IF EXISTS trg_ensure_provider_flags_service ON service_products;
CREATE TRIGGER trg_ensure_provider_flags_service
  AFTER INSERT ON service_products
  FOR EACH ROW
  EXECUTE FUNCTION ensure_provider_flags();

-- 3) Auto-calcular price_per_m2 si falta
CREATE OR REPLACE FUNCTION calc_price_per_m2() RETURNS trigger AS $$
BEGIN
  IF NEW.price IS NOT NULL
     AND NEW.area_m2 IS NOT NULL
     AND NEW.area_m2 > 0
     AND (NEW.price_per_m2 IS NULL OR NEW.price_per_m2 = 0) THEN
    NEW.price_per_m2 := ROUND(NEW.price / NEW.area_m2, 2);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_ppm2 ON houses;
CREATE TRIGGER trg_calc_ppm2
  BEFORE INSERT OR UPDATE OF price, area_m2, price_per_m2 ON houses
  FOR EACH ROW
  EXECUTE FUNCTION calc_price_per_m2();

-- ============================================================================
-- SECCIÓN F: VIEW DE VISIBILIDAD EFECTIVA
-- ============================================================================

-- Combina tier editorial + slot activo
CREATE OR REPLACE VIEW catalog_visibility_effective AS
WITH active_orders AS (
  SELECT so.*
  FROM slot_orders so
  WHERE so.is_active = true
    AND so.start_date <= CURRENT_DATE
    AND so.end_date >= CURRENT_DATE
)
SELECT
  'provider'::text AS entity_type,
  p.id AS entity_id,
  COALESCE(
    (SELECT 'premium'::text FROM active_orders ao
     WHERE ao.content_type='provider' AND ao.content_id=p.id AND ao.slot_type='premium'
     LIMIT 1),
    (SELECT 'destacado'::text FROM active_orders ao
     WHERE ao.content_type='provider' AND ao.content_id=p.id AND ao.slot_type='destacado'
     LIMIT 1),
    p.tier
  ) AS effective_tier
FROM providers p
WHERE p.status = 'active'

UNION ALL

SELECT
  'house'::text,
  h.id,
  COALESCE(
    (SELECT 'premium'::text FROM active_orders ao
     WHERE ao.content_type='house' AND ao.content_id=h.id AND ao.slot_type='premium'
     LIMIT 1),
    (SELECT 'destacado'::text FROM active_orders ao
     WHERE ao.content_type='house' AND ao.content_id=h.id AND ao.slot_type='destacado'
     LIMIT 1),
    h.tier
  )
FROM houses h
WHERE h.status = 'active'

UNION ALL

SELECT
  'service_product'::text,
  s.id,
  COALESCE(
    (SELECT 'premium'::text FROM active_orders ao
     WHERE ao.content_type='service_product' AND ao.content_id=s.id AND ao.slot_type='premium'
     LIMIT 1),
    (SELECT 'destacado'::text FROM active_orders ao
     WHERE ao.content_type='service_product' AND ao.content_id=s.id AND ao.slot_type='destacado'
     LIMIT 1),
    s.tier
  )
FROM service_products s
WHERE s.status = 'active';

COMMENT ON VIEW catalog_visibility_effective IS 'Tier efectivo (editorial + slot activo) para ordenamiento de catálogos';

-- ============================================================================
-- SECCIÓN G: SEED DATA BÁSICO
-- ============================================================================

-- 1) Seed de regiones de Chile (16 regiones)
INSERT INTO regions_lkp (code, name) VALUES
  ('XV', 'Región de Arica y Parinacota'),
  ('I', 'Región de Tarapacá'),
  ('II', 'Región de Antofagasta'),
  ('III', 'Región de Atacama'),
  ('IV', 'Región de Coquimbo'),
  ('V', 'Región de Valparaíso'),
  ('RM', 'Región Metropolitana de Santiago'),
  ('VI', 'Región del Libertador General Bernardo O''Higgins'),
  ('VII', 'Región del Maule'),
  ('XVI', 'Región de Ñuble'),
  ('VIII', 'Región del Biobío'),
  ('IX', 'Región de La Araucanía'),
  ('XIV', 'Región de Los Ríos'),
  ('X', 'Región de Los Lagos'),
  ('XI', 'Región de Aisén del General Carlos Ibáñez del Campo'),
  ('XII', 'Región de Magallanes y de la Antártica Chilena')
ON CONFLICT (code) DO NOTHING;

-- 2) Seed de slot_positions (cuántos visibles por tipo)
INSERT INTO slot_positions (slot_type, visible_count) VALUES
  ('premium', 2),
  ('destacado', 4)
ON CONFLICT (slot_type) DO UPDATE
  SET visible_count = EXCLUDED.visible_count;

COMMIT;

-- ============================================================================
-- FIN DE MIGRACIÓN
-- ============================================================================
