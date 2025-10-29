# 🏗️ Arquitectura de Base de Datos MODTOK

## 📋 Resumen Ejecutivo

**MODTOK** es un marketplace B2B de casas modulares y prefabricadas en Chile. El modelo de negocio se basa en **vender slots de visibilidad** en la homepage, similar a un sistema de publicidad premium. Los fabricantes y proveedores de servicios pagan por obtener mayor exposición mediante un sistema de rotación round-robin.

---

## 🎯 Modelo de Negocio: Sistema de Slots

### Concepto Core

El sistema de **homepage_slots** es el corazón del modelo de monetización:

- **Slots visibles limitados**: Solo 2 premium + 4 destacados + listing standard
- **Pool de slots comprados**: N providers pagan por un slot (ej: 10 providers compran slots premium)
- **Rotación automática**: El sistema rota automáticamente entre los providers que pagaron
- **Fairness**: Todos los que pagaron reciben exposición equitativa mediante `rotation_order`

### Ejemplo Práctico

```
Slots Premium en Homepage: 2 posiciones visibles
Providers que compraron slots premium: 10 empresas

Rotación:
- Refresh 1: Se muestran providers con rotation_order 0 y 1
- Refresh 2: Se muestran providers con rotation_order 2 y 3
- Refresh 3: Se muestran providers con rotation_order 4 y 5
- ... y así sucesivamente
```

---

## 🗄️ Esquemas de Base de Datos

### 1. 👤 **PROFILES** - Usuarios del Sistema

Tabla base de autenticación y autorización.

```sql
profiles {
  id UUID PRIMARY KEY
  email TEXT NOT NULL
  full_name TEXT NOT NULL
  role user_role (super_admin | admin | provider | user)
  status user_status (active | inactive | suspended | pending_verification)

  -- Metadata
  avatar_url TEXT
  bio TEXT
  phone TEXT
  rut TEXT -- RUT chileno
  company_name TEXT
  website TEXT
  social_links JSONB

  -- Preferences
  preferences JSONB
  email_verified BOOLEAN
  phone_verified BOOLEAN

  -- Timestamps
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
  last_login_at TIMESTAMPTZ
}
```

**Roles**:
- `super_admin`: Control total del sistema
- `admin`: Gestión de contenido y aprobaciones
- `provider`: Fabricantes y proveedores de servicios
- `user`: Compradores/visitantes registrados

---

### 2. 🏢 **PROVIDERS** - Fabricantes y Proveedores de Servicios

Entidad central que representa empresas. Un provider puede ser **fabricante Y proveedor de servicios simultáneamente**.

```sql
providers {
  id UUID PRIMARY KEY
  profile_id UUID REFERENCES profiles(id)

  -- Información Básica
  company_name TEXT NOT NULL
  slug TEXT UNIQUE NOT NULL
  email TEXT NOT NULL
  phone TEXT
  whatsapp TEXT
  website TEXT

  -- Servicios que Ofrece (NUEVO - Multi-servicio)
  is_manufacturer BOOLEAN DEFAULT false         -- Fabrica casas
  is_service_provider BOOLEAN DEFAULT false     -- Ofrece habilitación/servicios
  primary_category category_type (fabrica | casas | habilitacion_servicios)

  -- Ubicación
  address TEXT
  city TEXT
  region TEXT

  -- Contenido
  description TEXT                    -- Descripción corta
  description_long TEXT               -- Descripción extendida
  logo_url TEXT
  cover_image_url TEXT
  gallery_images TEXT[]
  videos TEXT[]

  -- Features Dinámicas (JSON Flexible)
  features JSONB                      -- Ej: {"servicios": {"dise_std": true, "dise_pers": true}}

  -- Estado y Aprobación
  status listing_status (draft | pending_review | active | inactive | rejected)
  approved_at TIMESTAMPTZ
  approved_by UUID REFERENCES profiles(id)
  rejection_reason TEXT
  admin_notes TEXT

  -- Tier y Monetización
  tier listing_tier (premium | destacado | standard)
  premium_until TIMESTAMPTZ           -- Fecha límite del tier premium
  featured_until TIMESTAMPTZ          -- Fecha límite del tier destacado
  featured_order INTEGER              -- Orden manual de destacados

  -- Landing Page Dedicada (Solo Premium)
  has_landing_page BOOLEAN DEFAULT false
  landing_slug TEXT                   -- Ej: /fabricante/modular-homes-chile

  -- Flags Editoriales (Control de Calidad)
  has_quality_images BOOLEAN DEFAULT false
  has_complete_info BOOLEAN DEFAULT false
  editor_approved_for_premium BOOLEAN DEFAULT false

  -- SEO
  meta_title TEXT
  meta_description TEXT
  keywords TEXT[]

  -- Analytics
  views_count INTEGER DEFAULT 0
  clicks_count INTEGER DEFAULT 0
  inquiries_count INTEGER DEFAULT 0
  internal_rating DECIMAL(3,2)       -- Rating interno del admin

  -- Metadata Adicional
  metadata JSONB

  -- Timestamps
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
}
```

