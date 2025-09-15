# MODTOK Catalog System Restructure Plan

## Critical Discovery: Services and Decorations Share Same Form (WRONG!)

### Current Problem
- **URL Evidence**:
  - `/admin/catalog/services/create?service_type=decoracion`
  - `/admin/catalog/services/create`
- Services and Decorations are using the SAME creation form
- This is architecturally incorrect - they have completely different data models

## Data Model Analysis from CSV Files

### 1. Habilitación & Servicios (cat_habilitacion.csv)

#### Service Categories Structure:
```
Habilitación & Servicios
├── Agua & Sanitarios
│   ├── Perforación de pozos
│   ├── Captación de agua lluvia
│   ├── Alcantarillado Autónomo
│   ├── Baños Secos
│   └── Reciclaje y Compostaje
├── Energía
│   ├── Paneles Solares
│   ├── Generadores Eléctricos
│   └── Energía Eólica
├── Pisos
│   ├── Pisos Deck
│   ├── Pisos de Madera
│   ├── Pisos Vinílicos
│   └── Alfombras Vinílicas
├── Revestimientos Interior
├── Revestimientos Exterior
│   ├── Madera
│   ├── Metal
│   └── Fibra Mineral
├── Cortasoles
│   ├── Madera
│   ├── Accionables
│   └── Folding/Sliding Shutter
├── Fachadas
│   ├── Paneles Aislantes
│   └── Fachadas de Madera
└── Seguridad & Comunicación
    ├── Instalación Antenas y Repetidores
    ├── Comunicación Satelital
    └── Cámaras
```

#### Service-Specific Fields:
- Precio Referencia Mínimo/m2
- Precio Referencia Máximo/m2
- Cobertura geográfica para entregas
- Multiple sub-categories with specific features

### 2. Decoración y Mejoras (cat_decoracion.csv)

#### Decoration Categories Structure:
```
Decoración y Mejoras
├── Control Solar
│   ├── Cortinas y Persianas
│   ├── Toldos
│   └── Pérgolas y quinchos
└── Muebles Modulares / Equipamiento
```

#### Decoration-Specific Fields:
- Much simpler structure
- Focus on products rather than services
- Different pricing model

## Current Database Schema Issues

### Tables Analysis:
1. **services table**: Has `category_id` field (UUID) - suggests sub-categories were planned
2. **decorations table**: Also has `category_id` field (UUID)
3. **categories table**: Has `parent_id` field for hierarchical structure
4. **No sub-categories exist**: Query confirmed no records with parent_id

## PROPOSED SOLUTION

### Phase 1: Data Model Correction

#### 1.1 Create Sub-Categories Structure
```sql
-- For Habilitación & Servicios
INSERT INTO categories (type, name, slug, parent_id) VALUES
  ('habilitacion_servicios', 'Agua & Sanitarios', 'agua-sanitarios', [parent_id]),
  ('habilitacion_servicios', 'Energía', 'energia', [parent_id]),
  ('habilitacion_servicios', 'Pisos', 'pisos', [parent_id]),
  ('habilitacion_servicios', 'Revestimientos Interior', 'revestimientos-interior', [parent_id]),
  ('habilitacion_servicios', 'Revestimientos Exterior', 'revestimientos-exterior', [parent_id]),
  ('habilitacion_servicios', 'Cortasoles', 'cortasoles', [parent_id]),
  ('habilitacion_servicios', 'Fachadas', 'fachadas', [parent_id]),
  ('habilitacion_servicios', 'Seguridad & Comunicación', 'seguridad-comunicacion', [parent_id]);

-- For Decoración
INSERT INTO categories (type, name, slug, parent_id) VALUES
  ('decoracion', 'Control Solar', 'control-solar', [parent_id]),
  ('decoracion', 'Muebles Modulares / Equipamiento', 'muebles-modulares', [parent_id]);
```

#### 1.2 Create Service Features Table
```sql
CREATE TABLE service_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  feature_name TEXT NOT NULL,
  feature_type TEXT, -- 'agua_sanitarios', 'energia', etc.
  display_order INTEGER,
  is_filter BOOLEAN DEFAULT false,
  show_in_card BOOLEAN DEFAULT false
);
```

### Phase 2: Form Separation

#### 2.1 Services Form Requirements
- **Category Selector**: Now makes sense! Select from sub-categories
- **Feature Checkboxes**: Based on selected category
- **Coverage Areas**: Geographic regions
- **Price Range**: Min/Max per m2
- **Service Type**: From predefined list
- **Installation Options**: Yes/No
- **Certifications**: Multiple selection

#### 2.2 Decorations Form Requirements
- **Category Selector**: Control Solar or Muebles Modulares
- **Product Type**: Based on category
- **Brand/Model**: Text fields
- **Dimensions**: Width, Height, Depth
- **Materials**: Multiple selection
- **Colors**: Multiple selection
- **Stock Management**: Quantity, availability
- **Installation Service**: Optional with price

### Phase 3: Implementation Tasks

#### CRITICAL TASKS (Session 5)
1. [ ] **Separate Forms Completely**
   - [ ] Create dedicated `/admin/catalog/decorations/create.astro` (currently using services form!)
   - [ ] Update decoration form to match decoration data model
   - [ ] Remove `service_type=decoracion` hack

2. [ ] **Populate Sub-Categories**
   - [ ] Run migration to create all sub-categories from CSV
   - [ ] Update parent_id references
   - [ ] Ensure proper hierarchy

