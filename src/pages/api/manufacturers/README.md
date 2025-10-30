# API Endpoint: GET /api/manufacturers

## Descripción

Endpoint público para listar fabricantes de casas modulares con filtros avanzados.

Consulta la vista `manufacturer_facets_effective` que combina:
- **Capabilities verificadas**: Deducidas desde casas publicadas
- **Capabilities declaradas**: Registradas en `manufacturer_profiles`

## URL

```
GET /api/manufacturers
```

## Autenticación

**Público** - No requiere autenticación

## Query Parameters

### Filtros de Ubicación

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `regions` | string | Códigos de regiones separados por coma. Filtra fabricantes que operan en AL MENOS UNA de las regiones especificadas. | `regions=RM,V,VIII` |

### Filtros de Servicios Disponibles

| Parámetro | Tipo | Descripción | Valores válidos |
|-----------|------|-------------|-----------------|
| `servicios` | string | Servicios disponibles separados por coma. Filtra fabricantes que ofrecen TODOS los servicios especificados (AND lógico). | `dise_std`, `dise_pers`, `insta_premontada`, `contr_terreno`, `instalacion`, `kit_autocons`, `ases_tecnica`, `ases_legal`, `logist_transporte`, `financiamiento` |

**Ejemplo:** `servicios=dise_pers,instalacion,financiamiento`

### Filtros de Especialidad

| Parámetro | Tipo | Descripción | Valores válidos |
|-----------|------|-------------|-----------------|
| `especialidad` | string | Especialidades separadas por coma. Filtra fabricantes que tienen TODAS las especialidades especificadas (AND lógico). | `tiny_houses`, `modulares_sip`, `modulares_container`, `modulares_hormigon`, `modulares_madera`, `prefabricada_tradicional`, `oficinas_modulares` |

**Ejemplo:** `especialidad=modulares_sip,tiny_houses`

### Filtros Generales

| Parámetro | Tipo | Descripción | Valores |
|-----------|------|-------------|---------|
| `llave_en_mano` | boolean | Solo fabricantes que ofrecen llave en mano | `true` / `false` |
| `publica_precios` | boolean | Solo fabricantes que publican precios | `true` / `false` |
| `price_m2_min` | number | Precio mínimo por m² (CLP). Filtra fabricantes cuyo rango de precios incluye este mínimo. | `25000` |
| `price_m2_max` | number | Precio máximo por m² (CLP). Filtra fabricantes cuyo rango de precios está dentro de este máximo. | `45000` |
| `verifiedOnly` | boolean | Solo fabricantes con casas publicadas (has_verified=true) | `true` / `false` |

### Paginación

| Parámetro | Tipo | Descripción | Default | Límite |
|-----------|------|-------------|---------|--------|
| `page` | number | Número de página | 1 | - |
| `limit` | number | Resultados por página | 30 | 100 |

### Ordenamiento

| Parámetro | Tipo | Descripción | Valores válidos |
|-----------|------|-------------|-----------------|
| `sort` | string | Campo de ordenamiento | `premium_first`, `house_count`, `price_m2_min`, `name` |

**Opciones de sort:**
- `premium_first`: Ordena por casas premium, luego por total de casas, luego por nombre
- `house_count`: Ordena por número de casas publicadas (desc)
- `price_m2_min`: Ordena por precio mínimo por m² (asc)
- `name`: Ordena alfabéticamente por nombre de compañía

## Response

### Success (200 OK)

```json
{
  "manufacturers": [
    {
      "provider_id": "uuid",
      "company_name": "Eco Modular SpA",
      "slug": "eco-modular-spa",
      "logo_url": "https://...",
      "cover_image_url": "https://...",
      "status": "active",
      "is_manufacturer": true,
      "is_service_provider": false,
      "hq_region_code": "RM",
      "regions": ["RM", "V", "VIII"],

      // Servicios disponibles
      "dise_std": false,
      "dise_pers": true,
      "insta_premontada": true,
      "contr_terreno": true,
      "instalacion": true,
      "kit_autocons": false,
      "ases_tecnica": true,
      "ases_legal": false,
      "logist_transporte": true,
      "financiamiento": true,

      // Especialidad
      "tiny_houses": false,
      "modulares_sip": true,
      "modulares_container": false,
      "modulares_hormigon": false,
      "modulares_madera": true,
      "prefabricada_tradicional": false,
      "oficinas_modulares": false,

      // Características generales
      "llave_en_mano": true,
      "publica_precios": false,
      "price_m2_min": 28000,
      "price_m2_max": 42000,

      // Metadata
      "has_verified": true,
      "house_count": 5,
      "house_premium_count": 2,
      "house_destacado_count": 1,
      "verified_by_admin": false,
      "experiencia_years": 10,
      "declared_at": "2025-01-15T10:00:00Z",
      "created_at": "2025-01-10T08:00:00Z",
      "updated_at": "2025-01-20T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 30,
    "total": 15,
    "totalPages": 1,
    "hasMore": false,
    "hasPrev": false
  },
  "filters": {
    "regions": ["RM", "V"],
    "servicios": ["dise_pers", "instalacion"],
    "especialidad": null,
    "llave_en_mano": true,
    "publica_precios": false,
    "price_m2_min": 25000,
    "price_m2_max": 45000,
    "verifiedOnly": false
  }
}
```

