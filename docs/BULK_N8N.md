¡De una! Aquí tienes una **guía práctica para integrar n8n** con tu endpoint **Option A** (`/api/admin/bulk/import`) y dejar a tu agente importando providers, perfiles de fabricante, cobertura, houses y services en **un solo batch idempotente**.

---

# Guía de Integración n8n → Bulk Import

## 0) Objetivo

Construir un workflow en n8n que:

* Tome datos desde tus fuentes (CSV/Sheets/API).
* Los **mapee** al contrato del **bulk import** (Option A).
* Aplique **idempotencia** (Idempotency-Key + Hash).
* Soporte **dry-run**, **chunking**, **reintentos** y **logging** de errores parciales (HTTP 207).

---

## 1) Prerrequisitos

* **Endpoint**: `POST /api/admin/bulk/import`
* **Auth**: `Authorization: Bearer <API_TOKEN>`
* **Headers**:

  * `Idempotency-Key: <uuid-v4>`
  * `Idempotency-Hash: <sha256 del body canonicalizado>`
* **Contrato base (resumen)**:

  ```json
  {
    "schema_version": "1.0",
    "options": { "dry_run": false, "atomic": false, "default_mode": "upsert", "autocreate_providers": true },
    "providers": { "mode": "upsert", "items": [ ... ] },
    "manufacturer_profiles": { "mode": "upsert", "items": [ ... ] },
    "provider_coverage": { "mode": "upsert", "items": [ ... ] },
    "houses": { "mode": "upsert", "items": [ ... ] },
    "services": { "mode": "upsert", "items": [ ... ] }
  }
  ```

---

## 2) Diseño del workflow (alto nivel)

1. **Trigger**

   * Manual para pruebas; luego **Cron** (ej. cada 4 h) o **Webhook**.