3. [ ] **Fix Category Selection**
   - [ ] Services form: Show sub-categories of 'habilitacion_servicios'
   - [ ] Decorations form: Show sub-categories of 'decoracion'
   - [ ] Make category_id field REQUIRED and FUNCTIONAL

#### HIGH PRIORITY TASKS
1. [ ] **Create Feature Management**
   - [ ] Import features from CSV for each sub-category
   - [ ] Create feature selection UI
   - [ ] Link features to services/decorations

2. [ ] **Fix Navigation & Routing**
   - [ ] Ensure `/admin/catalog/decorations/create` goes to correct form
   - [ ] Remove service_type parameter usage
   - [ ] Update all links

3. [ ] **Update APIs**
   - [ ] `/api/admin/services/index.ts` - Filter by sub-category
   - [ ] `/api/admin/decorations/index.ts` - Filter by sub-category
   - [ ] Add sub-category validation

#### MEDIUM PRIORITY TASKS
1. [ ] **Enhance Service Form**
   - [ ] Add all service-specific fields from CSV
   - [ ] Implement coverage area selector
   - [ ] Add certification management

2. [ ] **Enhance Decoration Form**
   - [ ] Add product variant support
   - [ ] Implement color/size/material options
   - [ ] Add stock management features

3. [ ] **Create Bulk Import**
   - [ ] Parse CSV structure
   - [ ] Map fields correctly
   - [ ] Validate against sub-categories

### Phase 4: Data Migration

#### Migration Steps:
1. Create sub-categories from CSV structure
2. Update existing services with correct category_id
3. Update existing decorations with correct category_id
4. Populate features table from CSV
5. Link features to appropriate categories

### Phase 5: Validation & Testing

#### Test Cases:
1. Create service with "Agua & Sanitarios" category
2. Create decoration with "Control Solar" category
3. Verify category filtering works
4. Test feature selection
5. Validate form submissions
6. Check data integrity

## File Structure After Fix

```
src/pages/admin/catalog/
├── services/
│   ├── create.astro (Services ONLY - with sub-categories)
│   ├── [id]/
│   │   └── edit.astro
│   └── index.astro
├── decorations/
│   ├── create.astro (Decorations ONLY - with sub-categories)
│   ├── [id]/
│   │   └── edit.astro
│   └── index.astro
```

## API Structure After Fix

```
/api/admin/services/
├── index.ts (GET services filtered by sub-category)
├── [id].ts (CRUD for specific service)
└── categories.ts (NEW - get service sub-categories)

/api/admin/decorations/
├── index.ts (GET decorations filtered by sub-category)
├── [id].ts (CRUD for specific decoration)
└── categories.ts (NEW - get decoration sub-categories)
```

## Database Queries Needed

### Get Service Sub-Categories:
```sql
SELECT * FROM categories
WHERE type = 'habilitacion_servicios'
AND parent_id IS NOT NULL
ORDER BY display_order;
```

### Get Decoration Sub-Categories:
```sql
SELECT * FROM categories
WHERE type = 'decoracion'
AND parent_id IS NOT NULL
ORDER BY display_order;
```

### Get Features for Category:
```sql
SELECT * FROM service_features
WHERE category_id = [selected_category_id]
ORDER BY display_order;
```

## Success Metrics

1. ✅ Services and Decorations have separate forms
2. ✅ Sub-categories properly implemented
3. ✅ Category selection works correctly
4. ✅ Features linked to categories
5. ✅ No more `service_type=decoracion` hack
6. ✅ Data model matches CSV structure

## Risk Assessment

### High Risk:
- **Data Loss**: Existing services/decorations might lose category association
- **Mitigation**: Create backup before migration

### Medium Risk:
- **Form Complexity**: Too many sub-categories might confuse users
- **Mitigation**: Good UX design with clear hierarchy

### Low Risk:
- **Performance**: Additional joins for sub-categories
- **Mitigation**: Proper indexing

## Next Session Starting Point

1. **FIRST TASK**: Check if decorations are actually using services form
   - Visit `/admin/catalog/decorations/create`
   - Check if it redirects or shows wrong form

2. **SECOND TASK**: Create proper decorations form if missing

3. **THIRD TASK**: Implement sub-categories from CSV data

4. **FOURTH TASK**: Update both forms to use sub-categories

5. **FIFTH TASK**: Test complete workflow

## Important Notes

- **Category_id field now makes sense!** It's for sub-categories, not main categories
- Services has 8 main sub-categories with multiple features each
- Decorations has 2 main sub-categories
- The CSV files are the source of truth for the data model
- Current implementation is mixing services and decorations (MUST FIX)

## Commands for Next Session

```bash
# Check current state
curl http://localhost:4321/admin/catalog/decorations/create
curl http://localhost:4321/admin/catalog/services/create

# Database checks
SELECT * FROM categories WHERE parent_id IS NOT NULL;
SELECT COUNT(*) FROM services WHERE category_id IS NOT NULL;
SELECT COUNT(*) FROM decorations WHERE category_id IS NOT NULL;
```

## Files to Review Next Session

1. `/src/pages/admin/catalog/services/create.astro`
2. `/src/pages/admin/catalog/decorations/create.astro`
3. `/.context/data/Estructuras_v3.xlsx - cat_habilitacion.csv`
4. `/.context/data/Estructuras_v3.xlsx - cat_decoracion.csv`
5. `/database_schema_complete.sql`

---

**END OF CONTEXT DUMP FOR SESSION 5**

*This plan addresses the critical architectural issue where Services and Decorations are incorrectly sharing the same form and not utilizing the sub-category structure that the database was designed for.*