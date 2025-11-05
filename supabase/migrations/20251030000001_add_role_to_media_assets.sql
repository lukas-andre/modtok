-- Migration: Add role-based media system to media_assets
-- Date: 2025-10-30
-- Purpose: Unify media handling with explicit roles for tier-based requirements

-- Step 1: Create ENUM type for media roles
CREATE TYPE media_role AS ENUM (
  'thumbnail',           -- Main thumbnail/preview image
  'landing_hero',        -- Hero image for landing page (premium)
  'landing_secondary',   -- Secondary landing image (premium)
  'landing_third',       -- Third landing image (premium)
  'gallery',             -- Gallery images
  'plan',                -- Floor plan (houses)
  'brochure_pdf',        -- Brochure PDF (houses)
  'cover',               -- Cover image (providers)
  'logo'                 -- Logo (providers)
);

-- Step 2: Add role column to media_assets (nullable initially for migration)
ALTER TABLE media_assets
ADD COLUMN role media_role NULL;

-- Step 3: Add owner_context to differentiate provider identity vs provider landing
ALTER TABLE media_assets
ADD COLUMN owner_context text NULL CHECK (owner_context IN ('identity', 'landing', 'product'));

COMMENT ON COLUMN media_assets.owner_context IS
'Context for owner: identity (provider corporate), landing (provider landing page), product (service/house)';

-- Step 4: Add position column for ordering within same role
ALTER TABLE media_assets
ADD COLUMN position integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN media_assets.position IS
'Position/order within the same role (for galleries, etc.)';

-- Step 5: Migrate existing data from 'kind' to 'role'
-- Map existing kinds to roles where possible
UPDATE media_assets SET role = 'gallery'::media_role WHERE kind = 'image' AND role IS NULL;
UPDATE media_assets SET role = 'plan'::media_role WHERE kind = 'plan' AND role IS NULL;
UPDATE media_assets SET role = 'brochure_pdf'::media_role WHERE kind = 'pdf' AND role IS NULL;

-- Set default owner_context based on owner_type
UPDATE media_assets SET owner_context = 'identity' WHERE owner_type = 'provider' AND owner_context IS NULL;
UPDATE media_assets SET owner_context = 'product' WHERE owner_type IN ('house', 'service_product') AND owner_context IS NULL;
UPDATE media_assets SET owner_context = 'product' WHERE owner_type IN ('blog', 'news') AND owner_context IS NULL;

-- Step 6: Update sort_order to position for existing records
UPDATE media_assets SET position = COALESCE(sort_order, 0) WHERE position = 0;

-- Step 7: Create updated indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_media_owner_role ON media_assets(owner_type, owner_id, role);
CREATE INDEX IF NOT EXISTS idx_media_owner_context ON media_assets(owner_type, owner_id, owner_context);

-- Step 8: Drop old index if exists
DROP INDEX IF EXISTS idx_media_owner;

-- Step 9: Update owner_type enum to include provider_landing
ALTER TABLE media_assets DROP CONSTRAINT IF EXISTS media_assets_owner_type_check;
ALTER TABLE media_assets ADD CONSTRAINT media_assets_owner_type_check
CHECK (owner_type IN ('provider', 'provider_landing', 'house', 'service_product', 'blog', 'news'));

-- Step 10: Add composite unique constraint to prevent duplicate roles per owner
-- (except for roles that can have multiple like 'gallery', 'plan')
CREATE UNIQUE INDEX idx_media_unique_single_roles ON media_assets(owner_type, owner_id, role, owner_context)
WHERE role IN ('thumbnail', 'landing_hero', 'landing_secondary', 'landing_third', 'cover', 'logo');

COMMENT ON INDEX idx_media_unique_single_roles IS
'Ensures single-instance roles (thumbnail, hero, etc.) are unique per owner+context';

-- Step 11: Update table comment
COMMENT ON TABLE media_assets IS
'Media assets with role-based organization. Roles define usage context (thumbnail, landing images, gallery, etc.).
owner_context differentiates provider identity media from provider landing media.';
