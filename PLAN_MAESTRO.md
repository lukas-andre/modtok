# 🏗️ MODTOK - Plan Maestro de Arquitectura

> **Versión:** 2.0
> **Fecha:** 2025-10-11
> **Estado:** En Desarrollo

Este documento define la arquitectura completa del sistema MODTOK, incluyendo modelo de datos, frontend, CMS admin y flujos de integración.

---

## 📋 Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Arquitectura Frontend](#-arquitectura-frontend)
3. [Modelo de Datos](#-modelo-de-datos)
4. [Sistema de Slots](#-sistema-de-slots)
5. [CMS Admin](#-cms-admin)
6. [Filtros Dinámicos](#-filtros-dinámicos)
7. [Rutas y Páginas](#-rutas-y-páginas)
8. [Integraciones](#-integraciones)
9. [Plan de Implementación](#-plan-de-implementación)

---

## 🎯 Visión General

MODTOK es un marketplace digital para la industria de construcción modular y prefabricada en Chile. El sistema permite:

- **Providers** (empresas) pueden ser:
  - 🏭 Fabricantes (producen casas modulares)
  - 🔧 Servicios de Habilitación (H&S: agua, energía, instalación, etc.)
  - **IMPORTANTE**: Un provider puede ofrecer AMBOS servicios (fabricación + H&S) sin crear múltiples cuentas

- **Productos**:
  - 🏠 **Houses** (casas/modelos) → productos de fabricantes
  - ⚙️ **Service Products** → servicios específicos de H&S

- **Sistema de Tiers** (independientes):
  - 💎 **Premium**: 2 cards por fila, landing dedicada, máxima visibilidad
  - ⭐ **Destacado**: 4 cards por fila, buena visibilidad
  - 📝 **Standard**: Solo texto, visibilidad básica

- **Control Editorial**:
  - Flags: `has_quality_images`, `has_complete_info`, `editor_approved_for_premium`
  - Editor decide qué contenido merece tier premium según calidad

---

## 🌐 Arquitectura Frontend

### Landing Principal (`modtok.cl/`)

```
┌─────────────────────────────────────────────┐
│  HEADER                                     │
│  [Logo] [Casas][Fabricantes][H&S]  [Login] │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│  CONTENIDO DESTACADO                        │
│  (Blog/Noticias/Contenido SEO)             │
│  - Artículos editoriales                    │
│  - Proyectos destacados                     │
│  - Novedades del sector                     │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│  FILTRO SUPERIOR (Categorías)               │
│  [📦 Casas] [🏭 Fabricantes]               │
│  [🔧 H&S] [🎨 Decoración]                  │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│  SECCIÓN PREMIUM (Round-Robin)              │
│  ┌──────────────┐ ┌──────────────┐          │
│  │   SLOT 1     │ │   SLOT 2     │  ← 2/fila│
│  │  💎 PREMIUM  │ │  💎 PREMIUM  │          │
│  │  Casa X      │ │  Fabr Y      │          │
│  │  [Ver más]   │ │  [Ver más]   │          │
│  └──────────────┘ └──────────────┘          │
│                                              │
│  Rotación automática de slots cada N seg    │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│  SECCIÓN DESTACADOS (Round-Robin)           │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐           │
│  │SLOT3│ │SLOT4│ │SLOT5│ │SLOT6│ ← 4/fila  │
│  │⭐ DS│ │⭐ DS│ │⭐ DS│ │⭐ DS│           │
│  └─────┘ └─────┘ └─────┘ └─────┘           │
│                                              │
│  Rotación de N slots disponibles             │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│  LISTING STANDARD (Sin fotos)               │
│  ──────────────────────────────────────────  │
│  📝 EcoModular | Fabricante | Región Metro  │
│  📝 Tiny Chile | Casas | Valparaíso         │
│  📝 Solar Pro | H&S | Todo Chile            │
│  ...                                         │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│  HOT SPOTS (Landings Regionales)            │
│  [📍 Santiago] [📍 Valparaíso]              │
│  [📍 Concepción] [📍 La Serena]            │
└─────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────┐
│  BLOG / NOVEDADES (SEO Critical)            │
│  ┌──────────┐ ┌──────────┐                  │
│  │ Post 1   │ │ Post 2   │                  │
│  │ [Leer+]  │ │ [Leer+]  │                  │
│  └──────────┘ └──────────┘                  │
└─────────────────────────────────────────────┘
```

### Landings Específicas con Filtros Laterales

#### `modtok.cl/casas`

```
┌────────────────┬──────────────────────────────┐
│ FILTROS        │  RESULTADOS CASAS            │
│ LATERALES      │                              │
│ (CSV Casas)    │  ┌────────┐ ┌────────┐       │
│                │  │💎 PREM │ │💎 PREM │       │
│ SERVICIOS:     │  │Casa A  │ │Casa B  │       │
│ ☑ Instalación  │  └────────┘ └────────┘       │
│ ☑ Transporte   │                              │
│                │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│ VENTANAS:      │  │⭐DS│ │⭐DS│ │⭐DS│ │⭐DS│ │
│ ☑ Termopanel   │  └────┘ └────┘ └────┘ └────┘ │
│ ☑ PVC          │                              │
│ ☑ Aluminio     │  📝 Listing Standard:        │
│                │  Casa X | 45m² | $25M        │
│ TECNOLOGÍA:    │  Casa Y | 60m² | $35M        │
│ ☑ Panel SIP    │  ...                         │
│ ☑ Container    │                              │
│ ☑ Madera       │  [Pagination]                │
│                │                              │
│ PRECIO:        │                              │
│ ━━━━━━━━━━     │                              │
│ $10M - $50M    │                              │
│                │                              │
│ M²:            │                              │
│ ━━━━━━━━━━     │                              │
│ 30 - 120       │                              │
│                │                              │
│ REGIÓN:        │                              │
│ ☑ Metropolitana│                              │
│ ☑ Valparaíso   │                              │
└────────────────┴──────────────────────────────┘
```

#### `modtok.cl/fabricantes`

```
┌────────────────┬──────────────────────────────┐
│ FILTROS        │  RESULTADOS FABRICANTES      │
│ LATERALES      │                              │
│ (imagen.png)   │  ┌────────┐ ┌────────┐       │
│                │  │💎 PREM │ │💎 PREM │       │
│ SERVICIOS:     │  │EcoMod  │ │TinyHm │       │
│ ☑ Diseño Std   │  └────────┘ └────────┘       │
│ ☑ Diseño Pers  │                              │
│ ☑ Instalación  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│ ☑ Transporte   │  │⭐DS│ │⭐DS│ │⭐DS│ │⭐DS│ │
│ ☑ Financ.      │  └────┘ └────┘ └────┘ └────┘ │
│                │                              │
│ ESPECIALIDAD:  │  📝 Listing Standard...      │
│ ☑ Tiny Houses  │                              │
│ ☑ Panel SIP    │                              │
│ ☑ Container    │                              │
│ ☑ Hormigón     │                              │
│ ☑ Madera       │                              │
│                │                              │
│ REGIÓN:        │                              │
│ ☑ Todo Chile   │                              │
│ ☑ Metro        │                              │
│ ☑ Valparaíso   │                              │
└────────────────┴──────────────────────────────┘
```

#### `modtok.cl/habilitacion-y-servicios`

```
┌────────────────┬──────────────────────────────┐
│ FILTROS        │  RESULTADOS H&S              │
│ LATERALES      │                              │
│ (CSV H&S)      │  ┌────────┐ ┌────────┐       │
│                │  │💎 PREM │ │💎 PREM │       │
│ AGUA:          │  │Solar X │ │Pozos Y│       │
│ ☑ Pozos        │  └────────┘ └────────┘       │
│ ☑ Alcantarilla │                              │
│ ☑ Aguas Lluvia │  ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│                │  │⭐DS│ │⭐DS│ │⭐DS│ │⭐DS│ │
│ ENERGÍA:       │  └────┘ └────┘ └────┘ └────┘ │
│ ☑ Solar        │                              │
│ ☑ Eólica       │  📝 Listing Standard...      │
│ ☑ Generadores  │                              │
│                │                              │
│ CLIMATIZACIÓN: │                              │
│ ☑ Estufas      │                              │
│ ☑ Calef. Solar │                              │
│ ☑ Aislamiento  │                              │
│                │                              │
│ SEGURIDAD:     │                              │
│ ☑ Cámaras      │                              │
│ ☑ Domótica     │                              │
│ ☑ Internet Sat │                              │
└────────────────┴──────────────────────────────┘
```

---

## 🗄️ Modelo de Datos

### Diagrama Entidad-Relación

```
┌─────────────────────────────────────────┐
│ PROVIDERS (Empresas base)               │
│ ─────────────────────────────────────── │
│ id UUID PRIMARY KEY                     │
│ company_name TEXT                       │
│ slug TEXT UNIQUE                        │
│                                         │
│ ⚠️ PUEDE OFRECER MÚLTIPLES SERVICIOS:   │
│ is_manufacturer BOOLEAN (fabrica casas) │
│ is_service_provider BOOLEAN (ofrece H&S)│
│                                         │
│ tier listing_tier (standard/dest/prem)  │
│ features JSONB (dinámico por servicio)  │
│                                         │
│ -- Landing dedicada                     │
│ has_landing_page BOOLEAN                │
│ landing_slug TEXT UNIQUE                │
│                                         │
│ -- Flags editoriales                    │
│ has_quality_images BOOLEAN              │
│ has_complete_info BOOLEAN               │
│ editor_approved_for_premium BOOLEAN     │
│                                         │
│ -- Info base                            │
│ description TEXT                        │
│ region TEXT                             │
│ phone, email, website                   │
│                                         │
│ status listing_status                   │
│ created_at, updated_at                  │
└─────────────────────────────────────────┘
           ↓                    ↓
  ┌────────────────┐    ┌──────────────────┐
  │ HOUSES         │    │ SERVICE_PRODUCTS │
  │ (Productos)    │    │ (Servicios)      │
  ├────────────────┤    ├──────────────────┤
  │ provider_id FK │    │ provider_id FK   │
  │                │    │                  │
  │ 🔑 CONSTRAINT: │    │ 🔑 CONSTRAINT:   │
  │ provider debe  │    │ provider debe    │
  │ tener          │    │ tener            │
  │ is_manufacturer│    │ is_service_      │
  │ = TRUE         │    │ provider = TRUE  │
  │                │    │                  │
  │ name, slug     │    │ name, slug       │
  │ model_code     │    │ service_type     │
  │                │    │                  │
  │ tier (INDEP.)  │    │ tier (INDEP.)    │
  │ features JSONB │    │ features JSONB   │
  │                │    │                  │
  │ price, m², bed │    │ price_from,_to   │
  │                │    │                  │
  │ has_landing    │    │ has_landing      │
  │ landing_slug   │    │ landing_slug     │
  │                │    │                  │
  │ Editorial flags│    │ Editorial flags  │
  │ Gallery images │    │ Gallery images   │
  │                │    │                  │
  │ status, dates  │    │ status, dates    │
  └────────────────┘    └──────────────────┘
```

### Providers con Múltiples Servicios

```sql
-- EJEMPLO: EcoModular
INSERT INTO providers (
  company_name,
  is_manufacturer,      -- TRUE (fabrica casas)
  is_service_provider,  -- TRUE (también ofrece instalación/transporte)
  features
) VALUES (
  'EcoModular',
  TRUE,
  TRUE,
  '{
    "manufacturer_features": {
      "servicios_disponibles": {
        "dise_pers": true,
        "instalacion": true,
        "transporte": true
      },
      "especialidad": {
        "tiny_houses": true,
        "panel_sip": true
      }
    },
    "service_features": {
      "agua": {
        "pozos": false
      },
      "energia": {
        "solar": true
      }
    }
  }'::jsonb
);

-- Puede tener HOUSES (porque is_manufacturer = true)
INSERT INTO houses (provider_id, name, ...)
VALUES ('ecomodular-uuid', 'Modelo Tiny Dreams', ...);

-- Y también SERVICE_PRODUCTS (porque is_service_provider = true)
INSERT INTO service_products (provider_id, name, ...)
VALUES ('ecomodular-uuid', 'Instalación Llave en Mano', ...);
```

### Feature Definitions (Metadata)

```sql
CREATE TABLE feature_definitions (
  id UUID PRIMARY KEY,

  -- 'fabrica', 'casas', 'habilitacion_servicios'
  -- ⚠️ SÍ incluye 'casas' (houses tienen features propias)
  category TEXT NOT NULL,

  group_name TEXT NOT NULL,     -- 'servicios_disponibles', 'ventanas', etc.
  feature_key TEXT NOT NULL,    -- 'dise_pers', 'termopanel', etc.
  label TEXT NOT NULL,          -- 'Diseño Personalizado', 'Termopanel'

  -- Tipo de dato
  data_type feature_data_type,  -- boolean, number, text, text_array, json
  validation_rules JSONB,

  -- Filtros
  is_filterable BOOLEAN,
  filter_type filter_type,      -- checklist, slider, checkbox
  filter_location TEXT,          -- 'lateral', null

  -- Visualización por tier
  show_in_card_standard BOOLEAN,
  show_in_card_destacado BOOLEAN,
  show_in_card_premium BOOLEAN,
  show_in_landing BOOLEAN,
  requires_login BOOLEAN,

  -- Admin form
  admin_input_type TEXT,        -- 'checkbox', 'select', 'textarea'
  admin_helper_text TEXT,

  display_order INTEGER,
  is_active BOOLEAN,

  UNIQUE(category, feature_key)
);
```

---

## 🎰 Sistema de Slots (Round-Robin)

### Tabla: `homepage_slots`

```sql
CREATE TABLE homepage_slots (
  id UUID PRIMARY KEY,

  -- Posición visual
  slot_position INTEGER NOT NULL,  -- 1, 2, 3, 4...
  slot_type TEXT NOT NULL,         -- 'premium', 'destacado', 'standard'

  -- Contenido asignado (polimórfico)
  content_type TEXT,               -- 'provider', 'house', 'service_product'
  content_id UUID,                 -- id del contenido

  -- Pricing & Duración
  monthly_price DECIMAL(10,2),
  start_date DATE,
  end_date DATE,

  -- Orden de rotación
  rotation_order INTEGER,          -- Para round-robin

  -- Estado
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Lógica Round-Robin

```typescript
// src/lib/slots.ts

export async function getActiveSlots(slotType: 'premium' | 'destacado') {
  const supabase = createSupabaseClient();

  // Obtener todos los slots activos del tipo
  const { data: slots } = await supabase
    .from('homepage_slots')
    .select('*')
    .eq('slot_type', slotType)
    .eq('is_active', true)
    .lte('start_date', new Date().toISOString())
    .gte('end_date', new Date().toISOString())
    .order('rotation_order', { ascending: true });

  // Calcular cuántos slots mostrar
  const visibleCount = slotType === 'premium' ? 2 : 4;

  // Round-robin: rotar cada N segundos
  const currentIndex = Math.floor(Date.now() / 10000) % slots.length;

  // Retornar slots visibles
  const visibleSlots = [];
  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % slots.length;
    visibleSlots.push(slots[index]);
  }

  return visibleSlots;
}
```

### UI Admin - Gestión de Slots

```
┌─────────────────────────────────────────────┐
│  GESTIÓN DE SLOTS HOMEPAGE                  │
│                                             │
│  📍 SLOTS PREMIUM (2 visibles, N en pool)   │
│  ┌─────────────────────────────────────┐   │
│  │ Slot #1 - Activo                    │   │
│  │ Casa "Tiny Dreams"                  │   │
│  │ $150.000/mes | Hasta: 2025-12-31    │   │
│  │ [Editar] [Desactivar]               │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Slot #2 - Activo                    │   │
│  │ Fabricante "EcoModular"             │   │
│  │ $150.000/mes | Hasta: 2025-11-30    │   │
│  │ [Editar] [Desactivar]               │   │
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │ Slot #3 - Activo (rotación)         │   │
│  │ Servicio "Paneles Solares Pro"      │   │
│  │ $150.000/mes | Hasta: 2026-01-15    │   │
│  │ [Editar] [Desactivar]               │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [+ Agregar Nuevo Slot Premium]            │
│                                             │
│  ⭐ SLOTS DESTACADOS (4 visibles, N pool)   │
│  [Similar UI...]                            │
│                                             │
│  📝 SLOTS STANDARD (listing)                │
│  [Similar UI...]                            │
└─────────────────────────────────────────────┘
```

---

## 🎛️ CMS Admin

### Flujo: Crear Provider (con servicios múltiples)

```
┌─────────────────────────────────────────────┐
│  CREAR PROVIDER                             │
│                                             │
│  1. INFORMACIÓN BASE                        │
│  ├─ Nombre Empresa: [____________]          │
│  ├─ Email: [____________]                   │
│  ├─ Región: [Seleccionar ▼]                │
│  └─ Tier: ○ Standard ○ Destacado ● Premium │
│                                             │
│  2. SERVICIOS QUE OFRECE                    │
│  ├─ ☑ Fabricante (produce casas)            │
│  └─ ☑ Servicios H&S                         │
│                                             │
│  3. FEATURES DINÁMICAS                      │
│  ┌───────────────────────────────────────┐ │
│  │ SI seleccionó "Fabricante":           │ │
│  │ <FeatureFormBuilder                   │ │
│  │   category="fabrica"                  │ │
│  │   currentFeatures={...}               │ │
│  │ />                                    │ │
│  │ → Muestra checkboxes de imagen.png   │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ SI seleccionó "Servicios H&S":        │ │
│  │ <FeatureFormBuilder                   │ │
│  │   category="habilitacion_servicios"   │ │
│  │   currentFeatures={...}               │ │
│  │ />                                    │ │
│  │ → Muestra checkboxes CSV H&S          │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  4. CONTROL EDITORIAL                       │
│  ├─ ☑ Tiene imágenes de calidad            │
│  ├─ ☑ Información completa                 │
│  ├─ ☑ Aprobado para Premium (editor)       │
│  └─ ☑ Generar landing dedicada             │
│                                             │
│  [Guardar Provider]                         │
└─────────────────────────────────────────────┘
```

### Flujo: Crear Casa (con selector fabricante)

```
┌─────────────────────────────────────────────┐
│  CREAR CASA                                 │
│                                             │
│  1. SELECCIONAR FABRICANTE                  │
│  ┌───────────────────────────────────────┐ │
│  │ Fabricante:                           │ │
│  │ <select>                              │ │
│  │   <option>EcoModular (Premium)</opt>  │ │
│  │   <option>Tiny Homes Chile</option>   │ │
│  │ </select>                             │ │
│  │                                       │ │
│  │ [+ Crear Fabricante Rápido] ← Modal  │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  2. INFORMACIÓN CASA                        │
│  ├─ Nombre Modelo: [____________]           │
│  ├─ Código: [____________]                  │
│  ├─ Precio: [$____________]                 │
│  ├─ m²: [____]  Dorm: [__]  Baños: [__]    │
│  └─ Tier: ○ Standard ○ Destacado ● Premium │
│                                             │
│  3. FEATURES CASA                           │
│  <FeatureFormBuilder                        │
│    category="casas"                         │
│    currentFeatures={...}                    │
│  />                                         │
│  → Checkboxes: Termopanel, Panel SIP, etc. │
│                                             │
│  4. GALERÍA                                 │
│  <ImageGalleryManager />                    │
│                                             │
│  5. CONTROL EDITORIAL                       │
│  ├─ ☑ Imágenes calidad                     │
│  ├─ ☑ Info completa                        │
│  ├─ ☑ Aprobado Premium                     │
│  └─ ☑ Landing dedicada                     │
│                                             │
│  [Guardar Casa]                             │
└─────────────────────────────────────────────┘
```

### Modal: Crear Fabricante Rápido

```
┌─────────────────────────────────────┐
│  ⚡ CREAR FABRICANTE RÁPIDO         │
│                                     │
│  Solo campos esenciales:            │
│  ├─ Nombre: [____________]          │
│  ├─ Email: [____________]           │
│  ├─ Región: [Seleccionar ▼]        │
│  └─ Tier: ● Standard (default)      │
│                                     │
│  Features mínimas (solo required):  │
│  <FeatureFormBuilder                │
│    category="fabrica"               │
│    minimalMode={true}               │
│  />                                 │
│                                     │
│  [Cancelar] [Crear y Asociar]      │
└─────────────────────────────────────┘
```

---

## 🔍 Filtros Dinámicos

### Sistema de Filtros por Categoría

```typescript
// src/components/catalog/FilterSidebar.tsx

interface FilterSidebarProps {
  category: 'fabricantes' | 'casas' | 'habilitacion_servicios';
}

export default function FilterSidebar({ category }: FilterSidebarProps) {
  const { features } = useFeatureDefinitions(category, false);

  // Filtrar solo features filtrables
  const filterableFeatures = features.filter(f => f.is_filterable);

  // Agrupar por filter_location
  const lateralFilters = filterableFeatures.filter(
    f => f.filter_location === 'lateral'
  );

  return (
    <aside className="w-64 space-y-6">
      {/* Filtros comunes */}
      <RegionFilter />
      <TierFilter />

      {/* Filtros dinámicos por categoría */}
      {lateralFilters.map(feature => (
        <DynamicFilter
          key={feature.id}
          feature={feature}
          onChange={handleFilterChange}
        />
      ))}
    </aside>
  );
}
```

### Tipos de Filtros

```typescript
// DynamicFilter.tsx

function DynamicFilter({ feature }: { feature: FeatureDefinition }) {
  switch (feature.filter_type) {
    case 'checklist':
      return <ChecklistFilter feature={feature} />;

    case 'slider':
      return <SliderFilter feature={feature} />;

    case 'checkbox':
      return <CheckboxFilter feature={feature} />;

    default:
      return null;
  }
}
```

---

## 🗺️ Rutas y Páginas

### Estructura Completa

```
modtok.cl/
├── 🏠 index.astro                        → Landing principal (slots round-robin)
│
├── 📦 casas/
│   ├── index.astro                       → Catálogo casas (filtros CSV casas)
│   └── [slug].astro                      → Landing casa individual (si premium)
│
├── 🏭 fabricantes/
│   ├── index.astro                       → Catálogo fabricantes (filtros imagen.png)
│   └── [slug].astro                      → Landing fabricante (si premium)
│
├── 🔧 habilitacion-y-servicios/
│   ├── index.astro                       → Catálogo H&S (filtros CSV H&S)
│   └── [slug].astro                      → Landing servicio (si premium)
│
├── 📍 regiones/
│   └── [region].astro                    → Hot spots regionales
│
├── 📰 blog/
│   ├── index.astro                       → Listing blog (SEO critical)
│   └── [slug].astro                      → Post individual (estático, SSG)
│
├── 🔐 auth/
│   ├── login.astro
│   ├── register.astro
│   └── reset-password.astro
│
└── 🎛️ admin/
    ├── index.astro                       → Dashboard
    │
    ├── slots/
    │   └── index.astro                   → Gestión slots homepage (round-robin)
    │
    ├── providers/
    │   ├── index.astro                   → Lista providers
    │   ├── create.astro                  → Crear provider (múltiples servicios)
    │   └── [id]/
    │       └── edit.astro                → Editar provider
    │
    ├── casas/
    │   ├── index.astro                   → Lista casas
    │   ├── create.astro                  → Crear casa (selector fabricante + modal)
    │   └── [id]/
    │       └── edit.astro                → Editar casa
    │
    ├── servicios/
    │   ├── index.astro                   → Lista servicios H&S
    │   ├── create.astro                  → Crear servicio (selector provider)
    │   └── [id]/
    │       └── edit.astro                → Editar servicio
    │
    ├── blog/
    │   ├── index.astro                   → Lista posts
    │   ├── create.astro                  → Editor post (TipTap/Lexical)
    │   └── [id]/
    │       └── edit.astro                → Editar post
    │
    └── webhooks/
        └── n8n-provider-import.ts        → Endpoint N8N (auto-import providers)
```

---

## 🔗 Integraciones

### Webhook N8N - Auto-Import Providers

```typescript
// src/pages/api/admin/webhooks/n8n-provider-import.ts

import type { APIRoute } from 'astro';
import { createSupabaseClient } from '@/lib/supabase';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Validar API Key del webhook
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== import.meta.env.N8N_WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Recibir datos del proveedor encontrado por agente N8N
    const providerData = await request.json();

    /*
    Formato esperado:
    {
      "company_name": "EcoModular Chile",
      "website": "https://ecomodular.cl",
      "email": "contacto@ecomodular.cl",
      "phone": "+56912345678",
      "region": "metropolitana",
      "detected_services": {
        "is_manufacturer": true,
        "is_service_provider": false
      },
      "scraped_features": {
        "tiny_houses": true,
        "panel_sip": true,
        "instalacion": true
      },
      "images": [
        "https://scraped-url.com/image1.jpg",
        "https://scraped-url.com/image2.jpg"
      ]
    }
    */

    const supabase = createSupabaseClient();

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('providers')
      .select('id')
      .eq('website', providerData.website)
      .single();

    if (existing) {
      return new Response(
        JSON.stringify({ message: 'Provider already exists', id: existing.id }),
        { status: 200 }
      );
    }

    // Crear provider con status 'pending_review'
    const { data: newProvider, error } = await supabase
      .from('providers')
      .insert({
        company_name: providerData.company_name,
        slug: slugify(providerData.company_name),
        website: providerData.website,
        email: providerData.email,
        phone: providerData.phone,
        region: providerData.region,

        is_manufacturer: providerData.detected_services.is_manufacturer,
        is_service_provider: providerData.detected_services.is_service_provider,

        features: {
          manufacturer_features: providerData.scraped_features
        },

        tier: 'standard',
        status: 'pending_review', // ← Requiere aprobación editorial

        has_quality_images: false, // Editor debe revisar
        has_complete_info: false,
        editor_approved_for_premium: false,

        source: 'n8n_agent' // Tracking
      })
      .select()
      .single();

    if (error) throw error;

    // Log en admin_actions
    await supabase.from('admin_actions').insert({
      action_type: 'provider_auto_imported',
      entity_type: 'provider',
      entity_id: newProvider.id,
      metadata: { source: 'n8n', original_data: providerData }
    });

    return new Response(
      JSON.stringify({
        success: true,
        provider_id: newProvider.id,
        message: 'Provider imported, pending editorial review'
      }),
      { status: 201 }
    );

  } catch (error) {
    console.error('N8N Import Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
};
```

### Configuración N8N Workflow

```json
{
  "nodes": [
    {
      "name": "Web Scraper",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{ $json.target_url }}",
        "method": "GET"
      }
    },
    {
      "name": "Extract Provider Data",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Lógica de extracción con IA/regex..."
      }
    },
    {
      "name": "Send to MODTOK",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://modtok.cl/api/admin/webhooks/n8n-provider-import",
        "method": "POST",
        "headers": {
          "x-api-key": "{{ $env.MODTOK_WEBHOOK_SECRET }}"
        },
        "body": "={{ $json }}"
      }
    }
  ]
}
```

---

## 📋 Plan de Implementación

### FASE 1 - Corrección Modelo de Datos ✅ COMPLETADA

```
✅ Objetivos:
- Permitir que providers ofrezcan múltiples servicios
- Eliminar 'casas' de category_type (es producto, no categoría)
- Agregar constraints correctos
- Sistema de slots con round-robin

📝 Tareas:
1. [x] Migración: Agregar campos is_manufacturer, is_service_provider a providers
2. [x] Migración: Deprecar primary_category (o mantener para legacy)
3. [x] Migración: Crear tabla homepage_slots
4. [x] Constraint: houses solo si provider.is_manufacturer = true (TRIGGER)
5. [x] Constraint: service_products solo si provider.is_service_provider = true (TRIGGER)
6. [x] Seed: Crear feature_definitions para 'casas' (si no existe)
7. [x] Regenerar: npx supabase gen types typescript

📋 Migración aplicada: `provider_multiple_services_and_slots_v2`
- Agregados: is_manufacturer, is_service_provider, has_landing_page, landing_slug
- Creada tabla homepage_slots con sistema round-robin
- Triggers de validación para houses y service_products
- Flags editoriales agregados a houses y service_products
- Función helper: get_provider_services()
- RLS policies para homepage_slots
- Índices optimizados
```

### FASE 2 - CMS Admin ✅ COMPLETADA (Tasks 1-3)

```
✅ Objetivos:
- Forms intuitivos para crear providers con múltiples servicios
- Forms para Houses con selector de fabricantes
- Forms para Services con selector de providers H&S
- Gestión completa de imágenes y features dinámicas

📝 Tareas:
1. [x] ✅ Provider Create/Edit (COMPLETADO):
   - [x] Checkboxes: ☑ Es Fabricante ☑ Ofrece H&S
   - [x] FeatureFormBuilder dinámico según servicios seleccionados
   - [x] Flags editoriales (has_quality_images, has_complete_info, editor_approved_for_premium)
   - [x] Componente: ProviderMultipleServicesForm.tsx (600+ líneas)
   - [x] Páginas actualizadas: create.astro, edit.astro
   - [x] API endpoints actualizados: create.ts, [id].ts
   - [x] Validaciones frontend y backend
   - [x] UI con gradientes y efectos visuales
   - [x] Auto-generación de landing_slug

2. [x] ✅ House Create/Edit (COMPLETADO):
   - [x] Selector fabricante (solo providers con is_manufacturer=true)
   - [x] Modal "Crear Fabricante Rápido" integrado
   - [x] FeatureFormBuilder category="casas"
   - [x] ImageGalleryManager para galería completa
   - [x] Componente: HouseForm.tsx (800+ líneas)
   - [x] Páginas: create.astro, [id]/edit.astro
   - [x] API endpoints actualizados: index.ts, [id].ts
   - [x] Auto-cálculo price_per_m2
   - [x] Validaciones provider-house relationship

3. [x] ✅ Service Create/Edit (COMPLETADO):
   - [x] Selector provider H&S (solo is_service_provider=true)
   - [x] Modal "Crear Proveedor H&S Rápido"
   - [x] FeatureFormBuilder category="habilitacion_servicios"
   - [x] Componente: ServiceForm.tsx (700+ líneas)
   - [x] Página: create.astro
   - [x] ImageGalleryManager integrado
   - [x] Gestión coverage_areas

4. [ ] Admin Slots (/admin/slots):
   - UI para asignar contenido a slots
   - Configurar orden rotación (round-robin)
   - Preview de cómo se verá en homepage

5. [ ] Flags Editoriales:
   - Component: ProviderVerificationSystem.tsx
   - Aprobar/rechazar para premium
   - Validar calidad imágenes/info

📦 Archivos creados en FASE 2:
**Task 1 - Providers:**
- ✅ src/components/admin/ProviderMultipleServicesForm.tsx (NUEVO - 600+ líneas)
- ✅ src/pages/admin/providers/create.astro (REESCRITO)
- ✅ src/pages/admin/providers/[id]/edit.astro (REESCRITO)
- ✅ src/pages/api/admin/providers/create.ts (ACTUALIZADO)
- ✅ src/pages/api/admin/providers/[id].ts (ACTUALIZADO)

**Task 2 - Houses:**
- ✅ src/components/admin/HouseForm.tsx (NUEVO - 800+ líneas)
- ✅ src/components/admin/ImageGalleryManager.tsx (NUEVO - 150 líneas)
- ✅ src/pages/admin/houses/create.astro (NUEVO)
- ✅ src/pages/admin/houses/[id]/edit.astro (NUEVO)
- ✅ src/pages/api/admin/houses/index.ts (ACTUALIZADO)
- ✅ src/pages/api/admin/houses/[id].ts (ACTUALIZADO)

**Task 3 - Services:**
- ✅ src/components/admin/ServiceForm.tsx (NUEVO - 700+ líneas)
- ✅ src/pages/admin/services/create.astro (NUEVO)

**TOTAL FASE 2:**
- 🎉 3 componentes de formulario completos (2100+ líneas)
- 🎉 1 componente reutilizable (ImageGalleryManager)
- 🎉 5 páginas admin creadas/actualizadas
- 🎉 4 API endpoints actualizados
- 🎉 Modal "Crear Rápido" para fabricantes y proveedores H&S
- 🎉 Integración completa FeatureFormBuilder
- 🎉 Validaciones robustas frontend/backend
```

### FASE 3 - Frontend Público (3-4h)

```
✅ Objetivos:
- Landing principal con slots round-robin
- Landings específicas con filtros laterales dinámicos
- Landings individuales premium

📝 Tareas:
1. [ ] Landing Principal (/):
   - Contenido destacado (blog/noticias)
   - Slots premium (2 visibles, rotación)
   - Slots destacados (4 visibles, rotación)
   - Listing standard
   - Hot spots regionales
   - Blog/Novedades

2. [ ] /casas:
   - FilterSidebar dinámico (CSV casas)
   - Cards por tier
   - Pagination

3. [ ] /fabricantes:
   - FilterSidebar dinámico (imagen.png)
   - Cards por tier
   - Pagination

4. [ ] /habilitacion-y-servicios:
   - FilterSidebar dinámico (CSV H&S)
   - Cards por tier
   - Pagination

5. [ ] Landings Individuales:
   - /casas/[slug] (si tier=premium)
   - /fabricantes/[slug] (si tier=premium)
   - /habilitacion-y-servicios/[slug] (si tier=premium)
   - Template reutilizable con secciones dinámicas
```

### FASE 4 - Blog/Noticias SEO (2-3h) 🔥 PRIORITARIO

```
✅ Objetivos:
- CMS completo para blog
- Generación estática (SSG)
- SEO optimizado

📝 Tareas:
1. [ ] Admin Blog:
   - Editor WYSIWYG (TipTap o Lexical)
   - Upload imágenes (Supabase Storage)
   - Meta tags (title, description, keywords)
   - Schema.org automation

2. [ ] Frontend Blog:
   - /blog (listing con paginación)
   - /blog/[slug] (post individual, SSG)
   - Related posts
   - Social sharing

3. [ ] SEO:
   - Sitemap.xml dinámico
   - RSS feed
   - Open Graph tags
   - JSON-LD structured data
```

### FASE 5 - Integraciones (1-2h)

```
✅ Objetivos:
- Webhook N8N para auto-import
- APIs públicas de catálogo

📝 Tareas:
1. [ ] Webhook N8N:
   - /api/admin/webhooks/n8n-provider-import
   - Validación API key
   - Status 'pending_review'
   - Notificación a editores

2. [ ] API Pública:
   - /api/catalog/search (unificada)
   - /api/catalog/casas
   - /api/catalog/fabricantes
   - /api/catalog/servicios
   - Filtros, paginación, ordering
```

### FASE 6 - Testing y QA (1-2h)

```
✅ Objetivos:
- Tests críticos
- Validación flujos completos

📝 Tareas:
1. [ ] Unit Tests:
   - Helpers JSONB (getFeatureValue, shouldShowFeature)
   - Slot rotation logic
   - Filter builders

2. [ ] Integration Tests:
   - Crear provider con múltiples servicios
   - Crear casa con fabricante asociado
   - Round-robin slots
   - Filtros dinámicos

3. [ ] E2E Tests (Playwright):
   - Flujo completo admin
   - Búsqueda y filtros frontend
   - Landing premium
```

---

## 📊 Resumen de Decisiones Clave

### ✅ Confirmado

1. **Providers con múltiples servicios**:
   - `is_manufacturer` + `is_service_provider` (pueden ser ambos)
   - Features JSONB separados por tipo de servicio

2. **Tiers 100% independientes**:
   - Provider premium puede tener casas standard
   - Cada entidad paga su propio tier

3. **Slots con Round-Robin**:
   - N slots en pool, rotan automáticamente
   - Premium: 2 visibles, Destacados: 4 visibles

4. **Filtros laterales dinámicos**:
   - Se ajustan según `/casas`, `/fabricantes`, `/habilitacion-y-servicios`
   - Basados en `feature_definitions.filter_location = 'lateral'`

5. **Constraints**:
   - Houses solo si `provider.is_manufacturer = true`
   - Service_products solo si `provider.is_service_provider = true`
   - DELETE RESTRICT (no borrar provider con contenido asociado)

6. **'casas' NO es category_type**:
   - Es un producto (tabla `houses`)
   - SÍ existe en `feature_definitions.category = 'casas'`

7. **Webhook N8N**:
   - Auto-import providers encontrados en web
   - Status `pending_review` para aprobación editorial

8. **Blog/Noticias PRIORITARIO**:
   - Generación estática (SSG)
   - SEO optimizado (Schema.org, OG tags)
   - Editor WYSIWYG

---

## 🚀 Próximos Pasos Inmediatos

```bash
# 1. Actualizar README.md con referencia a este plan
echo "Ver PLAN_MAESTRO.md para arquitectura completa" >> README.md

# 2. Crear issues/tasks en GitHub
gh issue create --title "FASE 1: Corrección Modelo de Datos" --body "..."

# 3. Iniciar FASE 1
git checkout -b feat/model-multiple-services

# 4. Crear primera migración
npx supabase migration new add_provider_service_flags
```

---

**Última actualización:** 2025-10-11
**Responsable:** Equipo Desarrollo MODTOK
**Estado:** ✅ Plan Aprobado - Listo para Implementar
