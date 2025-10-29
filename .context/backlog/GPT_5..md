¡vamos! hice una pasada completa por tu material (moodboard/visión, el schema/ERD actual y tu README de tareas). Resumen rapidísimo: tu base está bien encaminada para **tiers + rotación por slots**, pero hay 4 puntos que conviene corregir para que no se “cruce” la capa editorial con la de monetización, y para que los formularios pidan **los filtros correctos en el lugar correcto**.   

---

# Lo clave que corregiría (decisiones)

1. **Separar “tier de catálogo” del “tier pagado” (slots).**

   * Mantén `tier` en *providers/houses/service_products* como **prioridad editorial/base** (lo que tú decides mostrar mejor o peor por calidad).
   * Trátalo aparte del **slot pagado** (que da exposición real en home). El “pago” debe vivir en una tabla de **orders/entitlements**; la home lee solo “órdenes activas” para rotar. Hoy `homepage_slots` mezcla posición y compra; lo normalizo abajo.

2. **Filtros/Features en el lugar correcto.**

   * **Provider**: capacidades de la empresa (p.ej. *diseño personalizado, financiamiento, cobertura, tecnologías*).
   * **House**: prestaciones del modelo (*m2, dormitorios, termopanel, SIP, tiempos, garantía*).
   * **Service**: alcance/unidad/precio/rango y *features* de instalación/habilitación (los checkboxes de tus formularios H&S).
   * Por eso, **no** preguntes “filtros de casa/servicio” al crear *provider*. Pídelos cuando se crea **cada ítem** (house/service) y deja en *provider* solo lo corporativo. Esto está alineado con tu constructor de formularios dinámicos por categoría. 

3. **Dependencias fuertes por tipo de proveedor.**

   * **House → provider.is_manufacturer = true** (ya lo tienes como trigger; refuerzo abajo).
   * **Service → provider.is_service_provider = true** (ídem).
   * Además, propongo *upsert* automático: si insertas una house/servicio y el flag está en `false`, el trigger lo eleva a `true` (con histórico de auditoría), en lugar de fallar.

4. **Cálculo de visibilidad efectiva.**

   * Crea una *view* `catalog_visibility_effective` que combine: `tier` editorial **+** existe(orden de slot activo).
   * Reglas simples: si hay slot **premium** activo ⇒ `effective_tier='premium'`; si no, cae al `tier` editorial del propio item; si el item no tiene `tier` propio, hereda el del provider.

---

# Schema v3 (migración propuesta)

> Mantiene tu diseño general y añade normalización mínima para separar **compras de slot** vs **posiciones**, lookup de regiones/cobertura, media y visibilidad efectiva. (PostgreSQL)

