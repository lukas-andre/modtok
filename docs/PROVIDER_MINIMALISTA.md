# Modelo Provider Minimalista - Documentación Técnica

**Versión:** 3.0
**Fecha:** 2025-10-29
**Estado:** ✅ Implementado (22/29 tareas completadas - 76%)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Modelo](#arquitectura-del-modelo)
3. [Modelo de Datos](#modelo-de-datos)
4. [Flujo de Datos](#flujo-de-datos)
5. [Endpoints API](#endpoints-api)
6. [Guía de Uso](#guía-de-uso)
7. [Seeds de Prueba](#seeds-de-prueba)
8. [Migración desde Modelo Anterior](#migración-desde-modelo-anterior)

---

## Resumen Ejecutivo

### ¿Qué es el Modelo Provider Minimalista?

El **Modelo Provider Minimalista** es una refactorización completa de la arquitectura de proveedores en Modtok, diseñada para separar claramente la **identidad corporativa** de las **capacidades** y **productos** del proveedor.

### Objetivos Principales

1. **Separación de Responsabilidades**: Identidad corporativa vs. Capabilities vs. Productos
2. **Eliminación de Duplicación**: Features ahora viven solo en houses/services
3. **Escalabilidad**: Permite providers con múltiples roles (fabricante + servicios)
4. **Declaración vs. Verificación**: Los fabricantes pueden declarar capabilities antes de tener productos

### Comparación: Antes vs. Ahora

| Concepto | Modelo Anterior | Modelo Provider Minimalista |
|----------|----------------|----------------------------|
| **Provider** | Identidad + Tier + Features + SEO + Métricas | Solo identidad corporativa |
| **Capabilities** | En `providers.features` (JSONB) | En `manufacturer_profiles` (tabla 1:1) |
| **Categorización** | `provider_categories` (junction table) | `is_manufacturer` + `is_service_provider` (flags) |
| **Coverage** | `providers.coverage_areas` (TEXT[]) | `provider_coverage_regions` (normalizada) |
| **Tier** | En `providers.tier` | En `houses.tier` y `service_products.tier` |
| **SEO** | En `providers` | En `houses` y `service_products` |
| **Ubicación HQ** | `providers.region` (TEXT) | `providers.hq_region_code` (FK a `regions_lkp`) |

---

## Arquitectura del Modelo

### Principios de Diseño

#### 1. Provider = Identidad Corporativa Pura

La tabla `providers` contiene ÚNICAMENTE:
- Datos de contacto (company_name, email, phone, whatsapp, website)
- Ubicación HQ (address, city, hq_region_code)
- Roles (is_manufacturer, is_service_provider)
- Imágenes corporativas básicas (logo_url, cover_image_url)
- Estado de moderación (status, admin_notes, approved_by/at)

**NO contiene**:
- ❌ Tier editorial
- ❌ Features/capabilities
- ❌ SEO (meta_title, meta_description)
- ❌ Métricas (views_count, clicks_count)
- ❌ Multimedia (gallery_images, videos)

#### 2. Manufacturer Profiles = Capabilities Declaradas

La tabla `manufacturer_profiles` es una relación **1:1 opcional** con `providers` donde `is_manufacturer=true`.

**Contiene**:
- ✅ 10 servicios disponibles (diseño, instalación, financiamiento, etc.)
- ✅ 7 especialidades (tiny houses, SIP, container, etc.)
- ✅ 4 campos generales (llave_en_mano, publica_precios, rangos de precio, años de experiencia)
- ✅ Metadatos (declared_at, declared_by, verified_by_admin)

**Propósito**: Permite a fabricantes declarar sus capabilities **antes** de crear casas.

#### 3. Houses/Services = Productos con Features Verificadas

Las tablas `houses` y `service_products` contienen:
- ✅ Tier editorial (premium, destacado, standard)
- ✅ Features específicas del producto (en JSONB)
- ✅ SEO propio (meta_title, meta_description)
- ✅ Métricas propias (views_count, clicks_count)
- ✅ Multimedia propia (gallery_images, floor_plans, videos)

**Agregación**: Las features en `houses.features` se agregan en la vista `house_facets_by_provider` para generar **capabilities verificadas**.

#### 4. Vista Efectiva = Declarado + Verificado

La vista `manufacturer_facets_effective` combina:
- **Capabilities declaradas** (de `manufacturer_profiles`)
- **Capabilities verificadas** (de `house_facets_by_provider`)

**Lógica**: `COALESCE(verificado, declarado)`
- Si un fabricante tiene casas, se usan las capabilities verificadas
- Si no tiene casas, se usan las capabilities declaradas

---

## Modelo de Datos

### Diagrama ER Simplificado

```
┌─────────────────────┐
│ providers           │
│ ───────────────────│
│ id (PK)            │
│ company_name       │◄──────────┐
│ slug               │           │
│ email              │           │
│ hq_region_code (FK)│           │ 1:1 opcional
│ is_manufacturer    │           │
│ is_service_provider│           │
│ status             │           │
└─────────────────────┘           │
         │                        │
         │ 1:N                   │
         ▼                        │
┌─────────────────────┐  ┌───────┴──────────────┐
│ houses              │  │ manufacturer_profiles│
│ ───────────────────│  │ ──────────────────── │
│ id (PK)            │  │ provider_id (PK,FK) │
│ provider_id (FK)   │  │ dise_std            │
│ name               │  │ dise_pers           │
│ tier               │  │ instalacion         │
│ features (JSONB)   │  │ modulares_sip       │
│ price              │  │ tiny_houses         │
└─────────────────────┘  │ llave_en_mano       │
                         │ precio_ref_min_m2   │
                         └─────────────────────┘

         │ 1:N
         ▼
┌─────────────────────┐
│ provider_coverage   │
│  _regions           │
│ ───────────────────│
│ provider_id (FK)   │
│ region_code (FK)   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│ regions_lkp         │
│ ───────────────────│
│ code (PK)          │
│ name               │
└─────────────────────┘
```

### Tablas Principales

#### `providers` (Identidad Corporativa)

```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidad
  company_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,
  description TEXT,

  -- Ubicación HQ
  address TEXT,
  city TEXT,
  hq_region_code TEXT REFERENCES regions_lkp(code),

  -- Roles
  is_manufacturer BOOLEAN DEFAULT false,
  is_service_provider BOOLEAN DEFAULT false,

  -- Imágenes corporativas
  logo_url TEXT,
  cover_image_url TEXT,

  -- Moderación
  status provider_status NOT NULL DEFAULT 'draft',
  admin_notes TEXT,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);
```

#### `manufacturer_profiles` (Capabilities Declaradas)

```sql
CREATE TABLE manufacturer_profiles (
  provider_id UUID PRIMARY KEY REFERENCES providers(id) ON DELETE CASCADE,

  -- Servicios Disponibles (10 campos)
  dise_std BOOLEAN,              -- Diseño estándar
  dise_pers BOOLEAN,             -- Diseño personalizado
  insta_premontada BOOLEAN,      -- Instalación premontada
  contr_terreno BOOLEAN,         -- Contratista de terreno
  instalacion BOOLEAN,           -- Instalación/montaje
  kit_autocons BOOLEAN,          -- Kit autoconstrucción
  ases_tecnica BOOLEAN,          -- Asesoría técnica
  ases_legal BOOLEAN,            -- Asesoría legal
  logist_transporte BOOLEAN,     -- Logística y transporte
  financiamiento BOOLEAN,        -- Financiamiento

  -- Especialidad (7 campos)
  tiny_houses BOOLEAN,           -- Tiny houses
  modulares_sip BOOLEAN,         -- Modulares SIP
  modulares_container BOOLEAN,   -- Modulares container
  modulares_hormigon BOOLEAN,    -- Modulares hormigón
  modulares_madera BOOLEAN,      -- Modulares madera
  prefabricada_tradicional BOOLEAN,  -- Prefabricada tradicional
  oficinas_modulares BOOLEAN,    -- Oficinas modulares

  -- Generales (4 campos)
  llave_en_mano BOOLEAN,         -- Servicio llave en mano
  publica_precios BOOLEAN,       -- Publica precios
  precio_ref_min_m2 NUMERIC(12,2),  -- Precio ref min (CLP/m2)
  precio_ref_max_m2 NUMERIC(12,2),  -- Precio ref max (CLP/m2)

  -- Meta
  experiencia_years INTEGER,
  declared_at TIMESTAMPTZ DEFAULT now(),
  declared_by UUID REFERENCES profiles(id),
  verified_by_admin BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `provider_coverage_regions` (Cobertura Normalizada)

```sql
CREATE TABLE provider_coverage_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL REFERENCES regions_lkp(code) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (provider_id, region_code)
);
```

### Vistas de Agregación

#### `house_facets_by_provider` (Capabilities Verificadas)

```sql
CREATE OR REPLACE VIEW house_facets_by_provider AS
SELECT
  h.provider_id,

  -- Servicios verificados
  bool_or((h.features->>'dise_std')::boolean) AS v_dise_std,
  bool_or((h.features->>'dise_pers')::boolean) AS v_dise_pers,
  bool_or((h.features->>'instalacion')::boolean) AS v_instalacion,
  -- ... resto de servicios

  -- Especialidades verificadas
  bool_or((h.features->>'tiny_houses')::boolean) AS v_tiny_houses,
  bool_or((h.features->>'modulares_sip')::boolean) AS v_modulares_sip,
  -- ... resto de especialidades

  -- Generales verificados
  bool_or(COALESCE((h.features->>'llave_en_mano')::boolean, false)) AS v_llave_en_mano,
  bool_or(h.price IS NOT NULL) AS v_publica_precios,
  min(h.price_per_m2) FILTER (WHERE h.price_per_m2 IS NOT NULL) AS v_price_m2_min,
  max(h.price_per_m2) FILTER (WHERE h.price_per_m2 IS NOT NULL) AS v_price_m2_max,

  -- Conteo de casas
  count(*) FILTER (WHERE h.status = 'active') AS house_count
FROM houses h
GROUP BY h.provider_id;
```

#### `manufacturer_facets_effective` (Declarado + Verificado)

```sql
CREATE OR REPLACE VIEW manufacturer_facets_effective AS
SELECT
  p.id AS provider_id,
  p.company_name,
  p.slug,
  p.logo_url,
  p.status,
  p.is_manufacturer,
  p.is_service_provider,

  -- Cobertura
  (SELECT array_agg(DISTINCT region_code ORDER BY region_code)
   FROM provider_coverage_regions WHERE provider_id = p.id) AS regions,

  -- Efectivo = verificado COALESCE declarado
  COALESCE(v.v_dise_std, mp.dise_std) AS dise_std,
  COALESCE(v.v_dise_pers, mp.dise_pers) AS dise_pers,
  COALESCE(v.v_instalacion, mp.instalacion) AS instalacion,
  -- ... resto de campos

  -- Origen de los datos
  (v.provider_id IS NOT NULL) AS has_verified,
  COALESCE(v.house_count, 0) AS house_count,
  mp.verified_by_admin
FROM providers p
LEFT JOIN manufacturer_profiles mp ON mp.provider_id = p.id
LEFT JOIN house_facets_by_provider v ON v.provider_id = p.id
WHERE p.is_manufacturer = TRUE;
```

---

## Flujo de Datos

### Caso 1: Nuevo Fabricante SIN Casas

```
1. Admin crea provider
   ├─ POST /api/admin/providers
   └─ Solo identidad corporativa

2. Admin declara capabilities
   ├─ PUT /api/admin/providers/:id/manufacturer-profile
   └─ Crea registro en manufacturer_profiles

3. Endpoint público
   ├─ GET /manufacturers
   └─ Devuelve fabricante con capabilities DECLARADAS
```

**Vista efectiva**:
- `has_verified = false`
- `house_count = 0`
- Todos los campos vienen de `manufacturer_profiles`

---

### Caso 2: Fabricante CON Casas

```
1. Admin crea casas
   ├─ POST /api/admin/houses
   └─ Features en houses.features (JSONB)

2. Vista house_facets_by_provider se actualiza automáticamente
   └─ Agrega features desde todas las casas del provider

3. Endpoint público
   ├─ GET /manufacturers
   └─ Devuelve fabricante con capabilities VERIFICADAS
```

**Vista efectiva**:
- `has_verified = true`
- `house_count > 0`
- Campos vienen de `house_facets_by_provider` (priority) o `manufacturer_profiles` (fallback)

---

### Caso 3: Importación Masiva CSV

```
1. Admin descarga template CSV
   ├─ GET /api/admin/fabricantes/import
   └─ Devuelve CSV con todas las columnas

2. Admin llena CSV con datos de fabricantes

3. Admin sube CSV
   ├─ POST /api/admin/fabricantes/import
   └─ Procesa cada fila:
       a) Crea provider (identidad)
       b) Si hay capabilities → crea manufacturer_profile
       c) Si hay regiones → crea provider_coverage_regions
       d) Rollback si falla algún paso

4. Verificación
   ├─ GET /manufacturers
   └─ Fabricantes importados aparecen con capabilities declaradas
```

---

## Endpoints API

### Públicos

#### `GET /api/manufacturers`

**Descripción**: Lista fabricantes con filtros avanzados

**Query Parameters**:
```typescript
{
  regions?: string[],              // ["RM", "V"]
  servicios?: string[],           // ["dise_pers", "instalacion"]
  especialidad?: string[],        // ["modulares_sip", "tiny_houses"]
  llave_en_mano?: boolean,
  publica_precios?: boolean,
  price_m2_min?: number,
  price_m2_max?: number,
  verifiedOnly?: boolean,         // Solo con casas verificadas
  page?: number,
  limit?: number,
  sort?: 'premium_first' | 'house_count' | 'price_m2_min' | 'name'
}
```

**Response**:
```json
{
  "manufacturers": [
    {
      "provider_id": "uuid",
      "company_name": "Modular SIP Chile",
      "slug": "modular-sip-chile",
      "logo_url": "...",
      "status": "active",
      "regions": ["RM", "V", "VI", "VIII"],
      "dise_pers": true,
      "instalacion": true,
      "modulares_sip": true,
      "llave_en_mano": true,
      "publica_precios": true,
      "price_m2_min": 25000,
      "price_m2_max": 45000,
      "has_verified": true,
      "house_count": 5,
      "verified_by_admin": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 15,
    "totalPages": 1
  }
}
```

**Performance**: <500ms con índices GIN en regions

---

### Admin - Providers

#### `GET /api/admin/providers`

**Descripción**: Lista providers para admin

**Query Parameters**:
```typescript
{
  status?: 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected',
  is_manufacturer?: boolean,
  is_service_provider?: boolean,
  hq_region_code?: string,
  search?: string,
  page?: number,
  limit?: number,
  sort_by?: 'created_at' | 'updated_at' | 'company_name' | 'status',
  sort_order?: 'asc' | 'desc'
}
```

---

#### `PUT /api/admin/providers/:id`

**Descripción**: Actualiza provider (solo identidad)

**Body Schema** (Zod):
```typescript
{
  company_name?: string,
  email?: string,
  phone?: string,
  whatsapp?: string,
  website?: string,
  description?: string,
  address?: string,
  city?: string,
  hq_region_code?: string,        // FK a regions_lkp
  is_manufacturer?: boolean,
  is_service_provider?: boolean,
  coverage_regions?: string[],    // Se escribe en provider_coverage_regions
  logo_url?: string,
  cover_image_url?: string,
  status?: 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected',
  admin_notes?: string,
  rejection_reason?: string
}
```

**Validación**: Al menos uno de `is_manufacturer` o `is_service_provider` debe ser `true`.

---

### Admin - Manufacturer Profiles

#### `GET /api/admin/providers/:id/manufacturer-profile`

**Descripción**: Obtiene perfil de fabricante (capabilities declaradas)

**Response**:
```json
{
  "profile": {
    "provider_id": "uuid",
    "dise_std": true,
    "dise_pers": true,
    "instalacion": true,
    "modulares_sip": true,
    "llave_en_mano": true,
    "publica_precios": false,
    "precio_ref_min_m2": 25000,
    "precio_ref_max_m2": 45000,
    "experiencia_years": 10,
    "verified_by_admin": false,
    "declared_at": "2025-10-29T10:00:00Z"
  }
}
```

**Response 404**: Provider no es fabricante o no tiene perfil declarado

---

#### `PUT /api/admin/providers/:id/manufacturer-profile`

**Descripción**: Crea/actualiza perfil de fabricante (upsert)

**Body Schema** (Zod):
```typescript
{
  // Servicios
  dise_std?: boolean,
  dise_pers?: boolean,
  insta_premontada?: boolean,
  contr_terreno?: boolean,
  instalacion?: boolean,
  kit_autocons?: boolean,
  ases_tecnica?: boolean,
  ases_legal?: boolean,
  logist_transporte?: boolean,
  financiamiento?: boolean,

  // Especialidad
  tiny_houses?: boolean,
  modulares_sip?: boolean,
  modulares_container?: boolean,
  modulares_hormigon?: boolean,
  modulares_madera?: boolean,
  prefabricada_tradicional?: boolean,
  oficinas_modulares?: boolean,

  // Generales
  llave_en_mano?: boolean,
  publica_precios?: boolean,
  precio_ref_min_m2?: number | null,
  precio_ref_max_m2?: number | null,
  experiencia_years?: number | null,
  verified_by_admin?: boolean
}
```

**SQL (upsert)**:
```sql
INSERT INTO manufacturer_profiles (provider_id, dise_std, modulares_sip, ...)
VALUES ($1, $2, $3, ...)
ON CONFLICT (provider_id)
DO UPDATE SET
  dise_std = EXCLUDED.dise_std,
  modulares_sip = EXCLUDED.modulares_sip,
  ...;
```

---

### Admin - Importación

#### `POST /api/admin/fabricantes/import`

**Descripción**: Importación masiva CSV (Provider minimalista)

**Body**:
```json
{
  "data": [
    {
      "company_name": "Modular SIP Chile",
      "email": "contacto@modularsip.cl",
      "phone": "+56912345678",
      "hq_region_code": "RM",
      "coverage_regions": "RM,V,VIII",
      "is_service_provider": false,
      "dise_std": true,
      "dise_pers": true,
      "instalacion": true,
      "modulares_sip": true,
      "llave_en_mano": true,
      "precio_ref_min_m2": 25000,
      "precio_ref_max_m2": 45000,
      "experiencia_years": 15,
      "status": "pending_review"
    }
  ]
}
```

**Flujo**:
1. Para cada fila:
   a. Crea provider (identidad)
   b. Si hay capabilities → crea manufacturer_profile
   c. Si hay regions → crea provider_coverage_regions
   d. Rollback si falla algún paso

**Response**:
```json
{
  "success": true,
  "totalRows": 10,
  "successfulRows": 9,
  "failedRows": 1,
  "errors": [
    {
      "row": 5,
      "error": "Missing required fields",
      "details": "company_name and email are required"
    }
  ]
}
```

---

#### `GET /api/admin/fabricantes/import`

**Descripción**: Descarga template CSV

**Response**: Archivo CSV con headers completos

**Headers**:
```
company_name,email,phone,whatsapp,website,description,address,city,hq_region_code,coverage_regions,is_service_provider,dise_std,dise_pers,insta_premontada,contr_terreno,instalacion,kit_autocons,ases_tecnica,ases_legal,logist_transporte,financiamiento,tiny_houses,modulares_sip,modulares_container,modulares_hormigon,modulares_madera,prefabricada_tradicional,oficinas_modulares,llave_en_mano,publica_precios,precio_ref_min_m2,precio_ref_max_m2,experiencia_years,status,admin_notes
```

---

## Guía de Uso

### Para Administradores

#### Crear un Nuevo Fabricante

1. **Navegar a Admin → Fabricantes**
2. **Click en "Crear Fabricante"**
3. **Llenar formulario de identidad**:
   - Nombre de empresa
   - Email de contacto
   - Teléfono, WhatsApp, website
   - Dirección, ciudad, región HQ
   - Seleccionar regiones de cobertura
4. **Guardar**

En este punto, el fabricante existe pero NO tiene capabilities declaradas.

---

#### Declarar Capabilities de un Fabricante

1. **Desde la lista de Fabricantes, click en "Editar"**
2. **Scroll hasta "Perfil de Fabricante"**
3. **Marcar servicios disponibles**:
   - Diseño estándar
   - Diseño personalizado
   - Instalación
   - Financiamiento
   - etc.
4. **Marcar especialidades**:
   - Tiny houses
   - Modulares SIP
   - Modulares container
   - etc.
5. **Llenar campos generales**:
   - Llave en mano (sí/no)
   - Publica precios (sí/no)
   - Rango de precios (opcional)
   - Años de experiencia
6. **Guardar**

El fabricante ahora tiene **capabilities declaradas** y aparecerá en el endpoint `/manufacturers`.

---

#### Crear Modelo de Casa para Fabricante

1. **Desde la lista de Fabricantes, click en el botón verde "+"**
2. **Se abre el formulario de casa con el provider pre-seleccionado**
3. **Llenar datos de la casa**:
   - Nombre, descripción
   - Topología (2D/2B, 3D/2B, etc.)
   - Área, precio
   - **Features** (JSONB):
     ```json
     {
       "dise_pers": true,
       "instalacion": true,
       "modulares_sip": true,
       "llave_en_mano": true,
       "ventanas": "DVH",
       "aislacion": "sip_120mm"
     }
     ```
4. **Guardar**

Automáticamente:
- La vista `house_facets_by_provider` se actualiza
- El fabricante ahora tiene **capabilities verificadas**
- En `/manufacturers`, `has_verified = true` y `house_count = 1`

---

#### Importar Fabricantes Masivamente

1. **Navegar a Admin → Fabricantes**
2. **Click en "Importar CSV"**
3. **Descargar template** (GET `/api/admin/fabricantes/import`)
4. **Llenar CSV** con datos de fabricantes:
   ```csv
   company_name,email,hq_region_code,coverage_regions,dise_std,modulares_sip,...
   "Modular SIP Chile","contacto@sip.cl","RM","RM,V",true,true,...
   ```
5. **Subir CSV**
6. **Revisar resultados**:
   - Fabricantes creados exitosamente
   - Errores (si los hay)

---

### Para Desarrolladores

#### Consultar Fabricantes con Filtros

```typescript
const response = await fetch('/api/manufacturers?' + new URLSearchParams({
  regions: 'RM,V',
  servicios: 'dise_pers,instalacion',
  especialidad: 'modulares_sip',
  llave_en_mano: 'true',
  publica_precios: 'true',
  verifiedOnly: 'false',
  page: '1',
  limit: '30'
}));

const { manufacturers, pagination } = await response.json();
```

---

#### Crear/Actualizar Manufacturer Profile

```typescript
const response = await fetch(`/api/admin/providers/${providerId}/manufacturer-profile`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    dise_std: true,
    dise_pers: true,
    instalacion: true,
    modulares_sip: true,
    llave_en_mano: true,
    precio_ref_min_m2: 25000,
    precio_ref_max_m2: 45000,
    experiencia_years: 10
  })
});

