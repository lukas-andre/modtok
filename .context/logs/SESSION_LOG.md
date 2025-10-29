# Session Log - Modtok Core Business Implementation

**Fecha:** 2025-10-29
**Sesión:** Architecture Review & Roadmap Unification
**Estado:** ✅ COMPLETADO - ROADMAP actualizado y unificado

---

## 1. RESUMEN EJECUTIVO

### Sesión anterior:
1. ✅ Crear documentación unificada del schema y sistema de slots (SCHEMA_ARCHITECTURE.md)
2. ✅ Analizar propuesta PROGRESS_V2.md y crear roadmap de ejecución (ROADMAP_CORE_BUSINESS.md)
3. ✅ Seed de feature_definitions ejecutado previamente

### Esta sesión (2025-10-29):
1. ✅ Verificar estado de BD con MCP: feature_definitions **SÍ está cargada** (123 features)
2. ✅ Analizar PROGRESS_V2.1md (nuevas tareas con ejemplos NestJS)
3. ✅ Unificar ROADMAP_CORE_BUSINESS.md con nuevas tareas de ingestión n8n
4. ✅ Crear Stack Mapping (NestJS → Astro) para traducir ejemplos
5. ✅ Añadir fase P4 (Ingestión & Automatización)
6. ✅ Actualizar tiempos totales: 87-109h (incluyendo P4)

---

## 2. ARCHIVOS CREADOS

### 2.1. SCHEMA_ARCHITECTURE.md
**Ubicación:** `/Users/lhenry/Development/modtok/SCHEMA_ARCHITECTURE.md`
**Tamaño:** 450+ líneas
**Propósito:** Documentación completa del schema y arquitectura de slots

**Secciones principales:**
- Modelo de negocio (venta de slots con rotación round-robin)
- Schema completo: profiles, providers, houses, services, slots, analytics
- Diagrama de relaciones
- Sistema de tiers (editorial vs pagado vs efectivo)
- Ejemplos de queries
- Políticas RLS
- Mejores prácticas

**Conceptos clave:**
- **Slot System**: N slots comprados, solo 2 premium + 4 destacado visibles simultáneamente
- **Tier Separation**:
  - `tier` (editorial) = calidad del contenido
  - `slot_orders` = slots pagados
  - `effective_tier` = combinación de ambos
- **Normalización v3**: Separar `homepage_slots` en `slot_orders` + `slot_positions` + `slot_rotation_state`

### 2.2. ROADMAP_CORE_BUSINESS.md
**Ubicación:** `/Users/lhenry/Development/modtok/ROADMAP_CORE_BUSINESS.md`
**Tamaño:** Plan de 72-90 horas en 6 sprints
**Propósito:** Roadmap de ejecución para el core business

**Estructura:**
```
P0: Fundamentos Arquitectónicos (12-16h)
├── P0.1: Migración Schema v3
├── P0.2: Migrar Data Legacy
├── P0.3: Regenerar Types
└── P0.4: Actualizar API Endpoints

P1: Core CMS & Admin (24-30h)
├── P1.1: FeatureFormBuilder Component
├── P1.2: Refactor ProviderForm
├── P1.3: Refactor HouseForm
├── P1.4: Refactor ServiceForm
├── P1.5: Admin Slots Manager UI
├── P1.6: Media Gallery Manager
└── P1.7: Cleanup & Consolidation

P2: Catálogo Público (20-24h)
├── P2.1: Homepage con Slots Rotativos
├── P2.2: Catálogo de Casas con Filtros
├── P2.3: Catálogo de Fabricantes
├── P2.4: Landing Pages Premium
└── P2.5: Search Global

P3: Optimización & Growth (16-20h)
├── P3.1: Analytics Dashboard de Slots
├── P3.2: Notificaciones de Expiración
├── P3.3: AB Testing de Rotación
└── P3.4: SEO Avanzado
```

---

## 3. DESCUBRIMIENTO CRÍTICO: Feature Definitions NO está cargada

