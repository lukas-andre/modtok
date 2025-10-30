# API Endpoints - Provider Minimalista

**Versión**: 3.0
**Fecha**: 2025-10-29
**Base URL**: `https://modtok.cl/api`

---

## Tabla de Contenidos

1. [Endpoints Públicos](#endpoints-públicos)
2. [Endpoints Admin - Providers](#endpoints-admin---providers)
3. [Endpoints Admin - Manufacturer Profiles](#endpoints-admin---manufacturer-profiles)
4. [Endpoints Admin - Importación](#endpoints-admin---importación)
5. [Esquemas de Datos](#esquemas-de-datos)
6. [Códigos de Error](#códigos-de-error)

---

## Endpoints Públicos

### GET /api/manufacturers

**Descripción**: Lista fabricantes con filtros avanzados

**Autenticación**: No requiere

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `regions` | string | No | Regiones (comma-separated) | `RM,V,VIII` |
| `servicios` | string | No | Servicios (comma-separated) | `dise_pers,instalacion` |
| `especialidad` | string | No | Especialidades (comma-separated) | `modulares_sip,tiny_houses` |
| `llave_en_mano` | boolean | No | Solo con servicio llave en mano | `true` |
| `publica_precios` | boolean | No | Solo que publican precios | `true` |
| `price_m2_min` | number | No | Precio mínimo por m² (CLP) | `20000` |
| `price_m2_max` | number | No | Precio máximo por m² (CLP) | `50000` |
| `verifiedOnly` | boolean | No | Solo con casas verificadas | `true` |
| `page` | number | No | Página (default: 1) | `1` |
| `limit` | number | No | Resultados por página (default: 30, max: 100) | `30` |
| `sort` | string | No | Ordenamiento | `premium_first`, `house_count`, `price_m2_min`, `name` |

**Request Example**:
```http
GET /api/manufacturers?regions=RM,V&servicios=dise_pers,instalacion&especialidad=modulares_sip&llave_en_mano=true&page=1&limit=30
```

**Response 200 OK**:
```json
{
  "manufacturers": [
    {
      "provider_id": "11111111-1111-1111-1111-111111111111",
      "company_name": "Modular SIP Chile",
      "slug": "modular-sip-chile",
      "logo_url": "https://cdn.modtok.cl/logos/modular-sip.png",
      "status": "active",
      "regions": ["RM", "V", "VI", "VIII"],

      // Servicios disponibles
      "dise_std": true,
      "dise_pers": true,
      "insta_premontada": false,
      "contr_terreno": true,
      "instalacion": true,
      "kit_autocons": false,
      "ases_tecnica": true,
      "ases_legal": true,
      "logist_transporte": true,
      "financiamiento": true,

      // Especialidades
      "tiny_houses": false,
      "modulares_sip": true,
      "modulares_container": false,
      "modulares_hormigon": false,
      "modulares_madera": true,
      "prefabricada_tradicional": false,
      "oficinas_modulares": true,

      // Generales
      "llave_en_mano": true,
      "publica_precios": true,
      "price_m2_min": 25000,
      "price_m2_max": 45000,

      // Metadata
      "has_verified": true,
      "house_count": 5,
      "verified_by_admin": false
    },
    {
      "provider_id": "22222222-2222-2222-2222-222222222222",
      "company_name": "Tiny Houses del Sur",
      "slug": "tiny-houses-del-sur",
      "logo_url": "https://cdn.modtok.cl/logos/tiny-sur.png",
      "status": "active",
      "regions": ["X", "XIV", "IX"],

      "dise_std": true,
      "dise_pers": true,
      "instalacion": true,
      "kit_autocons": true,
      "ases_tecnica": true,
      "logist_transporte": true,

      "tiny_houses": true,
      "modulares_madera": true,

      "llave_en_mano": true,
      "publica_precios": true,
      "price_m2_min": 18000,
      "price_m2_max": 35000,

      "has_verified": true,
      "house_count": 2,
      "verified_by_admin": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 15,
    "totalPages": 1,
    "hasMore": false,
    "hasPrev": false
  }
}
```

**Filtrado por Servicios**:
```typescript
// Cliente puede filtrar por múltiples servicios
const servicios = ['dise_pers', 'instalacion', 'financiamiento'];
const url = `/api/manufacturers?servicios=${servicios.join(',')}`;

// Solo muestra fabricantes que ofrecen TODOS los servicios seleccionados
```

**Ordenamiento**:
- `premium_first`: Primero los con más casas (has_verified=true, house_count DESC)
- `house_count`: Por número de casas (DESC)
- `price_m2_min`: Por precio más bajo (ASC)
- `name`: Alfabético por nombre (ASC)

**Performance**: ~120-180ms con índices GIN

---

## Endpoints Admin - Providers

### GET /api/admin/providers

**Descripción**: Lista providers para gestión admin

**Autenticación**: Requiere rol `admin`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `draft`, `pending_review`, `active`, `inactive`, `rejected` |
| `is_manufacturer` | boolean | No | Solo fabricantes |
| `is_service_provider` | boolean | No | Solo servicios H&S |
| `hq_region_code` | string | No | Región HQ |
| `search` | string | No | Búsqueda en nombre, email, descripción |
| `page` | number | No | Página (default: 1) |
| `limit` | number | No | Resultados por página (default: 20) |
| `sort_by` | string | No | `created_at`, `updated_at`, `company_name`, `status` |
| `sort_order` | string | No | `asc` o `desc` |

**Request Example**:
```http
GET /api/admin/providers?is_manufacturer=true&status=active&sort_by=created_at&sort_order=desc
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "providers": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "company_name": "Modular SIP Chile",
      "slug": "modular-sip-chile",
      "email": "contacto@modularsipchile.cl",
      "phone": "+56912345678",
      "whatsapp": "+56912345678",
      "website": "https://modularsipchile.cl",
      "description": "Especialistas en construcción modular con sistema SIP...",
      "address": "Av. Providencia 1234",
      "city": "Santiago",
      "hq_region_code": "RM",
      "is_manufacturer": true,
      "is_service_provider": false,
      "status": "active",
      "approved_by": "admin-uuid",
      "approved_at": "2025-10-20T10:00:00Z",
      "admin_notes": null,
      "rejection_reason": null,
      "created_at": "2025-10-15T08:30:00Z",
      "updated_at": "2025-10-20T10:00:00Z",
      "profile": {
        "id": "profile-uuid",
        "full_name": "Admin User",
        "email": "admin@modtok.cl"
      },
      "approved_by_profile": {
        "full_name": "Super Admin"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasMore": true,
    "hasPrev": false
  }
}
```

---

### GET /api/admin/providers/:id

**Descripción**: Obtiene un provider específico

**Autenticación**: Requiere rol `admin`

**Request Example**:
```http
GET /api/admin/providers/11111111-1111-1111-1111-111111111111
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "provider": {
    "id": "11111111-1111-1111-1111-111111111111",
    "company_name": "Modular SIP Chile",
    "slug": "modular-sip-chile",
    "email": "contacto@modularsipchile.cl",
    "phone": "+56912345678",
    "whatsapp": "+56912345678",
    "website": "https://modularsipchile.cl",
    "description": "Especialistas en construcción modular con sistema SIP...",
    "address": "Av. Providencia 1234",
    "city": "Santiago",
    "hq_region_code": "RM",
    "is_manufacturer": true,
    "is_service_provider": false,
    "status": "active",
    "profile_id": "profile-uuid",
    "approved_by": "admin-uuid",
    "approved_at": "2025-10-20T10:00:00Z",
    "rejection_reason": null,
    "admin_notes": null,
    "created_at": "2025-10-15T08:30:00Z",
    "updated_at": "2025-10-20T10:00:00Z",
    "coverage_regions": [
      {
        "region_code": "RM",
        "region": {
          "code": "RM",
          "name": "Región Metropolitana de Santiago"
        }
      },
      {
        "region_code": "V",
        "region": {
          "code": "V",
          "name": "Región de Valparaíso"
        }
      }
    ]
  }
}
```

**Response 404 Not Found**:
```json
{
  "error": "Provider not found"
}
```

---

### PUT /api/admin/providers/:id

**Descripción**: Actualiza un provider (solo identidad corporativa)

**Autenticación**: Requiere rol `admin`

**Request Body Schema**:
```typescript
{
  // Identidad (opcionales)
  company_name?: string,
  email?: string,
  phone?: string,
  whatsapp?: string,
  website?: string,
  description?: string,

  // Ubicación HQ (opcionales)
  address?: string,
  city?: string,
  hq_region_code?: string,  // FK a regions_lkp (RM, V, etc.)

  // Roles (opcionales)
  is_manufacturer?: boolean,
  is_service_provider?: boolean,

  // Cobertura (opcional)
  coverage_regions?: string[],  // Array de region codes

  // Moderación (opcionales)
  status?: 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected',
  admin_notes?: string,
  rejection_reason?: string
}
```

**Validaciones**:
1. Al menos uno de `is_manufacturer` o `is_service_provider` debe ser `true`
2. Si `company_name` cambia → regenera `slug` automáticamente
3. Si `status` cambia a `active` → setea `approved_by` y `approved_at`

**Request Example**:
```http
PUT /api/admin/providers/11111111-1111-1111-1111-111111111111
Authorization: Bearer <token>
Content-Type: application/json

{
  "company_name": "Modular SIP Chile S.A.",
  "phone": "+56912345679",
  "hq_region_code": "RM",
  "coverage_regions": ["RM", "V", "VI", "VIII", "IX"],
  "status": "active"
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Provider updated successfully",
  "provider": {
    "id": "11111111-1111-1111-1111-111111111111",
    "company_name": "Modular SIP Chile S.A.",
    "slug": "modular-sip-chile-sa",
    "phone": "+56912345679",
    "hq_region_code": "RM",
    "status": "active",
    "approved_by": "current-admin-uuid",
    "approved_at": "2025-10-29T15:30:00Z",
    "updated_at": "2025-10-29T15:30:00Z"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "error": "Provider must offer at least one service (Manufacturer or H&S)"
}
```

---

### DELETE /api/admin/providers/:id

**Descripción**: Elimina un provider (requiere super admin)

**Autenticación**: Requiere rol `super_admin`

**Request Example**:
```http
DELETE /api/admin/providers/11111111-1111-1111-1111-111111111111
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Provider deleted successfully"
}
```

**Cascade Delete**:
- `manufacturer_profiles` (si existe)
- `provider_coverage_regions`
- **NO** elimina `houses` o `service_products` (error si existen)

---

### POST /api/admin/providers (Bulk Operations)

**Descripción**: Operaciones masivas (aprobar, rechazar)

**Autenticación**: Requiere rol `admin`

**Request Body Schema**:
```typescript
{
  action: 'approve' | 'reject',
  provider_ids: string[],
  data?: {
    rejection_reason?: string  // Solo para action='reject'
  }
}
```

**Request Example (Aprobar múltiples)**:
```http
POST /api/admin/providers
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "approve",
  "provider_ids": [
    "11111111-1111-1111-1111-111111111111",
    "22222222-2222-2222-2222-222222222222"
  ]
}
```

**Request Example (Rechazar múltiples)**:
```http
POST /api/admin/providers
Authorization: Bearer <token>
Content-Type: application/json

{
  "action": "reject",
  "provider_ids": [
    "33333333-3333-3333-3333-333333333333"
  ],
  "data": {
    "rejection_reason": "Información incompleta"
  }
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "2 providers updated successfully",
  "results": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "success": true,
      "provider": {
        "id": "11111111-1111-1111-1111-111111111111",
        "company_name": "Modular SIP Chile",
        "status": "active"
      }
    },
    {
      "id": "22222222-2222-2222-2222-222222222222",
      "success": true,
      "provider": {
        "id": "22222222-2222-2222-2222-222222222222",
        "company_name": "Tiny Houses del Sur",
        "status": "active"
      }
    }
  ]
}
```

---

## Endpoints Admin - Manufacturer Profiles

### GET /api/admin/providers/:id/manufacturer-profile

**Descripción**: Obtiene el perfil de fabricante (capabilities declaradas)

**Autenticación**: Requiere rol `admin`

**Request Example**:
```http
GET /api/admin/providers/11111111-1111-1111-1111-111111111111/manufacturer-profile
Authorization: Bearer <token>
```

**Response 200 OK**:
```json
{
  "profile": {
    "provider_id": "11111111-1111-1111-1111-111111111111",

    // Servicios disponibles
    "dise_std": true,
    "dise_pers": true,
    "insta_premontada": false,
    "contr_terreno": true,
    "instalacion": true,
    "kit_autocons": false,
    "ases_tecnica": true,
    "ases_legal": true,
    "logist_transporte": true,
    "financiamiento": true,

    // Especialidades
    "tiny_houses": false,
    "modulares_sip": true,
    "modulares_container": false,
    "modulares_hormigon": false,
    "modulares_madera": true,
    "prefabricada_tradicional": false,
    "oficinas_modulares": true,

    // Generales
    "llave_en_mano": true,
    "publica_precios": true,
    "precio_ref_min_m2": 25000,
    "precio_ref_max_m2": 45000,
    "experiencia_years": 15,

    // Metadata
    "verified_by_admin": false,
    "declared_at": "2025-10-15T09:00:00Z",
    "declared_by": "admin-uuid",
    "created_at": "2025-10-15T09:00:00Z",
    "updated_at": "2025-10-20T14:00:00Z"
  }
}
```

**Response 404 Not Found**:
```json
{
  "error": "Manufacturer profile not found"
}
```

**Casos**:
- Provider no es fabricante (`is_manufacturer=false`)
- Provider es fabricante pero no ha declarado perfil

---

### PUT /api/admin/providers/:id/manufacturer-profile

**Descripción**: Crea o actualiza el perfil de fabricante (upsert)

**Autenticación**: Requiere rol `admin`

**Request Body Schema**:
```typescript
{
  // Servicios disponibles (opcionales, boolean)
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

  // Especialidades (opcionales, boolean)
  tiny_houses?: boolean,
  modulares_sip?: boolean,
  modulares_container?: boolean,
  modulares_hormigon?: boolean,
  modulares_madera?: boolean,
  prefabricada_tradicional?: boolean,
  oficinas_modulares?: boolean,

  // Generales (opcionales)
  llave_en_mano?: boolean,
  publica_precios?: boolean,
  precio_ref_min_m2?: number | null,
  precio_ref_max_m2?: number | null,
  experiencia_years?: number | null,

  // Admin
  verified_by_admin?: boolean
}
```

**Validaciones**:
1. `precio_ref_min_m2` debe ser menor que `precio_ref_max_m2` (si ambos presentes)
2. `experiencia_years` debe ser >= 0
3. Provider debe tener `is_manufacturer=true`

**Request Example (Crear)**:
```http
PUT /api/admin/providers/11111111-1111-1111-1111-111111111111/manufacturer-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "dise_std": true,
  "dise_pers": true,
  "instalacion": true,
  "modulares_sip": true,
  "modulares_madera": true,
  "llave_en_mano": true,
  "publica_precios": true,
  "precio_ref_min_m2": 25000,
  "precio_ref_max_m2": 45000,
  "experiencia_years": 15
}
```

**Request Example (Actualizar)**:
```http
PUT /api/admin/providers/11111111-1111-1111-1111-111111111111/manufacturer-profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "dise_pers": true,
  "financiamiento": true,
  "precio_ref_max_m2": 50000,
  "verified_by_admin": true
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "message": "Manufacturer profile updated",
  "profile": {
    "provider_id": "11111111-1111-1111-1111-111111111111",
    "dise_std": true,
    "dise_pers": true,
    "instalacion": true,
    "financiamiento": true,
    "modulares_sip": true,
    "llave_en_mano": true,
    "precio_ref_min_m2": 25000,
    "precio_ref_max_m2": 50000,
    "verified_by_admin": true,
    "updated_at": "2025-10-29T16:00:00Z"
  }
}
```

**Response 400 Bad Request**:
```json
{
  "error": "Provider is not a manufacturer"
}
```

**SQL Upsert**:
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

## Endpoints Admin - Importación

### GET /api/admin/fabricantes/import

**Descripción**: Descarga template CSV para importación masiva

**Autenticación**: Requiere rol `admin`

**Request Example**:
```http
GET /api/admin/fabricantes/import
Authorization: Bearer <token>
```

**Response 200 OK** (text/csv):
```csv
company_name,email,phone,whatsapp,website,description,address,city,hq_region_code,coverage_regions,is_service_provider,dise_std,dise_pers,insta_premontada,contr_terreno,instalacion,kit_autocons,ases_tecnica,ases_legal,logist_transporte,financiamiento,tiny_houses,modulares_sip,modulares_container,modulares_hormigon,modulares_madera,prefabricada_tradicional,oficinas_modulares,llave_en_mano,publica_precios,precio_ref_min_m2,precio_ref_max_m2,experiencia_years,status,admin_notes
"Constructora Modular Ejemplo","contacto@ejemplo.com","+56912345678","+56912345678","https://ejemplo.com","Especialistas en construcción modular sustentable","Av. Providencia 123","Santiago","RM","RM,V,VIII",false,true,true,false,false,true,false,true,false,true,true,true,true,false,false,true,false,false,true,true,25000,45000,15,"pending_review","Importado desde CSV ejemplo"
```

**Headers**:
- `Content-Type: text/csv`
- `Content-Disposition: attachment; filename="fabricantes_minimalista_template.csv"`

---

### POST /api/admin/fabricantes/import

**Descripción**: Importación masiva de fabricantes desde CSV

**Autenticación**: Requiere rol `admin`

**Request Body Schema**:
```typescript
{
  data: Array<{
    // Identidad (requeridos)
    company_name: string,
    email: string,

    // Identidad (opcionales)
    phone?: string,
    whatsapp?: string,
    website?: string,
    description?: string,

    // Ubicación HQ (opcionales)
    address?: string,
    city?: string,
    hq_region_code?: string,

    // Cobertura (opcional, string o array)
    coverage_regions?: string | string[],  // "RM,V,VIII" o ["RM","V","VIII"]

    // Roles (opcional)
    is_service_provider?: boolean,

    // Servicios disponibles (opcionales, boolean)
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

    // Especialidades (opcionales, boolean)
    tiny_houses?: boolean,
    modulares_sip?: boolean,
    modulares_container?: boolean,
    modulares_hormigon?: boolean,
    modulares_madera?: boolean,
    prefabricada_tradicional?: boolean,
    oficinas_modulares?: boolean,

    // Generales (opcionales)
    llave_en_mano?: boolean,
    publica_precios?: boolean,
    precio_ref_min_m2?: number,
    precio_ref_max_m2?: number,
    experiencia_years?: number,

    // Moderación (opcional)
    status?: 'draft' | 'pending_review' | 'active',
    admin_notes?: string
  }>
}
```

**Flujo de Procesamiento**:
```
Para cada fila:
  1. Validar campos requeridos (company_name, email)
  2. Generar slug único desde company_name
  3. Crear provider (identidad corporativa)
  4. Si hay capabilities → crear manufacturer_profile
  5. Si hay coverage_regions → crear provider_coverage_regions
  6. Rollback si falla cualquier paso
```

**Request Example**:
```http
POST /api/admin/fabricantes/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "data": [
    {
      "company_name": "Modular SIP Chile",
      "email": "contacto@modularsipchile.cl",
      "phone": "+56912345678",
      "website": "https://modularsipchile.cl",
      "hq_region_code": "RM",
      "coverage_regions": "RM,V,VIII",
      "dise_std": true,
      "dise_pers": true,
      "instalacion": true,
      "modulares_sip": true,
      "llave_en_mano": true,
      "precio_ref_min_m2": 25000,
      "precio_ref_max_m2": 45000,
      "experiencia_years": 15,
      "status": "pending_review"
    },
    {
      "company_name": "Tiny Houses del Sur",
      "email": "info@tinyhousesdelsur.cl",
      "hq_region_code": "X",
      "coverage_regions": ["X", "XIV", "IX"],
      "tiny_houses": true,
      "modulares_madera": true,
      "llave_en_mano": true,
      "status": "active"
    }
  ]
}
```

**Response 200 OK**:
```json
{
  "success": true,
  "totalRows": 2,
  "successfulRows": 2,
  "failedRows": 0,
  "errors": []
}
```

**Response 200 OK (con errores)**:
```json
{
  "success": false,
  "totalRows": 3,
  "successfulRows": 2,
  "failedRows": 1,
  "errors": [
    {
      "row": 2,
      "error": "Missing required fields",
      "details": "company_name and email are required"
    }
  ]
}
```

**Logging**:
- Registra en `admin_actions` con `action_type='bulk_import'`
- Almacena total rows, successful, failed, errors

---

## Esquemas de Datos

### ProviderUpdate Schema (Zod)

```typescript
import { z } from 'zod';

export const ProviderUpdateSchema = z.object({
  company_name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  hq_region_code: z.string().optional().nullable(),
  is_manufacturer: z.boolean().optional(),
  is_service_provider: z.boolean().optional(),
  coverage_regions: z.array(z.string()).optional(),
  logo_url: z.string().url().optional().nullable(),
  cover_image_url: z.string().url().optional().nullable(),
  status: z.enum(['draft', 'pending_review', 'active', 'inactive', 'rejected']).optional(),
  admin_notes: z.string().optional().nullable(),
  rejection_reason: z.string().optional().nullable()
}).refine(data => {
  // Validación: al menos un rol debe ser true
  if (data.is_manufacturer === false && data.is_service_provider === false) {
    throw new Error('At least one role must be true');
  }
  return true;
});

export type ProviderUpdate = z.infer<typeof ProviderUpdateSchema>;
```

---

### ManufacturerProfileUpdate Schema (Zod)

```typescript
import { z } from 'zod';

export const ManufacturerProfileUpdateSchema = z.object({
  // Servicios
  dise_std: z.boolean().optional(),
  dise_pers: z.boolean().optional(),
  insta_premontada: z.boolean().optional(),
  contr_terreno: z.boolean().optional(),
  instalacion: z.boolean().optional(),
  kit_autocons: z.boolean().optional(),
  ases_tecnica: z.boolean().optional(),
  ases_legal: z.boolean().optional(),
  logist_transporte: z.boolean().optional(),
  financiamiento: z.boolean().optional(),

  // Especialidades
  tiny_houses: z.boolean().optional(),
  modulares_sip: z.boolean().optional(),
  modulares_container: z.boolean().optional(),
  modulares_hormigon: z.boolean().optional(),
  modulares_madera: z.boolean().optional(),
  prefabricada_tradicional: z.boolean().optional(),
  oficinas_modulares: z.boolean().optional(),

  // Generales
  llave_en_mano: z.boolean().optional(),
  publica_precios: z.boolean().optional(),
  precio_ref_min_m2: z.number().positive().optional().nullable(),
  precio_ref_max_m2: z.number().positive().optional().nullable(),
  experiencia_years: z.number().int().min(0).optional().nullable(),
  verified_by_admin: z.boolean().optional()
}).refine(data => {
  // Validación: min <= max
  if (data.precio_ref_min_m2 && data.precio_ref_max_m2) {
    if (data.precio_ref_min_m2 > data.precio_ref_max_m2) {
      throw new Error('precio_ref_min_m2 must be <= precio_ref_max_m2');
    }
  }
  return true;
});

export type ManufacturerProfileUpdate = z.infer<typeof ManufacturerProfileUpdateSchema>;
```

---

## Códigos de Error

### Errores HTTP

| Código | Descripción | Ejemplo |
|--------|-------------|---------|
| 200 | OK | Request exitoso |
| 400 | Bad Request | Validación de datos falló |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos de admin |
| 404 | Not Found | Provider/Profile no encontrado |
| 500 | Internal Server Error | Error del servidor |

### Errores de Negocio

| Código | Mensaje | Solución |
|--------|---------|----------|
| `PROVIDER_NOT_FOUND` | Provider not found | Verificar ID |
| `PROFILE_NOT_FOUND` | Manufacturer profile not found | Crear perfil primero |
| `NOT_MANUFACTURER` | Provider is not a manufacturer | Setear `is_manufacturer=true` |
| `MISSING_ROLE` | Provider must offer at least one service | Setear `is_manufacturer` o `is_service_provider` |
| `INVALID_REGION` | Invalid region code | Usar código de `regions_lkp` |
| `INVALID_PRICE_RANGE` | Price min must be <= price max | Corregir rangos |
| `DUPLICATE_SLUG` | Slug already exists | Cambiar `company_name` |

### Formato de Error

```json
{
  "error": "Error message",
  "details": "Detailed error information (optional)",
  "code": "ERROR_CODE (optional)"
}
```

---

## Rate Limiting

**Endpoints Públicos**:
- 100 requests por minuto por IP
- 1000 requests por hora por IP

**Endpoints Admin**:
- 300 requests por minuto por usuario
- Sin límite horario

**Headers de Rate Limit**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635724800
```

---

## Autenticación

**Header**:
```http
Authorization: Bearer <JWT_TOKEN>
```

**Token Structure**:
```json
{
  "sub": "user-uuid",
  "email": "admin@modtok.cl",
  "role": "admin",
  "iat": 1635724800,
  "exp": 1635728400
}
```

**Roles**:
- `user`: Usuario regular (sin acceso admin)
- `admin`: Administrador (acceso a endpoints admin)
- `super_admin`: Super administrador (acceso a DELETE)

---

## Versionado de API

**Actual**: v3.0 (Provider minimalista)

**Cambios desde v2**:
- ❌ Removido: `GET /api/providers` (reemplazado por `/manufacturers`)
- ❌ Removido: Filtro `tier` en providers
- ✅ Agregado: `GET /manufacturers` con filtros avanzados
- ✅ Agregado: Endpoints de `manufacturer_profiles`
- ✅ Agregado: Importación CSV para fabricantes

**Deprecaciones**:
- `providers.tier` → usar `houses.tier`
- `providers.features` → usar `manufacturer_profiles`
- `providers.region` → usar `providers.hq_region_code`
- `provider_categories` → usar `is_manufacturer` / `is_service_provider`

---

**Versión del Documento**: 3.0
**Última Actualización**: 2025-10-29
**Mantenido por**: Equipo Modtok
