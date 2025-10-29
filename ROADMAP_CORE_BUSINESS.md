# 🚀 MODTOK - Roadmap Core Business

**Enfoque:** Providers, Houses, Services, Slots & Monetización
**Última actualización:** 2025-10-29
**Status:** Plan de ejecución - Listo para comenzar

---

## 📊 Contexto Estratégico

### Visión del Negocio
MODTOK monetiza vendiendo **visibilidad en slots de homepage** con rotación round-robin:
- **2 slots premium** visibles (N providers rotan)
- **4 slots destacados** visibles (M providers rotan)
- **Listing standard** (gratis, sin rotación especial)

### Problema Actual
El schema mezcla **tier editorial** (calidad del contenido) con **tier pagado** (slots comprados), creando inconsistencias:
- `providers.tier` sirve para calidad Y visibilidad → debe separarse
- `homepage_slots` mezcla posiciones visuales con órdenes de compra → debe normalizarse
- Features están en lugares incorrectos (Provider form pregunta specs de casas)
- Cobertura geográfica no está normalizada (TEXT[] en lugar de junction table)

### Solución Propuesta (PROGRESS_V2.md)
**Schema v3** que separa concerns:
1. **Tier editorial**: `providers.tier`, `houses.tier`, `service_products.tier` (calidad del contenido)
2. **Tier pagado**: `slot_orders` (compras de visibilidad) + `slot_positions` (config de posiciones)
3. **Visibilidad efectiva**: View `catalog_visibility_effective` que combina ambos
4. **Features por tipo**: Provider = capabilities corporativas, House = specs técnicas, Service = alcance del servicio
5. **Cobertura normalizada**: `provider_coverage_regions` junction table
6. **Media centralizada**: `media_assets` polimórfica

---

## 🎯 Prioridades de Ejecución

### P0: Fundamentos Arquitectónicos (Bloqueante)
**Objetivo:** Schema sólido que soporte el modelo de negocio
**Tiempo estimado:** 12-16 horas
**Status:** 🔴 Crítico - Comenzar inmediatamente

### P1: Core CMS & Admin (Funcionalidad)
**Objetivo:** Admin puede gestionar providers, casas, servicios y slots
**Tiempo estimado:** 24-30 horas
**Status:** 🟡 Importante - Después de P0

### P2: Catálogo Público (User-Facing)
**Objetivo:** Users pueden buscar, filtrar y contactar providers
**Tiempo estimado:** 20-24 horas
**Status:** 🟢 Growth - Después de P1

### P3: Optimización & Growth (Post-Launch)
**Objetivo:** Analytics, notificaciones, AB testing, SEO avanzado
**Tiempo estimado:** 16-20 horas
**Status:** 🔵 Futuro - Post-MVP

---

# P0: FUNDAMENTOS ARQUITECTÓNICOS

## P0.0 - Seed Feature Definitions ✅ COMPLETADO

**Descripción:**
Cargar los 127 features del CSV Estructuras_v5.csv a la tabla feature_definitions.

**Status:** ✅ COMPLETADO
- Total cargado: 123 features activas
- fabrica: 31 features ✅
- casas: 34 features ✅
- habilitacion_servicios: 58 features ✅

**Tiempo real:** ~30 minutos

---

## P0.1 - Migración Schema v3 (Core Database)

**Descripción:**
Aplicar la migración SQL completa que normaliza slots, cobertura, media, ingestión y añade constraints de integridad.

**Tareas:**
1. ✅ Crear archivo de migración: `supabase/migrations/YYYYMMDD_schema_v3_core_business.sql`
2. ✅ Implementar tablas nuevas:
   - `regions_lkp` (16 regiones de Chile)
   - `provider_coverage_regions` (junction table)
   - `media_assets` (galería polimórfica)
   - `slot_positions` (config de posiciones visibles)
   - `slot_orders` (órdenes/entitlements)
   - `slot_rotation_state` (estado de rotación)
   - **`raw_provider_leads`** (auditoría de ingestión n8n)
   - **`provider_aliases`** (deduplicación: website_domain, instagram, email)
3. ✅ Implementar constraints:
   - `chk_provider_tier`, `chk_house_tier`, `chk_service_tier`
   - Landing solo premium (triggers)
4. ✅ Implementar triggers:
   - `ensure_provider_flags()` (auto-elevar is_manufacturer/is_service_provider)
   - `calc_price_per_m2()` (auto-calcular precio por m²)
5. ✅ Implementar view:
   - `catalog_visibility_effective` (tier efectivo = editorial + slots activos)
6. ✅ Seed inicial:
   - 16 regiones en `regions_lkp`
   - 2 rows en `slot_positions`: ('premium', 2), ('destacado', 4)

**Archivos afectados:**
- `supabase/migrations/YYYYMMDD_schema_v3_core_business.sql` (NUEVO)

**Tiempo estimado:** 4 horas

**Dependencias:** Ninguna

**Criterios de aceptación:**
- [ ] Migración corre sin errores en local y staging
- [ ] `regions_lkp` tiene 16 regiones de Chile
- [ ] `slot_positions` tiene 2 configuraciones (premium: 2, destacado: 4)
- [ ] Triggers funcionan correctamente (tests unitarios)
- [ ] View `catalog_visibility_effective` retorna datos esperados

---

## P0.2 - Migrar Data Legacy

**Descripción:**
Migrar datos existentes de `coverage_areas` TEXT[] a `provider_coverage_regions` junction table, y de `homepage_slots` a `slot_orders`.

**Tareas:**
1. ✅ Script de migración de cobertura:
   ```sql
   -- Extraer regiones de providers.coverage_areas y crear filas en provider_coverage_regions
   INSERT INTO provider_coverage_regions (provider_id, region_code)
   SELECT p.id, unnest(p.coverage_areas) AS region
   FROM providers p
   WHERE p.coverage_areas IS NOT NULL
   ON CONFLICT DO NOTHING;
   ```
2. ✅ Script de migración de slots:
   ```sql
   -- Migrar homepage_slots a slot_orders
   INSERT INTO slot_orders (slot_type, content_type, content_id, monthly_price, start_date, end_date, rotation_order, is_active)
   SELECT slot_type, content_type, content_id, monthly_price, start_date, end_date, rotation_order, is_active
   FROM homepage_slots
   WHERE is_active = true;
   ```
3. ✅ Verificar integridad de datos migrados (queries de validación)
4. ✅ Backup de `homepage_slots` antes de eliminar

**Archivos afectados:**
- `supabase/migrations/YYYYMMDD_migrate_legacy_data.sql` (NUEVO)

**Tiempo estimado:** 2 horas