### 3.1. Contexto
El usuario dijo: "recuerdo que ya subimos esos a la base de datos pero checkea"

### 3.2. Investigación realizada

**Archivo CSV verificado:**
- **Ubicación:** `/Users/lhenry/Development/modtok/.context/data/Estructuras_v5.csv`
- **Contenido:** 127 features + 4 headers
  - Fabrica: 31 features
  - Casas: 34 features
  - Habilitación: 58 features

**Tabla feature_definitions:**
- ✅ Estructura EXISTS en `src/lib/database.types.ts` (líneas 280-379)
- ✅ Seed script EXISTS en `.context/backlog/new/06_SEED_FEATURES.sql`
- ❌ Data NO está cargada en BD
- ❌ Migración NUNCA fue ejecutada

**Búsqueda en migraciones:**
```bash
grep -r "INSERT INTO feature_definitions" supabase/migrations/
# Resultado: Sin coincidencias
```

### 3.3. Reacción del usuario
User: "ok hazlo, pero creí que esto ya lo tenia en bd"

**Interpretación:** Proceder con el plan de cargar los datos.

---

## 4. PLAN INMEDIATO (PRÓXIMA ACCIÓN)

### PASO 1: Actualizar ROADMAP_CORE_BUSINESS.md

Agregar nueva tarea P0.0 ANTES de P0.1:

```markdown
## P0.0 - Seed Feature Definitions ⚠️ CRÍTICO

**Descripción:**
Cargar los 127 features del CSV Estructuras_v5.csv a la tabla feature_definitions.
Esta data es prerequisito para TODOS los formularios y filtros del sistema.

**¿Por qué es crítico?**
- FeatureFormBuilder (P1.1) depende de esta data
- Todos los formularios (P1.2, P1.3, P1.4) usan FeatureFormBuilder
- Los filtros del catálogo (P2.2) dependen de estos features

**Tareas:**
1. ✅ Mover seed script a migrations:
   - Origen: `.context/backlog/new/06_SEED_FEATURES.sql`
   - Destino: `supabase/migrations/20251029000000_seed_feature_definitions.sql`
2. ✅ Verificar contenido del script:
   - 31 features de Fabrica
   - 34 features de Casas
   - 58 features de Habilitación & Servicios
3. ✅ Aplicar migración: `supabase db push`
4. ✅ Verificar carga exitosa

**Tiempo estimado:** 30 minutos
**Dependencias:** Ninguna (DEBE SER PRIMERO)
**Bloquea:** P0.1, P0.2, P1.1, P1.2, P1.3, P1.4

**Query de verificación:**
```sql
-- Debe retornar: fabrica=31, casas=34, habilitacion_servicios=58
SELECT category, COUNT(*)
FROM feature_definitions
WHERE is_active = true
GROUP BY category;
```

**Criterios de aceptación:**
- [ ] Script de seed movido a migrations/
- [ ] Migración aplicada exitosamente
- [ ] 31 features de category='fabrica' cargadas
- [ ] 34 features de category='casas' cargadas
- [ ] 58 features de category='habilitacion_servicios' cargadas
- [ ] Todos los features tienen is_active=true
- [ ] Query de verificación retorna los números esperados
```

**Actualizar tiempos de P0:**
- Antes: 12-16h
- Después: 12.5-16.5h (agregando 30 min)

### PASO 2: Ejecutar P0.0

**Opción A (Recomendada):** Via migrations
```bash
# 1. Mover el script
cp .context/backlog/new/06_SEED_FEATURES.sql \
   supabase/migrations/20251029000000_seed_feature_definitions.sql

# 2. Aplicar migración
supabase db push

# 3. Verificar
supabase db execute "SELECT category, COUNT(*) FROM feature_definitions WHERE is_active = true GROUP BY category;"
```

**Opción B:** Via SQL directo
```bash
# Ejecutar directamente el contenido del seed script
cat .context/backlog/new/06_SEED_FEATURES.sql | supabase db execute
```

