¡Está muy bueno, Lucas! Se nota orden y criterio. Te dejo feedback “duro pero justo” para dejarlo redondo:

# Lo excelente (mantén)

* **Modelo mental claro**: *Provider = identidad*, *ManufacturerProfile = declaración*, *Houses/Services = verificación*. ✔️
* **Cobertura B+** con deltas e “inherit/override”. ✔️
* **Vistas para facetas** y endpoint `/manufacturers` con filtros concretos. ✔️
* **Seeds útiles** y plan de migraciones en orden lógico (pre-check → DDL → backfill → constraints → cleanup). ✔️

# Inconsistencias que debes alinear ya (P0)

1. **Estado global contradictorio**

   * Arriba dices “Database 100%” y “20 columnas obsoletas eliminadas”, pero en *Hallazgos DB* marcas `manufacturer_profiles` como faltante y `providers` “con campos obsoletos”.
     ✅ Acciones:
   * Si **ya eliminaste** columnas de `providers`, borra la tabla “Columnas Obsoletas” o muévela a historial.
   * Si **NO** las eliminaste aún (Fase 4), ajusta “Database 100%” → **<100%** y marca `DB-MIG-005` como pendiente.
2. **P0s completados vs. pendientes**

   * Dices “**TODAS las P0 completadas**”, pero abajo pones **ADMIN-TAB-001** como P0 “pendiente”.
     ✅ Acciones: o cambias prioridad de ADMIN-TAB-001 a P1, o actualizas el resumen de P0 a “9/10”.
3. **Frontend Admin 100%** vs. **ADMIN-TAB-001 pendiente**

   * Si la pestaña “Fabricantes” aún no está, **Frontend Admin** no está 100%.
     ✅ Acciones: baja a 6/7 o marca ADMIN-TAB-001 como completada.
4. **Facet truth precedence**

   * En `manufacturer_facets_effective` usas `COALESCE(verificado, declarado)`. Eso está bien para “true”, pero **no modela el ‘false verificado’** (ausencia de evidencia ≠ evidencia de ausencia).
     ✅ Acciones (elige una):
   * **A.** Mantener lógica actual y documentar: sólo *true verificado* tiene precedencia; *false* no se fuerza.
   * **B.** Cambiar el verificado a **conteos** (`count_true`, `count_total`) y derivar bools (p.ej. `count_true > 0`).
   * **C.** Añadir campos `verified_false_*` (es más pesado, solo si negocio lo necesita).
5. **Tri-estado vs. booleanos**

   * En `manufacturer_profiles` los flags son `BOOLEAN NULL`. `NULL` (=desconocido) es distinto de `FALSE`. El admin debe verlo como **(✔ / ✖ / ?) **.
     ✅ Acciones: explicita en el doc que **NULL = desconocido** y refleja eso en UI (tercer estado).

# Riesgos & mejoras técnicas (priorizadas)

## P0

* **RLS/seguridad (Supabase)**
  Define políticas para que `manufacturer_facets_effective` y endpoints públicos **solo** expongan `status='active'` y campos permitidos.
  *Snip:*

  ```sql
  -- Ejemplo RLS público para la vista materializada o normal:
  ALTER TABLE manufacturer_facets_effective ENABLE ROW LEVEL SECURITY;
  CREATE POLICY pub_read ON manufacturer_facets_effective
    FOR SELECT USING (status = 'active');
  ```
* **Índices para filtros reales**
  Si filtras por `servicios[]/especialidad[]`, los booleans en vista no generan índices útiles. Considera **materializar** y **indexar**.
  *Snip (MV):*

  ```sql
  CREATE MATERIALIZED VIEW IF NOT EXISTS manufacturer_facets_effective_mv AS
  SELECT * FROM manufacturer_facets_effective;
  CREATE INDEX IF NOT EXISTS idx_mfe_mv_status ON manufacturer_facets_effective_mv(status);
  CREATE INDEX IF NOT EXISTS idx_mfe_mv_house_count ON manufacturer_facets_effective_mv(house_count DESC);
  -- (Opcional) índices parciales por flags más usados
  ```

  Y **refresh** en cambios:

  ```sql
  CREATE OR REPLACE FUNCTION refresh_mfe_mv()
  RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN
    PERFORM refresh_materialized_view_concurrently('manufacturer_facets_effective_mv');
    RETURN NULL;
  END $$;
  -- Triggers en houses / manufacturer_profiles / provider_coverage_regions
  ```

  *(Si no puedes CONCURRENTLY en Supabase, usa job periódico + caché en API.)*