#### Índices Importantes

```sql
idx_providers_is_manufacturer ON (is_manufacturer) WHERE is_manufacturer = true
idx_providers_is_service_provider ON (is_service_provider) WHERE is_service_provider = true
idx_providers_multiple_services ON (is_manufacturer, is_service_provider) WHERE is_manufacturer = true OR is_service_provider = true
idx_providers_status_tier ON (status, tier)
```

#### Validaciones

- Un provider puede tener `is_manufacturer = true` y `is_service_provider = true` simultáneamente
- Si tiene casas en la tabla `houses`, automáticamente `is_manufacturer = true`
- Si tiene servicios en `service_products`, automáticamente `is_service_provider = true`

---

### 3. 🔖 **PROVIDER_CATEGORIES** - Categorías Múltiples

Tabla de junction para permitir que un provider tenga múltiples categorías.

```sql
provider_categories {
  id UUID PRIMARY KEY
  provider_id UUID REFERENCES providers(id)
  category category_type (fabrica | casas | habilitacion_servicios)
  is_primary BOOLEAN DEFAULT false
  created_at TIMESTAMPTZ
}
```

**Ejemplo**:
```sql
Provider "Modular Homes Chile"
  - categories: ['fabrica', 'habilitacion_servicios']
  - is_manufacturer: true
  - is_service_provider: true
  - primary_category: 'fabrica'
```

---

### 4. 🏠 **HOUSES** - Catálogo de Casas Modulares

Tabla de productos (casas) vinculadas a fabricantes.