---

## 5. CONTEXTO TÉCNICO IMPORTANTE

### 5.1. Estructura del CSV Estructuras_v5.csv

**Columnas:**
1. Orden
2. Categoria (Fabrica, Casas, Habilitación)
3. Feature Disponible (grupo/familia)
4. Etiqueta (label visible)
5. Filtro/Ubicacion (lateral sidebar)
6. formulario admin (tipo de input)
7. Formato en Filtro (checklist, range, etc.)
8. Dato en Bloque Std/Premium/Destacada/Landing (visibilidad por tier)
9. nombre_columna (feature_key)
10. logica columna (descripción técnica)
11. (valor esperado para admin)

**Ejemplo de fila:**
```csv
1,Fabrica,Servicios Disponibles,Diseño standard,Lateral,(true or false),checklist|varios|todos,NO,SI,SI,SI,Excl. Std | Destacado | Premium,dise_std,Verdadero si solo entrega casas con diseño standard sin personalización,(true or false)
```

**Mapeo a feature_definitions:**
- Categoria → `category` (enum: fabrica, casas, habilitacion_servicios)
- Feature Disponible → `group_name`
- Etiqueta → `label`
- Filtro/Ubicacion → `filter_type` (lateral, top)
- formulario admin → `admin_input_type`
- Formato en Filtro → `filter_type` detallado
- Dato en Bloque (columnas) → `show_in_card_standard`, `show_in_card_destacado`, `show_in_card_premium`, `show_in_landing`
- nombre_columna → `feature_key` (CRITICAL: unique identifier)
- logica columna → `admin_helper_text`
- valor esperado → `data_type`

### 5.2. Tabla feature_definitions (Schema)

```typescript
interface FeatureDefinition {
  feature_key: string;              // PRIMARY KEY: dise_std, term_pared, etc.
  category: 'fabrica' | 'casas' | 'habilitacion_servicios';
  group_name: string;               // "Servicios Disponibles", "Ventanas", etc.
  label: string;                    // "Diseño standard", "Termopanel", etc.
  data_type: 'boolean' | 'number' | 'text' | 'json';
  filter_type: 'checkbox' | 'range' | 'multiselect' | 'select' | null;
  admin_input_type: string | null;  // "checkbox", "number", "text", etc.
  admin_helper_text: string | null;
  is_filterable: boolean;
  show_in_card_standard: boolean;
  show_in_card_destacado: boolean;
  show_in_card_premium: boolean;
  show_in_landing: boolean;
  is_active: boolean;
}
```

### 5.3. Dependencias del Feature System

**P1.1 - FeatureFormBuilder Component:**
Este componente DEBE:
1. Leer `feature_definitions` filtrado por `category`
2. Agrupar por `group_name`
3. Renderizar inputs según `admin_input_type`
4. Validar según `data_type`
5. Guardar valores en columna `features` (JSONB) de la tabla correspondiente

**Ejemplo de uso en HouseForm.tsx:**
```typescript
// Esto es lo que se debe implementar en P1.3
<FeatureFormBuilder
  category="casas"
  value={formData.features || {}}
  onChange={(features) => handleChange('features', features)}
/>
```

**P1.2, P1.3, P1.4 - Refactor de Formularios:**
- ProviderForm: `category="fabrica"`
- HouseForm: `category="casas"`
- ServiceForm: `category="habilitacion_servicios"`

**P2.2 - Catálogo con Filtros:**
```typescript
// Leer features filtrables
const filterableFeatures = await supabase
  .from('feature_definitions')
  .select('*')
  .eq('category', 'casas')
  .eq('is_filterable', true)
  .eq('is_active', true);

// Renderizar sidebar de filtros
filterableFeatures.forEach(feature => {
  if (feature.filter_type === 'checkbox') {
    // Render checkbox filter
  } else if (feature.filter_type === 'range') {
    // Render range slider
  }
});
```

