¡Perfecto, vamos full con la **Opción A (endpoint por secciones)** y resolvemos **cómo vincular todo lo “de la misma empresa”** en un solo batch!

# Principios de vínculo (clave)

1. **Provider = entidad ancla.**
   Todo cuelga de `provider_id`. Un mismo Provider puede tener **ambos roles**:

   * `is_manufacturer = true` → habilita `manufacturer_profiles` y **houses**.
   * `is_service_provider = true` → habilita **services**.

2. **Refs consistentes en el batch.**
   En el payload usa **`provider_ref`** para referenciar la empresa desde cada sección:

   * `provider_id` (uuid) **o**
   * `external_id` (id del origen/n8n) **o**
   * `slug` **o**
   * `alias {source, value}` (e.g., `rut`, `website`, `legacy_id`)
     Además, dentro del mismo batch puedes usar **`temp_id`** al crear el provider y referenciarlo desde otras secciones.

3. **Inferencia de roles automática.**
   El backend **eleva** los flags del Provider si el batch trae piezas que lo requieren:

   * Si llega `manufacturer_profiles` o `houses` → set `is_manufacturer = true`.
   * Si llega `services` → set `is_service_provider = true`.

4. **Idempotencia por `external_id`.**
   Usa `external_id` por entidad (provider/house/service) + `Idempotency-Key` a nivel de batch para que **reintentos no dupliquen**.

---

# Contrato (secciones + refs)

```json
POST /api/admin/bulk/import
Headers:
  Idempotency-Key: 0bd2a3f2-6c4b-4f48-bf14-9d1d2ea3051e
  Idempotency-Hash: <sha256 del body normalizado>

{
  "schema_version": "1.0",
  "options": { "dry_run": false, "atomic": false, "default_mode": "upsert", "autocreate_providers": true },

  "providers": {
    "mode": "upsert",
    "items": [
      {
        "temp_id": "prov#eco",
        "external_id": "src:eco-modular",
        "company_name": "Eco Modular SpA",
        "email": "contacto@ecomodular.cl",
        "hq_region_code": "RM",
        "is_manufacturer": true,
        "is_service_provider": true,
        "status": "active",
        "logo_url": "https://..."
      }
    ]
  },

  "manufacturer_profiles": {
    "mode": "upsert",
    "items": [
      {
        "provider_ref": { "temp_id": "prov#eco" },
        "dise_pers": true, "instalacion": true, "modulares_sip": true,
        "llave_en_mano": true, "publica_precios": false,
        "precio_ref_min_m2": 28000, "precio_ref_max_m2": 42000,
        "experiencia_years": 10
      }
    ]
  },

  "provider_coverage": {
    "mode": "upsert",
    "items": [
      { "provider_ref": { "external_id": "src:eco-modular" }, "regions": ["RM","V","VIII"], "replace": true }
    ]
  },

  "houses": {
    "mode": "upsert",
    "items": [
      {
        "external_id": "house:eco-001",
        "provider_ref": { "temp_id": "prov#eco" },
        "name": "Casa Lago Premium",
        "status": "active", "tier": "premium",
        "bedrooms": 3, "bathrooms": 2, "area_m2": 80,
        "price": 28000000, "price_per_m2": 350000,
        "features": { "modulares_sip": true, "dise_pers": true, "instalacion": true, "llave_en_mano": true }
      }
    ]
  },

  "services": {
    "mode": "upsert",
    "items": [
      {
        "external_id": "svc:eco-solar",
        "provider_ref": { "external_id": "src:eco-modular" },
        "name": "Instalación Paneles Solares",
        "status": "active", "tier": "standard",
        "coverage_mode": "inherit",
        "coverage_deltas": [ { "region_code":"VI", "op":"exclude" } ],
        "features": { "certificacion_tecnica": true }
      }
    ]
  }
}
```

**Resultado:** una empresa única con **todo**: identidad + perfil de fabricante + cobertura + modelos (houses) + servicios.

---

# Resolución y “pegamento” en el backend

## 1) Resolver `provider_ref` de forma robusta

Orden de resolución (primero que calce):

1. `provider_id` (uuid)
2. `external_id`
3. `alias {source, value}` (e.g., `{"source":"rut","value":"76.123.456-7"}`)
4. `slug`
5. **Si `options.autocreate_providers=true` y nada matchea**: crear **provider stub** con:

   * `company_name` desde `provider_name` que puede venir opcional en `house/service` *(añade este campo opcional en items)*,
   * `is_manufacturer`/`is_service_provider` inferidos por la sección que lo invoca.