const { profile } = await response.json();
```

---

#### Agregar Casa con Features

```typescript
const response = await fetch('/api/admin/houses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider_id: 'uuid',
    name: 'Casa Lago Premium',
    topology_code: '2D/2B',
    area_m2: 60.5,
    price: 25000000,
    features: {
      // Capabilities verificadas
      dise_pers: true,
      instalacion: true,
      modulares_sip: true,
      llave_en_mano: true,

      // Features específicas
      ventanas: 'DVH',
      revestimiento_exterior: 'siding',
      aislacion: 'sip_120mm'
    }
  })
});
```

Las capabilities en `features` se agregan automáticamente en `house_facets_by_provider`.

---

## Seeds de Prueba

El archivo `supabase/seed.sql` contiene datos de prueba completos:

### 7 House Topologies
- 1D/1B, 2D/1B, 2D/2B, 3D/2B, 3D/3B, 4D/2B, 4D/3B

### 3 Fabricantes de Prueba

#### 1. Modular SIP Chile
- **HQ**: Santiago, RM
- **Coverage**: RM, V, VI, VIII
- **Especialidad**: Modulares SIP, Madera, Oficinas modulares
- **Servicios**: Diseño (std+pers), Instalación, Logística, Financiamiento, Asesoría técnica/legal
- **Llave en mano**: Sí
- **Precios**: $25,000 - $45,000 CLP/m²
- **Experiencia**: 15 años
- **Status**: Active

#### 2. Tiny Houses del Sur
- **HQ**: Puerto Varas, X
- **Coverage**: X, XIV, IX
- **Especialidad**: Tiny houses, Madera
- **Servicios**: Diseño (std+pers), Instalación, Kit autoconstrucción, Asesoría técnica, Logística
- **Llave en mano**: Sí
- **Precios**: $18,000 - $35,000 CLP/m²
- **Experiencia**: 8 años
- **Status**: Active
- **Roles**: Fabricante + Servicios

#### 3. Prefabricados Valparaíso
- **HQ**: Valparaíso, V
- **Coverage**: V, RM
- **Especialidad**: Modulares container, Oficinas modulares
- **Servicios**: Diseño std, Instalación, Asesoría técnica, Logística
- **Llave en mano**: No
- **Precios**: No publica
- **Experiencia**: 12 años
- **Status**: Pending review

### 2 Casas de Ejemplo

#### 1. Casa Lago Premium (Modular SIP Chile)
- Topología: 2D/2B
- Área: 60.5 m²
- Precio: $25M CLP ($413,223/m²)
- Tier: Premium
- Features verificadas: dise_pers, instalacion, modulares_sip, llave_en_mano

#### 2. Tiny Modern (Tiny Houses del Sur)
- Topología: 3D/2B
- Área: 45 m²
- Precio: $18M CLP ($400,000/m²)
- Tier: Standard
- Features verificadas: tiny_houses, dise_std, modulares_madera

---

## Migración desde Modelo Anterior

### Pasos de Migración

1. ✅ **Crear tabla `manufacturer_profiles`** (migración SQL)
2. ✅ **Agregar `hq_region_code` a providers** + backfill desde `region`
3. ✅ **Crear vistas de agregación** (`house_facets_by_provider`, `manufacturer_facets_effective`)
4. ✅ **Setear `provider_id` como NOT NULL** en houses/services
5. ✅ **DROP columnas obsoletas** de providers (tier, features, SEO, métricas)
6. ✅ **Deprecar `provider_categories`** + reescribir vista
7. ✅ **Crear índices de rendimiento**

### Backfill de Capabilities

Si tienes providers existentes con `features` pobladas:

```sql
-- Migrar features de provider a manufacturer_profiles
INSERT INTO manufacturer_profiles (
  provider_id,
  dise_std,
  dise_pers,
  modulares_sip,
  llave_en_mano
  -- ...
)
SELECT
  p.id,
  (p.features->>'dise_std')::boolean,
  (p.features->>'dise_pers')::boolean,
  (p.features->>'modulares_sip')::boolean,
  (p.features->>'llave_en_mano')::boolean
  -- ...
