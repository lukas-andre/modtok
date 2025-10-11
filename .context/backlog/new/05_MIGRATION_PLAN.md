# Plan de Migración - Schema v1 → v2

## Resumen Ejecutivo

Este plan detalla la migración del schema actual al nuevo sistema basado en:
- ✅ 3 categorías (eliminar decoraciones)
- ✅ Features dinámicas en JSONB
- ✅ Sistema de tiers con control editorial
- ✅ Landing pages para premium

---

## 📋 Pre-requisitos

### Backup Crítico
```bash
# 1. Backup completo de la base de datos
pg_dump -h localhost -U postgres -d modtok > backup_pre_migration_$(date +%Y%m%d).sql

# 2. Backup de datos específicos (por si acaso)
pg_dump -h localhost -U postgres -d modtok \
  -t providers -t houses -t services -t decorations \
  --data-only > backup_data_only_$(date +%Y%m%d).sql
```

### Análisis de Datos Existentes
```sql
-- Ver distribución de categorías actuales
SELECT category_type, COUNT(*)
FROM providers
GROUP BY category_type;

-- Ver cuántas decoraciones hay (serán migradas o eliminadas)
SELECT COUNT(*) FROM decorations;

-- Ver estructura de features actual
SELECT
  id,
  company_name,
  category_type,
  jsonb_object_keys(features) as feature_keys
FROM providers
LIMIT 5;
```

---

## 🔄 Fase 1: Preparación (Sin Downtime)

### 1.1. Crear feature_definitions

```sql
-- Crear tabla de definiciones de features
CREATE TABLE feature_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category category_type NOT NULL,
  group_name TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  data_type feature_data_type NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  default_value JSONB,
  is_filterable BOOLEAN DEFAULT false,
  filter_type filter_type,
  filter_location TEXT,
  filter_format TEXT,
  show_in_card_standard BOOLEAN DEFAULT false,
  show_in_card_destacado BOOLEAN DEFAULT false,
  show_in_card_premium BOOLEAN DEFAULT false,
  show_in_landing BOOLEAN DEFAULT false,
  requires_login BOOLEAN DEFAULT false,
  admin_input_type TEXT,
  admin_helper_text TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category, feature_key)
);

CREATE INDEX idx_feature_definitions_category ON feature_definitions(category);
CREATE INDEX idx_feature_definitions_group ON feature_definitions(category, group_name);
CREATE INDEX idx_feature_definitions_filterable ON feature_definitions(is_filterable) WHERE is_filterable = true;
```

### 1.2. Poblar feature_definitions desde JSON

```bash
# Usar el archivo 03_FEATURES_DEFINITIONS.json
node scripts/seed-feature-definitions.js
```

```javascript
// scripts/seed-feature-definitions.js
const { createClient } = require('@supabase/supabase-js');
const definitions = require('../.context/backlog/new/03_FEATURES_DEFINITIONS.json');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function seedFeatureDefinitions() {
  const allFeatures = [];

  // Fábrica
  for (const group in definitions.fabrica) {
    for (const feature of definitions.fabrica[group]) {
      allFeatures.push({
        ...feature,
        category: 'fabrica'
      });
    }
  }

  // Casas
  for (const group in definitions.casas) {
    for (const feature of definitions.casas[group]) {
      allFeatures.push({
        ...feature,
        category: 'casas'
      });
    }
  }

  // Habilitación & Servicios
  for (const group in definitions.habilitacion_servicios) {
    for (const feature of definitions.habilitacion_servicios[group]) {
      allFeatures.push({
        ...feature,
        category: 'habilitacion_servicios'
      });
    }
  }

  const { data, error } = await supabase
    .from('feature_definitions')
    .insert(allFeatures);

  if (error) {
    console.error('Error inserting features:', error);
    process.exit(1);
  }

  console.log(`✅ Inserted ${allFeatures.length} feature definitions`);
}

seedFeatureDefinitions();
```

---

## 🔄 Fase 2: Migración de Datos (Requiere Downtime Corto)

### 2.1. Actualizar enum category_type

```sql
-- Eliminar 'decoracion' del enum
-- NOTA: PostgreSQL no permite eliminar valores de enum directamente
-- Tenemos que recrear el enum

BEGIN;

-- Crear nuevo enum
CREATE TYPE category_type_new AS ENUM (
  'fabrica',
  'casas',
  'habilitacion_servicios'
);

-- Actualizar tabla providers
ALTER TABLE providers
  ALTER COLUMN category_type TYPE category_type_new
  USING category_type::text::category_type_new;

-- Actualizar tabla provider_categories (si existe)
ALTER TABLE provider_categories
  ALTER COLUMN category_type TYPE category_type_new
  USING category_type::text::category_type_new;

-- Eliminar enum antiguo y renombrar
DROP TYPE category_type;
ALTER TYPE category_type_new RENAME TO category_type;

COMMIT;
```