```sql
houses {
  id UUID PRIMARY KEY
  provider_id UUID REFERENCES providers(id)  -- Solo si provider.is_manufacturer = true

  -- Información Básica
  name TEXT NOT NULL
  slug TEXT UNIQUE NOT NULL
  sku TEXT
  model_code TEXT
  description TEXT
  description_long TEXT

  -- Variantes (Ej: diferentes tamaños del mismo modelo)
  has_variants BOOLEAN DEFAULT false
  parent_house_id UUID REFERENCES houses(id)
  variant_attributes JSONB             -- Ej: {"size": "medium", "color": "white"}

  -- Especificaciones
  bedrooms INTEGER
  bathrooms INTEGER
  floors INTEGER
  area_m2 DECIMAL(10,2)
  topology_code TEXT                   -- Ej: "3H2B" (3 habitaciones, 2 baños)

  -- Precio
  price DECIMAL(10,2)
  price_opportunity DECIMAL(10,2)      -- Precio en oferta
  price_per_m2 DECIMAL(10,2)
  currency TEXT DEFAULT 'CLP'

  -- Tiempos
  delivery_time_days INTEGER
  assembly_time_days INTEGER
  warranty_years INTEGER

  -- Contenido Multimedia
  main_image_url TEXT
  gallery_images TEXT[]
  floor_plans TEXT[]                   -- Planos de planta
  videos TEXT[]
  virtual_tour_url TEXT                -- Tour 360°
  brochure_pdf_url TEXT

  -- Features Dinámicas (JSON Flexible)
  features JSONB                       -- Ej: {"ventanas": {"vent_termopanel": true}}

  -- Estado y Stock
  status listing_status (draft | pending_review | active | inactive | rejected)
  is_available BOOLEAN DEFAULT true
  stock_quantity INTEGER
  stock_status TEXT                    -- in_stock | low_stock | out_of_stock | pre_order

  -- Tier y Monetización
  tier listing_tier (premium | destacado | standard)

  -- Landing Page Dedicada (Solo Premium)
  has_landing_page BOOLEAN DEFAULT false
  landing_slug TEXT                    -- Ej: /casa/tiny-house-40m2

  -- Flags Editoriales (Control de Calidad)
  has_quality_images BOOLEAN DEFAULT false
  has_complete_info BOOLEAN DEFAULT false
  editor_approved_for_premium BOOLEAN DEFAULT false

  -- Ubicación (opcional - si aplica)
  location_region TEXT
  location_city TEXT
  latitude DECIMAL(10,8)
  longitude DECIMAL(11,8)

  -- SEO
  meta_title TEXT
  meta_description TEXT
  keywords TEXT[]

  -- Analytics
  views_count INTEGER DEFAULT 0
  clicks_count INTEGER DEFAULT 0
  inquiries_count INTEGER DEFAULT 0
  saves_count INTEGER DEFAULT 0        -- Favoritos
  sales_count INTEGER DEFAULT 0

  -- Metadata Adicional
  metadata JSONB

  -- Timestamps
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
}
```

#### Trigger de Validación

```sql
-- Solo se pueden crear houses si provider.is_manufacturer = true
CREATE TRIGGER validate_house_provider_trigger
  BEFORE INSERT OR UPDATE OF provider_id ON houses
  FOR EACH ROW
  EXECUTE FUNCTION validate_house_provider();
```

---

### 5. 🛠️ **SERVICE_PRODUCTS** - Catálogo de Servicios

Tabla de servicios de habilitación vinculados a proveedores de servicios.

```sql
service_products {
  id UUID PRIMARY KEY
  provider_id UUID REFERENCES providers(id)  -- Solo si provider.is_service_provider = true

  -- Información Básica
  name TEXT NOT NULL
  slug TEXT UNIQUE NOT NULL
  sku TEXT
  service_type TEXT                    -- construccion | instalacion | asesoria | financiamiento
  service_family TEXT                  -- habilitacion_terreno | construccion | logistica
  description TEXT
  description_long TEXT

  -- Precio (Rangos)
  price_from DECIMAL(10,2)
  price_to DECIMAL(10,2)
  price_unit TEXT                      -- por_proyecto | por_m2 | por_hora | fijo
  currency TEXT DEFAULT 'CLP'

  -- Disponibilidad y Booking
  is_available BOOLEAN DEFAULT true
  max_bookings INTEGER                 -- Capacidad mensual
  current_bookings INTEGER DEFAULT 0
  booking_calendar JSONB

  -- Cobertura Geográfica
  coverage_areas TEXT[]                -- ["Región Metropolitana", "Valparaíso"]

  -- Contenido Multimedia
  main_image_url TEXT
  gallery_images TEXT[]
  videos TEXT[]

  -- Features Dinámicas (JSON Flexible)
  features JSONB

  -- Estado
  status listing_status (draft | pending_review | active | inactive | rejected)

  -- Tier y Monetización
  tier listing_tier (premium | destacado | standard)

  -- Landing Page Dedicada (Solo Premium)
  has_landing_page BOOLEAN DEFAULT false
  landing_slug TEXT

  -- Flags Editoriales
  has_quality_images BOOLEAN DEFAULT false
  has_complete_info BOOLEAN DEFAULT false
  editor_approved_for_premium BOOLEAN DEFAULT false

  -- SEO
  meta_title TEXT
  meta_description TEXT
  keywords TEXT[]

  -- Analytics
  views_count INTEGER DEFAULT 0
  clicks_count INTEGER DEFAULT 0
  inquiries_count INTEGER DEFAULT 0
  sales_count INTEGER DEFAULT 0

  -- Metadata Adicional
  metadata JSONB

  -- Timestamps
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ
}
```