## P1

* **Cache y versionado API**

  * `GET /manufacturers`: añade **ETag** + `Cache-Control: max-age=300` (ya mencionas 5m de cache).
  * Define `v1` en rutas o en header para evitar romper integraciones.
* **Validaciones de dominio**

  * `precio_ref_min_m2 < precio_ref_max_m2` (CHECK).
  * CLP como **INTEGER** (sin decimales) para evitar rounding.
  * Unicidad `slug` y `company_name` “soft unique” (ciudades homónimas):

    ```sql
    CREATE UNIQUE INDEX IF NOT EXISTS uq_providers_slug ON providers(slug);
    ```
* **Búsqueda por texto** (listados y admin):

  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE INDEX IF NOT EXISTS idx_providers_company_trgm
    ON providers USING gin (company_name gin_trgm_ops);
  ```
* **Auditoría**
  Ya propones `admin_actions`. Añade **trigger `updated_at`** en tablas clave:

  ```sql
  CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
  CREATE TRIGGER t_providers_touch BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
  -- idem houses, manufacturer_profiles, service_products
  ```

## P2

* **Sitemaps/SEO**: `/fabricantes` con `sitemap.xml` y páginas de detalle (si existen).
* **Observabilidad**: métrica de *search hit ratio* por filtro y latencia P95; alerta si >800ms.
* **OpenAPI/SDK**: publica spec de `/manufacturers` y admin endpoints para autogenerar cliente TS.
* **Revisión de normalización**: a medio plazo, pasar los “flags” de manufacturer a **listas normalizadas** (`services_lkp`, `specialties_lkp`) o a `JSONB` con **CHECK** de claves válidas (evitas migraciones por cada nueva capability).

# Nits de calidad (rápidos)

* **Orden de sort estable**: al final añade `, mfe.company_name ASC` (ya lo haces, bien).
* **Determinismo de paginación**: incluye `provider_id ASC` como último crit.
* **Idempotencia**: `/ingest/providers` ya usa `idempotency_key` — documenta colisión y TTL.
* **Null safety en vistas**: usa `COALESCE(..., FALSE)` en bools verificados si quieres evitar nulos en respuesta pública.
* **Naming**: unifica prefijos `v_` en *house_facets_by_provider* o elimínalos, pero sé consistente.

# Pequeños ajustes al documento

* En **“Vistas Faltantes (P0)”**: si ya existen, muévelo a “Vistas Implementadas” con el DDL real (para evitar doble fuente).
* En **“Plan de Corte”**: antes del DROP definitivo, añade **snapshot** de columnas obsoletas a tabla `providers_obsolete_snapshot_YYYYMMDD`.
* En **“Checklist Post-Deploy”**: agrega “RLS revisadas” y “ETag/caché habilitado”.

---

## Mini-verificaciones (copiar/pegar)

**Booleans tri-estado coherentes:**

```sql
-- 'desconocido' si todos NULL y sin verificación
SELECT provider_id
FROM manufacturer_facets_effective
WHERE NOT COALESCE(dise_std, FALSE)
  AND NOT COALESCE(dise_pers, FALSE)
  AND (has_verified = FALSE OR has_verified IS NULL);
```

**Región efectiva de servicios (smoke):**

```sql
SELECT s.id, array_agg(r.region_code ORDER BY r.region_code)
FROM service_products s
JOIN service_product_effective_regions r ON r.service_product_id = s.id
GROUP BY s.id
LIMIT 10;
```

**Latency guardrail (DB-side):**

```sql
EXPLAIN ANALYZE
SELECT * FROM manufacturer_facets_effective
WHERE status='active' AND (rm_code = ANY(regions)); -- adapta a tu filtro real
```

---

### Veredicto

Estás **muy bien encaminado**. Lo único que “chirría” es la **desalineación de estados** (completado vs. faltante) y la **semántica de verificación** (evidencia positiva vs. “falso verificado”). Si corriges esas dos cosas y añades RLS + (opcional) MV con refresh, quedas con un **MVP sólido y escalable**. ¿Te dejo un diff propuesto del documento para que lo pegues tal cual y lo dejes consistente?