### 2.2. Agregar nuevos campos a providers

```sql
-- Agregar campos de control editorial
ALTER TABLE providers ADD COLUMN IF NOT EXISTS has_quality_images BOOLEAN DEFAULT false;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS has_complete_info BOOLEAN DEFAULT false;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS editor_approved_for_premium BOOLEAN DEFAULT false;

-- Agregar primary_category (para claridad)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS primary_category category_type;

-- Poblar primary_category desde category_type actual
UPDATE providers SET primary_category = category_type WHERE primary_category IS NULL;

-- Hacer primary_category NOT NULL
ALTER TABLE providers ALTER COLUMN primary_category SET NOT NULL;
```

### 2.3. Migrar Decoraciones → Eliminar o Convertir

**Opción A: Eliminar completamente**
```sql
-- Si no hay decoraciones o se eliminan
DELETE FROM decorations;
DROP TABLE decorations;
```

**Opción B: Convertir a service_products**
```sql
-- Si algunas decoraciones se convierten en productos de servicios

-- 1. Crear tabla service_products (del nuevo schema)
CREATE TABLE service_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  description TEXT,
  description_long TEXT,
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'active',
  service_family TEXT,
  service_type TEXT,
  price_from NUMERIC,
  price_to NUMERIC,
  price_unit TEXT,
  currency TEXT DEFAULT 'CLP',
  features JSONB DEFAULT '{}',
  coverage_areas TEXT[] DEFAULT '{}',
  main_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER,
  current_bookings INTEGER DEFAULT 0,
  booking_calendar JSONB DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- 2. Migrar decoraciones selectas
INSERT INTO service_products (
  provider_id,
  name,
  slug,
  sku,
  description,
  price_from,
  main_image_url,
  gallery_images,
  features,
  service_family,
  service_type,
  created_at
)
SELECT
  provider_id,
  name,
  slug,
  sku,
  description,
  price,
  main_image_url,
  gallery_images,
  features,
  'decoracion' as service_family,
  product_type as service_type,
  created_at
FROM decorations
WHERE provider_id IS NOT NULL; -- Solo las que tienen proveedor

-- 3. Eliminar tabla decorations
DROP TABLE decorations;
```

### 2.4. Migrar features existentes a nuevo formato JSONB

```sql
-- Script de migración de features
-- Este script convierte campos individuales a estructura JSONB agrupada

-- Para FÁBRICA
UPDATE providers
SET features = jsonb_build_object(
  'servicios_disponibles', jsonb_build_object(
    'dise_std', COALESCE((features->>'dise_std')::boolean, false),
    'dise_pers', COALESCE((features->>'dise_pers')::boolean, false),
    'insta_premontada', COALESCE((features->>'insta_premontada')::boolean, false),
    'contr_terreno', COALESCE((features->>'contr_terreno')::boolean, false),
    'instalacion', COALESCE((features->>'instalacion')::boolean, false),
    'kit_autocons', COALESCE((features->>'kit_autocons')::boolean, false),
    'ases_tecnica', COALESCE((features->>'ases_tecnica')::boolean, false),
    'ases_legal', COALESCE((features->>'ases_legal')::boolean, false),
    'logist_transporte', COALESCE((features->>'logist_transporte')::boolean, false),
    'financiamiento', COALESCE((features->>'financiamiento')::boolean, false)
  ),
  'especialidad', jsonb_build_object(
    'tiny_houses', COALESCE((features->>'tiny_houses')::boolean, false),
    'modulares_sip', COALESCE((features->>'modulares_sip')::boolean, false),
    'modulares_container', COALESCE((features->>'modulares_container')::boolean, false),
    'modulares_hormigon', COALESCE((features->>'modulares_hormigon')::boolean, false),
    'modulares_madera', COALESCE((features->>'modulares_madera')::boolean, false),
    'prefabricada_tradicional', COALESCE((features->>'prefabricada_tradicional')::boolean, false),
    'oficinas_modulares', COALESCE((features->>'oficinas_modulares')::boolean, false)
  ),
  'generales', jsonb_build_object(
    'experiencia', COALESCE((features->>'experiencia')::integer, 0),
    'llave_en_mano', COALESCE(llave_en_mano, false),
    'precio_ref_min_m2', COALESCE(price_per_m2_min, 0),
    'precio_ref_max_m2', COALESCE(price_per_m2_max, 0),
    'cobertura', COALESCE(coverage_areas, ARRAY[]::text[]),
    'publica_precios', COALESCE((features->>'publica_precios')::boolean, false)
  )
)
WHERE primary_category = 'fabrica'
  AND features IS NOT NULL;

-- Similar para CASAS
UPDATE houses
SET features = jsonb_build_object(
  'servicios_disponibles', jsonb_build_object(
    'insta_premontada', COALESCE((features->>'insta_premontada')::boolean, false),
    'contr_terreno', COALESCE((features->>'contr_terreno')::boolean, false),
    'instalacion', COALESCE((features->>'instalacion')::boolean, false),
    'logist_transporte', COALESCE((features->>'logist_transporte')::boolean, false),
    'financiamiento', COALESCE((features->>'financiamiento')::boolean, false)
  ),
  'ventanas', jsonb_build_object(
    'vent_termopanel', COALESCE((features->>'vent_termopanel')::boolean, false),
    'vent_pvc', COALESCE((features->>'vent_pvc')::boolean, false),
    'vent_aluminio', COALESCE((features->>'vent_aluminio')::boolean, false),
    'vent_madera', COALESCE((features->>'vent_madera')::boolean, false)
  ),
  'tecnologia_materiales', jsonb_build_object(
    'tec_panel_sip', COALESCE((technology_materials @> ARRAY['Panel SIP']), false),
    'tec_madera', COALESCE((technology_materials @> ARRAY['Madera']), false),
    'tec_estructura_contenedor', COALESCE((technology_materials @> ARRAY['Container']), false)
  ),
  'generales', jsonb_build_object(
    'topologia', topology_code,
    'm2', area_m2,
    'precio', price,
    'precio_oportunidad', price_opportunity,
    'llave_en_mano', COALESCE(llave_en_mano, false),
    'modelo', model_code
  )
)
WHERE features IS NOT NULL;
```