#### Trigger de Validación

```sql
-- Solo se pueden crear service_products si provider.is_service_provider = true
CREATE TRIGGER validate_service_provider_trigger
  BEFORE INSERT OR UPDATE OF provider_id ON service_products
  FOR EACH ROW
  EXECUTE FUNCTION validate_service_provider();
```

---

### 6. 🎰 **HOMEPAGE_SLOTS** - Sistema de Slots (Core del Negocio)

Tabla que gestiona los **slots de visibilidad** en la homepage con rotación round-robin.

```sql
homepage_slots {
  id UUID PRIMARY KEY

  -- Posición en Homepage
  slot_position INTEGER NOT NULL       -- 1, 2, 3, 4... (posición visual)
  slot_type TEXT NOT NULL              -- premium | destacado | standard

  -- Contenido Asignado (Polimórfico)
  content_type TEXT                    -- provider | house | service_product
  content_id UUID                      -- ID del contenido

  -- Monetización
  monthly_price DECIMAL(10,2)          -- Precio mensual del slot
  start_date DATE NOT NULL
  end_date DATE NOT NULL

  -- Round-Robin
  rotation_order INTEGER NOT NULL DEFAULT 0  -- Orden en el pool de rotación

  -- Estado
  is_active BOOLEAN DEFAULT true

  -- Timestamps
  created_at TIMESTAMPTZ
  updated_at TIMESTAMPTZ

  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
  CONSTRAINT valid_content CHECK (
    (content_type IS NULL AND content_id IS NULL) OR
    (content_type IS NOT NULL AND content_id IS NOT NULL)
  )
}
```

#### Índices

```sql
idx_homepage_slots_slot_type ON (slot_type)
idx_homepage_slots_rotation ON (slot_type, rotation_order, is_active) WHERE is_active = true
idx_homepage_slots_dates ON (start_date, end_date)
```

#### Lógica de Rotación

```sql
-- Query para obtener slots visibles en homepage
SELECT * FROM homepage_slots
WHERE slot_type = 'premium'
  AND is_active = true
  AND start_date <= CURRENT_DATE
  AND end_date >= CURRENT_DATE
ORDER BY rotation_order ASC
LIMIT 2;  -- Solo 2 premium visibles
```

**Sistema Round-Robin**:
1. Admin asigna `rotation_order` secuencial (0, 1, 2, 3...)
2. Frontend rota automáticamente cada N segundos
3. Todos los providers que pagaron reciben exposición justa

---

## 📊 Relaciones entre Entidades

### Diagrama de Relaciones

```
profiles (1) ────────< (N) providers
                         │
                         ├────< (N) provider_categories
                         │
                         ├────< (N) houses
                         │       └── (opcional) parent_house_id (variantes)
                         │
                         └────< (N) service_products

homepage_slots (N) ──polimórfico──> provider | house | service_product
```

### Ejemplo de Provider Multi-servicio

```json
{
  "provider": {
    "company_name": "Modular Homes Chile",
    "is_manufacturer": true,
    "is_service_provider": true,
    "primary_category": "fabrica",
    "categories": ["fabrica", "habilitacion_servicios"]
  },
  "houses": [
    {"name": "Tiny House 40m2", "price": 15000000},
    {"name": "Casa Modular 80m2", "price": 35000000}
  ],
  "service_products": [
    {"name": "Instalación Llave en Mano", "price_from": 2000000},
    {"name": "Asesoría Técnica", "price_from": 500000}
  ],
  "homepage_slots": [
    {
      "slot_type": "premium",
      "content_type": "provider",
      "content_id": "<provider_id>",
      "rotation_order": 0,
      "monthly_price": 500000
    }
  ]
}
```