```sql
BEGIN;

-- 1) LOOKUPS BÁSICOS
CREATE TABLE IF NOT EXISTS regions_lkp (
  code TEXT PRIMARY KEY,        -- "RM", "V", ...
  name TEXT NOT NULL UNIQUE     -- "Región Metropolitana", etc.
);

-- Normaliza coberturas de providers
CREATE TABLE IF NOT EXISTS provider_coverage_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  region_code TEXT NOT NULL REFERENCES regions_lkp(code) ON DELETE RESTRICT,
  UNIQUE (provider_id, region_code)
);

-- 2) MEDIA ASSETS (opcional pero útil para tu CMS/galerías)
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type TEXT NOT NULL CHECK (owner_type IN ('provider','house','service_product','blog','news')),
  owner_id UUID NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('image','video','pdf','plan')),
  url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_media_assets_owner ON media_assets(owner_type, owner_id);

-- 3) TIERS EDITORIALES (lo que ya tienes, solo refuerzo)
-- Asegura valores legales y coherencia de landing premium
ALTER TABLE providers
  ADD CONSTRAINT chk_provider_tier CHECK (tier IN ('premium','destacado','standard'));

ALTER TABLE houses
  ADD CONSTRAINT chk_house_tier CHECK (tier IN ('premium','destacado','standard'));

ALTER TABLE service_products
  ADD CONSTRAINT chk_service_tier CHECK (tier IN ('premium','destacado','standard'));

-- "Sólo premium puede tener landing"
CREATE OR REPLACE FUNCTION enforce_landing_only_premium() RETURNS trigger AS $$
BEGIN
  IF NEW.has_landing_page = true AND NEW.tier <> 'premium' THEN
    RAISE EXCEPTION 'Solo items premium pueden tener landing';
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_landing_only_premium_prov ON providers;
CREATE TRIGGER trg_landing_only_premium_prov
  BEFORE INSERT OR UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION enforce_landing_only_premium();

DROP TRIGGER IF EXISTS trg_landing_only_premium_house ON houses;
CREATE TRIGGER trg_landing_only_premium_house
  BEFORE INSERT OR UPDATE ON houses
  FOR EACH ROW EXECUTE FUNCTION enforce_landing_only_premium();

DROP TRIGGER IF EXISTS trg_landing_only_premium_srv ON service_products;
CREATE TRIGGER trg_landing_only_premium_srv
  BEFORE INSERT OR UPDATE ON service_products
  FOR EACH ROW EXECUTE FUNCTION enforce_landing_only_premium();

-- 4) NORMALIZAR SLOTS (compra/entitlement vs posiciones visibles)
-- a) Definición de posiciones visibles por tipo (configurable desde admin)
CREATE TABLE IF NOT EXISTS slot_positions (
  id SERIAL PRIMARY KEY,
  slot_type TEXT NOT NULL CHECK (slot_type IN ('premium','destacado')),
  visible_count INT NOT NULL CHECK (visible_count > 0),
  UNIQUE (slot_type)
);
-- Seed sugerido: ('premium',2), ('destacado',4)

-- b) Orden/entitlement comprado (una fila = un "derecho" a entrar en la rotación)
CREATE TABLE IF NOT EXISTS slot_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_type TEXT NOT NULL CHECK (slot_type IN ('premium','destacado')),
  content_type TEXT NOT NULL CHECK (content_type IN ('provider','house','service_product')),
  content_id UUID NOT NULL,
  monthly_price NUMERIC(12,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rotation_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT chk_dates CHECK (end_date >= start_date)
);
CREATE INDEX IF NOT EXISTS idx_slot_orders_active
  ON slot_orders(slot_type, is_active, start_date, end_date, rotation_order);

-- Evitar duplicados solapados (mismo contenido, mismo tipo, mismas fechas)
CREATE UNIQUE INDEX IF NOT EXISTS uq_slot_orders_overlap
ON slot_orders (content_type, content_id, slot_type, start_date, end_date);

-- c) (Opcional) Estado de rotación para cada tipo, si quieres rotar server-side
CREATE TABLE IF NOT EXISTS slot_rotation_state (
  slot_type TEXT PRIMARY KEY CHECK (slot_type IN ('premium','destacado')),
  last_rotation_at TIMESTAMPTZ,
  last_pointer INT DEFAULT 0
);

-- 5) TRIGGERS DE COHERENCIA PROVIDER<->HIJOS (auto-elevar flags)
CREATE OR REPLACE FUNCTION ensure_provider_flags() RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'houses' THEN
    UPDATE providers SET is_manufacturer = true WHERE id = NEW.provider_id AND is_manufacturer = false;
  ELSIF TG_TABLE_NAME = 'service_products' THEN
    UPDATE providers SET is_service_provider = true WHERE id = NEW.provider_id AND is_service_provider = false;
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ensure_provider_flags_house ON houses;
CREATE TRIGGER trg_ensure_provider_flags_house
  AFTER INSERT ON houses
  FOR EACH ROW EXECUTE FUNCTION ensure_provider_flags();

DROP TRIGGER IF EXISTS trg_ensure_provider_flags_service ON service_products;
CREATE TRIGGER trg_ensure_provider_flags_service
  AFTER INSERT ON service_products
  FOR EACH ROW EXECUTE FUNCTION ensure_provider_flags();

-- 6) CÁLCULOS ÚTILES
-- price_per_m2 automático si falta y hay datos
CREATE OR REPLACE FUNCTION calc_price_per_m2() RETURNS trigger AS $$
BEGIN
  IF NEW.price IS NOT NULL AND NEW.area_m2 IS NOT NULL AND (NEW.price_per_m2 IS NULL OR NEW.price_per_m2 = 0) THEN
    NEW.price_per_m2 := ROUND(NEW.price / NULLIF(NEW.area_m2,0), 2);
  END IF;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calc_ppm2 ON houses;
CREATE TRIGGER trg_calc_ppm2
  BEFORE INSERT OR UPDATE OF price, area_m2, price_per_m2 ON houses
  FOR EACH ROW EXECUTE FUNCTION calc_price_per_m2();

-- 7) VISIBILIDAD EFECTIVA (view)
CREATE OR REPLACE VIEW catalog_visibility_effective AS
WITH active_orders AS (
  SELECT so.*
  FROM slot_orders so
  WHERE so.is_active = true
    AND so.start_date <= CURRENT_DATE
    AND so.end_date >= CURRENT_DATE
)
SELECT
  'provider' AS entity_type, p.id AS entity_id,
  COALESCE(
    (SELECT 'premium'::text FROM active_orders ao WHERE ao.content_type='provider' AND ao.content_id=p.id AND ao.slot_type='premium' LIMIT 1),
    (SELECT 'destacado' FROM active_orders ao WHERE ao.content_type='provider' AND ao.content_id=p.id AND ao.slot_type='destacado' LIMIT 1),
    p.tier
  ) AS effective_tier
FROM providers p
UNION ALL
SELECT
  'house', h.id,
  COALESCE(
    (SELECT 'premium' FROM active_orders ao WHERE ao.content_type='house' AND ao.content_id=h.id AND ao.slot_type='premium' LIMIT 1),
    (SELECT 'destacado' FROM active_orders ao WHERE ao.content_type='house' AND ao.content_id=h.id AND ao.slot_type='destacado' LIMIT 1),
    h.tier
  )
FROM houses h
UNION ALL
SELECT
  'service_product', s.id,
  COALESCE(
    (SELECT 'premium' FROM active_orders ao WHERE ao.content_type='service_product' AND ao.content_id=s.id AND ao.slot_type='premium' LIMIT 1),
    (SELECT 'destacado' FROM active_orders ao WHERE ao.content_type='service_product' AND ao.content_id=s.id AND ao.slot_type='destacado' LIMIT 1),
    s.tier
  )
FROM service_products s;

COMMIT;
```