**Dependencias:** P0.1

**Criterios de aceptación:**
- [ ] Todos los `coverage_areas` migrados a `provider_coverage_regions`
- [ ] Todos los `homepage_slots` activos migrados a `slot_orders`
- [ ] No hay pérdida de datos (validation queries pasan)
- [ ] Backup de `homepage_slots` guardado

---

## P0.3 - Regenerar Types & Update ORM

**Descripción:**
Regenerar `database.types.ts` con las nuevas tablas y actualizar tipos en `types.ts`.

**Tareas:**
1. ✅ Ejecutar: `npx supabase gen types typescript --project-id ygetqjqtjhdlbksdpyyr > src/lib/database.types.ts`
2. ✅ Añadir type aliases en `database.types.ts`:
   ```typescript
   export type Region = Tables<'regions_lkp'>
   export type ProviderCoverageRegion = Tables<'provider_coverage_regions'>
   export type MediaAsset = Tables<'media_assets'>
   export type SlotPosition = Tables<'slot_positions'>
   export type SlotOrder = Tables<'slot_orders'>
   export type SlotRotationState = Tables<'slot_rotation_state'>
   export type CatalogVisibility = Tables<'catalog_visibility_effective'> // view
   ```
3. ✅ Actualizar `types.ts` para re-exportar nuevos tipos
4. ✅ Fix imports en componentes que usen `House`, `Provider`, `Service`

**Archivos afectados:**
- `src/lib/database.types.ts` (AUTO-GENERADO)
- `src/lib/types.ts` (MODIFICAR)
- `src/components/admin/*` (FIX IMPORTS)

**Tiempo estimado:** 1 hora

**Dependencias:** P0.1, P0.2

**Criterios de aceptación:**
- [ ] `database.types.ts` tiene todos los nuevos tipos
- [ ] `types.ts` re-exporta correctamente
- [ ] `pnpm check` pasa sin errores de tipos
- [ ] Imports actualizados en todos los componentes

---

## P0.4 - Actualizar API Endpoints (Breaking Changes)

**Descripción:**
Actualizar endpoints de providers, houses, services para usar nuevas tablas y view de visibilidad. Añadir endpoints de ingestión y visibilidad.

**Tareas:**
1. ✅ **Providers API** (`src/pages/api/admin/providers/[id].ts`):
   - GET: Join con `provider_coverage_regions` y `catalog_visibility_effective`
   - PUT: Manejar upsert de cobertura en junction table
   - POST: Crear cobertura automáticamente si se envía array de regiones
2. ✅ **Houses API** (`src/pages/api/admin/houses/[id].ts`):
   - GET: Join con `catalog_visibility_effective` para tier efectivo
   - PUT: Validar que `provider.is_manufacturer = true`
3. ✅ **Services API** (`src/pages/api/admin/services/[id].ts`):
   - GET: Join con `catalog_visibility_effective` para tier efectivo
   - PUT: Validar que `provider.is_service_provider = true`
4. ✅ **Slots API** (NUEVO: `src/pages/api/admin/slots/index.ts`):
   - GET: Listar todas las órdenes de slots (admin) con filtros (slotType, contentType, activeOn)
   - POST: Crear nueva orden de slot
   - PUT: Actualizar orden de slot (fechas, precio, rotation_order)
   - DELETE: Desactivar orden de slot
5. ✅ **Public API** (NUEVO: `src/pages/api/slots/active.ts`):
   - GET: Retornar slots activos para homepage (con rotación)
6. ✅ **Visibility API** (NUEVO: `src/pages/api/visibility/effective.ts`):
   - GET: Wrapper de view `catalog_visibility_effective`
   - Query params: type (provider|house|service_product), ids[] (array de UUIDs)
   - Retorna effective_tier para cada entity
7. ✅ **Ingestion API** (NUEVO: `src/pages/api/ingest/providers.ts`):
   - POST: Endpoint idempotente para n8n
   - Headers: X-Ingestion-Token (auth), X-Idempotency-Key (dedupe)
   - Body: {name, website, instagram, emails[], phones[], regions[], capabilities[]}
   - Lógica: normaliza datos → busca en provider_aliases → match/create → upsert aliases
   - Response: {providerId, status: 'matched'|'created'}

**Archivos afectados:**
- `src/pages/api/admin/providers/[id].ts` (MODIFICAR)
- `src/pages/api/admin/houses/[id].ts` (MODIFICAR)
- `src/pages/api/admin/services/[id].ts` (MODIFICAR)
- `src/pages/api/admin/slots/index.ts` (NUEVO)
- `src/pages/api/admin/slots/[id].ts` (NUEVO)
- `src/pages/api/slots/active.ts` (NUEVO)
- `src/pages/api/visibility/effective.ts` (NUEVO)
- `src/pages/api/ingest/providers.ts` (NUEVO)

**Tiempo estimado:** 7 horas (+2h por endpoints de ingestión/visibility)

**Dependencias:** P0.3

**Criterios de aceptación:**
- [ ] GET endpoints retornan tier efectivo desde view
- [ ] PUT providers maneja cobertura en junction table
- [ ] POST/PUT validan flags de provider (is_manufacturer/is_service_provider)
- [ ] Slots API completa (CRUD + activación/desactivación)
- [ ] Public API retorna slots activos con rotación correcta
- [ ] Tests de integración pasan

---

# P1: CORE CMS & ADMIN

## P1.1 - FeatureFormBuilder Component

**Descripción:**
Componente React reutilizable que renderiza formularios dinámicos de features según categoría (fabrica, casas, habilitacion_servicios) leyendo desde `feature_definitions`.

**Tareas:**
1. ✅ Crear componente: `src/components/admin/FeatureFormBuilder.tsx`
2. ✅ Props:
   ```typescript
   interface FeatureFormBuilderProps {
     category: 'fabrica' | 'casas' | 'habilitacion_servicios';
     initialValues?: Record<string, any>; // features JSONB
     onChange: (features: Record<string, any>) => void;
     mode?: 'create' | 'edit';
   }
   ```
3. ✅ Fetch `feature_definitions` al montar:
   ```sql
   SELECT * FROM feature_definitions
   WHERE category = $1 AND is_active = true
   ORDER BY display_order, group_name, feature_key;
   ```
4. ✅ Agrupar por `group_name` (ej: "Servicios Disponibles", "Ventanas", "Tecnología")
5. ✅ Renderizar según `data_type`:
   - `boolean` → Checkbox
   - `number` → InputField type="number"
   - `text` → InputField type="text"
   - `text_array` → Multi-select o tags input
   - `json` → JSON editor (opcional, futuro)
