 🎯 ANÁLISIS CRÍTICO - Corrigiendo el Modelo

  Déjame analizar tu visión y corregir/clarificar el modelo de datos:

  ---
  ✅ LO QUE ENTIENDO (y está correcto):

  1. Estructura Jerárquica:
  PROVIDER (Empresa base - info general)
     ↓
     ├── Si es FABRICANTE → tiene Features de Fábrica (image.png)
     │                    → puede tener HOUSES (productos)
     │
     └── Si es H&SERVICIOS → tiene Features de Servicios (image-1.png)
                           → puede tener SERVICE_PRODUCTS

  2. Frontend Principal:
  - Muestra mezcla de todo: fabricantes destacados, casas populares, servicios
  - Búsqueda filtrada por macro-categoría
  - Filtros laterales dinámicos (según CSV)

  3. Flujo Editorial:
  - Admin crea provider → selecciona categoría → features en checkboxes
  - Admin sube tier → mejora visibilidad
  - Admin crea casa → debe asociar fabricante (provider)

  ---
  ⚠️ PROBLEMAS ACTUALES EN EL SCHEMA:

  1. Confusión "casas" como categoría:
  // ❌ INCORRECTO - Actualmente tenemos:
  primary_category: 'fabrica' | 'casas' | 'habilitacion_servicios'

  // ✅ CORRECTO - Debería ser:
  primary_category: 'fabrica' | 'habilitacion_servicios'

  CASAS NO ES UNA CATEGORÍA DE PROVIDER, es un producto/catálogo de un fabricante.

  2. Relación Houses → Provider:
  -- ✅ YA ESTÁ BIEN:
  houses.provider_id → providers.id

  -- ✅ PERO FALTA VALIDACIÓN:
  -- Solo providers con category='fabrica' pueden tener houses

  ---
  💡 MODELO CORRECTO (Propuesta):

  ┌─────────────────────────────────────────┐
  │ PROVIDERS (Empresas base)               │
  │ - id, company_name, email, phone, etc.  │
  │ - primary_category: enum                │
  │   → 'fabrica'                            │
  │   → 'habilitacion_servicios'             │
  │ - tier: 'standard' | 'destacado' |      │
  │         'premium'                        │
  │ - features: JSONB (según categoría)      │
  └─────────────────────────────────────────┘
             ↓                    ↓
    ┌────────────────┐    ┌──────────────────┐
    │ HOUSES         │    │ SERVICE_PRODUCTS │
    │ (Productos)    │    │ (Servicios)      │
    ├────────────────┤    ├──────────────────┤
    │ provider_id FK │    │ provider_id FK   │
    │ (fabrica)      │    │ (servicios)      │
    │ name, price    │    │ name, price_from │
    │ features JSONB │    │ features JSONB   │
    └────────────────┘    └──────────────────┘

  ---
  🔧 AJUSTES NECESARIOS:

  1. Eliminar 'casas' de enum category_type:
  -- Migration:
  ALTER TYPE category_type RENAME TO category_type_old;
  CREATE TYPE category_type AS ENUM ('fabrica', 'habilitacion_servicios');
  ALTER TABLE providers
    ALTER COLUMN primary_category TYPE category_type
    USING primary_category::text::category_type;
  DROP TYPE category_type_old;

  2. Agregar constraint en houses:
  -- Asegurar que solo fabricantes tengan casas
  ALTER TABLE houses ADD CONSTRAINT houses_provider_must_be_fabrica
  CHECK (
    EXISTS (
      SELECT 1 FROM providers
      WHERE providers.id = houses.provider_id
      AND providers.primary_category = 'fabrica'
    )
  );

  3. Feature_definitions limpiar categoría 'casas':
  -- Las houses tienen sus propias features independientes
  -- NO necesitan estar en feature_definitions de provider
  -- Ya tienen su propio JSONB

  ---
  🎨 FORMS CORRECTOS:

  Provider Form (Create/Edit):
  1. Info Base (siempre):
     - company_name, email, phone, region, tier, status

  2. Categoría (select):
     - 'fabrica' | 'habilitacion_servicios'

  3. Features dinámicas (según categoría):
     <FeatureFormBuilder 
       category={provider.primary_category}
       currentFeatures={provider.features}
     />
     // Renderiza checkboxes de image.png o image-1.png

  House Form (Create/Edit):
  1. Seleccionar Fabricante:
     <select>
       {fabricantes.map(...)}
     </select>
     <button onClick={openModalCrearFabricante}>
       + Crear Fabricante Rápido
     </button>

  2. Info Casa:
     - name, model_code, price, area_m2, bedrooms, etc.

  3. Features Casa (propias):
     <FeatureFormBuilder 
       category="casas" // ← features específicas de casas
       currentFeatures={house.features}
     />

  Modal Crear Fabricante Rápido:
  <Modal>
    <input name="company_name" required />
    <input name="email" required />
    <input name="phone" required />
    <select name="region" required />

    {/* Features mínimas */}
    <FeatureFormBuilder
      category="fabrica"
      currentFeatures={{}}
      minimalMode={true} // solo campos required
    />

    <button>Crear y Asociar</button>
  </Modal>

  ---
  ✅ CHECKLIST DE IMPLEMENTACIÓN:

  P1.2 - Corregir Modelo + Controles Editoriales:

  1. [ ] Migrar enum: eliminar 'casas' de category_type
  2. [ ] Actualizar feature_definitions: separar features de houses
  3. [ ] Constraint: houses solo para fabricantes
  4. [ ] Form Provider: usar FeatureFormBuilder correcto
  5. [ ] Form House: selector fabricante + modal creación rápida
  6. [ ] Integrar flags editoriales (has_quality_images, etc.)
  7. [ ] UI aprobación editorial por tier

  ---
  🤔 MIS CRÍTICAS Y PREGUNTAS:

  ✅ LO QUE ESTÁ BIEN:
  - Separación provider (base) vs productos (houses/services)
  - Form Builder dinámico con checkboxes
  - Tier system para visibilidad
  - Filtros laterales del CSV

  ❌ LO QUE NECESITA AJUSTE:
  - Eliminar 'casas' como categoría de provider
  - Clarificar que houses son productos de fabricantes
  - Agregar modal creación rápida de fabricante

  ❓ PREGUNTAS:
  1. ¿Un provider puede ser AMBOS (fabricante Y servicios)?
    - Si sí → necesitamos tabla provider_categories (many-to-many)
    - Si no → basta con primary_category enum
  2. ¿Features de houses están en feature_definitions o separadas?
    - Opción A: feature_definitions con category='casas'
    - Opción B: hardcoded en house form
    - Recomiendo A para consistencia
  3. ¿Service_products necesita modal rápido también?

  ---
  🚀 PLAN DE ACCIÓN PROPUESTO:

  FASE 1 - Limpieza Schema (30min):
  - Migrar enum category_type
  - Update feature_definitions
  - Constraints

  FASE 2 - Forms Correctos (1h):
  - Provider form con FeatureFormBuilder
  - House form con selector + modal
  - Integrar flags editoriales

  FASE 3 - Testing (30min):
  - Crear provider fabricante
  - Crear casa asociada
  - Crear provider servicios
  - Verificar features por categoría