**Cómo se usa en la Home (round-robin):**

```sql
-- 1) lee cuántos mostrar de cada tipo
SELECT visible_count FROM slot_positions WHERE slot_type='premium';  -- ej: 2

-- 2) toma órdenes activas de ese tipo, ordenadas por rotation_order
WITH pool AS (
  SELECT * FROM slot_orders
  WHERE slot_type='premium' AND is_active
    AND start_date<=CURRENT_DATE AND end_date>=CURRENT_DATE
  ORDER BY rotation_order
)
SELECT * FROM pool LIMIT (SELECT visible_count FROM slot_positions WHERE slot_type='premium');
```

> Si rotas **client-side**, basta con paginar ese `pool` en el front. Si prefieres **server-side**, usa `slot_rotation_state` como puntero.
> Esto deja el *tier editorial* para búsquedas/listados, y el *slot pagado* para la franja de home, tal cual tu visión. 

---

# Formularios: qué pedir en cada uno

* **Provider (empresa)**

  * Datos corporativos, *capabilities* (features “corporativas”: diseño estándar/personalizado, financiamiento, tecnología SIP/madera/hormigón, logística, postventa), coberturas (tabla normalizada), redes, landing premium (si `tier='premium'`), flags editoriales.
  * **No** pidas “ventanas termopanel/Baños/Dormitorios”: eso es **de la casa**.
  * **No** pidas “precio por m2 del servicio X”: eso es **del servicio**.