---

## 🎨 Tiers y Visibilidad

### Comparación de Tiers

| Feature | **Standard** | **Destacado** | **Premium** |
|---------|-------------|---------------|-------------|
| Precio mensual | Gratis | ~$100.000 CLP | ~$500.000 CLP |
| Slots en homepage | Listing | 4 rotatorios | 2 rotatorios |
| Landing dedicada | ❌ | ❌ | ✅ |
| Imágenes en card | 1 | 3-5 | Galería completa |
| Datos mostrados | Básicos | Extendidos | Completos + videos |
| Logo destacado | ❌ | ✅ | ✅ Grande |
| Badge "Premium" | ❌ | ✅ "Destacado" | ✅ "Premium" |
| Prioridad en búsqueda | Baja | Media | Alta |

---

## 🔐 Row Level Security (RLS)

### Providers

```sql
-- Providers pueden crear su propio listing
CREATE POLICY "Providers can create own listing"
  ON providers FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Providers pueden editar su propio listing
CREATE POLICY "Providers can update own listing"
  ON providers FOR UPDATE
  USING (profile_id = auth.uid());
```

### Homepage Slots

```sql
-- Público puede ver slots activos
CREATE POLICY "Public can view active slots"
  ON homepage_slots FOR SELECT
  USING (
    is_active = true
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  );

-- Solo admins pueden gestionar slots
CREATE POLICY "Admins can manage slots"
  ON homepage_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
```

---

## 🛠️ Funciones Helper

### get_provider_services()

Retorna lista de servicios que ofrece un provider.

```sql
CREATE FUNCTION get_provider_services(provider_uuid UUID)
RETURNS TABLE(service_type TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT UNNEST(
    CASE
      WHEN p.is_manufacturer AND p.is_service_provider
        THEN ARRAY['manufacturer', 'service_provider']::TEXT[]
      WHEN p.is_manufacturer
        THEN ARRAY['manufacturer']::TEXT[]
      WHEN p.is_service_provider
        THEN ARRAY['service_provider']::TEXT[]
      ELSE ARRAY[]::TEXT[]
    END
  ) as service_type
  FROM providers p
  WHERE p.id = provider_uuid;
END;
$$ LANGUAGE plpgsql;
```

**Uso**:
```sql
SELECT * FROM get_provider_services('uuid-del-provider');
-- Retorna: ['manufacturer', 'service_provider']
```

---

## 📈 Analytics y Tracking

### Tablas de Analytics

```sql
analytics_events {
  id UUID PRIMARY KEY
  user_id UUID REFERENCES profiles(id)
  event_type TEXT NOT NULL           -- view | click | inquiry | favorite
  event_category TEXT                -- provider | house | service
  target_type TEXT                   -- provider | house | service_product
  target_id UUID

  -- Metadata del Evento
  event_action TEXT
  event_label TEXT
  event_value INTEGER

  -- Tracking
  session_id TEXT
  page_url TEXT
  referrer_url TEXT
  user_agent TEXT
  ip_address INET

  -- UTM Parameters
  utm_source TEXT
  utm_medium TEXT
  utm_campaign TEXT

  -- Geolocalización
  country TEXT
  region TEXT
  city TEXT
  device_type TEXT
  browser TEXT
  os TEXT

  created_at TIMESTAMPTZ
}
```

---

## 🚀 Queries Comunes

### 1. Obtener Providers con sus Casas y Servicios

```sql
SELECT
  p.*,
  array_agg(DISTINCT h.id) as house_ids,
  array_agg(DISTINCT sp.id) as service_product_ids,
  array_agg(DISTINCT pc.category) as categories
FROM providers p
LEFT JOIN houses h ON h.provider_id = p.id
LEFT JOIN service_products sp ON sp.provider_id = p.id
LEFT JOIN provider_categories pc ON pc.provider_id = p.id
WHERE p.status = 'active'
GROUP BY p.id;
```

