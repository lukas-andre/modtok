-- Migration: Add tier to provider_landings
-- Date: 2025-10-30
-- Purpose: Move tier management to provider_landings for manufacturer landing pages

-- Step 1: Add tier column to provider_landings
-- Reuse existing listing_tier ENUM (premium, destacado, standard)
ALTER TABLE provider_landings
ADD COLUMN tier listing_tier NOT NULL DEFAULT 'standard'::listing_tier;

COMMENT ON COLUMN provider_landings.tier IS
'Tier de la landing del fabricante: premium (landing dedicada + SEO), destacado (card bonita), standard (ficha simple)';

-- Step 2: Migrate existing tier data from manufacturer_profiles to provider_landings
-- Only for providers that have both a manufacturer_profile and a provider_landing
UPDATE provider_landings pl
SET tier = mp.tier::listing_tier
FROM manufacturer_profiles mp
WHERE pl.provider_id = mp.provider_id
  AND mp.tier IS NOT NULL;

-- Step 3: Create function to sync tier between manufacturer_profiles and provider_landings
CREATE OR REPLACE FUNCTION sync_manufacturer_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- When manufacturer_profiles.tier changes, update provider_landings.tier
  IF TG_OP = 'UPDATE' AND OLD.tier IS DISTINCT FROM NEW.tier THEN
    UPDATE provider_landings
    SET tier = NEW.tier::listing_tier,
        updated_at = now()
    WHERE provider_id = NEW.provider_id;
  END IF;

  -- When provider_landings.tier changes, update manufacturer_profiles.tier
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'provider_landings' AND OLD.tier IS DISTINCT FROM NEW.tier THEN
    UPDATE manufacturer_profiles
    SET tier = NEW.tier::text,
        updated_at = now()
    WHERE provider_id = NEW.provider_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create triggers to keep both tables in sync
CREATE TRIGGER sync_tier_from_manufacturer_profiles
AFTER UPDATE ON manufacturer_profiles
FOR EACH ROW
WHEN (OLD.tier IS DISTINCT FROM NEW.tier)
EXECUTE FUNCTION sync_manufacturer_tier();

CREATE TRIGGER sync_tier_from_provider_landings
AFTER UPDATE ON provider_landings
FOR EACH ROW
WHEN (OLD.tier IS DISTINCT FROM NEW.tier)
EXECUTE FUNCTION sync_manufacturer_tier();

COMMENT ON TRIGGER sync_tier_from_manufacturer_profiles ON manufacturer_profiles IS
'Keeps tier synchronized between manufacturer_profiles and provider_landings';

COMMENT ON TRIGGER sync_tier_from_provider_landings ON provider_landings IS
'Keeps tier synchronized between provider_landings and manufacturer_profiles';

-- Step 5: Create index for tier-based queries
CREATE INDEX IF NOT EXISTS idx_provider_landings_tier ON provider_landings(tier);

-- Step 6: Update table comment
COMMENT ON TABLE provider_landings IS
'Landing pages para fabricantes. Incluye tier (premium/destacado/standard) que define requisitos de media y SEO.
Tier sincronizado automáticamente con manufacturer_profiles.tier.';