---

## 6. ARQUITECTURA: Schema v3 (PROGRESS_V2.md)

### 6.1. Cambios principales propuestos

**ANTES (Schema actual):**
```sql
homepage_slots (
  id, slot_type, content_type, content_id,
  position_index, monthly_price, is_active
)
```
**Problema:** Mezcla concepto de "posición visible" con "orden de compra/entitlement"

**DESPUÉS (Schema v3):**
```sql
-- Config: cuántos slots visibles por tipo
slot_positions (
  slot_type TEXT PRIMARY KEY,  -- 'premium' | 'destacado'
  visible_count INT            -- 2 para premium, 4 para destacado
);

-- Entitlements: N órdenes compradas (pool de rotación)
slot_orders (
  id UUID PRIMARY KEY,
  slot_type TEXT,              -- 'premium' | 'destacado'
  content_type TEXT,           -- 'provider' | 'house' | 'service_product'
  content_id UUID,
  monthly_price NUMERIC,
  start_date DATE,
  end_date DATE,
  rotation_order INT,          -- orden dentro del pool
  is_active BOOLEAN
);

-- Estado de rotación (puntero server-side)
slot_rotation_state (
  slot_type TEXT PRIMARY KEY,
  last_rotation_at TIMESTAMPTZ,
  last_pointer INT
);
```

### 6.2. Lógica de rotación

**Round-robin:**
```sql
-- 1. Leer cuántos mostrar
SELECT visible_count FROM slot_positions WHERE slot_type='premium';  -- 2

-- 2. Obtener pool de órdenes activas
WITH pool AS (
  SELECT * FROM slot_orders
  WHERE slot_type='premium'
    AND is_active = true
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  ORDER BY rotation_order
)
SELECT * FROM pool
LIMIT (SELECT visible_count FROM slot_positions WHERE slot_type='premium');
```

**Client-side rotation:**
- Traer todo el pool al front
- Paginar localmente cada X segundos
- No requiere `slot_rotation_state`

**Server-side rotation:**
- Usar `slot_rotation_state.last_pointer` como offset
- Incrementar pointer en cada request
- Wrap-around cuando pointer >= count(pool)

### 6.3. View: catalog_visibility_effective

```sql
-- Combina tier editorial + slots activos
CREATE OR REPLACE VIEW catalog_visibility_effective AS
WITH active_orders AS (
  SELECT * FROM slot_orders
  WHERE is_active = true
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
)
SELECT
  'house' AS entity_type,
  h.id AS entity_id,
  COALESCE(
    (SELECT 'premium' FROM active_orders WHERE content_type='house' AND content_id=h.id AND slot_type='premium' LIMIT 1),
    (SELECT 'destacado' FROM active_orders WHERE content_type='house' AND content_id=h.id AND slot_type='destacado' LIMIT 1),
    h.tier  -- fallback a tier editorial
  ) AS effective_tier
FROM houses h;
```

**Uso en queries:**
```sql
-- Ordenar catálogo por visibilidad efectiva
SELECT h.*, v.effective_tier
FROM houses h
LEFT JOIN catalog_visibility_effective v ON v.entity_id = h.id AND v.entity_type = 'house'
ORDER BY
  CASE v.effective_tier
    WHEN 'premium' THEN 1
    WHEN 'destacado' THEN 2
    ELSE 3
  END,
  h.created_at DESC;
```

---

## 7. OTROS ARCHIVOS CLAVE REVISADOS

### 7.1. HouseForm.tsx
**Ubicación:** `src/components/admin/forms/HouseForm.tsx`
**Estado actual:** Formulario hardcoded con campos estáticos

**Campos actuales:**
- Información Básica: name, slug, sku, model_code, provider_id, topology_id
- Dimensiones: bedrooms, bathrooms, area_m2, area_built_m2, floors, main_material, energy_rating, warranty_years
- Precio: price, price_opportunity, price_per_m2, stock_quantity, stock_status
- Entrega: delivery_time_days, assembly_time_days, location_region
- SEO: status, tier, meta_title, meta_description, keywords

