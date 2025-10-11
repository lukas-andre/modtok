# Sistema de Tiers y Visualización - MODTOK v2.0

## Resumen Ejecutivo

El sistema de tiers controla:
1. **Espacio visual** en listados
2. **Cantidad de información** mostrada
3. **Acceso a landing page** dedicada
4. **Control editorial** basado en calidad de contenido

---

## 🏆 Niveles de Tier

### 1. PREMIUM 💎
**La más cara - Máximo espacio y visibilidad**

#### Características:
- **Layout**: 1-2 tarjetas por columna (ocupa más espacio horizontal)
- **Landing dedicada**: Página completa del proveedor (`/provider/[slug]`)
- **Información**: TODO visible
- **Imágenes**: Galería completa, videos, tour virtual
- **Contenido adicional**:
  - Estadísticas destacadas (años experiencia, proyectos, satisfacción)
  - Testimoniales de clientes
  - Modelos destacados
  - Formulario de cotización integrado
  - Información de contacto completa
  - Redes sociales
  - Certificaciones destacadas

#### Control Editorial:
- **Campo**: `editor_approved_for_premium BOOLEAN`
- **Reglas**:
  - El editor DEBE aprobar contenido basado en:
    - ✅ Calidad de imágenes (resolución, profesionalismo)
    - ✅ Completitud de información
    - ✅ Descripción bien redactada
    - ❌ Rechaza si las fotos son malas calidad
    - ❌ Rechaza si falta información crítica