---

## 🔄 Fase 3: Actualizar Aplicación

### 3.1. Actualizar TypeScript Types

```bash
# Regenerar tipos desde el nuevo schema
npx supabase gen types typescript --local > src/lib/database.types.ts
```

### 3.2. Actualizar Queries

**Antes:**
```typescript
const { data: providers } = await supabase
  .from('providers')
  .select('*')
  .eq('category_type', 'fabricantes');
```

**Después:**
```typescript
const { data: providers } = await supabase
  .from('providers')
  .select('*')
  .eq('primary_category', 'fabrica');
```

### 3.3. Implementar Feature Helper

```typescript
// src/lib/features.ts

export function getFeatureValue(
  provider: Provider,
  group: string,
  key: string
): any {
  return provider.features?.[group]?.[key];
}

export function shouldShowFeature(
  feature: FeatureDefinition,
  tier: 'standard' | 'destacado' | 'premium' | 'landing',
  isAuthenticated: boolean
): boolean {
  const tierField = {
    standard: 'show_in_card_standard',
    destacado: 'show_in_card_destacado',
    premium: 'show_in_card_premium',
    landing: 'show_in_landing'
  }[tier];

  const shouldShow = feature[tierField];

  if (!shouldShow) return false;

  if (feature.requires_login && !isAuthenticated) {
    return false;
  }

  return true;
}

export async function getFilterableFeatures(
  category: CategoryType
): Promise<FeatureDefinition[]> {
  const { data } = await supabase
    .from('feature_definitions')
    .select('*')
    .eq('category', category)
    .eq('is_filterable', true)
    .order('display_order');

  return data || [];
}
```

### 3.4. Crear Componentes Dinámicos

```astro
---
// src/components/ProviderCard.astro
import { getFeatureValue, shouldShowFeature } from '@/lib/features';

interface Props {
  provider: Provider;
  tier: 'standard' | 'destacado' | 'premium';
  features: FeatureDefinition[];
  isAuthenticated: boolean;
}

const { provider, tier, features, isAuthenticated } = Astro.props;
---

<div class={`provider-card tier-${tier}`}>
  <h2>{provider.company_name}</h2>
  <p>{provider.description}</p>

  {features
    .filter(f => shouldShowFeature(f, tier, isAuthenticated))
    .map(feature => {
      const value = getFeatureValue(provider, feature.group_name, feature.feature_key);

      if (!value) return null;

      return (
        <div class="feature">
          <span class="feature-label">{feature.label}</span>
          <span class="feature-value">
            {feature.data_type === 'boolean' ? (value ? '✓' : '') : value}
          </span>
        </div>
      );
    })
  }
</div>
```

---

## 🔄 Fase 4: Testing

### 4.1. Test Queries

