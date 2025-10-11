# MODTOK CMS v2.0 - Task Tracker

Este README reemplaza el template anterior y funciona como tablero vivo para aterrizar el nuevo modelo de datos, el CMS y el front con tiers. Mantenerlo al dia para coordinar al equipo.

## Contexto rapido
- Las migraciones del schema v2 ya se ejecutaron en la base de datos; el repo debe reflejar y versionar esos cambios.
- El modelo ahora usa solo tres categorias (`fabrica`, `casas`, `habilitacion_servicios`), features dinamicas en JSONB y un tier system (premium, destacado, standard) con control editorial.
- La prioridad inmediata es alinear el data layer y habilitar el CMS (providers + blog/noticias) sobre este modelo antes de extender features nuevas.
- La **UI pública de catálogo (cards por tier, filtros laterales, landings premium)** se trabajará más adelante; por ahora basta con que el back-office permita configurar toda la metadata. La única pieza orientada a visitantes que sí es prioritaria es el blog/noticias con foco SEO.

## Referencias clave
- `.context/backlog/new/00_EXECUTIVE_SUMMARY.md` - vision general y checklist de alto nivel.
- `.context/backlog/new/01_CSV_ANALYSIS.md` - mapeo completo de features y reglas por categoria/tier.
- `.context/backlog/new/02_NEW_SCHEMA.sql` - schema definitivo aplicado en la DB.
- `.context/backlog/new/03_FEATURES_DEFINITIONS.json` & `.context/backlog/new/06_SEED_FEATURES.sql` - metadata y seed de features.
- `.context/backlog/new/04_TIER_SYSTEM.md` - reglas de layout, gating y contenido por tier.
- `.context/backlog/new/05_MIGRATION_PLAN.md` - pasos y scripts sugeridos para migrar datos.
- `.context/backlog/new/07_ARCHITECTURE_DIAGRAM.md` - ERD y flujos.
- `.context/backlog/new/08_EXPORT_FEATURE_DEFINITIONS.sql` - query para exportar metadata.
- `.context/backlog/CMS_IMPLEMENTATION_PLAN.md` - plan maestro del CMS/back-office.
- `mockup/provider/ecomodular.html` - referencia visual para landing premium.

## Leyenda de prioridad
- **P0** bloqueante: debe quedar listo antes de tocar nuevas features o desplegar.
- **P1** alta: habilita entregables clave del CMS y contenido.
- **P2** normal: pulido, observabilidad y escalamientos posteriores.

## Como usar este README
- Actualizar los checkboxes y notas cuando se complete una tarea o cambie el alcance.
- Si una tarea se mueve de prioridad, duplicarla en la nueva seccion y marcar como "movida" en la anterior.
- Registrar en comentarios (al pie de este archivo o en `PROGRESS.md`) enlaces a PRs, scripts y decisiones.

### P0 - Alineamiento de datos (bloqueante)
1. [x] **Versionar schema v2 en Supabase**: crear migraciones incrementales en `supabase/migrations` basadas en `.context/backlog/new/02_NEW_SCHEMA.sql` y validar contra `database_schema_complete.sql` para evitar drift.
2. [x] **Seed de feature_definitions**: portar `.context/backlog/new/03_FEATURES_DEFINITIONS.json` a un script (`scripts/seed-feature-definitions.ts`) o migracion (`supabase/migrations/..._seed_feature_definitions.sql`) que mantenga la metadata sincronizada.
3. [x] **Script de migracion de datos**: implementar la logica de `.context/backlog/new/05_MIGRATION_PLAN.md` (providers, houses, service_products) en `scripts/migrate_features_to_jsonb.sql` y documentar ejecucion.
4. [x] **Regenerar tipos y enums**: correr `npx supabase gen types typescript --local > src/lib/database.types.ts` y ajustar `src/lib/types.ts`, `src/lib/utils.ts` y cualquier helper que reference enums antiguos.
5. [x] **Auditoria de categorias/tier legacy**: limpiar referencias a `decoracion` y enums viejos en `src/components/**`, `src/pages/admin/providers/*.astro`, `src/pages/onboarding/provider.astro` y `src/lib/auth.ts`.
6. [x] **Helpers y RLS para JSONB**: asegurar que las politicas en `supabase/migrations` cubren `features`, `feature_definitions` y los flags editoriales; exponer helpers en `src/lib/supabase.ts` y `src/lib/utils.ts` (por ejemplo `getFeatureValue`, `shouldShowFeature`).
7. [x] **Export job de features**: automatizar el query de `.context/backlog/new/08_EXPORT_FEATURE_DEFINITIONS.sql` (script en `scripts/export-feature-definitions.ts` o vista materializada) para respaldos y QA.
8. [x] **Limpieza de tablas/columnas obsoletas**: eliminar `decorations` y columnas legacy una vez migrado (nueva migracion en `supabase/migrations`) y actualizar seeds (`scripts/seed-super-admin-simple.sql`).