> Recomendación: agrega tabla `provider_aliases(provider_id, source, value)` con índice único `(source,value)` para enlazar múltiples identificadores (RUT, legacy_id, dominio website).

## 2) Inferencia de roles (server-side)

* Si llega `manufacturer_profiles` o `houses` para un provider → `is_manufacturer = true`.
* Si llega `services` → `is_service_provider = true`.
* **No bajar flags** en este endpoint (solo elevar o mantener).

## 3) Reglas de coherencia

* `manufacturer_profiles`: solo si `is_manufacturer=true` (si no, el servidor lo eleva automáticamente antes del upsert).
* `houses`: requieren `is_manufacturer=true` (mismo comportamiento).
* `services`: requieren `is_service_provider=true`.

## 4) Idempotencia

* Tabla `idempotency_keys` guarda `(key, hash, response_json, created_at)`.
* Si llega **misma key + mismo hash** → devolver **response cacheada**.
* **Misma key + hash distinto** → `409 Conflict`.
* A nivel entidad, **`external_id` único** por tabla (providers/houses/service_products).

## 5) Atomicidad

* `options.atomic=true`: una transacción por **todo el batch**.
* `false` (default): transacción por **ítem**; responder `207 Multi-Status` con `errors[]` por sección.

---

# Zod (resumen de tipos clave)

```ts
const ProviderRefSchema = z.union([
  z.object({ provider_id: z.string().uuid() }),
  z.object({ external_id: z.string().min(1) }),
  z.object({ slug: z.string().min(1) }),
  z.object({ alias: z.object({ source: z.enum(['rut','website','legacy','scraper','csv']), value: z.string().min(2) }) })
]);

const ProviderItemSchema = z.object({
  temp_id: z.string().optional(),
  external_id: z.string().optional(),
  company_name: z.string().min(2),
  email: z.string().email().optional(),
  hq_region_code: z.string().optional(),
  is_manufacturer: z.boolean().optional(),
  is_service_provider: z.boolean().optional(),
  status: z.enum(['draft','pending_review','active','inactive','rejected']).default('active'),
  logo_url: z.string().url().optional()
});

const ManufacturerProfileItemSchema = z.object({
  provider_ref: ProviderRefSchema,
  // flags & números como definiste
  dise_pers: z.boolean().optional(),
  instalacion: z.boolean().optional(),
  modulares_sip: z.boolean().optional(),
  llave_en_mano: z.boolean().optional(),
  publica_precios: z.boolean().optional(),
  precio_ref_min_m2: z.number().positive().optional().nullable(),
  precio_ref_max_m2: z.number().positive().optional().nullable(),
  experiencia_years: z.number().int().min(0).optional().nullable()
}).refine(d => !d.precio_ref_min_m2 || !d.precio_ref_max_m2 || d.precio_ref_min_m2 <= d.precio_ref_max_m2, {
  message: 'precio_ref_min_m2 debe ser <= precio_ref_max_m2'
});

const HouseItemSchema = z.object({
  external_id: z.string().min(1).optional(),
  provider_ref: ProviderRefSchema.or(z.object({
    // fallback opcional si autocreate y no hay match:
    provider_name: z.string().min(2).optional()
  })),
  name: z.string().min(2),
  status: z.enum(['active','inactive','draft']).default('active'),
  tier: z.enum(['standard','destacado','premium']).optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  area_m2: z.number().positive().optional(),
  price: z.number().int().min(0).optional(),
  price_per_m2: z.number().int().min(0).optional(),
  features: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])).default({})
});

const ServiceItemSchema = z.object({
  external_id: z.string().min(1).optional(),
  provider_ref: ProviderRefSchema.or(z.object({ provider_name: z.string().min(2).optional() })),
  name: z.string().min(2),
  status: z.enum(['active','inactive','draft']).default('active'),
  tier: z.enum(['standard','destacado','premium']).optional(),
  coverage_mode: z.enum(['inherit','override']).default('inherit'),
  coverage_deltas: z.array(z.object({ region_code: z.string(), op: z.enum(['include','exclude']) })).optional(),
  features: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])).default({})
});
```

---

# Flujo del handler (pseudocódigo TS/Fastify)

