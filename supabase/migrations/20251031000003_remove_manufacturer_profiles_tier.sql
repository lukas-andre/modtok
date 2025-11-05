-- Remove tier column from manufacturer_profiles
-- Tier solo debe estar en provider_landings (para fabricantes)
-- manufacturer_profiles solo contiene capacidades/flags/precios de referencia

-- Step 1: Drop trigger that depends on mp.tier
DROP TRIGGER IF EXISTS sync_tier_from_manufacturer_profiles ON manufacturer_profiles;

-- Step 2: Drop and recreate view manufacturer_facets_effective using pl.tier instead of mp.tier
DROP VIEW IF EXISTS manufacturer_facets_effective CASCADE;

CREATE VIEW manufacturer_facets_effective AS
SELECT
  p.id AS provider_id,
  p.company_name,
  p.slug,
  p.logo_url,
  p.cover_image_url,
  p.status,
  p.is_manufacturer,
  p.is_service_provider,
  p.hq_region_code,
  (SELECT array_agg(DISTINCT region_code ORDER BY region_code)
   FROM provider_coverage_regions
   WHERE provider_id = p.id) AS regions,
  COALESCE(v.v_dise_std, mp.dise_std, false) AS dise_std,
  COALESCE(v.v_dise_pers, mp.dise_pers, false) AS dise_pers,
  COALESCE(v.v_insta_premontada, mp.insta_premontada, false) AS insta_premontada,
  COALESCE(v.v_contr_terreno, mp.contr_terreno, false) AS contr_terreno,
  COALESCE(v.v_instalacion, mp.instalacion, false) AS instalacion,
  COALESCE(v.v_kit_autocons, mp.kit_autocons, false) AS kit_autocons,
  COALESCE(v.v_ases_tecnica, mp.ases_tecnica, false) AS ases_tecnica,
  COALESCE(v.v_ases_legal, mp.ases_legal, false) AS ases_legal,
  COALESCE(v.v_logist_transporte, mp.logist_transporte, false) AS logist_transporte,
  COALESCE(v.v_financiamiento, mp.financiamiento, false) AS financiamiento,
  COALESCE(v.v_tiny_houses, mp.tiny_houses, false) AS tiny_houses,
  COALESCE(v.v_modulares_sip, mp.modulares_sip, false) AS modulares_sip,
  COALESCE(v.v_modulares_container, mp.modulares_container, false) AS modulares_container,
  COALESCE(v.v_modulares_hormigon, mp.modulares_hormigon, false) AS modulares_hormigon,
  COALESCE(v.v_modulares_madera, mp.modulares_madera, false) AS modulares_madera,
  COALESCE(v.v_prefabricada_tradicional, mp.prefabricada_tradicional, false) AS prefabricada_tradicional,
  COALESCE(v.v_oficinas_modulares, mp.oficinas_modulares, false) AS oficinas_modulares,
  COALESCE(v.v_llave_en_mano, mp.llave_en_mano, false) AS llave_en_mano,
  COALESCE(v.v_publica_precios, mp.publica_precios, false) AS publica_precios,
  COALESCE(v.v_price_m2_min, mp.precio_ref_min_m2) AS price_m2_min,
  COALESCE(v.v_price_m2_max, mp.precio_ref_max_m2) AS price_m2_max,
  (v.provider_id IS NOT NULL) AS has_verified,
  COALESCE(v.house_count, 0::bigint) AS house_count,
  COALESCE(v.house_premium_count, 0::bigint) AS house_premium_count,
  COALESCE(v.house_destacado_count, 0::bigint) AS house_destacado_count,
  mp.verified_by_admin,
  mp.experiencia_years,
  mp.declared_at,
  p.created_at,
  p.updated_at,
  p.description,
  p.email,
  p.phone,
  p.whatsapp,
  p.website,
  p.address,
  p.city,
  pl.tier,  -- CHANGED: Now from provider_landings instead of manufacturer_profiles
  ((pl.tier = 'premium'::listing_tier) AND (pl.enabled = true) AND (pl.editorial_status = 'published'::text) AND (p.status = 'active'::listing_status)) AS has_landing,
  pl.slug AS landing_slug,
  pl.template AS landing_template
FROM providers p
LEFT JOIN manufacturer_profiles mp ON mp.provider_id = p.id
LEFT JOIN house_facets_by_provider v ON v.provider_id = p.id
LEFT JOIN provider_landings pl ON pl.provider_id = p.id
WHERE p.is_manufacturer = true AND p.status = 'active'::listing_status;

-- Step 3: Now drop the tier column
ALTER TABLE manufacturer_profiles
DROP COLUMN IF EXISTS tier;

COMMENT ON TABLE manufacturer_profiles IS 'Perfil de capacidades de fabricantes (1:1 con providers donde is_manufacturer=true). NO contiene tier. Tier del fabricante está en provider_landings.tier.';
