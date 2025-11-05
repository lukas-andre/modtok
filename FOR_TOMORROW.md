# MODTOK - Tareas Pendientes para Mañana

**Fecha:** 2025-10-30
**Última actualización:** 03:52 UTC

---

## 🔴 URGENTE - Bugs & Correcciones

### ✅ COMPLETADO HOY
- ✅ Fix ruta edit de casas (`/admin/catalog/houses/` → `/admin/houses/`)
- ✅ Verificada tabla `house_topologies` (existe y funciona)
- ✅ Implementada sección "Casas Similares"
- ✅ Sistema de error handling con ErrorBanner

---

## 🎯 PRIORIDAD ALTA - Lógica de Negocio

### ✅ 1. Landing Pages solo para Premium (COMPLETADO)
**Problema:** Al parecer todos están teniendo página/landing, solo los PRO deberían poder tener.

**Implementación:**
- ✅ Creada tabla `provider_landings` para control editorial de fabricantes
- ✅ Actualizada vista `manufacturer_facets_effective` con campo `has_landing` derivado
- ✅ Lógica: `tier='premium'` + `provider_landings.enabled` + `editorial_status='published'`
- ✅ Verificación en `/fabricantes/[slug].astro` con redirect a `/fabricantes`
- ✅ Verificación en `/casas/[slug].astro` con redirect a `/` (tier + has_landing_page)
- ✅ Triggers DB que validan solo premium puede tener landing
- ✅ UI Admin para gestionar landing pages de fabricantes
- ✅ API pública GET `/api/manufacturers` con campo `has_landing`

**Arquitectura:**
- Fabricantes: `manufacturer_profiles.tier` + tabla editorial `provider_landings`
- Casas: `houses.tier` + `houses.has_landing_page` (enfoque producto)

**Tiempo real:** 1.5 horas

---

### 2. Revisar Sistema de Slots
**Problema:** Slot no funca.... y no sé si tiene sentido ahora que podemos controlar tiers en cada Fabrica/H&B/Casas.

**Acciones:**
- [ ] Revisar `/admin/slots/` y determinar si aún tiene sentido
- [ ] Si NO: eliminar código relacionado
- [ ] Si SÍ: arreglar funcionalidad

**Estimación:** 2 horas (análisis + decisión + implementación/eliminación)

---

## 🎨 DISEÑO & UX - Frontend Público

### 3. UI/UX Elegante del Lado del Cliente
**Objetivo:** Layouts elegantes muy diferentes al admin panel. Seguir usando azul, verde y la fuente, pero otra onda.

**Áreas a mejorar:**
- [ ] `/casas/[slug].astro` - Mejorar diseño de detalle
- [ ] `/fabricantes/[slug].astro` - Mejorar diseño de perfil
- [ ] Home page - Diseño más atractivo
- [ ] Listados/catálogos (cuando existan)

**Referencias:**
- Admin: layouts funcionales y sobrios
- Cliente: elegante, moderno, espacioso

**Estimación:** 4-6 horas

---

### 4. Quitar Emojis
**Objetivo:** Eliminar emojis de la interfaz.

**Archivos a revisar:**
- [ ] `/components/ErrorBanner.astro` (🔍 ⚠️ 🔒 ❌)
- [ ] Admin layouts (si tienen emojis)
- [ ] Badges de status

**Estimación:** 30 minutos

---

## ⚙️ MEJORAS TÉCNICAS - Backend/DB

> **Detalle completo:** `.context/logs/MODTOK_PENDING_FIXES.md`

### 5. Validaciones de Dominio (FB-P1.2)
- [ ] Precio min < precio max en `manufacturer_profiles`
- [ ] Slug único en `providers`

**Estimación:** 30 min

---

### 6. Búsqueda por Texto (FB-P1.3)
- [ ] Extensión pg_trgm
- [ ] Índice GIN en `company_name`

**Estimación:** 20 min

---

### 7. Triggers `updated_at` (FB-P1.4)
- [ ] Auto-actualizar `updated_at` en providers, houses, services

**Estimación:** 40 min

---

### 8. Documentar Tri-estado NULL (FB-P1.5)
- [ ] Clarificar NULL = desconocido, TRUE = disponible, FALSE = no disponible
- [ ] Actualizar UI admin con 3 estados (✔ / ✖ / ?)