6. ✅ Validar según `validation_rules` JSONB (ej: `{min: 0, max: 100, required: true}`)
7. ✅ Mostrar `admin_helper_text` como tooltip o helper text
8. ✅ Callback `onChange` con objeto JSON `{group_name: {feature_key: value}}`

**Archivos afectados:**
- `src/components/admin/FeatureFormBuilder.tsx` (NUEVO)
- `src/lib/features.ts` (NUEVO - helper functions)

**Tiempo estimado:** 6 horas

**Dependencias:** P0.3

**Criterios de aceptación:**
- [ ] Component renderiza correctamente para las 3 categorías
- [ ] Validación funciona según `validation_rules`
- [ ] onChange retorna estructura correcta de JSON
- [ ] UI es responsive y usa Design System v2.0
- [ ] Helper text y tooltips funcionan

---

## P1.2 - Refactor ProviderForm (Corporativo)

**Descripción:**
Simplificar ProviderForm para que SOLO maneje datos corporativos y capabilities de la empresa. Eliminar features de casa/servicio.

**Tareas:**
1. ✅ Revisar form actual: `src/pages/admin/catalog/fabricantes/create.astro` (línea ~50)
2. ✅ Identificar fields que deben QUEDAR (corporativos):
   - Básicos: company_name, email, phone, website, description, logo, cover_image
   - Ubicación: address, city, region
   - Flags: is_manufacturer, is_service_provider
   - Cobertura: usar `ProviderCoverageSelector` (nuevo componente)
   - Capabilities corporativas (de `feature_definitions` con category='fabrica'):
     - Diseño estándar/personalizado
     - Financiamiento
     - Logística y transporte
     - Asesoría técnica/legal
     - Tecnologías que domina (SIP, madera, hormigón, etc.)
3. ✅ Identificar fields que deben IR A HOUSE/SERVICE FORM:
   - ❌ Ventanas (termopanel, PVC, aluminio) → HouseForm
   - ❌ Especificaciones de m² → HouseForm
   - ❌ Precios de servicios → ServiceForm
   - ❌ Tiempos de entrega → HouseForm
4. ✅ Crear componente: `ProviderCoverageSelector.tsx`
   - Checkboxes con 16 regiones de Chile (leyendo de `regions_lkp`)
   - Retorna array de region_codes seleccionados
5. ✅ Integrar `FeatureFormBuilder` con `category='fabrica'`
6. ✅ Actualizar API endpoint para manejar `provider_coverage_regions`

**Archivos afectados:**
- `src/pages/admin/catalog/fabricantes/create.astro` (MODIFICAR)
- `src/pages/admin/catalog/fabricantes/[id]/edit.astro` (MODIFICAR)
- `src/components/admin/ProviderCoverageSelector.tsx` (NUEVO)
- `src/pages/api/admin/providers/index.ts` (MODIFICAR)

**Tiempo estimado:** 5 horas

**Dependencias:** P1.1, P0.4

**Criterios de aceptación:**
- [ ] ProviderForm solo tiene fields corporativos
- [ ] FeatureFormBuilder integrado correctamente
- [ ] ProviderCoverageSelector funciona con 16 regiones
- [ ] API guarda cobertura en junction table
- [ ] Form valida que al menos 1 flag (is_manufacturer o is_service_provider) esté true

---

## P1.3 - Refactor HouseForm (Specs Técnicas)

**Descripción:**
Actualizar HouseForm para que maneje SOLO especificaciones técnicas de la casa y use FeatureFormBuilder para features dinámicas.

**Tareas:**
1. ✅ Revisar form actual: `src/components/admin/forms/HouseForm.tsx`
2. ✅ Mantener fields básicos:
   - name, slug, sku, model_code, description
   - bedrooms, bathrooms, floors, area_m2, topology_code
   - price, price_per_m2 (auto-calculated), currency
   - delivery_time_days, assembly_time_days, warranty_years
   - main_image_url, gallery_images (migrar a media_assets en futuro)
   - status, tier, is_available, stock_quantity
3. ✅ Añadir sección "Features Técnicas":
   - Integrar `FeatureFormBuilder` con `category='casas'`
   - Features como ventanas, revestimientos, tecnología, pisos, etc.
4. ✅ Validar que `provider.is_manufacturer = true` antes de submit
5. ✅ Si provider no existe o no es manufacturer, mostrar modal de ayuda

**Archivos afectados:**
- `src/components/admin/forms/HouseForm.tsx` (MODIFICAR)
- `src/pages/admin/catalog/houses/create.astro` (VERIFICAR)

**Tiempo estimado:** 4 horas

**Dependencias:** P1.1

**Criterios de aceptación:**
- [ ] HouseForm integra FeatureFormBuilder correctamente
- [ ] Validación de `is_manufacturer` funciona
- [ ] Features se guardan en JSONB `features` column
- [ ] Auto-cálculo de `price_per_m2` funciona
- [ ] UI responsive con Design System v2.0

---

## P1.4 - Refactor ServiceForm (Alcance del Servicio)

**Descripción:**
Actualizar ServiceForm para que maneje alcance y características del servicio específico, no del provider.

**Tareas:**
1. ✅ Revisar form actual: `src/components/admin/forms/ServiceForm.tsx`
2. ✅ Mantener fields básicos:
   - name, slug, sku, description
   - service_type, service_family
   - price_from, price_to, price_unit, currency
   - coverage_areas (específicas de este servicio, no del provider)
   - is_available, max_bookings, booking_calendar
   - main_image_url, gallery_images
   - status, tier
3. ✅ Añadir sección "Features del Servicio":
   - Integrar `FeatureFormBuilder` con `category='habilitacion_servicios'`
   - Features como instalación eléctrica, paneles solares, riego, etc.
4. ✅ Validar que `provider.is_service_provider = true` antes de submit

**Archivos afectados:**
- `src/components/admin/forms/ServiceForm.tsx` (MODIFICAR)
- `src/pages/admin/catalog/services/create.astro` (VERIFICAR)

**Tiempo estimado:** 4 horas

**Dependencias:** P1.1

**Criterios de aceptación:**
- [ ] ServiceForm integra FeatureFormBuilder correctamente
- [ ] Validación de `is_service_provider` funciona
- [ ] Features se guardan en JSONB `features` column
- [ ] Coverage areas específicas del servicio funcionan
- [ ] UI responsive con Design System v2.0

---

## P1.5 - Admin Slots Manager UI

**Descripción:**
Crear interfaz completa para gestionar slots (órdenes de visibilidad) desde el admin panel con preview en tiempo real.

