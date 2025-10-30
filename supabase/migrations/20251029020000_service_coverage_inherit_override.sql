-- Migration: Service Coverage Inherit/Override Architecture
-- Description: Implements geographic coverage for service_products with inherit/override pattern
-- Reference: .context/backlog/1.4.md
-- Part of: P0.5 - Schema v3 Completion

BEGIN;

-- 1) Add coverage strategy to service_products
ALTER TABLE service_products
  ADD COLUMN coverage_mode TEXT NOT NULL DEFAULT 'inherit'
  CHECK (coverage_mode IN ('inherit','override'));

COMMENT ON COLUMN service_products.coverage_mode IS
  'Coverage strategy: inherit (use provider coverage) or override (define own coverage)';

-- 2) Create coverage deltas table for service-specific regions
CREATE TABLE IF NOT EXISTS service_product_coverage_deltas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_product_id UUID NOT NULL REFERENCES service_products(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL REFERENCES regions_lkp(code) ON DELETE RESTRICT,
  op TEXT NOT NULL CHECK (op IN ('include','exclude')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (service_product_id, region_code)
);

COMMENT ON TABLE service_product_coverage_deltas IS
  'Coverage deltas for services: include adds regions, exclude removes them (when inherit mode)';
COMMENT ON COLUMN service_product_coverage_deltas.op IS
  'Operation: include (add region) or exclude (remove region from inherited coverage)';

-- 3) Index for efficient delta queries
CREATE INDEX IF NOT EXISTS idx_sp_cov_deltas_spid
  ON service_product_coverage_deltas(service_product_id, op, region_code);

-- 4) View: Effective coverage for services (for queries and filters)
CREATE OR REPLACE VIEW service_product_effective_regions AS
-- A) Override mode: use ONLY the 'include' deltas from service
SELECT sp.id AS service_product_id, d.region_code
FROM service_products sp
JOIN service_product_coverage_deltas d
  ON d.service_product_id = sp.id AND d.op='include'
WHERE sp.coverage_mode = 'override'

UNION

-- B1) Inherit mode: inherit provider coverage, removing 'exclude' deltas
SELECT sp.id AS service_product_id, prov.region_code
FROM service_products sp
JOIN providers p ON p.id = sp.provider_id
JOIN provider_coverage_regions prov ON prov.provider_id = p.id
LEFT JOIN service_product_coverage_deltas ex
  ON ex.service_product_id = sp.id AND ex.op='exclude' AND ex.region_code = prov.region_code
WHERE sp.coverage_mode = 'inherit' AND ex.region_code IS NULL

UNION

-- B2) Inherit mode: add 'include' deltas specific to this service
SELECT sp.id AS service_product_id, inc.region_code
FROM service_products sp
JOIN service_product_coverage_deltas inc
  ON inc.service_product_id = sp.id AND inc.op='include'
WHERE sp.coverage_mode = 'inherit';

COMMENT ON VIEW service_product_effective_regions IS
  'Effective coverage for services: combines coverage_mode + provider coverage + deltas';

COMMIT;
