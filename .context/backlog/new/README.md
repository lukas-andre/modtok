# MODTOK Database Schema v2.0 - Complete Redesign

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Cambios Principales](#cambios-principales)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Quick Start](#quick-start)
5. [Arquitectura](#arquitectura)
6. [Implementación](#implementación)

---

## 🎯 Resumen Ejecutivo

Este es un **rediseño completo** del modelo de datos de MODTOK basado en el análisis profundo del CSV `Estructuras_v5.csv` y los requerimientos del negocio.

### Objetivos Alcanzados:
✅ Reducción a **3 categorías** (Fábricas, Casas, Habilitación & Servicios)
✅ Eliminación de categoría "Decoraciones"
✅ Sistema de **features dinámicas** basado en JSONB
✅ **Tier system** completo (Premium, Destacado, Standard)
✅ **Control editorial** para contenido premium
✅ **Landing pages** dedicadas para proveedores premium
✅ Sistema de **filtros dinámicos** auto-generados
✅ Máxima **flexibilidad** sin cambios de schema constantes

---

## 🔄 Cambios Principales

### 1. Categorías Simplificadas

**ANTES** (4 categorías):
- `fabricantes`
- `casas`
- `habilitacion_servicios`
- `decoracion` ❌

**DESPUÉS** (3 categorías):
- `fabrica` ✅
- `casas` ✅
- `habilitacion_servicios` ✅

### 2. Features Dinámicas

**ANTES**: Columnas individuales
```sql
providers (
  dise_std BOOLEAN,
  dise_pers BOOLEAN,
  tiny_houses BOOLEAN,
  -- ... 50+ campos más
)
```

**DESPUÉS**: JSONB agrupado
```sql
providers (
  features JSONB DEFAULT '{
    "servicios_disponibles": {
      "dise_std": true,
      "dise_pers": false,
      ...
    },
    "especialidad": {
      "tiny_houses": true,
      ...
    },
    "generales": {
      "experiencia": 15,
      ...
    }
  }'
)
```

### 3. Sistema de Tiers

| Tier | Layout | Landing | Contacto | Pricing |
|------|--------|---------|----------|---------|
| **Premium** 💎 | 1-2 por columna | ✅ Dedicada | ✅ Todo visible | $400K/mes |
| **Destacado** ⭐ | 4 por columna | ❌ | 🔒 Con login | $150K/mes |
| **Standard** 📋 | 6+ listado | ❌ | ❌ Oculto | Gratis |

### 4. Control Editorial

Nuevos campos para controlar calidad de contenido premium:
- `has_quality_images` - ¿Imágenes de buena calidad?
- `has_complete_info` - ¿Información completa?
- `editor_approved_for_premium` - ✅ Aprobación editorial

---

## 📁 Estructura de Archivos

```
.context/backlog/new/
├── README.md                          # Este archivo
├── 01_CSV_ANALYSIS.md                 # Análisis detallado del CSV
├── 02_NEW_SCHEMA.sql                  # Schema SQL completo v2.0
├── 03_FEATURES_DEFINITIONS.json       # Definiciones de features
├── 04_TIER_SYSTEM.md                  # Sistema de tiers y visualización
├── 05_MIGRATION_PLAN.md               # Plan de migración paso a paso
└── 06_SEED_FEATURES.sql               # Script de seed para features
```

### Descripción de Archivos:

#### 📄 01_CSV_ANALYSIS.md
Análisis exhaustivo del CSV con:
- Estructura de features por categoría
- Mapeo de campos a columnas BD
- Reglas de visualización por tier
- Tipos de datos y validaciones
- 3 enfoques de arquitectura (columnas, JSONB, normalizado)

#### 📄 02_NEW_SCHEMA.sql
Schema SQL completo incluyendo:
- Enums actualizados (3 categorías)
- Tabla `feature_definitions` (metadata)
- Tabla `providers` con features JSONB
- Tabla `houses` con features JSONB
- Tabla `service_products` (reemplaza decorations)
- Índices GIN para búsquedas rápidas
- Functions y triggers
- RLS policies
- Storage buckets

#### 📄 03_FEATURES_DEFINITIONS.json
Definiciones JSON de todas las features por categoría:
- Fábrica: 31 campos
- Casas: 34 campos
- Habilitación & Servicios: 58 campos

Incluye para cada feature:
- `feature_key`: Identificador técnico
- `label`: Texto visible
- `data_type`: boolean, number, text, etc.
- `is_filterable`: ¿Se puede filtrar?
- `filter_type`: checklist, slider, etc.
- `show_in_card_*`: Reglas de visualización por tier
- `requires_login`: ¿Requiere autenticación?

#### 📄 04_TIER_SYSTEM.md
Documentación completa del sistema de tiers:
- Características por tier
- Reglas de visualización
- Layout y diseño
- Componentes React/Astro
- Sistema de filtros dinámicos
- Queries SQL con JSONB
- Analytics por tier
- Modelo de negocio (pricing)

#### 📄 05_MIGRATION_PLAN.md
Plan detallado de migración:
- Pre-requisitos y backups
- Migración de enum (eliminar decoraciones)
- Migración de features a JSONB
- Actualización de aplicación
- Testing y validación
- Deploy y rollback plan
- Issues comunes y soluciones

#### 📄 06_SEED_FEATURES.sql
Script SQL para poblar `feature_definitions` directamente desde el análisis del CSV.

---

## 🚀 Quick Start

### Opción 1: Migración desde Schema Actual

Si ya tienes datos:

```bash
# 1. Backup
pg_dump modtok > backup_$(date +%Y%m%d).sql

# 2. Aplicar nuevo schema
psql modtok < .context/backlog/new/02_NEW_SCHEMA.sql

# 3. Poblar feature definitions
psql modtok < .context/backlog/new/06_SEED_FEATURES.sql

# 4. Migrar datos (sigue el plan en 05_MIGRATION_PLAN.md)
```

### Opción 2: Schema Nuevo desde Cero

Si empiezas de cero:

```bash
# 1. Crear BD
createdb modtok

# 2. Aplicar schema completo
psql modtok < .context/backlog/new/02_NEW_SCHEMA.sql

# 3. Poblar feature definitions
psql modtok < .context/backlog/new/06_SEED_FEATURES.sql

# 4. ¡Listo! Ya puedes empezar a insertar providers
```

### Verificar Instalación

```sql
-- Ver feature definitions por categoría
SELECT
  category,
  COUNT(*) as total_features,
  COUNT(DISTINCT group_name) as total_groups
FROM feature_definitions
GROUP BY category;

-- Resultado esperado:
-- fabrica              | 31 | 3
-- casas                | 34 | 4
-- habilitacion_servicios | 48 | 15
```

---

## 🏗️ Arquitectura

### Diagrama de Entidades Principal

```
┌─────────────────┐
│   profiles      │
│  (auth users)   │
└────────┬────────┘
         │
         │ profile_id
         ▼
┌─────────────────────────────┐
│      providers              │◄───┐
│  ┌─────────────────────┐    │    │
│  │ features JSONB      │    │    │
│  │ {                   │    │    │
│  │   "servicios": {},  │    │    │
│  │   "especialidad":{},│    │    │
│  │   "generales": {}   │    │    │
│  │ }                   │    │    │
│  └─────────────────────┘    │    │
│                             │    │
│ primary_category            │    │
│ tier (premium/destacado)    │    │
│ editor_approved_for_premium │    │
└──────────┬──────────────────┘    │
           │                       │
           │                       │
    ┌──────┴────────┐         ┌───┴──────────────┐
    ▼               ▼         │                  │
┌─────────┐   ┌──────────────┐│  provider_      │
│ houses  │   │service_      ││  categories     │
│         │   │products      ││  (multi-cat)    │
│ features│   │              │└──────────────────┘
│ JSONB   │   │ features     │
└─────────┘   │ JSONB        │
              └──────────────┘

                ┌────────────────────────┐
                │  feature_definitions   │
                │  (metadata)            │
                │                        │
                │  - category            │
                │  - group_name          │
                │  - feature_key         │
                │  - label               │
                │  - show_in_card_*      │
                │  - filter_type         │
                └────────────────────────┘
```

### Flujo de Datos

1. **Admin crea/edita provider**
   - Selecciona categoría (fabrica/casas/habilitacion_servicios)
   - Sistema carga feature_definitions para esa categoría
   - Form builder dinámico genera campos según definitions
   - Al guardar, features se almacenan en JSONB agrupado

2. **Usuario busca en frontend**
   - Sistema carga feature_definitions filtrables
   - Genera filtros dinámicos (checkboxes, sliders, etc.)
   - Query SQL filtra en JSONB usando GIN index
   - Resultados se ordenan por tier (premium primero)

3. **Renderizado de tarjetas**
   - Para cada provider, determina tier
   - Carga feature_definitions
   - Filtra features según `show_in_card_[tier]`
   - Si requiere login y no autenticado, oculta campo
   - Renderiza componente dinámicamente

### Ventajas de esta Arquitectura

✅ **Flexible**: Agregar features sin ALTER TABLE
✅ **Escalable**: Índices GIN para queries rápidas
✅ **Mantenible**: Metadata centralizada en feature_definitions
✅ **Type-safe**: TypeScript types generados automáticamente
✅ **SEO-friendly**: Landing pages SSR para premium
✅ **Control editorial**: Aprobación basada en calidad

---

## 💻 Implementación

### 1. Backend (Supabase)

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Helper: Get feature value
export function getFeatureValue(
  provider: Database['public']['Tables']['providers']['Row'],
  group: string,
  key: string
): any {
  return provider.features?.[group]?.[key];
}

// Helper: Should show feature
export function shouldShowFeature(
  feature: Database['public']['Tables']['feature_definitions']['Row'],
  tier: 'standard' | 'destacado' | 'premium' | 'landing',
  isAuthenticated: boolean
): boolean {
  const fieldMap = {
    standard: 'show_in_card_standard',
    destacado: 'show_in_card_destacado',
    premium: 'show_in_card_premium',
    landing: 'show_in_landing'
  };

  const shouldShow = feature[fieldMap[tier]];
  if (!shouldShow) return false;

  if (feature.requires_login && !isAuthenticated) {
    return false;
  }

  return true;
}
```

### 2. Queries Comunes

```typescript
// Buscar fábricas con filtros
const { data: providers } = await supabase
  .from('providers')
  .select('*')
  .eq('primary_category', 'fabrica')
  .eq('status', 'active')
  // Filtro boolean
  .filter('features->servicios_disponibles->>dise_pers', 'eq', 'true')
  .filter('features->especialidad->>tiny_houses', 'eq', 'true')
  // Filtro numérico
  .gte('features->generales->>precio_ref_min_m2', 800000)
  .lte('features->generales->>precio_ref_max_m2', 1500000)
  // Orden por tier
  .order('tier', { ascending: true })
  .order('featured_order', { nullsFirst: false });

// Cargar features filtrables para una categoría
const { data: filterableFeatures } = await supabase
  .from('feature_definitions')
  .select('*')
  .eq('category', 'fabrica')
  .eq('is_filterable', true)
  .order('display_order');
```

### 3. Componentes Frontend

```astro
---
// src/components/ProviderCard.astro
import { getFeatureValue, shouldShowFeature } from '@/lib/supabase';

interface Props {
  provider: Provider;
  tier: 'standard' | 'destacado' | 'premium';
  features: FeatureDefinition[];
  isAuthenticated: boolean;
}

const { provider, tier, features, isAuthenticated } = Astro.props;

const visibleFeatures = features.filter(f =>
  shouldShowFeature(f, tier, isAuthenticated)
);
---

<div class={`provider-card tier-${tier}`}>
  <!-- Header -->
  <div class="card-header">
    {tier === 'premium' && (
      <span class="badge premium">PREMIUM</span>
    )}
    <h3>{provider.company_name}</h3>
    <p class="description">{provider.description}</p>
  </div>

  <!-- Features -->
  <div class="features">
    {visibleFeatures.map(feature => {
      const value = getFeatureValue(
        provider,
        feature.group_name,
        feature.feature_key
      );

      if (!value) return null;

      return (
        <div class="feature-item">
          <span class="label">{feature.label}</span>
          {feature.data_type === 'boolean' ? (
            <span class="value">✓</span>
          ) : (
            <span class="value">{value}</span>
          )}
        </div>
      );
    })}
  </div>

  <!-- Actions -->
  <div class="card-actions">
    {tier === 'premium' ? (
      <a href={`/provider/${provider.slug}`} class="btn btn-primary">
        Ver Catálogo
      </a>
    ) : (
      <button class="btn btn-secondary">
        Solicitar Cotización
      </button>
    )}
  </div>
</div>
```

### 4. Admin Form Builder

```tsx
// src/components/admin/FeatureFormBuilder.tsx
import { useEffect, useState } from 'react';

interface Props {
  category: 'fabrica' | 'casas' | 'habilitacion_servicios';
  currentFeatures: Record<string, any>;
  onChange: (features: Record<string, any>) => void;
}

export function FeatureFormBuilder({ category, currentFeatures, onChange }: Props) {
  const [definitions, setDefinitions] = useState<FeatureDefinition[]>([]);

  useEffect(() => {
    loadFeatureDefinitions();
  }, [category]);

  async function loadFeatureDefinitions() {
    const { data } = await supabase
      .from('feature_definitions')
      .select('*')
      .eq('category', category)
      .order('display_order');

    setDefinitions(data || []);
  }

  // Agrupar por group_name
  const grouped = definitions.reduce((acc, def) => {
    if (!acc[def.group_name]) acc[def.group_name] = [];
    acc[def.group_name].push(def);
    return acc;
  }, {} as Record<string, FeatureDefinition[]>);

  return (
    <div className="feature-form-builder">
      {Object.entries(grouped).map(([groupName, features]) => (
        <fieldset key={groupName} className="feature-group">
          <legend>{groupName.replace(/_/g, ' ').toUpperCase()}</legend>

          {features.map(feature => (
            <div key={feature.id} className="form-field">
              <label>{feature.label}</label>

              {feature.data_type === 'boolean' && (
                <input
                  type="checkbox"
                  checked={currentFeatures[groupName]?.[feature.feature_key] || false}
                  onChange={(e) => {
                    onChange({
                      ...currentFeatures,
                      [groupName]: {
                        ...currentFeatures[groupName],
                        [feature.feature_key]: e.target.checked
                      }
                    });
                  }}
                />
              )}

              {feature.data_type === 'number' && (
                <input
                  type="number"
                  value={currentFeatures[groupName]?.[feature.feature_key] || ''}
                  onChange={(e) => {
                    onChange({
                      ...currentFeatures,
                      [groupName]: {
                        ...currentFeatures[groupName],
                        [feature.feature_key]: parseInt(e.target.value)
                      }
                    });
                  }}
                />
              )}

              {feature.data_type === 'text' && (
                <input
                  type="text"
                  value={currentFeatures[groupName]?.[feature.feature_key] || ''}
                  onChange={(e) => {
                    onChange({
                      ...currentFeatures,
                      [groupName]: {
                        ...currentFeatures[groupName],
                        [feature.feature_key]: e.target.value
                      }
                    });
                  }}
                />
              )}

              {feature.admin_helper_text && (
                <small className="helper-text">{feature.admin_helper_text}</small>
              )}
            </div>
          ))}
        </fieldset>
      ))}
    </div>
  );
}
```

---

## 📚 Recursos Adicionales

### Documentación Relacionada
- [01_CSV_ANALYSIS.md](./01_CSV_ANALYSIS.md) - Análisis detallado del CSV
- [04_TIER_SYSTEM.md](./04_TIER_SYSTEM.md) - Sistema de tiers completo
- [05_MIGRATION_PLAN.md](./05_MIGRATION_PLAN.md) - Plan de migración

### Referencias Técnicas
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)
- [GIN Indexes](https://www.postgresql.org/docs/current/gin-intro.html)
- [Supabase JSONB Queries](https://supabase.com/docs/guides/database/json)

---

## 🤝 Contribuir

Para agregar nuevas features:

1. Agregar definición en `feature_definitions`:
```sql
INSERT INTO feature_definitions (
  category,
  group_name,
  feature_key,
  label,
  data_type,
  is_filterable,
  show_in_card_premium,
  show_in_landing
) VALUES (
  'fabrica',
  'servicios_disponibles',
  'nueva_feature',
  'Nueva Feature',
  'boolean',
  true,
  true,
  true
);
```

2. No requiere cambios en el schema
3. El form builder y filtros se actualizan automáticamente
4. Regenerar TypeScript types

---

## 📝 Notas Finales

Este diseño prioriza:
- ✅ **Flexibilidad**: Sin cambios de schema frecuentes
- ✅ **Performance**: Índices GIN optimizados
- ✅ **Mantenibilidad**: Metadata centralizada
- ✅ **UX**: Sistema de tiers con control editorial
- ✅ **SEO**: SSR para landing pages premium

**Próximos Pasos**:
1. Revisar y aprobar el diseño
2. Aplicar migración siguiendo [05_MIGRATION_PLAN.md](./05_MIGRATION_PLAN.md)
3. Implementar componentes frontend
4. Poblar contenido y testear
5. Deploy a producción

---

**Versión**: 2.0
**Fecha**: 2025-01-14
**Autor**: Claude Code (Anthropic)
**Basado en**: Estructuras_v5.csv + Requerimientos de negocio