**Tareas:**
1. ✅ Crear página: `src/pages/admin/monetizacion/slots/index.astro`
   - Layout de 3 columnas: Config | Órdenes | Preview
   - Header: "Gestión de Slots de Homepage"
   - Stats cards: Total slots activos, Revenue mensual, Slots próximos a expirar
   - Tabs: "Premium" | "Destacado" | "Todos"
2. ✅ Crear tabla: `SlotsTable.tsx`
   - Columnas: Contenido, Tipo, Precio Mensual, Inicio, Fin, Rotation Order, Estado
   - Actions: Editar, Desactivar, Eliminar, Preview
   - Filtros: Por tipo, por estado, por fecha
3. ✅ Crear modal: `SlotOrderModal.tsx`
   - Form para crear/editar orden de slot
   - Selector de contenido (Provider, House, Service) con autocomplete
   - Selector de slot_type (premium, destacado)
   - Date picker para start_date y end_date
   - Input de monthly_price
   - Input de rotation_order (con sugerencia: "Próximo: N")
4. ✅ **Crear vista previa: `SlotPreview.tsx` (MEJORADO)**
   - **Panel lateral derecho** con preview en tiempo real
   - Fetch de `/api/slots/active?slotType=premium&activeOn=today`
   - Muestra los N slots que **actualmente** se verían en home
   - Simulación de rotación:
     - Botón "Simular siguiente rotación"
     - Muestra qué slots entrarían si se rota ahora
   - Cards con mini-preview de cada slot (imagen, nombre, tier badge)
   - Actualización automática cada 30s
5. ✅ Crear componente: `SlotConfigPanel.tsx`
   - Config de `slot_positions` (cuántos premium/destacado visibles)
   - Inputs numéricos: Premium (default: 2), Destacado (default: 4)
   - PUT a `/api/slot-positions` al guardar
   - Solo super_admin puede modificar

**Archivos afectados:**
- `src/pages/admin/monetizacion/slots/index.astro` (NUEVO)
- `src/components/admin/SlotsTable.tsx` (NUEVO)
- `src/components/admin/SlotOrderModal.tsx` (NUEVO)
- `src/components/admin/SlotPreview.tsx` (NUEVO)
- `src/components/admin/SlotConfigPanel.tsx` (NUEVO)
- `src/layouts/AdminLayout.astro` (AÑADIR LINK en sidebar: "💰 Monetización > Slots")

**Tiempo estimado:** 8 horas

**Dependencias:** P0.4, P1.1

**Criterios de aceptación:**
- [ ] SlotsTable muestra todas las órdenes con filtros funcionales
- [ ] SlotOrderModal crea/edita órdenes correctamente
- [ ] SlotPreview simula rotación correctamente
- [ ] SlotConfigPanel actualiza `slot_positions` (solo super_admin)
- [ ] Notificación de slots próximos a expirar (< 7 días)
- [ ] UI usa Design System v2.0

---

## P1.6 - Media Gallery Manager (Opcional pero Recomendado)

**Descripción:**
Componente para gestionar `media_assets` (imágenes, videos, PDFs, planos) de forma centralizada.

**Tareas:**
1. ✅ Crear componente: `MediaGalleryManager.tsx`
   - Props: `ownerType`, `ownerId`, `allowedKinds` (image, video, pdf, plan)
   - Grid de media assets con preview
   - Upload modal con drag & drop
   - Reordenar con drag & drop (update `sort_order`)
   - Eliminar asset
   - Edit metadata (alt text, caption)
2. ✅ Integrar en forms:
   - ProviderForm: Usar para logo, cover_image, gallery
   - HouseForm: Usar para main_image, gallery, floor_plans, brochure
   - ServiceForm: Usar para main_image, gallery
3. ✅ API endpoint: `src/pages/api/admin/media/index.ts`
   - POST: Upload media (integrar con Supabase Storage)
   - PUT: Update metadata
   - DELETE: Eliminar asset
   - PATCH: Reordenar (update sort_order)

**Archivos afectados:**
- `src/components/admin/MediaGalleryManager.tsx` (NUEVO)
- `src/pages/api/admin/media/index.ts` (NUEVO)
- `src/pages/api/admin/media/[id].ts` (NUEVO)
- `src/components/admin/forms/HouseForm.tsx` (MODIFICAR - integrar MediaGalleryManager)

**Tiempo estimado:** 6 horas

**Dependencias:** P0.1, P0.3

**Criterios de aceptación:**
- [ ] MediaGalleryManager funciona para los 3 tipos (provider, house, service)
- [ ] Upload funciona con Supabase Storage
- [ ] Drag & drop para reordenar funciona
- [ ] Delete elimina de storage y DB
- [ ] Preview correcto para image, video, pdf
- [ ] UI responsive con Design System v2.0

---

## P1.7 - Cleanup & Consolidation

**Descripción:**
Limpiar rutas duplicadas y consolidar estructura de admin panel.

**Tareas:**
1. ✅ **Consolidar rutas de providers:**
   - Eliminar: `/admin/catalog/fabricantes/` (usar solo `/admin/providers/`)
   - O viceversa (decidir cuál es más semántico)
   - Actualizar todos los links en sidebar y tablas
2. ✅ **Actualizar AdminLayout sidebar:**
   - Sección "Catálogo":
     - 🏢 Providers
     - 🏠 Casas
     - 🛠️ Servicios
   - Sección "Monetización":
     - 💰 Slots de Homepage
     - 📊 Analytics de Slots (futuro)
3. ✅ **Eliminar archivos obsoletos:**
   - `homepage_slots` table (deprecated, usar `slot_orders`)
   - API endpoints viejos de slots
4. ✅ **Actualizar documentación:**
   - `ADMIN_TABLE_PATTERN.md` (añadir SlotsTable)
   - `ADMIN_FORM_PATTERN.md` (añadir SlotOrderModal)
   - `SCHEMA_ARCHITECTURE.md` (actualizar con Schema v3)

**Archivos afectados:**
- `src/layouts/AdminLayout.astro` (MODIFICAR)
- `src/pages/admin/catalog/fabricantes/` (ELIMINAR o RENOMBRAR)
- Varios archivos de API (CLEANUP)
- Documentación (ACTUALIZAR)

**Tiempo estimado:** 3 horas

**Dependencias:** P1.1-P1.6

**Criterios de aceptación:**
- [ ] Solo existe 1 ruta para providers (no duplicación)
- [ ] Sidebar organizado y coherente
- [ ] No hay archivos obsoletos en el repo
- [ ] Documentación actualizada con Schema v3

---

# P2: CATÁLOGO PÚBLICO

## P2.1 - Homepage con Slots Rotativos

**Descripción:**
Implementar homepage que consume API de slots activos y rota automáticamente.