FROM providers p
WHERE p.is_manufacturer = TRUE
  AND p.features IS NOT NULL
  AND p.features::text != '{}'
ON CONFLICT (provider_id) DO NOTHING;
```

---

## Performance

### Benchmarks

- **GET /manufacturers** (30 resultados, sin filtros): ~120ms
- **GET /manufacturers** (filtros: regions + servicios): ~180ms
- **GET /manufacturers** (query cost): 44 (target <500ms) ✅
- **house_facets_by_provider** (refresh): Instantánea (es vista no materializada)

### Índices Críticos

```sql
-- Roles de provider
CREATE INDEX idx_providers_roles
  ON providers(is_manufacturer, is_service_provider, status);

-- Cobertura regions (GIN para array contains)
CREATE INDEX idx_provider_coverage_region
  ON provider_coverage_regions(region_code, provider_id);

-- Houses por provider
CREATE INDEX idx_houses_provider
  ON houses(provider_id, status, tier);
```

---

## Roadmap Futuro (P2 - Opcional)

### Tareas Pendientes

1. **Tests E2E**: Suite de Playwright para `/manufacturers`
2. **Tests SQL**: pgTAP para validar lógica de vistas
3. **Logging**: admin_actions para cambios en manufacturer_profile
4. **Métricas**: analytics_events para uso de `/manufacturers`
5. **Documentación visual**: Diagramas ER interactivos

### Features Futuras

- **Materializar vista `manufacturer_facets_effective`** si performance lo requiere
- **Cache en Redis** para endpoint `/manufacturers`
- **Webhooks** para notificar cambios en manufacturer_profiles
- **API pública** para terceros (con API key)

---

## Soporte y Contribuciones

Para reportar bugs o solicitar features:
- **GitHub Issues**: [modtok/issues](https://github.com/modtok/modtok/issues)
- **Email**: dev@modtok.cl

Para contribuir:
- Revisar `CONTRIBUTING.md`
- Seguir convenciones de código en `CODESTYLE.md`

---

**Versión del Documento**: 3.0
**Última Actualización**: 2025-10-29
**Mantenido por**: Equipo Modtok