#### Ejemplo Visual:
```
┌─────────────────────────────────────────────────────────────┐
│ [BADGE: PREMIUM] [BADGE: VERIFICADO]                        │
│                                                              │
│ [────────── HERO IMAGE ──────────]                          │
│                                                              │
│ 🏭 EcoModular Pro                                           │
│ Líderes en construcción modular sustentable                 │
│                                                              │
│ ⭐ 500+ Proyectos | 15 Años | 98% Satisfacción              │
│                                                              │
│ ✓ Diseño personalizado ✓ Instalación ✓ Financiamiento      │
│ ✓ Llave en mano        ✓ Asesoría    ✓ Transporte          │
│                                                              │
│ 📍 Todo Chile | 💰 $800K - $1.5M /m²                        │
│                                                              │
│ [Solicitar Cotización]  [Ver Catálogo]  [♡ Guardar]        │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. DESTACADO ⭐
**Nivel medio - 4 tarjetas por columna**

#### Características:
- **Layout**: 4 tarjetas por columna (grid estándar)
- **Landing dedicada**: NO (redirige a formulario de contacto)
- **Información**: Parcial
  - Servicios principales: SI
  - Especialidades: SI
  - Precios: SI
  - Contacto: **Requiere login** (teléfono, email, cobertura)
- **Imágenes**: 1 principal + hover preview

#### Campos que requieren LOGIN:
- `telefono` → muestra solo si `auth.uid()` existe
- `email` → muestra solo si `auth.uid()` existe
- `cobertura` → muestra solo si `auth.uid()` existe

#### Ejemplo Visual:
```
┌───────────────────────────┐
│ [── COVER IMAGE ──]       │
│                           │
│ 🏭 ModularChile           │
│ Casas modulares SIP       │
│                           │
│ ✓ Tiny Houses             │
│ ✓ Panel SIP               │
│ ✓ Diseño personalizado    │
│                           │
│ 📍 RM, V, VIII            │
│ 💰 $900K - $1.2M /m²      │
│                           │
│ 📧 [Login para ver]       │
│ 📞 [Login para ver]       │
│                           │
│ [Contactar]  [♡ Guardar]  │
└───────────────────────────┘
```

---

### 3. STANDARD 📋
**Nivel básico - Listado simple**

#### Características:
- **Layout**: Lista compacta o grid de 6+ tarjetas
- **Landing dedicada**: NO
- **Información**: Mínima
  - Nombre empresa: SI
  - Descripción breve: SI
  - Región: SI
  - Especialidades principales: SI (solo las más importantes)
  - Servicios detallados: NO
  - Contacto: **Todo oculto** (requiere click para cotizar)

#### Sin acceso a:
- ❌ Teléfono/Email directo
- ❌ Detalles de servicios
- ❌ Rango de precios
- ❌ Cobertura detallada
- ❌ Galería de imágenes

#### Ejemplo Visual:
```
┌─────────────────────┐
│ [LOGO] ModularHome  │
│ Casas modulares     │
│ RM | Panel SIP      │
│ [Solicitar Info]    │
└─────────────────────┘
```

---

## 📊 Matriz de Visualización por Tier

### Para FÁBRICA:

| Campo / Grupo | Standard | Destacado | Premium | Landing |
|---------------|----------|-----------|---------|---------|
| **Servicios Disponibles** ||||
| Diseño estándar | ❌ | ✅ | ✅ | ✅ |
| Diseño personalizado | ❌ | ✅ | ✅ | ✅ |
| Instalación | ❌ | ✅ | ✅ | ✅ |
| Kits autoconstrucción | ❌ | ✅ | ✅ | ✅ |
| Asesoría técnica | ❌ | ✅ | ✅ | ✅ |
| Asesoría legal | ❌ | ✅ | ✅ | ✅ |
| Transporte | ❌ | ✅ | ✅ | ✅ |
| Financiamiento | ❌ | ✅ | ✅ | ✅ |
| **Especialidad** ||||
| Tiny Houses | ✅ | ✅ | ✅ | ✅ |
| Panel SIP | ✅ | ✅ | ✅ | ✅ |
| Container | ✅ | ✅ | ✅ | ✅ |
| Hormigón | ✅ | ✅ | ✅ | ✅ |
| Madera | ✅ | ✅ | ✅ | ✅ |
| Prefabricadas | ✅ | ✅ | ✅ | ✅ |
| Oficinas | ✅ | ✅ | ✅ | ✅ |
| **Generales** ||||
| Experiencia (años) | ❌ | Opcional | ✅ | ✅ |
| Nombre empresa | ✅ | ✅ | ✅ | ✅ |
| Descripción | ✅ | ✅ | ✅ | ✅ |
| Región | ✅ | ✅ | ✅ | ✅ |
| Dirección | ❌ | ❌ | ❌ | ✅ |
| Instagram | ❌ | ❌ | ❌ | ✅ |
| Teléfono | ❌ | 🔒 Login | ✅ | ✅ |
| Email | 🔒 Login | ❌ | 🔒 Login | ✅ |
| Cobertura | ❌ | 🔒 Login | 🔒 Login | ✅ |
| Llave en mano | ❌ | ✅ | ✅ | ✅ |
| Precio min/m² | ❌ | ✅ | ✅ | ❌ |
| Precio máx/m² | ❌ | ✅ | ✅ | ❌ |

### Para CASAS:

| Campo / Grupo | Standard | Destacado | Premium | Landing |
|---------------|----------|-----------|---------|---------|
| **Generales Core** ||||
| Nombre/Modelo | ✅ | ✅ | ✅ | ✅ |
| Descripción | ✅ | ✅ | ✅ | ✅ |
| Topología | ❌ | ✅ | ✅ | ✅ |
| m² | ✅ | ✅ | ✅ | ✅ |
| Precio | ✅ | ✅ | ✅ | ✅ |
| Precio Oportunidad | ✅ | 🔒 Login | 🔒 Login | ✅ |
| **Servicios** ||||
| Instalación premontada | ❌ | ✅ | ✅ | ✅ |
| Construcción terreno | ❌ | ✅ | ✅ | ✅ |
| Transporte | ❌ | ✅ | ✅ | ✅ |
| **Tecnología** ||||
| Panel SIP | ❌ | ✅ | ✅ | ✅ |
| Container | ❌ | ✅ | ✅ | ✅ |
| Madera | ❌ | ✅ | ✅ | ✅ |
| (todos los demás) | ❌ | ✅ | ✅ | ✅ |
| **Ventanas** ||||
| Termopanel | ❌ | ✅ | ✅ | ✅ |
| PVC/Aluminio/Madera | ❌ | ✅ | ✅ | ✅ |

---

## 🎨 Diseño de Componentes

### Card Component Props
```typescript
interface ProviderCardProps {
  provider: Provider;
  tier: 'standard' | 'destacado' | 'premium';
  isAuthenticated: boolean;
  features: FeatureDefinition[];
}