**Estimación:** 1 hora

---

## 📈 OPCIONAL - SEO & Docs

### 9. Sitemap.xml (FB-P2.1)
- [ ] Generar sitemap para `/fabricantes` y `/casas`

**Estimación:** 1 hora

---

### 10. OpenAPI Spec (FB-P2.2)
- [ ] Documentar APIs públicas con OpenAPI

**Estimación:** 3 horas

---

## 📊 Resumen de Tiempo Estimado

| Categoría | Tareas | Tiempo Total |
|-----------|--------|--------------|
| **Urgente** | 0 | 0h (completado) |
| **Prioridad Alta** | 1 → 2 completadas | ~1.5h → ~1.5h pendiente |
| **Diseño & UX** | 2 | ~5h |
| **Mejoras Técnicas** | 4 | ~2.5h |
| **SEO & Docs** | 2 | ~4h |
| **TOTAL** | 9 pendientes | **~13 horas** |

---

## 🎯 Recomendación para Mañana

**Sprint enfocado (4-6 horas):**
1. Landing pages solo PRO (1h)
2. Decisión sobre Slots (2h)
3. Quitar emojis (30min)
4. Validaciones DB + Triggers (1h)
5. Búsqueda trigram (20min)

**Resultado:** Lógica de negocio clara + base técnica sólida

---

## 📁 Referencias

- **Detalle de bugs resueltos:** `.context/logs/MODTOK_PENDING_FIXES.md`
- **Feedback técnico completo:** `.context/logs/MODTOK_UNIFIED_TASKS_FEEDBACK.md`
- **Tareas unificadas:** `.context/logs/MODTOK_UNIFIED_TASKS.md`

---

## 🚀 MEJORAS FUTURAS - Landing Pages (Fabricantes, Casas y Servicios)

### Landing Pages Avanzadas (Aplicable a todos los tipos)

**Features Editoriales:**
- [ ] Editor visual de secciones: JSON editor para `sections` field con bloques drag-and-drop
- [ ] Templates personalizados: Múltiples plantillas visuales (default, premium, showcase, modern, etc.)
- [ ] Preview en tiempo real: Vista previa sin publicar (staging URL)
- [ ] Scheduled publishing: Programar fecha/hora de publicación automática
- [ ] Version history: Historial de cambios con rollback

**SEO & Marketing:**
- [ ] SEO score automático: Análisis de meta tags, keywords, structure
- [ ] Image optimizer: CDN integrado para optimizar og_image_url y gallery
- [ ] Rich snippets: Schema.org automático por tipo (Organization, Product, Service)
- [ ] Redirects manager: Gestión de redirects 301 para cambios de slug
- [ ] Sitemap automático: Generación dinámica de sitemap.xml con landings activas

**Analytics & Testing:**
- [ ] Analytics dashboard: Tracking de visitas, conversiones, bounce rate por landing
- [ ] A/B Testing: Múltiples versiones de landing para comparar performance
- [ ] Heatmaps: Mapas de calor de interacciones de usuario
- [ ] Conversion tracking: Goals y funnels por landing page

**Operaciones Bulk:**
- [ ] Bulk enable/disable: Habilitar/deshabilitar múltiples landings a la vez
- [ ] Bulk SEO update: Actualizar meta tags en batch
- [ ] Import/Export: Importar configuraciones de landing desde CSV/JSON
- [ ] Duplicate landing: Clonar configuración para crear nuevas landings rápido

**Integraciones:**
- [ ] WhatsApp Business API: Botón de contacto directo con tracking
- [ ] Email marketing: Forms integrados con Mailchimp/SendGrid
- [ ] CRM integration: Leads automáticos a HubSpot/Salesforce
- [ ] Social proof: Integración con reviews de Google/Facebook

**Performance:**
- [ ] Static generation: Pre-renderizar landings para mejor performance
- [ ] CDN caching: Cache estratégico por tier y región
- [ ] Lazy loading: Carga progresiva de imágenes y secciones
- [ ] Progressive Web App: PWA para landings mobile-first

**Estimación total:** 40-60 horas (priorizar según ROI)

En notado que no piden ninguna caracterista, debería almenos agregar 1 feature para crear casas/providers/h&s