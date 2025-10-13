-- FASE 1: Corrección Modelo de Datos - Providers con Múltiples Servicios + Sistema de Slots
-- Fecha: 2025-10-11
-- Descripción: Permite que providers ofrezcan múltiples servicios (fabricante + H&S)
--              Agrega sistema de slots para homepage con round-robin
--              Agrega flags editoriales para control de calidad

-- ============================================================================
-- 1. AGREGAR CAMPOS A PROVIDERS (Múltiples Servicios)
-- ============================================================================

-- Agregar flags de servicios
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS is_manufacturer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_service_provider BOOLEAN DEFAULT false;

-- Agregar campos para landing dedicada
ALTER TABLE providers
ADD COLUMN IF NOT EXISTS has_landing_page BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS landing_slug TEXT;

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_providers_is_manufacturer ON providers(is_manufacturer) WHERE is_manufacturer = true;
CREATE INDEX IF NOT EXISTS idx_providers_is_service_provider ON providers(is_service_provider) WHERE is_service_provider = true;
CREATE INDEX IF NOT EXISTS idx_providers_multiple_services ON providers(is_manufacturer, is_service_provider) WHERE is_manufacturer = true OR is_service_provider = true;

-- Comentarios
COMMENT ON COLUMN providers.is_manufacturer IS 'TRUE si el provider fabrica casas modulares';
COMMENT ON COLUMN providers.is_service_provider IS 'TRUE si el provider ofrece servicios de habilitación';
COMMENT ON COLUMN providers.has_landing_page IS 'TRUE si tiene landing page dedicada (tier premium)';
COMMENT ON COLUMN providers.landing_slug IS 'Slug único para landing dedicada';

-- ============================================================================
-- 2. AGREGAR FLAGS EDITORIALES A HOUSES
-- ============================================================================

ALTER TABLE houses
ADD COLUMN IF NOT EXISTS has_quality_images BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_complete_info BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS editor_approved_for_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_landing_page BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS landing_slug TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_houses_editor_approved ON houses(editor_approved_for_premium) WHERE editor_approved_for_premium = true;
CREATE INDEX IF NOT EXISTS idx_houses_has_landing ON houses(has_landing_page) WHERE has_landing_page = true;

-- Comentarios
COMMENT ON COLUMN houses.has_quality_images IS 'Flag editorial: imágenes de calidad para tier premium';
COMMENT ON COLUMN houses.has_complete_info IS 'Flag editorial: información completa y verificada';
COMMENT ON COLUMN houses.editor_approved_for_premium IS 'Flag editorial: aprobado para tier premium';
COMMENT ON COLUMN houses.has_landing_page IS 'TRUE si tiene landing page dedicada';
COMMENT ON COLUMN houses.landing_slug IS 'Slug único para landing dedicada';

-- ============================================================================
-- 3. AGREGAR FLAGS EDITORIALES A SERVICE_PRODUCTS
-- ============================================================================

ALTER TABLE service_products
ADD COLUMN IF NOT EXISTS has_quality_images BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_complete_info BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS editor_approved_for_premium BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_landing_page BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS landing_slug TEXT;

-- Índices
CREATE INDEX IF NOT EXISTS idx_service_products_editor_approved ON service_products(editor_approved_for_premium) WHERE editor_approved_for_premium = true;
CREATE INDEX IF NOT EXISTS idx_service_products_has_landing ON service_products(has_landing_page) WHERE has_landing_page = true;

-- Comentarios
COMMENT ON COLUMN service_products.has_quality_images IS 'Flag editorial: imágenes de calidad para tier premium';
COMMENT ON COLUMN service_products.has_complete_info IS 'Flag editorial: información completa y verificada';
COMMENT ON COLUMN service_products.editor_approved_for_premium IS 'Flag editorial: aprobado para tier premium';
COMMENT ON COLUMN service_products.has_landing_page IS 'TRUE si tiene landing page dedicada';
COMMENT ON COLUMN service_products.landing_slug IS 'Slug único para landing dedicada';

-- ============================================================================
-- 4. CREAR TABLA HOMEPAGE_SLOTS (Sistema Round-Robin)
-- ============================================================================

CREATE TABLE IF NOT EXISTS homepage_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Posición y tipo
  slot_position INTEGER NOT NULL,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('premium', 'destacado', 'standard')),

  -- Contenido asignado (polimórfico)
  content_type TEXT CHECK (content_type IN ('provider', 'house', 'service_product')),
  content_id UUID,

  -- Pricing y duración
  monthly_price DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Orden de rotación
  rotation_order INTEGER NOT NULL DEFAULT 0,

  -- Estado
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date >= start_date),
  CONSTRAINT valid_content CHECK (
    (content_type IS NULL AND content_id IS NULL) OR
    (content_type IS NOT NULL AND content_id IS NOT NULL)
  )
);