2. **Fuente de datos**

   * Uno de: **Google Sheets**, **Read Binary File (CSV)** + **Spreadsheet File**, **HTTP Request** (si scrapeas), **Postgres**/**Supabase** Node.

3. **Normalize/Map (Function)**

   * Limpia y normaliza filas.
   * Construye arrays: `providers.items`, `manufacturer_profiles.items`, `provider_coverage.items`, `houses.items`, `services.items`.
   * Usa `external_id`, `slug`, `alias` o `temp_id` para **referenciar el mismo provider** desde todas las secciones.

4. **Chunking opcional**

   * **Split In Batches** (p.ej. 200 registros o payload ~2–3 MB) + **Rate Limit** (p.ej. 6 req/min).

5. **Build Payload + Headers (Function)**

   * Arma el body final.
   * Calcula **`Idempotency-Key`** (uuid v4) y **`Idempotency-Hash`** (sha256 de JSON *determinístico*).

6. **POST Bulk Import (HTTP Request)**

   * POST con headers y body.
   * Maneja `200 OK` y `207 Multi-Status` (errores parciales).

7. **Branching de errores**

   * **IF**: si status = 207, parsea `errors[]` y registra en **Slack/Email**.
   * Si `409 Conflict` (Idempotency-Key repetida con payload distinto), **regenerar Key** *o* enviar el mismo body.

8. **Observabilidad**

   * **Set Workflow Status** custom + **Slack/Email** resumen: totales creados/actualizados/errores.

---

## 3) Variables y credenciales recomendadas

* **Environment Variables (n8n)**:

  * `API_BASE_URL=https://tu-dominio/api/admin/bulk/import`
  * `API_TOKEN=***`
  * `DRY_RUN=false` (para testear: `true`)
  * `DEFAULT_MODE=upsert`
  * `ATOMIC=false`
  * `AUTOCREATE_PROVIDERS=true`
  * `BATCH_SIZE=200`

* **Credentials**:

  * `Generic Token Auth` o Header fijo `Authorization: Bearer {{ $env.API_TOKEN }}`.

---

## 4) Mapeo típico desde CSV/Sheets

Asumiendo columnas inspiradas en tu CSV de “Fábrica”, ejemplo:

* **Provider**: `company_name`, `email`, `hq_region_code`, `website`, `rut`
* **Manufacturer profile (flags)**: `dise_std`, `dise_pers`, `insta_premontada`, `contr_terreno`, `instalacion`, `kit_autocons`, `ases_tecnica`, `ases_legal`, `logist_transporte`, `financiamiento`, `tiny_houses`, `modulares_sip`, `modulares_container`, `modulares_hormigon`, `modulares_madera`, `prefabricada_tradicional`, `oficinas_modulares`, `llave_en_mano`, `publica_precios`, `precio_ref_min_m2`, `precio_ref_max_m2`, `experiencia_years`
* **Coverage**: `regions` (p.ej. “RM|V|VIII”)
* **Houses**: (`house_name`, `tier`, `price`, `price_per_m2`, `features_*`) → features JSON con las mismas claves del CSV
* **Services**: (`service_name`, `coverage_mode`, `coverage_deltas`, `svc_features_*`)

---

## 5) Nodos y configuración (paso a paso)

### (A) Trigger

* **Manual Trigger** (desarrollo).
* Luego **Cron**: cada 4 h, tolerancia X min.

### (B) Input de datos

* **Spreadsheet File** (si tienes CSV local) o **Google Sheets**:

  * Output: **JSON** (1 item por fila).
  * Normaliza strings (“RM, V, VIII” → `["RM","V","VIII"]`).

### (C) Function: Normalizar y construir secciones

Usa un **Function Node** para tomar las filas y producir **1 item** con `{ providers, manufacturer_profiles, provider_coverage, houses, services }`. Ejemplo:

```js
// Input: items[] con rows normalizadas
// Output: 1 item con {providers, manufacturer_profiles, provider_coverage, houses, services}

const rows = items.map(i => i.json);

// Helpers
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64);

const toBool = v => {
  if (typeof v === 'boolean') return v;
  if (v == null) return undefined;
  const s = String(v).trim().toLowerCase();
  return ['1','true','sí','si','x','yes','y'].includes(s) ? true :
         ['0','false','no',''].includes(s) ? false : undefined;
};

const splitRegions = v => Array.from(new Set(
  String(v||'').split(/[\|\,,\s]+/).filter(Boolean)
));

const providers = new Map(); // key: external_id | slug | website
const manProfiles = [];
const coverageItems = [];
const houses = [];
const services = [];

for (const r of rows) {
  const company = String(r.company_name || r.nombre_empresa || '').trim();
  if (!company) continue;

  const baseExternal = r.external_id || `src:${slugify(company)}`;
  const slug = slugify(company);
  const website = (r.website || r.sitio_web || '').trim();
  const rut = (r.rut || '').trim();

  // 1) Provider (upsert)
  const providerKey = baseExternal;
  if (!providers.has(providerKey)) {
    providers.set(providerKey, {
      temp_id: `prov#${slug}`,
      external_id: baseExternal,
      company_name: company,
      email: r.email || undefined,
      hq_region_code: r.hq_region_code || r.region_hq || undefined,
      is_manufacturer: toBool(r.is_manufacturer),
      is_service_provider: toBool(r.is_service_provider),
      status: (r.status || 'active').toLowerCase(),
      logo_url: r.logo_url || undefined,
      // Sugerencia: guarda alias para RUT/domino si luego los cargas
      aliases: {
        rut: rut || undefined,
        website: website || undefined
      }
    });
  }

  const provider_ref = { external_id: baseExternal };

  // 2) Manufacturer profile (si trae banderas)
  const anyMfgFlag = [
    'dise_std','dise_pers','insta_premontada','contr_terreno','instalacion','kit_autocons','ases_tecnica',
    'ases_legal','logist_transporte','financiamiento','tiny_houses','modulares_sip','modulares_container',
    'modulares_hormigon','modulares_madera','prefabricada_tradicional','oficinas_modulares','llave_en_mano',
    'publica_precios','precio_ref_min_m2','precio_ref_max_m2','experiencia_years'
  ].some(k => r[k] != null && String(r[k]).trim() !== '');

  if (anyMfgFlag) {
    manProfiles.push({
      provider_ref,
      dise_std: toBool(r.dise_std),
      dise_pers: toBool(r.dise_pers),
      insta_premontada: toBool(r.insta_premontada),
      contr_terreno: toBool(r.contr_terreno),
      instalacion: toBool(r.instalacion),
      kit_autocons: toBool(r.kit_autocons),
      ases_tecnica: toBool(r.ases_tecnica),
      ases_legal: toBool(r.ases_legal),
      logist_transporte: toBool(r.logist_transporte),
      financiamiento: toBool(r.financiamiento),
      tiny_houses: toBool(r.tiny_houses),
      modulares_sip: toBool(r.modulares_sip),
      modulares_container: toBool(r.modulares_container),
      modulares_hormigon: toBool(r.modulares_hormigon),
      modulares_madera: toBool(r.modulares_madera),
      prefabricada_tradicional: toBool(r.prefabricada_tradicional),
      oficinas_modulares: toBool(r.oficinas_modulares),
      llave_en_mano: toBool(r.llave_en_mano),
      publica_precios: toBool(r.publica_precios),
      precio_ref_min_m2: r.precio_ref_min_m2 ? Number(r.precio_ref_min_m2) : undefined,
      precio_ref_max_m2: r.precio_ref_max_m2 ? Number(r.precio_ref_max_m2) : undefined,
      experiencia_years: r.experiencia_years ? Number(r.experiencia_years) : undefined
    });
  }

  // 3) Coverage (si viene coverage Regions)
  const regions = splitRegions(r.cobertura || r.regions || '');
  if (regions.length) {
    coverageItems.push({ provider_ref, regions, replace: true });
  }

  // 4) House (si row describe un modelo)
  if (r.house_name || r.modelo_nombre) {
    const features = {};
    // Copia flags compartidos al features del modelo si existen en la fila
    ['dise_std','dise_pers','instalacion','llave_en_mano','modulares_sip','modulares_madera','modulares_container','modulares_hormigon','tiny_houses','prefabricada_tradicional','oficinas_modulares','publica_precios'].forEach(k => {
      if (r[k] != null) features[k] = toBool(r[k]);
    });

    houses.push({
      external_id: r.house_external_id || `house:${slug}-${(r.modelo_codigo||r.house_code||'1')}`,
      provider_ref,
      name: r.house_name || r.modelo_nombre,
      status: (r.house_status || 'active').toLowerCase(),
      tier: (r.house_tier || 'standard').toLowerCase(),
      bedrooms: r.bedrooms ? Number(r.bedrooms) : undefined,
      bathrooms: r.bathrooms ? Number(r.bathrooms) : undefined,
      area_m2: r.area_m2 ? Number(r.area_m2) : undefined,
      price: r.price ? Number(r.price) : undefined,
      price_per_m2: r.price_per_m2 ? Number(r.price_per_m2) : undefined,
      features
    });
  }

  // 5) Service (si row describe un servicio)
  if (r.service_name || r.servicio_nombre) {
    const svcFeatures = {};
    Object.keys(r).filter(k => k.startsWith('svc_')).forEach(k => { svcFeatures[k] = toBool(r[k]); });

    const deltas = [];
    if (r.coverage_excludes) splitRegions(r.coverage_excludes).forEach(code => deltas.push({ region_code: code, op: 'exclude' }));
    if (r.coverage_includes) splitRegions(r.coverage_includes).forEach(code => deltas.push({ region_code: code, op: 'include' }));

    services.push({
      external_id: r.service_external_id || `svc:${slug}-${(r.servicio_codigo||'1')}`,
      provider_ref,
      name: r.service_name || r.servicio_nombre,
      status: (r.service_status || 'active').toLowerCase(),
      tier: (r.service_tier || 'standard').toLowerCase(),
      coverage_mode: (r.coverage_mode || 'inherit').toLowerCase(),
      coverage_deltas: deltas.length ? deltas : undefined,
      features: svcFeatures
    });
  }
}

return [{
  json: {
    providers: { mode: 'upsert', items: Array.from(providers.values()) },
    manufacturer_profiles: { mode: 'upsert', items: manProfiles },
    provider_coverage: { mode: 'upsert', items: coverageItems },
    houses: { mode: 'upsert', items: houses },
    services: { mode: 'upsert', items: services }
  }
}];
```

### (D) Function: Armar payload final + headers de idempotencia

```js
// Input: 1 item con secciones
// Output: 1 item con { body, headers }

const crypto = require('crypto');

const body = {
  schema_version: '1.0',
  options: {
    dry_run: ($env.DRY_RUN || 'false').toLowerCase() === 'true',
    atomic: ($env.ATOMIC || 'false').toLowerCase() === 'true',
    default_mode: $env.DEFAULT_MODE || 'upsert',
    autocreate_providers: ($env.AUTOCREATE_PROVIDERS || 'true').toLowerCase() === 'true'
  },
  ...items[0].json
};

// Canonical stringify (ordenar claves recursivamente)
function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((acc,k) => {
      acc[k] = sortKeys(obj[k]);
      return acc;
    }, {});
  }
  return obj;
}
const canonical = JSON.stringify(sortKeys(body));
const hash = crypto.createHash('sha256').update(canonical).digest('hex');

// UUID v4 simple
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

const headers = {
  Authorization: `Bearer ${$env.API_TOKEN}`,
  'Content-Type': 'application/json',
  'Idempotency-Key': uuidv4(),
  'Idempotency-Hash': hash
};

return [{ json: { body, headers } }];
```

### (E) HTTP Request: POST bulk import

* **Method**: POST
* **URL**: `{{$env.API_BASE_URL}}`
* **Headers**: `{{$json.headers}}`
* **Body**: RAW JSON → `{{$json.body}}`
* **Response**: JSON
* **Continue On Fail**: desactivado (maneja errores con `Error Workflow` o con un **IF** posterior).

### (F) IF + Manejo de respuestas

* **IF (statusCode == 207)** → Nodo **Function** que recorra `errors[]` y alerte por **Slack/Email** con los `external_id` fallidos, motivos y sección.
* **IF (statusCode == 409)** → Reintenta con **mismo body** pero **nuevo Idempotency-Key** *solo si* el hash es igual (mismo payload). Si cambió el payload, **loggear y abortar**.

### (G) Split in Batches (opcional)

Si tu fuente trae miles de filas, inserta:

* **Split In Batches** (ej. 200 filas).
* Loop por lote: Normalize/Map → Build payload → POST → Next Batch.

### (H) Rate Limit (opcional)

* P. ej. **6 req/min** para no saturar backend.

### (I) Notificación

* **Slack** o **Email** con resumen:

  * `created`, `updated`, `skipped`, `errors`.
  * Marca si fue **dry_run**.

---

## 6) Estrategia de Idempotencia (operativa)

* **Reintentos del mismo batch** → usa **la misma `Idempotency-Key`**.
* Si cambiaste el contenido, el servidor responderá **409** (hash distinto con misma key).

  * Solución: generar **nueva `Idempotency-Key`** si el **hash cambió**.
* Sugerencia: para **reprocesar una ventana de datos** con cambios, **nueva key** por ejecución programada (manteniendo el hash correcto).

---

## 7) Pruebas recomendadas

1. **Smoke test (cURL)**:

```bash
BODY='{"schema_version":"1.0","options":{"dry_run":true,"atomic":false,"default_mode":"upsert","autocreate_providers":true},"providers":{"mode":"upsert","items":[{"external_id":"src:eco-modular","company_name":"Eco Modular SpA","is_manufacturer":true,"is_service_provider":true,"status":"active"}]},"manufacturer_profiles":{"mode":"upsert","items":[{"provider_ref":{"external_id":"src:eco-modular"},"modulares_sip":true,"llave_en_mano":true,"precio_ref_min_m2":28000,"precio_ref_max_m2":42000}]}}'
HASH=$(printf "%s" "$BODY" | openssl dgst -sha256 -binary | xxd -p -c 256)
curl -i -X POST "$API_BASE_URL" \
 -H "Authorization: Bearer $API_TOKEN" \
 -H "Content-Type: application/json" \
 -H "Idempotency-Key: $(uuidgen)" \
 -H "Idempotency-Hash: $HASH" \
 -d "$BODY"
```

2. **Dry-run end-to-end en n8n**: `DRY_RUN=true`. Verifica que no persiste nada.

3. **Errores parciales**: Inserta una fila mal (ej. región inválida) y confirma `207` + logging.

4. **Idempotencia**: Ejecuta dos veces el mismo batch (misma Key/Hash) → segunda debe devolver la respuesta cacheada.

---

## 8) Operación y scheduling

* **Cron** cada 4 h; en peak, ajusta a 1 h con **Rate Limit**.
* **Batch Size**: comienza con 200; sube/baja según tiempos de respuesta (<500 ms objetivo por lote en backend).
* **Timeout HTTP**: 30–60 s por lote.
* **Alertas**: notifica si `errors.length > 0` o si status != 200/207.

---

## 9) Observabilidad y trazabilidad

* Incluye en cada payload un campo opcional:
  `metadata: { source: "n8n", workflow_id: "{{ $workflow.id }}", run_id: "{{ $execution.id }}" }`
  (si el backend lo acepta, útil para rastrear ejecuciones).

* En n8n, guarda en **Data Stores** un registro con:

  * `idempotency_key`, `hash`, `started_at`, `finished_at`, `status`, `totals`, `errors[]`.

---

## 10) Checklist de producción

* [ ] `DRY_RUN=false` en producción.
* [ ] Conexiones y credenciales n8n guardadas como **env/credentials**, no en claro.
* [ ] **Retry On Fail** del HTTP node: 3–5 intentos exponenciales (429/5xx).
* [ ] **Split In Batches** + **Rate Limit** configurados.
* [ ] Notificaciones Slack/Email en `207` o `>=400`.
* [ ] Fuente de datos validada (regiones ISO, booleanos normalizados).
* [ ] Flow de **rollback** (opcional: desactivar programado si supera N errores consecutivos).

---

## 11) FAQ rápido

* **¿Puedo enviar solo providers hoy y mañana houses/services?**
  Sí. El contrato por secciones es independiente; el server hace **upsert** por `external_id` y eleva roles según corresponda.

* **¿Qué hago si detecto empresa con fábricas y servicios?**
  Referencia el **mismo `provider_ref`** (misma `external_id`) en `manufacturer_profiles`, `houses` **y** `services`. El backend consolidará todo bajo el **mismo `provider_id`**.

* **¿Si un house/service llega y no existe el provider?**
  Con `autocreate_providers=true`, el backend crea un **provider stub** automáticamente (y asigna el rol).

---

Si quieres, te preparo un **workflow JSON de n8n listo para importar** (Manual Trigger → Spreadsheet File → Function Map → Function Headers → HTTP → Slack). Dime qué **fuente exacta** usarás (CSV/Sheets/API) y te lo dejo preconfigurado con tus campos y nombres de columnas.