### 2. Obtener Slots Activos para Homepage (con Rotación)

```sql
-- Premium Slots (2 visibles)
WITH active_premium_slots AS (
  SELECT *
  FROM homepage_slots
  WHERE slot_type = 'premium'
    AND is_active = true
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  ORDER BY rotation_order ASC
)
SELECT * FROM active_premium_slots
LIMIT 2;

-- Destacados (4 visibles)
WITH active_featured_slots AS (
  SELECT *
  FROM homepage_slots
  WHERE slot_type = 'destacado'
    AND is_active = true
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  ORDER BY rotation_order ASC
)
SELECT * FROM active_featured_slots
LIMIT 4;
```

### 3. Buscar Providers por Features

```sql
-- Buscar fabricantes que ofrecen diseño personalizado
SELECT p.*
FROM providers p
WHERE p.is_manufacturer = true
  AND p.features->'servicios'->>'dise_pers' = 'true'
  AND p.status = 'active';

-- Buscar casas con termopanel
SELECT h.*
FROM houses h
WHERE h.features->'ventanas'->>'vent_termopanel' = 'true'
  AND h.status = 'active';
```

---

## 🎯 Consideraciones Importantes

### 1. **Features Dinámicas (JSONB)**

Las tablas `providers`, `houses`, y `service_products` tienen un campo `features JSONB` que permite almacenar características dinámicas sin crear columnas adicionales.

**Estructura del JSONB**:
```json
{
  "servicios": {
    "dise_std": true,
    "dise_pers": true,
    "instalacion": true,
    "financiamiento": false
  },
  "ventanas": {
    "vent_termopanel": true,
    "vent_pvc": false,
    "vent_aluminio": true
  },
  "tecnologia": {
    "tec_panel_sip": true,
    "tec_madera": false
  }
}
```

### 2. **Sistema de Variantes de Casas**

Las casas pueden tener variantes (ej: diferentes tamaños del mismo modelo):

```sql
-- Casa Padre
INSERT INTO houses (name, slug, has_variants) VALUES
  ('Tiny House 40m2', 'tiny-house-40m2', true);

-- Variantes
INSERT INTO houses (name, slug, parent_house_id, variant_attributes) VALUES
  ('Tiny House 40m2 - Blanca', 'tiny-house-40m2-blanca', '<parent_id>', '{"color": "white"}'),
  ('Tiny House 40m2 - Negra', 'tiny-house-40m2-negra', '<parent_id>', '{"color": "black"}');
```

### 3. **Control Editorial**

Los flags `has_quality_images`, `has_complete_info`, y `editor_approved_for_premium` permiten que los editores validen manualmente la calidad del contenido antes de permitir upgrades a tier premium.

### 4. **Landing Pages Dedicadas**

Solo los providers, casas y servicios con tier `premium` pueden tener landing pages dedicadas (`has_landing_page = true` y `landing_slug` único).

---

## 📝 Próximos Pasos Recomendados

1. **Implementar Dashboard de Slots**: Panel admin para gestionar slots y ver analytics de rotación
2. **Sistema de Pagos**: Integrar Webpay/Flow para pagos de slots
3. **Analytics Dashboard**: Panel de analytics para providers
4. **Alertas de Vencimiento**: Notificar a providers cuando sus slots expiran
5. **A/B Testing**: Probar diferentes estrategias de rotación
6. **Recomendaciones**: Sistema de recomendaciones basado en búsquedas

---

## 🔗 Referencias

- **Migraciones**: `/supabase/migrations/`
- **Tipos TypeScript**: `/src/lib/database.types.ts`
- **Guía de Proyecto**: `/CLAUDE.md`
- **CSV de Features**: `/.context/data/Estructuras_v5.csv`

---

**Última actualización**: 2025-10-28
**Versión Schema**: v1.0
**Status**: ✅ Producción