**Tareas:**
1. ✅ Crear página: `src/pages/index.astro`
   - Hero section con search bar
   - Sección "Fabricantes Premium" (2 slots rotativos)
   - Sección "Casas Destacadas" (4 slots rotativos)
   - Sección "Cómo Funciona" (value proposition)
   - CTA Newsletter
2. ✅ Crear componente: `SlotCard.tsx`
   - Renderiza provider, house o service según `content_type`
   - Badge de tier (Premium, Destacado)
   - Hover effects con Design System v2.0
3. ✅ Implementar rotación client-side:
   - Fetch slots activos: `GET /api/slots/active?type=premium`
   - Intervalo de 5-10 segundos para rotar
   - Animación smooth entre transiciones
4. ✅ Implementar rotación server-side (opcional):
   - Usar `slot_rotation_state` para puntero
   - Actualizar puntero en cada request
   - Cache de 30 segundos

**Archivos afectados:**
- `src/pages/index.astro` (MODIFICAR COMPLETO)
- `src/components/homepage/SlotCard.tsx` (NUEVO)
- `src/components/homepage/SlotCarousel.tsx` (NUEVO)
- `src/pages/api/slots/active.ts` (YA CREADO en P0.4)

**Tiempo estimado:** 6 horas

**Dependencias:** P0.4, P1.5

**Criterios de aceptación:**
- [ ] Homepage muestra 2 premium + 4 destacados correctamente
- [ ] Rotación client-side funciona smooth
- [ ] SlotCard renderiza correctamente los 3 tipos de contenido
- [ ] Responsive design (mobile/tablet/desktop)
- [ ] Performance Lighthouse > 90

---

## P2.2 - Catálogo de Casas con Filtros

**Descripción:**
Página de catálogo de casas con filtros dinámicos por features.

**Tareas:**
1. ✅ Crear página: `src/pages/casas/index.astro`
   - Header: "Catálogo de Casas Modulares"
   - Sidebar: Filtros dinámicos (FeatureFilters component)
   - Grid: Cards de casas con hover effects
   - Pagination: 12/24/48 por página
   - Sort: Precio, Relevancia, Nuevas, Popular
2. ✅ Crear componente: `FeatureFilters.tsx`
   - Fetch `feature_definitions` con `category='casas'` y `is_filterable=true`
   - Agrupar por `group_name` (ej: "Ventanas", "Tecnología")
   - Renderizar según `filter_type`:
     - `checklist` → Checkboxes
     - `slider` → Range slider (ej: precio, m²)
     - `select` → Dropdown
     - `radio` → Radio buttons
   - Callback con query params para API
3. ✅ API endpoint: `src/pages/api/casas/index.ts`
   - Filtros dinámicos por features JSONB (usando GIN index)
   - Ordenamiento por tier efectivo (desde `catalog_visibility_effective`)
   - Paginación

**Archivos afectados:**
- `src/pages/casas/index.astro` (NUEVO)
- `src/components/catalog/FeatureFilters.tsx` (NUEVO)
- `src/components/catalog/HouseCard.tsx` (NUEVO)
- `src/pages/api/casas/index.ts` (NUEVO)

**Tiempo estimado:** 8 horas

**Dependencias:** P0.4, P1.3

**Criterios de aceptación:**
- [ ] Filtros dinámicos funcionan correctamente
- [ ] Grid de casas con tier efectivo (premium primero)
- [ ] Paginación funciona
- [ ] Sort funciona
- [ ] Responsive design
- [ ] Performance Lighthouse > 85

---

## P2.3 - Catálogo de Fabricantes

**Descripción:**
Página de catálogo de fabricantes/providers con filtros.

**Tareas:**
1. ✅ Crear página: `src/pages/fabricantes/index.astro`
   - Similar a casas pero con filtros de capabilities corporativas
   - Grid: Cards de providers con logo, descripción, categorías
2. ✅ Crear componente: `ProviderCard.tsx`
   - Logo circular, company_name, descripción breve
   - Badges de categorías (Fabricante, H&S)
   - Badges de capabilities (Diseño personalizado, Financiamiento, etc.)
   - CTA "Ver Catálogo" o "Contactar"
3. ✅ API endpoint: `src/pages/api/fabricantes/index.ts`
   - Filtros por cobertura (región)
   - Filtros por capabilities
   - Ordenamiento por tier efectivo

**Archivos afectados:**
- `src/pages/fabricantes/index.astro` (NUEVO)
- `src/components/catalog/ProviderCard.tsx` (NUEVO)
- `src/pages/api/fabricantes/index.ts` (NUEVO)

**Tiempo estimado:** 6 horas

**Dependencias:** P0.4, P1.2

**Criterios de aceptación:**
- [ ] Filtros por región funcionan
- [ ] Filtros por capabilities funcionan
- [ ] Grid con tier efectivo
- [ ] ProviderCard con todas las badges correctas
- [ ] Responsive design

---

## P2.4 - Landing Pages Premium

**Descripción:**
Generar landing pages dedicadas para providers/houses/services con tier premium.

**Tareas:**
1. ✅ Crear template: `src/pages/fabricante/[slug].astro`
   - Hero section con cover image
   - About section con descripción larga
   - Gallery con `media_assets`
   - Catálogo de casas del fabricante
   - Capabilities & features
   - Contact form
   - Sección "Otros Fabricantes" (cross-sell)
2. ✅ Crear template: `src/pages/casa/[slug].astro`
   - Hero con imagen principal + gallery
   - Specs técnicas en grid
   - Features con iconos
   - Floor plans viewer
   - Variantes (si `has_variants`)
   - CTA "Solicitar Cotización"
   - Sección "Casas Similares"
3. ✅ Trigger: Validar que solo premium tiene landing
   - Ya implementado en P0.1
4. ✅ Sitemap: Generar URLs automáticas para SEO

**Archivos afectados:**
- `src/pages/fabricante/[slug].astro` (NUEVO)
- `src/pages/casa/[slug].astro` (NUEVO)
- `src/pages/servicio/[slug].astro` (NUEVO)
- `astro.config.mjs` (AÑADIR sitemap integration)

**Tiempo estimado:** 8 horas

**Dependencias:** P1.2, P1.3, P1.4

**Criterios de aceptación:**
- [ ] Landings solo accesibles para tier premium
- [ ] SEO optimizado (meta tags, structured data)
- [ ] Gallery funcional con lightbox
- [ ] Contact form envía leads
- [ ] Cross-sell de productos similares funciona
- [ ] Performance Lighthouse > 90

---

## P2.5 - Search Global

**Descripción:**
Barra de búsqueda global que busca en providers, houses y services.