* **House (modelo)**

  * Especificaciones técnicas + features “de producto” (ventanas, revestimientos, pisos, tiempos, garantía), medios, planos, `price/area_m2` (trigger calcula `price_per_m2`), SEO/landing si premium.
  * Selector de fabricante obligatorio; si no existe, *modal* “crear fabricante rápido”. (Esto ya lo tienes avanzado). 

* **Service (habilitación & servicios)**

  * Tipo/familia, unidad de precio (por m²/hora/proyecto), rango de precios, cobertura, features específicas (antenas, paneles solares, riego, etc.), SEO/landing si premium.
  * Selector de proveedor H&S obligatorio; *modal* “crear proveedor rápido”. 

---

# Backlog preciso (lo que queda por hacer)

### P0 – Esquema & Core (bloqueante)

* [ ] Aplicar migración **Schema v3** (bloque SQL arriba).
* [ ] Cargar `regions_lkp` y migrar `coverage_areas` a `provider_coverage_regions`.
* [ ] Reemplazar uso de `homepage_slots` por **slot_orders + slot_positions** en API/UI admin.
* [ ] Crear *view* `catalog_visibility_effective` y actualizar queries de catálogo para usar `effective_tier` en ordenamiento.

### P1 – Admin/CMS

* [ ] **ProviderForm**: mover “filtros de casa/servicio” fuera; dejar solo *capabilities corporativas* y cobertura normalizada.
* [ ] **HouseForm / ServiceForm**: integrar **FeatureFormBuilder** por categoría (ya lo tienes), validando contra `feature_definitions`. 
* [ ] **Slots Admin**: refactor a `slot_orders` (crear/editar/activar/desactivar, previsualización round-robin leyendo `slot_positions`).
* [ ] **Media Manager**: opcional, pero deja lista `media_assets` para galerías y planos.

### P1 – Integridad & UX

* [ ] Triggers “auto-elevar flag” (`ensure_provider_flags`) activos y probados (unit tests).
* [ ] Validación “landing solo premium” en los 3 tipos (tests).
* [ ] Slugs únicos **por tipo** + canonical builders (evitar conflicto de `/casa/` vs `/fabricante/`).
* [ ] Índices GIN en `features` (búsqueda rápida por filtros).

### P2 – Catálogo Público

* [ ] Home `/` leyendo `slot_positions` + `slot_orders` (premium 2, destacados 4) con rotación.
* [ ] `/casas`, `/fabricantes`, `/habilitacion-y-servicios` usando filtros dinámicos por categoría.
* [ ] “Hotspots” (tabla simple `hotspots` + landings por región/ciudad). (Referencias de tu moodboard/visión). 

### P2 – Analytics & Growth

* [ ] Materialized views para KPIs (views/clicks/leads por `effective_tier`).
* [ ] Notificaciones de expiración de `slot_orders`.
* [ ] AB testing simple de orden de rotación (opcional).

---

# Por qué esto alinea con tu visión

* Tu **modelo de negocio** es “vender visibilidad” (slots con rotación); al separar **entitlement** (slot_orders) de **tier editorial**, evitas inconsistencias y puedes **vender combos** (p.ej., *provider premium + 1 casa destacada*) sin pelearte con flags de columnas. 
* La **experiencia de usuario** y tus formularios quedan limpios: cada cosa en su lugar (empresa vs producto/servicio). Las capturas de formulario H&S/Manufacturer que compartiste se traducen 1:1 a **features por categoría**, no al provider genérico. (Moodboard+wireframes hablan justo de esto: foco en imágenes y filtros potentes). 

Si quieres, en la próxima iteración te dejo los **endpoints** y ejemplos de consultas (TypeScript) leyendo `catalog_visibility_effective` + `slot_orders` y la **UI de admin** ajustada a este cambio.
