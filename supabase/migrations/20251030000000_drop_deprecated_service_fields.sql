-- Drop deprecated service_type and service_family columns
-- These are replaced by the features JSONB field which provides flexible metadata

ALTER TABLE service_products
  DROP COLUMN IF EXISTS service_type,
  DROP COLUMN IF EXISTS service_family;

-- Update comment on features column
COMMENT ON COLUMN service_products.features IS
  'JSONB with dynamic features using feature_definitions. Replaces deprecated service_type and service_family columns.';

-- Note: coverage_mode and service_product_coverage_deltas table remain unchanged
-- These are actively used for inherit/override coverage functionality