**Tareas:**
1. ✅ Crear componente: `GlobalSearch.tsx`
   - Input con autocomplete
   - Results agrupados por tipo (Fabricantes, Casas, Servicios)
   - Preview con imagen, nombre, precio
   - Keyboard navigation (↑↓ Enter)
2. ✅ API endpoint: `src/pages/api/search/index.ts`
   - Full-text search en name, description, keywords
   - Priorizar por tier efectivo
   - Limit 5 por tipo
3. ✅ Integrar en header de todas las páginas públicas

**Archivos afectados:**
- `src/components/search/GlobalSearch.tsx` (NUEVO)
- `src/pages/api/search/index.ts` (NUEVO)
- `src/layouts/MainLayout.astro` (MODIFICAR - añadir GlobalSearch)

**Tiempo estimado:** 5 horas

**Dependencias:** P0.4

**Criterios de aceptación:**
- [ ] Search funciona correctamente
- [ ] Autocomplete rápido (< 200ms)
- [ ] Keyboard navigation funciona
- [ ] Results priorizan tier efectivo
- [ ] Mobile-friendly

---

# P3: OPTIMIZACIÓN & GROWTH

## P3.1 - Analytics Dashboard de Slots

**Descripción:**
Dashboard para ver performance de slots (views, clicks, conversions).

**Tareas:**
1. ✅ Crear página: `src/pages/admin/monetizacion/analytics.astro`
   - Stats cards: Total revenue, Active slots, Avg. CTR, Conversions
   - Chart: Revenue over time (últimos 30 días)
   - Table: Performance por slot (views, clicks, CTR, conversions)
2. ✅ Implementar tracking de eventos:
   - View: Slot impression
   - Click: Click en slot
   - Conversion: Lead generado desde slot
3. ✅ Guardar en `analytics_events` con `target_type='slot_order'`

**Archivos afectados:**
- `src/pages/admin/monetizacion/analytics.astro` (NUEVO)
- `src/pages/api/admin/analytics/slots.ts` (NUEVO)
- `src/components/homepage/SlotCard.tsx` (AÑADIR TRACKING)

**Tiempo estimado:** 6 horas

**Dependencias:** P2.1

**Criterios de aceptación:**
- [ ] Dashboard muestra metrics correctas
- [ ] Charts funcionan correctamente
- [ ] Tracking de eventos funciona
- [ ] Performance > 90

---

## P3.2 - Notificaciones de Expiración

**Descripción:**
Sistema de notificaciones para avisar a providers cuando sus slots expiran.

**Tareas:**
1. ✅ Crear Supabase Edge Function: `supabase/functions/check-expiring-slots/index.ts`
   - Cron job diario
   - Query slots con `end_date` entre HOY y HOY+7
   - Enviar emails con Resend/SendGrid
2. ✅ Crear template de email: "Tu slot expira en X días"
3. ✅ Añadir badge en admin: "⚠️ Slots próximos a expirar"

**Archivos afectados:**
- `supabase/functions/check-expiring-slots/index.ts` (NUEVO)
- Template de email (NUEVO)

**Tiempo estimado:** 4 horas

**Dependencias:** P1.5

**Criterios de aceptación:**
- [ ] Cron job ejecuta diariamente
- [ ] Emails se envían correctamente
- [ ] Badge en admin funciona

---

## P3.3 - AB Testing de Rotación

**Descripción:**
Probar diferentes estrategias de rotación para optimizar CTR.

**Tareas:**
1. ✅ Implementar variantes:
   - A: Rotación secuencial (actual)
   - B: Rotación random
   - C: Rotación por performance (CTR histórico)
2. ✅ Tracking de variantes en analytics
3. ✅ Dashboard para comparar resultados

**Archivos afectados:**
- `src/pages/api/slots/active.ts` (MODIFICAR - añadir variantes)
- `src/pages/admin/monetizacion/ab-testing.astro` (NUEVO)

**Tiempo estimado:** 5 horas

**Dependencias:** P3.1

**Criterios de aceptación:**
- [ ] 3 variantes implementadas
- [ ] Tracking por variante funciona
- [ ] Dashboard muestra comparación

---

## P3.4 - SEO Avanzado

**Descripción:**
Optimizar SEO para ranking orgánico.

**Tareas:**
1. ✅ Structured data (JSON-LD):
   - Product schema para casas
   - Organization schema para providers
   - Service schema para servicios
2. ✅ Sitemap XML automático
3. ✅ Robots.txt
4. ✅ Canonical URLs
5. ✅ Open Graph & Twitter Cards

**Archivos afectados:**
- `src/components/seo/StructuredData.astro` (NUEVO)
- `src/pages/sitemap.xml.ts` (NUEVO)
- `public/robots.txt` (NUEVO)

**Tiempo estimado:** 4 horas

**Dependencias:** P2.4

**Criterios de aceptación:**
- [ ] Structured data valida (Google Rich Results Test)
- [ ] Sitemap genera todas las URLs
- [ ] Meta tags correctos

---

# P4: INGESTIÓN & AUTOMATIZACIÓN

## P4.1 - Sistema de Ingestión (n8n Backend)

**Descripción:**
Implementar endpoint `/api/ingest/providers` idempotente para n8n con deduplicación automática vía aliases.

**Tareas:**
1. ✅ Crear endpoint: `src/pages/api/ingest/providers.ts`
   - Validación de `X-Ingestion-Token` (env variable)
   - Soporte de `X-Idempotency-Key` header
   - Responde 401 si token inválido
2. ✅ Implementar normalización:
   ```ts
   // Funciones de normalización
   normalizeDomain(url) → hostname sin www (lowercase)
   normalizeInstagram(handle) → sin @ (lowercase)
   normalizeEmail(email) → lowercase trimmed
   ```
3. ✅ Lógica de deduplicación:
   - Guardar payload crudo en `raw_provider_leads`
   - Buscar matches en `provider_aliases` por website_domain, instagram, email
   - Si match → retornar providerId existente (status: 'matched')
   - Si no match → crear provider draft + aliases (status: 'created')
4. ✅ Upsert de aliases:
   - Insertar aliases en `provider_aliases` (ON CONFLICT DO NOTHING)
   - Tipos: website_domain, instagram, email
5. ✅ Handling de regiones y capabilities (opcional):
   - Si vienen regiones → insert en `provider_coverage_regions`
   - Si vienen capabilities → guardar en metadata JSONB

**Archivos afectados:**
- `src/pages/api/ingest/providers.ts` (NUEVO)
- `src/lib/ingest/normalize.ts` (NUEVO - funciones helper)
- `.env` (añadir INGESTION_TOKEN)