**Features actuales:** NINGUNO (esto es el problema)

**P1.3 debe:**
1. Mantener todos los campos hardcoded actuales
2. Agregar `<FeatureFormBuilder category="casas" />` en nueva sección "Características Técnicas"
3. Los 34 features de casas del CSV se deben renderizar dinámicamente

### 7.2. ProvidersTable.tsx
**Ubicación:** `src/components/admin/ProvidersTable.tsx`

**Patrón actual:**
```typescript
interface Provider {
  id: string;
  company_name: string;
  logo_url: string | null;
  status: string;
  tier: string;
  provider_categories: Array<{ category_type: string }>;
}

const columns = [
  { key: 'company_name', label: 'Proveedor', sortable: true },
  { key: 'categories', label: 'Categorías' },
  { key: 'tier', label: 'Tier' },
  { key: 'status', label: 'Estado' },
  { key: 'actions', label: '' }
];
```

**P1.2 debe:**
- Refactorizar formulario para SOLO mostrar features corporativos de "fabrica"
- NO mostrar features de casas/servicios (esos van en HouseForm/ServiceForm)

---

## 8. DECISIONES ARQUITECTÓNICAS CLAVE

### 8.1. Separación de Concerns

**Provider (empresa):**
- Datos corporativos
- Capabilities empresariales (diseño_personalizado, financiamiento, tecnología_sip, cobertura)
- flags: is_manufacturer, is_service_provider
- Features: SOLO los de category='fabrica' (31 features)

**House (producto):**
- Especificaciones técnicas del modelo
- Features: category='casas' (34 features)
- Relación: provider_id → providers (WHERE is_manufacturer=true)

**Service (servicio):**
- Alcance/unidad/precio/rango
- Features: category='habilitacion_servicios' (58 features)
- Relación: provider_id → providers (WHERE is_service_provider=true)

### 8.2. Triggers de Auto-elevación

```sql
-- Si insertas una casa, auto-activar is_manufacturer
CREATE OR REPLACE FUNCTION ensure_provider_flags() RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'houses' THEN
    UPDATE providers
    SET is_manufacturer = true
    WHERE id = NEW.provider_id AND is_manufacturer = false;
  ELSIF TG_TABLE_NAME = 'service_products' THEN
    UPDATE providers
    SET is_service_provider = true
    WHERE id = NEW.provider_id AND is_service_provider = false;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
```

### 8.3. Landing Pages Premium

**Regla:**
```sql
-- Solo tier='premium' puede tener landing
CREATE OR REPLACE FUNCTION enforce_landing_only_premium() RETURNS trigger AS $$
BEGIN
  IF NEW.has_landing_page = true AND NEW.tier <> 'premium' THEN
    RAISE EXCEPTION 'Solo items premium pueden tener landing';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;
```

---

## 9. ARCHIVOS DE REFERENCIA

### Documentación creada esta sesión:
- ✅ `/Users/lhenry/Development/modtok/SCHEMA_ARCHITECTURE.md`
- ✅ `/Users/lhenry/Development/modtok/ROADMAP_CORE_BUSINESS.md`
- 📝 `/Users/lhenry/Development/modtok/SESSION_LOG.md` (este archivo)

### Documentación de sesiones anteriores:
- `/Users/lhenry/Development/modtok/PROGRESS.md` (legacy, no modificar)
- `/Users/lhenry/Development/modtok/PROGRESS_V2.md` (propuesta arquitectónica, base del ROADMAP)

### Data crítica:
- `/Users/lhenry/Development/modtok/.context/data/Estructuras_v5.csv` (127 features)
- `/Users/lhenry/Development/modtok/.context/backlog/new/06_SEED_FEATURES.sql` (seed script)