```ts
async function bulkImportHandler(req, reply) {
  enforceIdempotency(req.headers); // 409 si key reutilizada con payload distinto
  const payload = parseAndValidate(req.body); // Zod

  // Índices temporales del batch
  const refIndex = new RefIndex(); // temp_id/external_id/alias/slug -> provider_id
  if (payload.providers) {
    // Upsert providers primero
    for (const p of payload.providers.items) {
      const provider = await upsertProvider(p); // upsert por external_id o slug
      refIndex.bind(p, provider.id);            // temp_id/external_id/slug -> uuid
    }
  }

  // Si autocreate_providers=true, register lazy resolver
  refIndex.setLazy(async (ref, fallbackName) => {
    let id = await resolveProviderRefInDB(ref);
    if (!id && payload.options.autocreate_providers) {
      const created = await upsertProvider({
        company_name: fallbackName ?? 'Proveedor sin nombre',
        is_manufacturer: false,
        is_service_provider: false,
        status: 'draft'
      });
      id = created.id;
    }
    return id;
  });

  // manufacturer_profiles → eleva rol fabricante
  for (const m of payload.manufacturer_profiles?.items ?? []) {
    const providerId = await refIndex.resolve(m.provider_ref, /*fallbackName*/ undefined);
    await ensureRoles(providerId, { manufacturer: true });
    await upsertManufacturerProfile(providerId, m);
  }

  // coverage
  for (const c of payload.provider_coverage?.items ?? []) {
    const providerId = await refIndex.resolve(c.provider_ref, undefined);
    await upsertCoverage(providerId, c.regions, { replace: !!c.replace });
  }

  // houses → eleva fabricante
  for (const h of payload.houses?.items ?? []) {
    const providerId = await refIndex.resolve(h.provider_ref, h.provider_ref?.provider_name);
    await ensureRoles(providerId, { manufacturer: true });
    await upsertHouse(providerId, h); // upsert por external_id + provider_id
  }

  // services → eleva H&S
  for (const s of payload.services?.items ?? []) {
    const providerId = await refIndex.resolve(s.provider_ref, s.provider_ref?.provider_name);
    await ensureRoles(providerId, { serviceProvider: true });
    await upsertService(providerId, s); // upsert por external_id + provider_id
  }

  const summary = buildSummary();
  cacheIdempotentResponse(req.headers, summary);
  return reply.status(summary.hasErrors ? 207 : 200).send(summary);
}
```

**Detalle de `ensureRoles`**

* Hace `UPDATE providers SET is_manufacturer = is_manufacturer OR $1, is_service_provider = is_service_provider OR $2`.
* Alternativamente, tus triggers `ensure_provider_flags` lo cubren cuando insertas casas/servicios; igual es sano hacerlo explícito aquí.

---

# Casos típicos y cómo se resuelven

1. **Empresa que fabrica y también presta servicios**

* En `providers.items[0]` marca ambos flags **o** deja que el servidor los infiera por las secciones.
* `manufacturer_profiles` + `houses` + `services` referencian el **mismo** provider (por `temp_id`/`external_id`).
* Resultado: un único `provider_id` con ambos roles; todo vinculado.

2. **Empresa con servicios pero sin casas**

* Solo `services` + (opcional) `provider_coverage`.
* `is_service_provider` se eleva a `true`.
* **No** crear `manufacturer_profiles` (a menos que de verdad sea fabricante también).

3. **Detecto en scraping una casa sin haber creado provider**

* Si `autocreate_providers=true`, en el `house.item` manda `provider_ref: { provider_name: "Nueva Empresa Ltda" }`.
* El servidor crea un **provider stub** y lo eleva como fabricante.

---

# Recomendaciones finales (para n8n y DB)

* **n8n**: un **único** HTTP Request por batch. Reintentos con **mismo `Idempotency-Key`**.
* **DB**:

  * Índices `UNIQUE (external_id)` en `providers`, `houses`, `service_products`.
  * Tabla `provider_aliases` con `UNIQUE (source, value)`.
  * Constraints de integridad ya descritos (manufacturer_profiles 1:1, etc.).
* **Contratos limpios**:

  * Provider no acepta tier/capabilities/SEO.
  * Capabilities corporativas → `manufacturer_profiles`.
  * Tiers/capabilities de catálogo → `houses` / `services`.

Si quieres, te paso **el handler Fastify/Next con Zod** listo para pegar y el **OpenAPI** completo. ¿Lo generamos así tal cual?