**Tiempo estimado:** 4 horas

**Dependencias:** P0.1 (tablas raw_provider_leads + provider_aliases)

**Criterios de aceptación:**
- [ ] Endpoint responde 401 sin token válido
- [ ] Idempotencia funciona: mismo payload → mismo providerId
- [ ] Deduplicación por website detecta matches
- [ ] Deduplicación por instagram detecta matches
- [ ] Deduplicación por email detecta matches
- [ ] Payloads crudos guardados en raw_provider_leads
- [ ] Aliases insertados correctamente
- [ ] Response JSON: {providerId, status}

---

## P4.2 - n8n Workflow Setup

**Descripción:**
Configurar workflow de n8n para ingestión automática de providers desde fuentes externas.

**Tareas:**
1. ✅ Crear workflow n8n:
   - Trigger: Manual / Webhook / Schedule (diario)
   - Fuentes: Google Sheets, Web Scraper, APIs de directorios
2. ✅ Transformación de datos:
   - Mapear campos source → schema de ingest
   - Normalizar formatos (teléfonos, regiones, etc.)
3. ✅ HTTP Request node:
   - Method: POST
   - URL: `https://api.modtok.com/v1/ingest/providers`
   - Headers:
     - `X-Ingestion-Token: {{$env.MODTOK_INGESTION_TOKEN}}`
     - `X-Idempotency-Key: {{$json.website || $json.instagram || $json.name}}`
     - `Content-Type: application/json`
   - Body: {name, website, instagram, emails, phones, regions, capabilities}
4. ✅ Branching por respuesta:
   - Si status='created' → notificar Slack/Email "Nuevo provider draft"
   - Si status='matched' → log + opcional enriquecimiento
   - Si error → retry 3 veces + log error
5. ✅ Guardar providerId en sheet/DB para tracking

**Archivos afectados:**
- n8n workflow JSON (exportar y guardar en `.context/n8n/`)

**Tiempo estimado:** 3 horas

**Dependencias:** P4.1

**Criterios de aceptación:**
- [ ] Workflow ejecuta sin errores
- [ ] Token de ingestión configurado en n8n
- [ ] Notificaciones de nuevos providers funcionan
- [ ] Retry logic funciona ante errores temporales
- [ ] Logs guardados para auditoría

---

## P4.3 - Admin: Raw Leads Dashboard

**Descripción:**
UI para visualizar y gestionar `raw_provider_leads` (auditoría de ingesta).

**Tareas:**
1. ✅ Crear página: `src/pages/admin/ingest/leads.astro`
   - Header: "Leads de Ingestión"
   - Stats: Total received, matched, created, errors
2. ✅ Crear tabla: `LeadsTable.tsx`
   - Columnas: Received At, Name, Website, Instagram, Status, Provider ID
   - Filtros: Por status (received, matched, created, error)
   - Ordenamiento: Por fecha descendente
3. ✅ Detalle de lead:
   - Modal con payload crudo (JSON viewer)
   - Datos normalizados
   - Error message (si existe)
   - Link a provider si matcheó
4. ✅ Acciones:
   - Re-procesar lead fallido (retry manual)
   - Marcar como ignorado
   - Convertir a provider manualmente

**Archivos afectados:**
- `src/pages/admin/ingest/leads.astro` (NUEVO)
- `src/components/admin/LeadsTable.tsx` (NUEVO)
- `src/pages/api/admin/ingest/leads/index.ts` (NUEVO - GET)
- `src/pages/api/admin/ingest/leads/[id]/reprocess.ts` (NUEVO - POST)

**Tiempo estimado:** 5 horas

**Dependencias:** P4.1, P1.7

**Criterios de aceptación:**
- [ ] Dashboard muestra stats correctas
- [ ] Filtros funcionan
- [ ] Modal de detalle muestra payload completo
- [ ] Re-proceso manual funciona
- [ ] Link a provider funciona si existe match

---

## P4.4 - Monitoring & Alerts

**Descripción:**
Sistema de monitoreo para detectar problemas en la ingestión.

**Tareas:**
1. ✅ Crear Supabase Edge Function: `check-ingestion-health`
   - Cron job: diario (8:00 AM)
   - Query: leads con status='error' de últimas 24h
   - Si > 10 errores → enviar alerta
2. ✅ Métricas clave:
   - Tasa de match (matched / total)
   - Tasa de error (error / total)
   - Providers nuevos por día
3. ✅ Alertas:
   - Email a admin si tasa de error > 20%
   - Slack notification de nuevos providers creados

**Archivos afectados:**
- `supabase/functions/check-ingestion-health/index.ts` (NUEVO)

**Tiempo estimado:** 2 horas

**Dependencias:** P4.1, P4.3

**Criterios de aceptación:**
- [ ] Cron ejecuta diariamente
- [ ] Alertas se envían correctamente
- [ ] Métricas calculadas son precisas

---

# 📊 RESUMEN DE EJECUCIÓN

## Tiempos Estimados

| Fase | Horas | Status |
|------|-------|--------|
| **P0: Fundamentos** | 12.5-16.5h | 🔴 Crítico (P0.0 ✅ done) |
| **P1: Core CMS** | 24-30h | 🟡 Importante |
| **P2: Catálogo Público** | 20-24h | 🟢 Growth |
| **P3: Optimización** | 16-20h | 🔵 Futuro |
| **P4: Ingestión & Automatización** | 14-18h | 🟣 Nuevo |
| **TOTAL** | **87-109h** | |

## Orden de Ejecución Recomendado

### Sprint 1 (P0): Arquitectura Sólida ⚡ CRÍTICO
**Objetivo:** Schema v3 funcionando en producción
**Duración:** 2-3 días
**Status:** P0.0 ✅ done, P0.1-P0.4 pendientes
**Tasks:** ~~P0.0~~ → P0.1 → P0.2 → P0.3 → P0.4

### Sprint 2 (P1.1-P1.4): Forms Correctos
**Objetivo:** Admin puede crear providers/houses/services con features correctas
**Duración:** 3-4 días
**Tasks:** P1.1 → P1.2 → P1.3 → P1.4

### Sprint 3 (P1.5-P1.7): Slots Manager
**Objetivo:** Admin puede vender y gestionar slots con preview en tiempo real
**Duración:** 2-3 días
**Tasks:** P1.5 → P1.6 (opcional) → P1.7

### Sprint 4 (P2.1-P2.3): Catálogo MVP
**Objetivo:** Users pueden buscar y ver casas/fabricantes
**Duración:** 3-4 días
**Tasks:** P2.1 → P2.2 → P2.3 → P2.5