### Error (500 Internal Server Error)

```json
{
  "error": "Failed to fetch manufacturers"
}
```

## Ejemplos de Uso

### 1. Listar todos los fabricantes (sin filtros)

```bash
curl -X GET "https://modtok.cl/api/manufacturers"
```

### 2. Fabricantes en Región Metropolitana con diseño personalizado

```bash
curl -X GET "https://modtok.cl/api/manufacturers?regions=RM&servicios=dise_pers"
```

### 3. Fabricantes que ofrecen llave en mano con precios públicos

```bash
curl -X GET "https://modtok.cl/api/manufacturers?llave_en_mano=true&publica_precios=true"
```

### 4. Fabricantes de Tiny Houses y SIP en regiones V y VIII

```bash
curl -X GET "https://modtok.cl/api/manufacturers?regions=V,VIII&especialidad=tiny_houses,modulares_sip"
```

### 5. Buscar en rango de precio específico (25k-45k por m²)

```bash
curl -X GET "https://modtok.cl/api/manufacturers?price_m2_min=25000&price_m2_max=45000&sort=price_m2_min"
```

### 6. Solo fabricantes verificados con casas publicadas

```bash
curl -X GET "https://modtok.cl/api/manufacturers?verifiedOnly=true&sort=house_count"
```

### 7. Filtro completo para cliente exigente

```bash
curl -X GET "https://modtok.cl/api/manufacturers?\
regions=RM,V,VIII&\
servicios=dise_pers,instalacion,financiamiento&\
especialidad=modulares_sip&\
llave_en_mano=true&\
price_m2_max=40000&\
verifiedOnly=true&\
sort=premium_first&\
page=1&\
limit=20"
```

## Lógica de Filtros

### Regiones (OR lógico)
El fabricante debe servir **AL MENOS UNA** de las regiones especificadas.

```sql
-- Si regions = ["RM", "V"]
-- Match si: regions && ARRAY['RM', 'V']
```

### Servicios y Especialidad (AND lógico)
El fabricante debe ofrecer **TODOS** los servicios/especialidades especificados.

```sql
-- Si servicios = ["dise_pers", "instalacion"]
-- Match si: dise_pers = true AND instalacion = true
```

### Precio por m² (rango overlap)
El fabricante debe tener un rango de precios que se **solape** con el rango solicitado.

```sql
-- Si price_m2_min = 25000 y price_m2_max = 45000
-- Match si: price_m2_max >= 25000 AND price_m2_min <= 45000
```

## Ordenamiento

### premium_first
```
1. house_premium_count DESC
2. house_count DESC
3. company_name ASC
```

### house_count
```
1. house_count DESC
2. company_name ASC
```

### price_m2_min
```
1. price_m2_min ASC (nulls last)
2. company_name ASC
```

### name (default)
```
1. company_name ASC
```

## Caché

Respuestas cacheadas por **5 minutos** (300 segundos).

```
Cache-Control: public, max-age=300
```

## Performance Target

**< 500ms** con índices optimizados en:
- `providers(is_manufacturer, is_service_provider, status)`
- `houses(provider_id, status, tier)`
- `manufacturer_profiles(provider_id)`
- `provider_coverage_regions(region_code, provider_id)`

## Analytics

Cada request se registra en `analytics_events` con:
- `event_type`: "api_call"
- `event_category`: "manufacturers"
- `event_action`: "filter"
- `event_label`: Query string completo

## Notas Técnicas

### Vista Subyacente: `manufacturer_facets_effective`

La vista combina datos de:
1. `providers` (identidad, status, roles)
2. `manufacturer_profiles` (capabilities declaradas)
3. `house_facets_by_provider` (capabilities verificadas desde casas)
4. `provider_coverage_regions` (regiones de servicio)

### Precedencia de Datos

```
effective_value = COALESCE(verified_value, declared_value)
```

Si el fabricante tiene casas publicadas, las capabilities verificadas tienen precedencia sobre las declaradas.

### Validación de Inputs

Los arrays de `servicios` y `especialidad` se validan contra listas permitidas:

**Servicios válidos:**
- dise_std, dise_pers, insta_premontada, contr_terreno
- instalacion, kit_autocons, ases_tecnica, ases_legal
- logist_transporte, financiamiento

**Especialidades válidas:**
- tiny_houses, modulares_sip, modulares_container
- modulares_hormigon, modulares_madera
- prefabricada_tradicional, oficinas_modulares

Valores inválidos son ignorados silenciosamente.