### P1 - Experiencia admin y contenido (alta)
1. [x] **Form builder dinamico en admin**: ✅ COMPLETADO - Implementados `useFeatureDefinitions` hook, `DynamicFeatureInput` y `FeatureFormBuilder`. Ver documentación en `docs/DYNAMIC_FORM_BUILDER.md`. Listo para integrar en formularios admin.
2. [ ] **Controles editoriales y tiers**: integrar `has_quality_images`, `has_complete_info`, `editor_approved_for_premium` y seleccion tier en `src/pages/admin/providers/[id]/edit.astro`, `src/components/admin/ProviderVerificationSystem.tsx` y `src/pages/admin/providers/create.astro` siguiendo `.context/backlog/new/04_TIER_SYSTEM.md`.
3. [ ] **CMS de blog/noticias (PRIORITARIO SEO)**: completar flujo admin (`src/pages/admin/content/blog/**`, `src/components/admin/pages/*`), editor de contenido (TipTap/Lexical), almacenamiento (Supabase Storage), render estatico (`src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`) con meta tags y Schema.org.
4. [ ] **Dashboards y aprobaciones con datos reales**: conectar `src/components/admin/AdminDashboard.tsx`, `src/components/admin/PendingApprovals.tsx` y `src/pages/admin/index.astro` a metricas reales (views/leads por tier, cola de aprobaciones, stats de contenido).
5. [ ] **Workflow de revision de contenido**: crear tabla `content_reviews` (nota: `admin_actions` ya existe) segun `.context/backlog/CMS_IMPLEMENTATION_PLAN.md` y exponer UI en `src/pages/admin/content/index.astro`.
6. [ ] **Onboarding y control de cuentas proveedor mejorado**: implementar wizard con pasos claros en `src/pages/onboarding/provider.astro`, revisar `src/lib/auth.ts` para forzar cambio de password y asegurar compatibilidad con flags nuevos del tier system.

### P2 - Consolidacion, QA y growth (normal)
1. [ ] **Busqueda y APIs de filtro**: optimizar endpoints en `src/pages/api/admin/**` y crear endpoints publicos (`src/pages/api/catalog/*.ts`) que usen indices GIN segun `.context/backlog/new/05_MIGRATION_PLAN.md`.
2. [ ] **SEO y datos estructurados**: agregar helpers en `src/utils/seo.ts` (crear si no existe) y aplicar Schema.org/OG en `src/pages/catalog/index.astro`, `src/pages/providers/[slug]/index.astro` y `src/pages/blog/[slug].astro`.
3. [ ] **Testing integral**: configurar Vitest/Playwright (estructura sugerida en `tests/` nuevo), cubrir helpers (JSONB, filtros), RLS y flujos admin.
4. [ ] **Observabilidad y analiticas**: instrumentar metricas en `src/components/admin/StatCard.tsx`, exponer consultas en `supabase/migrations` (materialized views) y registrar eventos (considerar `supabase/functions` para webhooks).
5. [ ] **Documentacion y playbooks**: crear `docs/` con guias (migracion, edicion de contenido, manejo tiers) y mantener `PROGRESS.md` / `PROGRESS_3.md` sincronizados.
6. [ ] **Performance y caching**: evaluar caches (edge, SWR) en `src/pages/catalog/*`, agregar indices adicionales (`supabase/migrations`), monitorizar con `supabase`/`Railway`.
7. [ ] **Backlog de mejoras**: features comerciales (upsells, badges), provider self-service, analytics avanzadas (ver `.context/backlog/CMS_IMPLEMENTATION_PLAN.md`) - mover aqui ideas nuevas.
8. [ ] **(Movida) Catálogo público y filtros**: construir las cards por tier y sidebar de filtros para el sitio público (`src/pages/catalog/index.astro`, `src/components/catalog/ProviderCard.tsx`) una vez que el CMS esté estable.
9. [ ] **(Movida) Landing premium reutilizable**: publicar plantilla de landing premium en `src/pages/providers/[slug]/index.astro` usando las reglas de `.context/backlog/new/04_TIER_SYSTEM.md` cuando retomemos el front.

## Entregables y checkpoints
- Scripts de migracion y seeds ejecutables (firmados en repositorio).
- Nuevos componentes/catalogo desplegados en staging.
- Documentacion de admin actualizada antes de production.
- Pruebas (unitarias e integracion) pasando en CI antes de promover a produccion.

## Registro rapido
Anotar aqui decisiones, blockers o enlaces importantes:
- **2025-10-11**: ✅ Auditoria completa P0 + limpieza frontend
  - Verificado schema v2 en Supabase: 123 features, 3 categorias, tier system OK
  - Eliminada categoria "decoraciones" del menu admin y archivos legacy
  - Reordenadas tareas P1 priorizando CMS Blog (SEO critico)
  - Corregido typo "a5" → "3" y aclarado que `admin_actions` ya existe
- **2025-10-11**: ✅ P1.1 Form Builder Dinamico COMPLETADO
  - Creado hook `useFeatureDefinitions` para cargar metadata de Supabase
  - Creado componente `DynamicFeatureInput` que renderiza inputs según tipo de dato
  - Creado componente `FeatureFormBuilder` con agrupación, progreso y validaciones
  - Documentación completa en `docs/DYNAMIC_FORM_BUILDER.md`
  - Siguiente paso: P1.2 Controles editoriales y tiers