-- Índices para homepage_slots
CREATE INDEX IF NOT EXISTS idx_homepage_slots_slot_type ON homepage_slots(slot_type);
CREATE INDEX IF NOT EXISTS idx_homepage_slots_is_active ON homepage_slots(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_homepage_slots_content ON homepage_slots(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_homepage_slots_dates ON homepage_slots(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_homepage_slots_rotation ON homepage_slots(slot_type, rotation_order, is_active) WHERE is_active = true;

-- Comentarios
COMMENT ON TABLE homepage_slots IS 'Slots de homepage con sistema round-robin: N slots rotan automáticamente';
COMMENT ON COLUMN homepage_slots.slot_position IS 'Posición visual del slot (1, 2, 3...)';
COMMENT ON COLUMN homepage_slots.slot_type IS 'premium (2 visibles), destacado (4 visibles), standard (listing)';
COMMENT ON COLUMN homepage_slots.content_type IS 'Tipo de contenido: provider, house, service_product';
COMMENT ON COLUMN homepage_slots.content_id IS 'ID del contenido asignado';
COMMENT ON COLUMN homepage_slots.rotation_order IS 'Orden en el pool de rotación (0, 1, 2...)';

-- Trigger para updated_at
CREATE TRIGGER update_homepage_slots_updated_at
  BEFORE UPDATE ON homepage_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 5. CREAR TRIGGERS DE VALIDACIÓN
-- ============================================================================

-- Trigger: Validar que houses solo se creen si provider.is_manufacturer = true
CREATE OR REPLACE FUNCTION validate_house_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM providers
    WHERE id = NEW.provider_id
    AND is_manufacturer = true
  ) THEN
    RAISE EXCEPTION 'Houses can only be created for providers with is_manufacturer = true';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_house_provider_trigger ON houses;
CREATE TRIGGER validate_house_provider_trigger
  BEFORE INSERT OR UPDATE OF provider_id ON houses
  FOR EACH ROW
  EXECUTE FUNCTION validate_house_provider();

-- Trigger: Validar que service_products solo se creen si provider.is_service_provider = true
CREATE OR REPLACE FUNCTION validate_service_provider()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM providers
    WHERE id = NEW.provider_id
    AND is_service_provider = true
  ) THEN
    RAISE EXCEPTION 'Service products can only be created for providers with is_service_provider = true';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_service_provider_trigger ON service_products;
CREATE TRIGGER validate_service_provider_trigger
  BEFORE INSERT OR UPDATE OF provider_id ON service_products
  FOR EACH ROW
  EXECUTE FUNCTION validate_service_provider();

-- ============================================================================
-- 6. CREAR FUNCIÓN HELPER: get_provider_services()
-- ============================================================================

CREATE OR REPLACE FUNCTION get_provider_services(provider_uuid UUID)
RETURNS TABLE(service_type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT UNNEST(
    CASE
      WHEN p.is_manufacturer AND p.is_service_provider THEN ARRAY['manufacturer', 'service_provider']::TEXT[]
      WHEN p.is_manufacturer THEN ARRAY['manufacturer']::TEXT[]
      WHEN p.is_service_provider THEN ARRAY['service_provider']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END
  ) as service_type
  FROM providers p
  WHERE p.id = provider_uuid;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_provider_services IS 'Retorna lista de servicios que ofrece un provider (manufacturer, service_provider)';

-- ============================================================================
-- 7. RLS POLICIES PARA HOMEPAGE_SLOTS
-- ============================================================================

ALTER TABLE homepage_slots ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver slots activos
CREATE POLICY "Public can view active slots"
  ON homepage_slots
  FOR SELECT
  USING (
    is_active = true
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  );

-- Solo admins pueden gestionar slots
CREATE POLICY "Admins can manage slots"
  ON homepage_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 8. MIGRAR DATOS LEGACY (si existen)
-- ============================================================================

-- Setear is_manufacturer = true para providers que tienen casas
UPDATE providers p
SET is_manufacturer = true
WHERE EXISTS (
  SELECT 1 FROM houses h WHERE h.provider_id = p.id
);

-- Setear is_service_provider = true para providers que tienen servicios
UPDATE providers p
SET is_service_provider = true
WHERE EXISTS (
  SELECT 1 FROM service_products sp WHERE sp.provider_id = p.id
);

-- Si primary_category es 'fabrica', marcar como manufacturer
UPDATE providers
SET is_manufacturer = true
WHERE primary_category = 'fabrica';

-- Si primary_category es 'habilitacion_servicios', marcar como service_provider
UPDATE providers
SET is_service_provider = true
WHERE primary_category = 'habilitacion_servicios';

-- ============================================================================
-- 9. GRANTS Y PERMISOS
-- ============================================================================

GRANT ALL ON TABLE homepage_slots TO postgres;
GRANT ALL ON TABLE homepage_slots TO anon;
GRANT ALL ON TABLE homepage_slots TO authenticated;
GRANT ALL ON TABLE homepage_slots TO service_role;

GRANT EXECUTE ON FUNCTION get_provider_services(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_provider_services(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_provider_services(UUID) TO service_role;

GRANT EXECUTE ON FUNCTION validate_house_provider() TO postgres;
GRANT EXECUTE ON FUNCTION validate_service_provider() TO postgres;