```sql
-- Verificar que features están correctamente estructuradas
SELECT
  id,
  company_name,
  primary_category,
  features->'servicios_disponibles' as servicios,
  features->'especialidad' as especialidad,
  features->'generales' as generales
FROM providers
WHERE primary_category = 'fabrica'
LIMIT 5;

-- Test de filtros
SELECT * FROM providers
WHERE
  primary_category = 'fabrica'
  AND (features->'servicios_disponibles'->>'dise_pers')::boolean = true
  AND (features->'especialidad'->>'tiny_houses')::boolean = true;
```

### 4.2. Test Frontend

```bash
# Iniciar dev server
pnpm dev

# Probar:
# 1. Listado de fábricas
# 2. Filtros dinámicos
# 3. Tarjetas por tier
# 4. Landing premium
# 5. Formularios admin
```

---

## 🔄 Fase 5: Deploy

### 5.1. Checklist Pre-Deploy

- [ ] Backup completo hecho
- [ ] Migración testeada en local
- [ ] Tipos TypeScript regenerados
- [ ] Tests pasando
- [ ] Feature definitions pobladas
- [ ] Documentación actualizada

### 5.2. Deploy Steps

```bash
# 1. Aplicar migraciones a producción
supabase db push

# 2. Poblar feature definitions
node scripts/seed-feature-definitions.js --env production

# 3. Migrar datos existentes
psql $DATABASE_URL < migrations/migrate_features_to_jsonb.sql

# 4. Deploy frontend
pnpm build
railway deploy # o plataforma que uses

# 5. Verificar
curl https://modtok.cl/api/providers?category=fabrica
```

### 5.3. Rollback Plan

Si algo falla:

```bash
# 1. Restaurar backup
psql $DATABASE_URL < backup_pre_migration_20250114.sql

# 2. Deploy versión anterior del código
git checkout v1.0.0
railway deploy
```

---

## 📊 Post-Migration

### Validación

```sql
-- Contar providers migrados correctamente
SELECT
  primary_category,
  COUNT(*) as total,
  COUNT(CASE WHEN features IS NOT NULL THEN 1 END) as con_features,
  COUNT(CASE WHEN features IS NULL THEN 1 END) as sin_features
FROM providers
GROUP BY primary_category;

-- Verificar feature_definitions
SELECT
  category,
  COUNT(*) as total_features,
  COUNT(DISTINCT group_name) as total_groups
FROM feature_definitions
GROUP BY category;
```

### Limpieza

```sql
-- Eliminar campos antiguos que ya no se usan (opcional, solo después de validar)
-- ALTER TABLE providers DROP COLUMN IF EXISTS old_field_name;

-- Vacuum para recuperar espacio
VACUUM FULL ANALYZE providers;
VACUUM FULL ANALYZE houses;
```

---

## 🚨 Issues Comunes y Soluciones

### Issue 1: Features NULL después de migración
**Causa**: El script de migración no encontró datos en los campos antiguos
**Solución**:
```sql
-- Verificar estructura de features antigua
SELECT features FROM providers WHERE id = 'xxx';

-- Ajustar script de migración según estructura real
```

### Issue 2: Enum no se puede eliminar
**Causa**: PostgreSQL requiere que no haya dependencias
**Solución**:
```sql
-- Encontrar dependencias
SELECT * FROM pg_depend WHERE objid = 'category_type'::regtype;

-- Eliminar dependencias primero, luego el enum
```

### Issue 3: GIN index lento
**Causa**: JSONB sin índice apropiado
**Solución**:
```sql
-- Crear índices GIN específicos para queries comunes
CREATE INDEX idx_providers_features_servicios
  ON providers USING GIN ((features->'servicios_disponibles'));

CREATE INDEX idx_providers_features_especialidad
  ON providers USING GIN ((features->'especialidad'));
```

---

## ✅ Checklist Final

- [ ] Schema migrado exitosamente
- [ ] Decoraciones eliminadas o convertidas
- [ ] Feature definitions pobladas
- [ ] Providers migrados a nuevo formato JSONB
- [ ] Houses migrados a nuevo formato JSONB
- [ ] Indices creados correctamente
- [ ] Types TypeScript actualizados
- [ ] Queries del frontend actualizadas
- [ ] Componentes dinámicos funcionando
- [ ] Sistema de filtros operativo
- [ ] Tiers visualizándose correctamente
- [ ] Landing pages premium funcionando
- [ ] Admin form builder operativo
- [ ] Tests pasando
- [ ] Deploy exitoso
- [ ] Validación en producción OK

---

**Tiempo Estimado de Migración**: 2-4 horas (con downtime de ~30 min)

**Riesgo**: Medio (mitigado con backups y rollback plan)

**Beneficio**: Alto (flexibilidad total, escalabilidad, mejor UX)