### Sprint 5 (P2.4): Premium Landings
**Objetivo:** Landings dedicadas para premium
**Duración:** 2 días
**Tasks:** P2.4

### Sprint 6 (P4): Ingestión & Automatización 🤖 NUEVO
**Objetivo:** n8n ingesta providers automáticamente, admin gestiona leads
**Duración:** 2-3 días
**Tasks:** P4.1 → P4.2 → P4.3 → P4.4

### Sprint 7 (P3): Growth & Optimización
**Objetivo:** Analytics, notificaciones, SEO
**Duración:** 3-4 días
**Tasks:** P3.1 → P3.2 → P3.3 → P3.4

---

## 🎯 KPIs de Éxito

### Sprint 1 (P0)
- [ ] Migración corre sin errores en staging
- [ ] Tests unitarios de triggers pasan
- [ ] Types regenerados sin errores
- [ ] API endpoints retornan tier efectivo

### Sprint 2 (P1.1-P1.4)
- [ ] FeatureFormBuilder renderiza 3 categorías correctamente
- [ ] ProviderForm solo tiene fields corporativos
- [ ] HouseForm/ServiceForm usan FeatureFormBuilder
- [ ] Features se guardan correctamente en JSONB

### Sprint 3 (P1.5-P1.7)
- [ ] Admin puede crear/editar/desactivar slots
- [ ] SlotPreview simula rotación correctamente
- [ ] Sidebar consolidado y limpio
- [ ] Documentación actualizada

### Sprint 4 (P2.1-P2.3)
- [ ] Homepage rota 2 premium + 4 destacados
- [ ] Catálogo de casas con filtros funciona
- [ ] Catálogo de fabricantes con filtros funciona
- [ ] Search global funciona < 200ms

### Sprint 5 (P2.4)
- [ ] Landings premium generadas automáticamente
- [ ] SEO meta tags correctos
- [ ] Contact forms envían leads
- [ ] Lighthouse > 90

### Sprint 6 (P3)
- [ ] Analytics dashboard funcional
- [ ] Notificaciones de expiración enviadas
- [ ] AB testing implementado
- [ ] Structured data válida

---

## 🚨 Decisiones Pendientes

1. **Rutas de Providers:**
   - ¿Usar `/admin/providers` o `/admin/catalog/fabricantes`?
   - **Recomendación:** `/admin/providers` (más genérico, cubre fabricantes Y servicios)

2. **Media Assets Migration:**
   - ¿Migrar `gallery_images` TEXT[] a `media_assets` en P1.6 o postergar?
   - **Recomendación:** Hacer en P1.6 (evita deuda técnica)

3. **Rotación de Slots:**
   - ¿Client-side o server-side?
   - **Recomendación:** Client-side para MVP (más simple), server-side en P3

4. **Feature Definitions:**
   - ¿Seed features en migración o desde admin UI?
   - **Recomendación:** Seed básico en migración, UI para editar después

---

## 📝 Notas Finales

### Arquitectura
- Schema v3 separa correctamente concerns (editorial vs pagado)
- View `catalog_visibility_effective` es el source of truth para ordenamiento
- Triggers garantizan integridad (landing solo premium, auto-elevar flags)

### UX
- FeatureFormBuilder permite escalar sin crear forms custom por cada categoría
- Filtros dinámicos se generan automáticamente desde `feature_definitions`
- Admin UI sigue Design System v2.0 establecido

### Performance
- GIN indexes en JSONB `features` para búsquedas rápidas
- View materializada opcional para analytics (P3)
- Cache de 30s en slots activos

### Escalabilidad
- Separación provider/house/service permite growth independiente
- Media assets centralizada facilita CDN integration
- Slots normalizados permiten pricing dinámico

---

**Próximo paso:** Comenzar con **P0.1 - Migración Schema v3** 🚀

**Preguntas antes de comenzar:**
1. ¿Aprobamos el Schema v3 tal cual está en PROGRESS_V2.md?
2. ¿Migramos `gallery_images` a `media_assets` en Sprint 3 o postergar?
3. ¿Confirmamos `/admin/providers` como ruta unificada?

---

---

# 🔧 STACK MAPPING: NestJS → Astro

**Contexto:** PROGRESS_V2.1md contiene ejemplos en NestJS/TypeORM. Esta tabla traduce conceptos al stack actual de Modtok.

| NestJS/TypeORM | Astro + Supabase | Notas |
|----------------|------------------|-------|
| **Entities (TypeORM)** | `database.types.ts` generado por Supabase CLI | `npx supabase gen types typescript` |
| **Controllers** | Astro API Routes (`src/pages/api/`) | `.ts` files exportan `GET`, `POST`, `PUT`, `DELETE` |
| **Services** | Helper functions en `src/lib/` | Ej: `src/lib/ingest/service.ts` |
| **DTOs (class-validator)** | Zod schemas | Ej: `z.object({name: z.string()})` |
| **Guards** | Astro middleware (`src/middleware.ts`) | O verificación manual en cada endpoint |
| **Dependency Injection** | Import directo de funciones | No hay DI container, simplemente `import` |
| **TypeORM Repository** | Supabase client (`createClient()`) | `supabase.from('table').select()` |
| **QueryBuilder** | PostgREST query params | `.eq()`, `.in()`, `.gte()`, `.order()` |
| **Raw SQL** | `supabase.rpc()` o `execute_sql` MCP | Para queries complejas |
| **Migrations** | `supabase/migrations/*.sql` | Versionadas con timestamp |
| **Env vars** | `.env` + `import.meta.env` | Astro lee de `.env` |
| **Validation pipe** | Manual con Zod en cada endpoint | `schema.parse(body)` |

**Ejemplo de traducción:**

```typescript
// NestJS Controller
@Controller('providers')
export class ProvidersController {
  @Get()
  list(@Query('limit') limit: number) {
    return this.service.findAll(limit);
  }
}

// Astro API Route: src/pages/api/providers/index.ts
import { createClient } from '@/lib/supabase';
import { z } from 'zod';

export async function GET({ request }) {
  const url = new URL(request.url);
  const limit = z.coerce.number().default(20).parse(url.searchParams.get('limit'));

  const supabase = createClient();
  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .limit(limit);

  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}
```

**Key takeaways:**
- NestJS decorators → Astro exported functions
- TypeORM queries → Supabase client methods
- Class-validator DTOs → Zod schemas
- Services → plain functions in `src/lib/`

---

**Última actualización:** 2025-10-29
**Autor:** Claude Code + Equipo MODTOK
**Status:** ✅ Plan unificado, incluyendo PROGRESS_V2.1md (adaptado de NestJS a Astro)