// Lógica de visualización
function shouldShowField(
  feature: FeatureDefinition,
  tier: 'standard' | 'destacado' | 'premium',
  isAuthenticated: boolean
): boolean {
  // Mapeo tier a campos de feature_definitions
  const tierField = {
    standard: 'show_in_card_standard',
    destacado: 'show_in_card_destacado',
    premium: 'show_in_card_premium'
  }[tier];

  const shouldShow = feature[tierField];

  if (!shouldShow) return false;

  // Check si requiere login
  if (feature.requires_login && !isAuthenticated) {
    return false;
  }

  return true;
}
```

### Landing Page (Solo Premium)
```astro
---
// src/pages/provider/[slug].astro
const { slug } = Astro.params;

const provider = await getProviderBySlug(slug);

// Validar que es premium
if (provider.tier !== 'premium') {
  return Astro.redirect(`/contacto?provider=${provider.id}`);
}

const features = await getFeaturesForCategory(provider.primary_category);
---

<ProviderLandingLayout provider={provider}>
  <!-- Hero con cover image -->
  <HeroSection provider={provider} />

  <!-- Stats destacadas -->
  <StatsSection
    experiencia={provider.features.generales.experiencia}
    proyectos={provider.metadata.proyectos_completados}
  />

  <!-- Servicios -->
  <ServicesSection
    features={provider.features}
    definitions={features.filter(f => f.group_name === 'servicios_disponibles')}
  />

  <!-- Galería -->
  <GallerySection images={provider.gallery_images} />

  <!-- Modelos/Productos destacados -->
  <ProductsSection providerId={provider.id} />

  <!-- Testimoniales -->
  <TestimonialsSection providerId={provider.id} />

  <!-- Formulario de contacto -->
  <ContactForm provider={provider} />

  <!-- Sidebar con info de contacto -->
  <ContactSidebar provider={provider} />
</ProviderLandingLayout>
```

---

## 🔍 Sistema de Filtros

### Filtros Dinámicos basados en feature_definitions

```typescript
// Generar filtros automáticamente desde feature_definitions
async function generateFilters(category: CategoryType) {
  const filterableFeatures = await supabase
    .from('feature_definitions')
    .select('*')
    .eq('category', category)
    .eq('is_filterable', true)
    .order('display_order');

  // Agrupar por filter_location
  const lateralFilters = filterableFeatures
    .filter(f => f.filter_location === 'lateral');

  const topFilters = filterableFeatures
    .filter(f => f.filter_location === 'top');

  return {
    lateral: groupByGroupName(lateralFilters),
    top: groupByGroupName(topFilters)
  };
}

// Componente de filtro
function FilterComponent({ feature }: { feature: FeatureDefinition }) {
  switch (feature.filter_type) {
    case 'checklist':
      return <CheckboxGroup feature={feature} />;
    case 'slider':
      return <RangeSlider feature={feature} />;
    case 'checkbox':
      return <SingleCheckbox feature={feature} />;
    default:
      return null;
  }
}
```

### Query con filtros JSONB

```sql
-- Búsqueda de providers por features
SELECT * FROM providers
WHERE
  primary_category = 'fabrica'
  AND status = 'active'
  -- Filtro boolean en JSONB
  AND (features->'servicios_disponibles'->>'dise_pers')::boolean = true
  AND (features->'especialidad'->>'tiny_houses')::boolean = true
  -- Filtro numérico en JSONB
  AND (features->'generales'->>'precio_ref_min_m2')::numeric >= 800000
  AND (features->'generales'->>'precio_ref_max_m2')::numeric <= 1500000
  -- Orden por tier
ORDER BY
  CASE tier
    WHEN 'premium' THEN 1
    WHEN 'destacado' THEN 2
    WHEN 'standard' THEN 3
  END,
  featured_order NULLS LAST,
  created_at DESC;