### Código a refactorizar en P1:
- `src/components/admin/forms/HouseForm.tsx`
- `src/components/admin/forms/ProviderForm.tsx` (asumo que existe)
- `src/components/admin/forms/ServiceForm.tsx` (asumo que existe)
- `src/components/admin/ProvidersTable.tsx`

### Schema:
- `src/lib/database.types.ts` (TypeScript types generados)
- `supabase/migrations/` (migraciones SQL)

---

## 10. ESTADO ACTUAL (SESIÓN 2025-10-29)

### ✅ Completado en esta sesión:
1. **Verificación de BD via MCP:**
   - feature_definitions: ✅ 123 features cargados (31+34+58)
   - P0.0 ya estaba completado previamente
2. **Análisis de PROGRESS_V2.1md:**
   - Identificadas nuevas tareas: ingestión n8n, aliases, raw_provider_leads
   - Extraídos conceptos (ignorando que es NestJS)
3. **Unificación de ROADMAP_CORE_BUSINESS.md:**
   - P0.0 marcado como ✅ COMPLETADO
   - P0.1 enriquecido con tablas de ingestión
   - P0.4 ampliado con endpoints /ingest/providers y /visibility/effective
   - P1.5 mejorado con Preview en tiempo real
   - Nueva fase P4 añadida (Ingestión & Automatización, 14-18h)
   - Tiempo total: 72-90h → 87-109h
4. **Stack Mapping creado:**
   - Tabla de traducción NestJS → Astro
   - Ejemplos de código adaptados al stack actual

### 🚧 Verificado que NO está implementado:
- Schema v3 completo (faltan tablas: regions_lkp, provider_coverage_regions, slot_orders, etc.)
- View catalog_visibility_effective
- Endpoints de ingestión y visibility

### ⏭️ PRÓXIMO PASO INMEDIATO:
**Comenzar con P0.1 - Migración Schema v3**

Crear archivo de migración SQL que incluya:
1. Tablas originales de Schema v3 (PROGRESS_V2.md)
2. Tablas nuevas de ingestión (PROGRESS_V2.1md):
   - `raw_provider_leads`
   - `provider_aliases`
3. View `catalog_visibility_effective`
4. Triggers y constraints

---

## 11. NOTAS PARA LA PRÓXIMA SESIÓN

### Contexto emocional del usuario:
- Estaba sorprendido de que feature_definitions no estuviera cargada
- "creí que esto ya lo tenia en bd"
- Pero dio luz verde: "ok hazlo"

### Prioridades del usuario:
1. **Core business**: providers, houses, services, slots
2. **Monetización**: venta de slots premium/destacado
3. **Catálogo público**: con filtros dinámicos
4. **Design system**: YA ESTÁ LISTO (no trabajar en eso)
5. **Blog/noticias**: YA ESTÁ LISTO (no trabajar en eso)

### Lo que NO hay que tocar:
- Design system (revisado y listo)
- Blog module (ya implementado)
- Módulo de noticias (ya implementado)

### Foco exclusivo:
- Providers, fabricantes, casas, habilitación & servicios
- Sistema de slots y rotación
- Formularios con features dinámicos
- Catálogo público con filtros
- Landing pages premium

---

## 12. COMANDOS ÚTILES PARA LA PRÓXIMA SESIÓN

### Verificar estado de migraciones:
```bash
supabase db diff
supabase migration list
```

### Verificar feature_definitions:
```bash
supabase db execute "SELECT category, COUNT(*) FROM feature_definitions WHERE is_active = true GROUP BY category;"
```

### Regenerar types:
```bash
supabase gen types typescript --local > src/lib/database.types.ts
```

### Ver estructura de tabla:
```bash
supabase db execute "\d feature_definitions"
```

### Ver sample de data:
```bash
supabase db execute "SELECT feature_key, category, label, group_name FROM feature_definitions WHERE category='casas' LIMIT 5;"
```

---

## 13. PREGUNTAS PENDIENTES

