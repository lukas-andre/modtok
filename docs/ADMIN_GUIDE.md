# Guía de Uso para Administradores - Modtok

**Versión**: 3.0
**Fecha**: 2025-10-29
**Modelo**: Provider Minimalista

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Gestión de Fabricantes](#gestión-de-fabricantes)
3. [Gestión de Casas](#gestión-de-casas)
4. [Importación Masiva](#importación-masiva)
5. [Flujos de Trabajo](#flujos-de-trabajo)
6. [Tips y Mejores Prácticas](#tips-y-mejores-prácticas)
7. [Solución de Problemas](#solución-de-problemas)

---

## Introducción

### ¿Qué cambió en el Modelo Provider Minimalista?

El nuevo modelo separa claramente:

1. **Provider** (Identidad Corporativa)
   - Nombre, email, contacto
   - Ubicación HQ
   - Roles (fabricante y/o servicios)
   - Estado de moderación

2. **Manufacturer Profile** (Capabilities Declaradas)
   - Servicios que ofrece
   - Especialidades
   - Llave en mano, precios
   - Años de experiencia

3. **Houses/Services** (Productos con Capabilities Verificadas)
   - Modelos de casas con features específicas
   - Servicios de habilitación

### Beneficios para Admins

✅ **Menos campos al crear provider**: Solo datos corporativos básicos
✅ **Declaración temprana**: Fabricantes pueden declarar capabilities antes de crear casas
✅ **Verificación automática**: Las capabilities se verifican cuando se crean casas
✅ **Importación simplificada**: CSV más claro y estructurado
✅ **Badges visuales**: "Declarado" vs "Verificado" en listados

---

## Gestión de Fabricantes

### Crear un Nuevo Fabricante

#### Paso 1: Ir a la Sección Fabricantes

1. Navegar a **Admin → Fabricantes**
2. Click en botón **"Crear Fabricante"** (esquina superior derecha)

#### Paso 2: Llenar Información Corporativa

**Datos Requeridos**:
- ✅ Nombre de la empresa
- ✅ Email de contacto

**Datos Opcionales Recomendados**:
- Teléfono
- WhatsApp
- Website
- Descripción breve
- Dirección completa
- Ciudad
- Región HQ (RM, V, VIII, etc.)

**Screenshot**:
```
┌─────────────────────────────────────────┐
│ Información Corporativa                 │
├─────────────────────────────────────────┤
│ Nombre *                                │
│ [Modular SIP Chile               ]      │
│                                         │
│ Email *                                 │
│ [contacto@modularsipchile.cl    ]      │
│                                         │
│ Teléfono                                │
│ [+56912345678                    ]      │
│                                         │
│ Región HQ                               │
│ [▼ Región Metropolitana (RM)     ]      │
└─────────────────────────────────────────┘
```

#### Paso 3: Seleccionar Roles

**Roles Disponibles**:
- ☑ **Fabricante** (is_manufacturer): Construye casas modulares
- ☐ **Servicios H&S** (is_service_provider): Ofrece habilitación/servicios

**Importante**: Al menos uno debe estar marcado.

**Ejemplo**:
```
Fabricante puro:          ☑ Fabricante  ☐ Servicios
Servicios puro:           ☐ Fabricante  ☑ Servicios
Fabricante + Servicios:   ☑ Fabricante  ☑ Servicios
```

#### Paso 4: Seleccionar Cobertura Geográfica

**Regiones disponibles** (16 regiones de Chile):
```
☑ Región Metropolitana (RM)
☑ Región de Valparaíso (V)
☐ Región de O'Higgins (VI)
☑ Región del Biobío (VIII)
...
```

**Tip**: Seleccionar solo las regiones donde realmente operan.

#### Paso 5: Guardar

Click en **"Guardar Provider"**

**Resultado**:
- Provider creado con estado `draft` o `pending_review`
- **NO** tiene capabilities declaradas aún
- **NO** aparece en listado público `/fabricantes`

---

### Declarar Capabilities de un Fabricante

#### ¿Cuándo declarar capabilities?

**Escenarios**:
1. Fabricante nuevo sin casas → Declarar capabilities para aparecer en listado público
2. Fabricante con pocas casas → Declarar servicios adicionales que no están en las casas
3. Actualizar información → Cambiar precios de referencia, años de experiencia

#### Paso 1: Editar Provider

1. Desde listado de Fabricantes
2. Click en **"Editar"** (ícono de lápiz)
3. Scroll hasta sección **"Perfil de Fabricante (Declarado)"**

#### Paso 2: Marcar Servicios Disponibles

**10 servicios disponibles**:
```
☑ Diseño estándar (dise_std)
☑ Diseño personalizado (dise_pers)
☐ Instalación premontada (insta_premontada)
☐ Contratista de terreno (contr_terreno)
☑ Instalación/montaje (instalacion)
☐ Kit autoconstrucción (kit_autocons)
☑ Asesoría técnica (ases_tecnica)
☐ Asesoría legal (ases_legal)
☑ Logística y transporte (logist_transporte)
☑ Financiamiento (financiamiento)
```

**Tip**: Marcar solo lo que realmente ofrecen para evitar confusión.

#### Paso 3: Marcar Especialidades

**7 especialidades**:
```
☐ Tiny houses (tiny_houses)
☑ Modulares SIP (modulares_sip)
☐ Modulares container (modulares_container)
☐ Modulares hormigón (modulares_hormigon)
☑ Modulares madera (modulares_madera)
☐ Prefabricada tradicional (prefabricada_tradicional)
☐ Oficinas modulares (oficinas_modulares)
```

**Ejemplo**: Un fabricante puede ser especialista en SIP y Madera.

#### Paso 4: Llenar Datos Generales

**Campos opcionales**:
```
┌───────────────────────────────────────┐
│ Llave en mano                         │
│ ☑ Sí  ☐ No                           │
│                                       │
│ Publica precios                       │
│ ☑ Sí  ☐ No                           │
│                                       │
│ Rango de precios (CLP/m²)             │
│ Min: [25000  ]  Max: [45000  ]       │
│                                       │
│ Años de experiencia                   │
│ [15        ]                          │
└───────────────────────────────────────┘
```

**Tips**:
- **Llave en mano**: Marcar si ofrecen servicio completo (diseño + construcción + instalación)
- **Publica precios**: Marcar si muestran precios en su web o catálogo
- **Rango de precios**: Precios aproximados para dar referencia a clientes
- **Años de experiencia**: Desde que comenzaron a fabricar casas modulares

#### Paso 5: Guardar

Click en **"Guardar Perfil"**

**Resultado**:
- Fabricante ahora tiene capabilities **declaradas**
- Aparece en `/fabricantes` con badge "Declarado"
- Puede aparecer en búsquedas por servicio/especialidad

---

### Aprobar/Rechazar Fabricantes

#### Aprobar Fabricante

**Cuándo aprobar**:
- Información corporativa completa y veraz
- Email y teléfono válidos
- Descripción clara de servicios
- (Opcional) Capabilities declaradas

**Pasos**:
1. Desde listado de Fabricantes
2. Filtrar por estado **"Pending Review"**
3. Revisar información del fabricante
4. Click en **"Aprobar"** o seleccionar múltiples y **"Aprobar seleccionados"**

**Resultado**:
- Estado cambia a `active`
- `approved_by` = admin actual
- `approved_at` = fecha/hora actual
- Fabricante visible en sitio público

#### Rechazar Fabricante

**Cuándo rechazar**:
- Información incompleta o dudosa
- Email/teléfono inválidos
- Duplicado de otro fabricante
- No cumple criterios de calidad

**Pasos**:
1. Click en **"Rechazar"**
2. Escribir **motivo del rechazo**:
   ```
   Razón de rechazo *
   [Información de contacto incompleta.    ]
   [Por favor proporcionar teléfono y      ]
   [dirección válidos.                     ]
   ```
3. Confirmar

**Resultado**:
- Estado cambia a `rejected`
- `rejection_reason` = motivo ingresado
- Fabricante NO visible en sitio público
- Provider puede corregir y volver a enviar

---

## Gestión de Casas

### Crear Casa desde Fabricante

#### Flujo Rápido con Pre-Selección

**Paso 1**: Desde el listado de Fabricantes
**Paso 2**: Click en botón verde **"+"** (Crear modelo)

**Ventaja**:
- Provider ya viene pre-seleccionado
- Ahorra tiempo vs. ir a Casas → Crear → Seleccionar provider

#### Paso 3: Llenar Datos de la Casa

**Información Básica**:
```
┌───────────────────────────────────────┐
│ Nombre de la Casa *                   │
│ [Casa Lago Premium              ]     │
│                                       │
│ SKU / Código                          │
│ [MSC-LAG-001                    ]     │
│                                       │
│ Proveedor *                           │
│ [▼ Modular SIP Chile (pre-sel.) ]     │
│                                       │
│ Topología *                           │
│ [▼ 2D/2B - 2 Dorm, 2 Baños      ]     │
└───────────────────────────────────────┘
```

**Características**:
```
┌───────────────────────────────────────┐
│ Área (m²) *                           │
│ [60.5   ]                             │
│                                       │
│ Pisos                                 │
│ [1      ]                             │
│                                       │
│ Precio (CLP)                          │
│ [25000000]                            │
│                                       │
│ Precio por m² (calculado)             │
│ 413,223 CLP/m² (auto)                 │
└───────────────────────────────────────┘
```

**Tiempo de Entrega**:
```
┌───────────────────────────────────────┐
│ Días de fabricación                   │
│ [45     ]                             │
│                                       │
│ Días de montaje                       │
│ [15     ]                             │
│                                       │
│ Total: 60 días (2 meses)              │
└───────────────────────────────────────┘
```

#### Paso 4: Configurar Features

**Features Verificadas** (para agregación):
```json
{
  // Capabilities que se agregarán a house_facets_by_provider
  "dise_pers": true,
  "instalacion": true,
  "modulares_sip": true,
  "llave_en_mano": true
}
```

**Features Específicas** (de la casa):
```json
{
  // Features técnicas de la casa
  "ventanas": "DVH",
  "revestimiento_exterior": "siding",
  "techo": "zinc_alum",
  "aislacion": "sip_120mm",
  "calefaccion": "estufa_lena",
  "agua_caliente": "solar"
}
```

**IMPORTANTE**: Las claves de features deben coincidir con `feature_definitions` para que la agregación funcione.

#### Paso 5: Seleccionar Tier

**Opciones**:
- **Premium**: Destacado con foto grande, aparece primero
- **Destacado**: Aparece en sección destacados
- **Standard**: Listado normal

**Tip**: Solo fabricantes aprobados pueden tener casas Premium/Destacado.

#### Paso 6: Configurar Stock

```
Estado del Stock
● Disponible
○ Agotado
○ Por encargo

Cantidad en stock
[5      ]
```

#### Paso 7: Guardar

Click en **"Guardar Casa"**

**Resultado**:
1. Casa creada con estado configurado
2. Provider automáticamente marcado como `is_manufacturer=true` (trigger)
3. `house_facets_by_provider` se actualiza automáticamente
4. En `/manufacturers`, el fabricante ahora tiene `has_verified=true` y `house_count=1`

---

### Editar Casa Existente

#### Caso 1: Actualizar Precio

**Pasos**:
1. Admin → Casas → Buscar casa
2. Click "Editar"
3. Cambiar campo **Precio**
4. Guardar

**Resultado**: El `price_per_m2` se recalcula automáticamente.

#### Caso 2: Agregar/Quitar Features

**Pasos**:
1. Editar casa
2. En sección "Features", actualizar JSON:
   ```json
   {
     "dise_pers": true,
     "instalacion": true,
     "modulares_sip": true,
     "llave_en_mano": true,
     "financiamiento": true  // ← Agregado
   }
   ```
3. Guardar

**Resultado**: `house_facets_by_provider` se actualiza para incluir "financiamiento".

#### Caso 3: Cambiar de Provider

**⚠️ CUIDADO**: Cambiar el `provider_id` de una casa afecta:
- `house_facets_by_provider` del provider anterior (puede perder capabilities verificadas)
- `house_facets_by_provider` del nuevo provider (gana capabilities)

**Recomendación**: Confirmar con fabricante antes de hacer el cambio.

---

## Importación Masiva

### Flujo de Importación CSV

#### Paso 1: Descargar Template

1. Admin → Fabricantes → **"Importar CSV"**
2. Click en **"Descargar Template"**
3. Se descarga `fabricantes_minimalista_template.csv`

#### Paso 2: Llenar CSV

**Campos Requeridos**:
- `company_name`
- `email`

**Campos Recomendados**:
- `phone`, `whatsapp`, `website`
- `hq_region_code` (RM, V, VIII, etc.)
- `coverage_regions` (RM,V,VIII o array)
- Servicios y especialidades (true/false)
- `status` (`draft`, `pending_review`, `active`)

**Ejemplo CSV**:
```csv
company_name,email,phone,hq_region_code,coverage_regions,dise_std,dise_pers,instalacion,modulares_sip,llave_en_mano,precio_ref_min_m2,precio_ref_max_m2,experiencia_years,status
"Modular SIP Chile","contacto@sip.cl","+56912345678","RM","RM,V,VIII",true,true,true,true,true,25000,45000,15,"pending_review"
"Tiny Houses del Sur","info@tinysur.cl","+56987654321","X","X,XIV,IX",true,true,true,true,true,18000,35000,8,"active"
"Prefab Valpo","ventas@prefabvalpo.cl","+56956781234","V","V,RM",true,false,true,false,false,null,null,12,"pending_review"
```

**Tips**:
- Usar `"` para campos con comas o espacios
- Usar `true`/`false` para booleanos (no sí/no)
- `coverage_regions` puede ser string "RM,V,VIII" o array
- `null` para campos vacíos numéricos

#### Paso 3: Subir CSV

1. Click en **"Subir CSV"**
2. Seleccionar archivo
3. Click en **"Importar"**
4. **Esperar**: El sistema procesa fila por fila

**Procesamiento**:
```
┌───────────────────────────────────────┐
│ Importando fabricantes...             │
│ ━━━━━━━━━━━━━━━━━━━━━ 100%          │
│                                       │
│ Total: 3 fabricantes                  │
│ ✓ Exitosos: 2                        │
│ ✗ Fallidos: 1                        │
└───────────────────────────────────────┘
```

#### Paso 4: Revisar Resultados

**Reporte de Importación**:
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
      "details": "email is required"
    }
  ]
}
```

**Acciones**:
- **Exitosos**: Revisar y aprobar fabricantes importados
- **Fallidos**: Corregir CSV y volver a importar solo las filas con error

---

### Rollback de Importación

**Situación**: Importaste fabricantes por error

**Solución**:
1. Ir a Admin → Fabricantes
2. Filtrar por fecha de creación (hoy)
3. Seleccionar fabricantes importados
4. Click en **"Eliminar seleccionados"** (requiere super admin)

**⚠️ CUIDADO**: Eliminar provider también elimina:
- `manufacturer_profiles`
- `provider_coverage_regions`
- **NO** elimina casas (error si existen)

---

## Flujos de Trabajo

### Flujo 1: Onboarding de Fabricante Nuevo (Sin Casas)

```
1. Fabricante completa formulario público
   └─ Provider creado con status=draft

2. Admin revisa información
   ├─ Si OK → Aprobar (status=active)
   └─ Si no → Rechazar con motivo

3. Fabricante declara capabilities desde su panel
   └─ O admin declara capabilities desde admin panel

4. Fabricante aparece en /fabricantes
   └─ Badge "Declarado" (has_verified=false)

5. Fabricante sube primera casa
   └─ Badge cambia a "Verificado" (has_verified=true)
```

---

### Flujo 2: Onboarding de Fabricante con Casas

```
1. Fabricante completa formulario público
   └─ Provider creado con status=draft

2. Admin revisa y aprueba
   └─ status=active

3. Admin crea casas desde "Crear modelo" (botón +)
   ├─ Casa 1 con features: dise_pers, instalacion, sip
   ├─ Casa 2 con features: dise_std, madera
   └─ house_facets_by_provider agrega automáticamente

4. Fabricante aparece en /fabricantes
   └─ Badge "Verificado" (has_verified=true, house_count=2)
   └─ Capabilities: dise_std, dise_pers, instalacion, sip, madera
```

---

### Flujo 3: Fabricante Declara Servicio que No Tiene en Casas

**Situación**: Fabricante ofrece financiamiento pero ninguna casa lo menciona

```
1. Admin edita manufacturer_profile
   └─ Marcar financiamiento=true

2. Vista manufacturer_facets_effective
   └─ COALESCE(verificado, declarado)
   └─ financiamiento = NULL (no verificado) COALESCE true (declarado) = true

3. En /manufacturers, fabricante aparece con financiamiento
   └─ Badge "Declarado + Verificado" (parcial)
```

---

### Flujo 4: Importación Masiva de 100 Fabricantes

```
1. Descargar template CSV

2. Preparar datos en Excel/Google Sheets
   ├─ 100 filas con fabricantes
   └─ Exportar como CSV UTF-8

3. Subir CSV
   └─ Sistema procesa en ~30-60 segundos

4. Revisar reporte
   ├─ 95 exitosos → Aprobar en batch
   └─ 5 fallidos → Corregir y re-importar

5. Aprobar fabricantes en batch
   └─ Seleccionar 95 fabricantes
   └─ Click "Aprobar seleccionados"
   └─ Todos cambian a status=active
```

---

## Tips y Mejores Prácticas

### Naming Conventions

**Slugs**:
- ✅ Automáticos desde `company_name`
- ✅ Lowercase, sin tildes, sin espacios
- ✅ Únicos (se agrega sufijo si hay duplicado)

**Ejemplos**:
```
Modular SIP Chile       → modular-sip-chile
Tiny Houses del Sur     → tiny-houses-del-sur
Constructora & Diseño   → constructora-diseno
Casa Módulos (duplicado)→ casa-modulos-1
```

---

### Gestión de Coverage Regions

**Buena Práctica**:
```
Provider HQ: RM
Coverage: RM, V, VI, VIII
```
- HQ es donde está la oficina principal
- Coverage es donde operan (puede incluir HQ o no)

**Mal Práctica**:
```
Provider HQ: (vacío)
Coverage: Todas las regiones
```
- Definir HQ ayuda a organizar fabricantes
- No marcar todas las regiones sin confirmación

---

### Declaración de Capabilities

**Cuándo usar Manufacturer Profile**:
- ✅ Fabricante nuevo sin casas
- ✅ Servicio que no está en las casas (ej: financiamiento)
- ✅ Actualizar rangos de precios de referencia

**Cuándo NO usar**:
- ❌ Fabricante ya tiene 10+ casas con todas las capabilities
  - Reason: Las capabilities verificadas son más confiables

---

### Performance del Listado Público

**Filtros más usados** (optimizados):
- ✅ `regions` (índice GIN)
- ✅ `servicios` (campos indexados)
- ✅ `verifiedOnly=true` (índice en house_count)

**Filtros menos usados**:
- `price_m2_min/max` (scan completo)
- Múltiples especialidades combinadas

**Recomendación**: Limitar a 3-4 filtros simultáneos para mejor performance.

---

## Solución de Problemas

### Provider No Aparece en /fabricantes

**Checklist**:
1. ☑ `is_manufacturer = true`
2. ☑ `status = active`
3. ☑ Tiene `manufacturer_profile` O tiene casas activas
4. ☑ No está filtrado por región/servicio

**Debugging**:
```sql
-- Ver provider en vista efectiva
SELECT * FROM manufacturer_facets_effective
WHERE slug = 'modular-sip-chile';

-- Si no aparece, revisar:
SELECT is_manufacturer, status FROM providers WHERE slug = 'modular-sip-chile';
SELECT * FROM manufacturer_profiles WHERE provider_id = '...';
SELECT COUNT(*) FROM houses WHERE provider_id = '...' AND status = 'active';
```

---

### Capabilities Verificadas No Se Actualizan

**Situación**: Creé una casa con `financiamiento: true` pero no aparece en el fabricante

**Causas**:
1. ❌ Feature key incorrecta → `financement` (typo) en vez de `financiamiento`
2. ❌ Casa en estado `draft` → Solo casas `active` se agregan
3. ❌ Cache del navegador

**Solución**:
1. Verificar que la key en `houses.features` coincida exactamente con `manufacturer_profiles`
2. Cambiar estado de casa a `active`
3. Refrescar navegador (Ctrl+Shift+R)

---

### Importación CSV Falla

**Error**: "Missing required fields"

**Solución**:
```csv
company_name,email  ← Headers correctos
"Modular SIP","contacto@sip.cl"  ← OK
"Tiny Houses"  ← FALTA EMAIL (error)
```

Asegurarse que **todas las filas** tengan `company_name` y `email`.

---

**Error**: "Invalid region code"

**Solución**:
```csv
hq_region_code
"Metropolitana"  ← ERROR
"RM"  ← CORRECTO
```

Usar códigos de `regions_lkp`: RM, V, VI, VIII, etc.

---

**Error**: "Duplicate slug"

**Situación**: Dos fabricantes con el mismo nombre

**Solución**:
```csv
company_name
"Casa Modular"  ← slug: casa-modular
"Casa Modular"  ← slug: casa-modular-1 (auto-incrementa)
```

El sistema maneja automáticamente agregando sufijo numérico.

---

### Provider Eliminado por Error

**Situación**: Eliminaste provider por error (requiere super admin)

**⚠️ IMPORTANTE**: NO hay rollback automático.

**Solución**:
1. Si tienes backup reciente → Restaurar desde backup
2. Si no → Re-crear provider manualmente o desde CSV
3. Las casas NO se eliminan (FK con RESTRICT), así que se pueden reasignar

---

### Casa con Precio Incorrecto en Agregación

**Situación**: Casa tiene precio $25M pero aparece $0 en `/manufacturers`

**Causa**: Casa tiene `price=null` o `price_per_m2=null`

**Solución**:
1. Editar casa
2. Llenar campos `price` y `price_per_m2`
3. Guardar
4. La vista `house_facets_by_provider` se actualiza automáticamente con `min(price_per_m2)` y `max(price_per_m2)`

---

## Glosario

| Término | Descripción |
|---------|-------------|
| **Provider** | Empresa proveedora (fabricante y/o servicios H&S) |
| **Manufacturer Profile** | Perfil de capabilities declaradas por fabricante |
| **House Facets** | Capabilities verificadas desde casas |
| **Effective Facets** | Combinación de declarado + verificado (COALESCE) |
| **Coverage Regions** | Regiones geográficas donde opera el provider |
| **HQ Region** | Región donde está la oficina principal |
| **Tier** | Nivel de visibilidad (premium, destacado, standard) - Solo en houses/services |
| **Status** | Estado de moderación (draft, pending_review, active, inactive, rejected) |
| **Slug** | URL amigable generada desde company_name |

---

## Accesos Rápidos

### Endpoints Admin Más Usados

- `GET /api/admin/providers` - Listar providers
- `PUT /api/admin/providers/:id` - Actualizar provider
- `GET /api/admin/providers/:id/manufacturer-profile` - Ver perfil fabricante
- `PUT /api/admin/providers/:id/manufacturer-profile` - Actualizar perfil
- `POST /api/admin/fabricantes/import` - Importar CSV
- `POST /api/admin/providers` (bulk) - Aprobar/rechazar batch

### Vistas Útiles

```sql
-- Ver todos los fabricantes activos
SELECT * FROM manufacturer_facets_effective
WHERE status = 'active'
ORDER BY house_count DESC;

-- Ver fabricantes solo con capabilities declaradas (sin casas)
SELECT * FROM manufacturer_facets_effective
WHERE status = 'active' AND has_verified = FALSE;

-- Ver fabricantes con más casas
SELECT company_name, house_count, regions
FROM manufacturer_facets_effective
WHERE house_count > 0
ORDER BY house_count DESC
LIMIT 10;
```

---

## Contacto y Soporte

**Para dudas técnicas**:
- Email: dev@modtok.cl
- GitHub Issues: [modtok/modtok/issues](https://github.com/modtok/modtok/issues)

**Para reportar bugs**:
- Incluir: URL, pasos para reproducir, screenshots
- Template: `.github/ISSUE_TEMPLATE/bug_report.md`

**Para solicitar features**:
- Template: `.github/ISSUE_TEMPLATE/feature_request.md`

---

**Versión del Documento**: 3.0
**Última Actualización**: 2025-10-29
**Mantenido por**: Equipo Modtok