```

---

## 💰 Pricing Tiers (Sugerencia comercial)

### Modelo de Negocio

| Tier | Precio Mensual | Duración Mínima | Beneficios |
|------|----------------|-----------------|------------|
| **Standard** | Gratis | - | - Listado básico<br>- Sin contacto directo<br>- Sin estadísticas |
| **Destacado** | $150.000 CLP | 3 meses | - Más visibilidad<br>- 4 por columna<br>- Contacto con login<br>- Filtros completos<br>- Estadísticas básicas |
| **Premium** | $400.000 CLP | 6 meses | - Máxima visibilidad<br>- 1-2 por columna<br>- Landing dedicada<br>- TODO visible<br>- Galería completa<br>- Testimoniales<br>- Estadísticas avanzadas<br>- **Aprobación editorial** |

### Upsells adicionales:
- **Destacar en búsquedas**: +$50K/mes
- **Badge verificado**: +$30K/mes (requiere validación)
- **Reportes analíticos**: +$40K/mes
- **Leads premium**: Comisión por cotización

---

## 🛠️ Implementación en Admin

### Formulario de Provider (Admin)

```typescript
// Campos core (siempre visibles)
- Nombre empresa
- Email
- Teléfono
- Región
- Categoría principal
- Tier (dropdown: standard, destacado, premium)
- Status

// Features dinámicas (carga según categoría)
<FeatureFormBuilder
  category={provider.primary_category}
  currentFeatures={provider.features}
  onChange={handleFeaturesChange}
/>

// Control editorial (solo si tier === 'premium')
{tier === 'premium' && (
  <EditorialApprovalSection>
    <Checkbox
      name="has_quality_images"
      label="¿Tiene imágenes de calidad?"
    />
    <Checkbox
      name="has_complete_info"
      label="¿Información completa?"
    />
    <Checkbox
      name="editor_approved_for_premium"
      label="✅ APROBAR PARA PREMIUM"
      disabled={!has_quality_images || !has_complete_info}
    />
    <Textarea
      name="admin_notes"
      label="Notas internas"
    />
  </EditorialApprovalSection>
)}
```

---

## 📈 Analytics por Tier

Trackear métricas por tier para optimizar conversión:

```sql
SELECT
  tier,
  COUNT(*) as total_providers,
  AVG(views_count) as avg_views,
  AVG(clicks_count) as avg_clicks,
  AVG(inquiries_count) as avg_inquiries,
  AVG(clicks_count::float / NULLIF(views_count, 0)) as ctr,
  AVG(inquiries_count::float / NULLIF(clicks_count, 0)) as conversion_rate
FROM providers
WHERE status = 'active'
  AND created_at > now() - interval '30 days'
GROUP BY tier
ORDER BY
  CASE tier
    WHEN 'premium' THEN 1
    WHEN 'destacado' THEN 2
    WHEN 'standard' THEN 3
  END;
```

---

## ✅ Checklist de Implementación

### Frontend:
- [ ] Componente `ProviderCard` con lógica de tier
- [ ] Componente `ProviderLandingPage` (solo premium)
- [ ] Sistema de filtros dinámico
- [ ] Auth gates para campos "requires_login"
- [ ] Layout responsive por tier

### Backend:
- [ ] Migrar schema actual a nuevo
- [ ] Poblar `feature_definitions` desde CSV
- [ ] Funciones de búsqueda con JSONB
- [ ] Endpoints de filtrado
- [ ] RLS policies para features sensibles

### Admin:
- [ ] Form builder dinámico de features
- [ ] Control editorial para premium
- [ ] Gestión de tiers
- [ ] Preview de cards por tier
- [ ] Analytics dashboard

### SEO:
- [ ] Landing pages con SSR
- [ ] Metadata dinámica
- [ ] Structured data (schema.org)
- [ ] Sitemap dinámico
- [ ] Open Graph tags

---

**Conclusión**: Este sistema permite máxima flexibilidad, control editorial, y escalabilidad sin cambios de schema constantes.