1. **¿El script 06_SEED_FEATURES.sql está actualizado?**
   - Tiene 123 INSERTs (esperamos 127)
   - Revisar si las 4 filas faltantes son headers duplicados o data real

2. **¿Cómo se maneja el hot-reloading de feature_definitions?**
   - ¿Cache en memoria?
   - ¿Query directa en cada form load?
   - ¿ISR en Next.js?

3. **¿Existe FeatureFormBuilder ya o hay que crearlo desde cero?**
   - Buscar en `src/components/admin/`
   - Si no existe, es la primera tarea de P1.1

4. **¿Qué hacer con homepage_slots existente?**
   - ¿Migrar data a slot_orders?
   - ¿Deprecar tabla?
   - ¿Mantener ambas durante transición?

---

## 14. MÉTRICAS DE ÉXITO

### P0.0 exitoso si:
- ✅ 123-127 filas insertadas en feature_definitions
- ✅ `SELECT COUNT(*) FROM feature_definitions WHERE is_active = true` retorna >= 123
- ✅ Cada categoría tiene el número esperado de features
- ✅ No hay errores de constraint violations
- ✅ Types regenerados sin errores

### ROADMAP exitoso si:
- ✅ P0 completo → API endpoints funcionando con Schema v3
- ✅ P1 completo → Formularios con features dinámicos renderizando correctamente
- ✅ P2 completo → Catálogo público con filtros + homepage con slots rotativos
- ✅ P3 completo → Analytics funcionando + notificaciones de expiración

---

## 15. RECURSOS Y REFERENCIAS

### PROGRESS_V2.md - Decisiones clave:

1. **Separar "tier de catálogo" del "tier pagado"**
   - `tier` = prioridad editorial
   - `slot_orders` = exposición pagada
   - `effective_tier` = combinación

2. **Filtros/Features en el lugar correcto**
   - Provider: capabilities corporativas
   - House: prestaciones del modelo
   - Service: alcance/unidad/precio + features de instalación

3. **Dependencias fuertes por tipo de proveedor**
   - House → is_manufacturer = true
   - Service → is_service_provider = true

4. **Cálculo de visibilidad efectiva**
   - View `catalog_visibility_effective`
   - Combina tier editorial + slot activo

### Moodboard/Visión del usuario:
- Foco en imágenes y filtros potentes
- Experiencia tipo marketplace/vitrina
- Landing pages premium con mucho detalle
- Hotspots por región/ciudad

---

## FIN DEL LOG

**Última actualización:** 2025-10-29 (Sesión de Unificación)
**Estado:** ✅ COMPLETADO - Roadmap unificado, Stack Mapping creado
**Siguiente acción:** Comenzar P0.1 (Migración Schema v3)

---

## RESUMEN DE 30 SEGUNDOS (SESIÓN ACTUAL)

1. ✅ Verificamos BD: feature_definitions **SÍ está cargada** (123 features, P0.0 ✅ done)
2. ✅ Analizamos PROGRESS_V2.1md: nuevas tareas de ingestión n8n + deduplicación
3. ✅ Unificamos ROADMAP: P0.0 marcado completado, P0.1 enriquecido, P0.4 ampliado
4. ✅ Añadimos fase P4 (14-18h): Ingestión n8n + Raw Leads Dashboard + Monitoring
5. ✅ Creamos Stack Mapping: NestJS → Astro (tabla de traducción + ejemplos)
6. ✅ Tiempos totales: 72-90h → 87-109h
7. 🎯 **PRÓXIMO:** Ejecutar P0.1 (crear migración Schema v3 con tablas de ingestión)

**Archivos modificados:**
- ROADMAP_CORE_BUSINESS.md (unificado con PROGRESS_V2.1md)
- SESSION_LOG.md (actualizado con nuevo estado)

**Key insight:** PROGRESS_V2.1md tenía ejemplos NestJS pero los **conceptos** son aplicables. Stack Mapping permite traducir cualquier ejemplo futuro al stack Astro+Supabase.
