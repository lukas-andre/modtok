¡perfecto, Lucas! Aquí tienes **todo lo necesario**: endpoints (con OpenAPI listo para descargar), snippets NestJS (DTOs/Controller/Service/SQL), la **UI de Admin** ajustada a “slots” y “tiers”, y el **flujo de ingestión** vía n8n con endpoint idempotente y estrategia de *dedupe*.

[Descargar OpenAPI 3.1 (v0.3.0)](sandbox:/mnt/data/modtok-openapi-v3.yaml)

---

# 1) Endpoints (resumen + ejemplos)

**Grupos:**

* Catálogo: `/providers`, `/houses`, `/service-products`
* Slots: `/slot-positions`, `/slot-orders`, `/visibility/effective`
* Media: `/media-assets` (metadatos)
* Ingesta (n8n): `/ingest/providers`

### Ejemplos (cURL)

```bash
# Listar órdenes activas de slots premium para home
curl -H "Authorization: Bearer <ADMIN_JWT>" \
  "https://api.modtok.com/v1/slot-orders?slotType=premium&activeOn=2025-10-29&limit=20"

# Visibilidad efectiva (mezcla tier + slot activo)
curl -H "Authorization: Bearer <ADMIN_JWT>" \
  "https://api.modtok.com/v1/visibility/effective?type=house&ids=4f...a,2c...9"

# Crear/actualizar visibilidad de conteos por tipo de slot (admin)
curl -X PUT -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{"premium":2,"destacado":4}' \
  "https://api.modtok.com/v1/slot-positions"

# Ingesta desde n8n (idempotente + token)
curl -X POST "https://api.modtok.com/v1/ingest/providers" \
  -H "X-Ingestion-Token: $INGESTION_TOKEN" \
  -H "X-Idempotency-Key: 3b83b2..." \
  -H "Content-Type: application/json" \
  -d '{
    "name":"CasaSIP Chile",
    "website":"https://casasip.cl",
    "instagram":"@casasipchile",
    "emails":["hola@casasip.cl"],
    "phones":["+56 9 1234 5678"],
    "regions":["RM","V","VI"],
    "capabilities":["diseño personalizado","panel SIP"]
  }'
```

> El YAML incluye todos los paths con parámetros y *security schemes* (Bearer y `X-Ingestion-Token`).

---

# 2) NestJS – entidades, DTOs y controladores clave

> Supone **TypeORM + Postgres** (tal como vienes usando). Reutiliza el *schema v3* que te propuse.

### 2.1 Entidades (TypeORM)

```ts
// slot-position.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('slot_positions')
@Unique(['slotType'])
export class SlotPosition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'slot_type' })
  slotType: 'premium' | 'destacado';

  @Column({ name: 'visible_count', type: 'int' })
  visibleCount: number;
}
```

```ts
// slot-order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('slot_orders')
@Index(['slotType', 'isActive', 'startDate', 'endDate', 'rotationOrder'])
export class SlotOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'slot_type' })
  slotType: 'premium' | 'destacado';

  @Column({ name: 'content_type' })
  contentType: 'provider' | 'house' | 'service_product';

  @Column({ name: 'content_id' })
  contentId: string;

  @Column({ name: 'monthly_price', type: 'numeric', precision: 12, scale: 2 })
  monthlyPrice: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'rotation_order', type: 'int', default: 0 })
  rotationOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'now()' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamptz', default: () => 'now()' })
  updatedAt: Date;
}
```

### 2.2 DTOs

```ts
// dto/create-slot-order.dto.ts
import { IsIn, IsUUID, IsDateString, IsBoolean, IsInt, Min, IsOptional } from 'class-validator';

export class CreateSlotOrderDto {
  @IsIn(['premium', 'destacado'])
  slotType: 'premium' | 'destacado';

  @IsIn(['provider','house','service_product'])
  contentType: 'provider' | 'house' | 'service_product';

  @IsUUID()
  contentId: string;

  monthlyPrice: number;

  @IsDateString() startDate: string; // YYYY-MM-DD
  @IsDateString() endDate: string;

  @IsOptional() @IsInt() @Min(0)
  rotationOrder?: number;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
```

```ts
// dto/update-slot-order.dto.ts
import { PartialType } from '@nestjs/mapped-types';
export class UpdateSlotOrderDto extends PartialType(CreateSlotOrderDto) {}
```

```ts
// dto/upsert-slot-positions.dto.ts
import { IsInt, Min, IsOptional } from 'class-validator';

export class UpsertSlotPositionsDto {
  @IsOptional() @IsInt() @Min(1) premium?: number;
  @IsOptional() @IsInt() @Min(1) destacado?: number;
}
```

```ts
// dto/ingest-provider.dto.ts
import { IsString, IsOptional, IsArray, IsEmail, IsUrl } from 'class-validator';

export class IngestProviderDto {
  @IsString() name: string;

  @IsOptional() @IsUrl() website?: string;
  @IsOptional() @IsString() instagram?: string;

  @IsOptional() @IsArray() @IsEmail({}, { each: true }) emails?: string[];
  @IsOptional() @IsArray() phones?: string[];

  @IsOptional() @IsArray() regions?: string[];      // e.g., ["RM","V"]
  @IsOptional() @IsArray() capabilities?: string[];  // etiquetas libres
  @IsOptional() @IsString() notes?: string;
}
```

### 2.3 Controladores y servicios

```ts
// slot-orders.controller.ts
import { Controller, Get, Post, Body, Query, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { SlotOrdersService } from './slot-orders.service';
import { CreateSlotOrderDto } from './dto/create-slot-order.dto';
import { UpdateSlotOrderDto } from './dto/update-slot-order.dto';

@Controller('slot-orders')
export class SlotOrdersController {
  constructor(private svc: SlotOrdersService) {}

  @Get()
  list(
    @Query('slotType') slotType?: 'premium'|'destacado',
    @Query('contentType') contentType?: 'provider'|'house'|'service_product',
    @Query('contentId') contentId?: string,
    @Query('activeOn') activeOn?: string, // YYYY-MM-DD
    @Query('limit') limit = 20,
    @Query('cursor') cursor?: string,
  ) {
    return this.svc.list({ slotType, contentType, contentId, activeOn, limit, cursor });
  }

  @Post()
  create(@Body() dto: CreateSlotOrderDto) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSlotOrderDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.svc.softDelete(id);
  }
}
```

```ts
// slot-orders.service.ts (extracto)
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SlotOrder } from './slot-order.entity';
import { CreateSlotOrderDto } from './dto/create-slot-order.dto';
import { UpdateSlotOrderDto } from './dto/update-slot-order.dto';

@Injectable()
export class SlotOrdersService {
  constructor(@InjectRepository(SlotOrder) private repo: Repository<SlotOrder>) {}

  async list(params: {
    slotType?: 'premium'|'destacado',
    contentType?: 'provider'|'house'|'service_product',
    contentId?: string,
    activeOn?: string,
    limit?: number,
    cursor?: string
  }) {
    const qb = this.repo.createQueryBuilder('so').orderBy('so.rotationOrder', 'ASC').addOrderBy('so.id', 'ASC');

    if (params.slotType) qb.andWhere('so.slotType = :st', { st: params.slotType });
    if (params.contentType) qb.andWhere('so.contentType = :ct', { ct: params.contentType });
    if (params.contentId) qb.andWhere('so.contentId = :cid', { cid: params.contentId });

    if (params.activeOn) {
      qb.andWhere('so.isActive = true')
        .andWhere('so.startDate <= :d', { d: params.activeOn })
        .andWhere('so.endDate >= :d', { d: params.activeOn });
    }

    if (params.cursor) {
      // cursor simple "createdAt,id"
      const [createdAt, id] = Buffer.from(params.cursor, 'base64').toString('utf8').split(',');
      qb.andWhere('(so.createdAt, so.id) > (:cAt, :id)', { cAt: createdAt, id });
    }

    qb.limit(params.limit ?? 20);
    const rows = await qb.getMany();
    const nextCursor = rows.length
      ? Buffer.from(`${rows[rows.length-1].createdAt.toISOString()},${rows[rows.length-1].id}`).toString('base64')
      : null;

    return { items: rows, nextCursor };
  }

  async create(dto: CreateSlotOrderDto) {
    // Validación: evitar solapes exactos ya lo maneja el índice único del esquema
    const row = this.repo.create(dto as any);
    return this.repo.save(row);
  }

  async update(id: string, dto: UpdateSlotOrderDto) {
    await this.repo.update({ id }, dto as any);
    return this.repo.findOneByOrFail({ id });
  }

  async softDelete(id: string) {
    await this.repo.update({ id }, { isActive: false });
    return { ok: true };
  }
}
```

```ts
// visibility.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('visibility')
export class VisibilityController {
  constructor(private ds: DataSource) {}

  @Get('effective')
  async effective(@Query('type') type?: 'provider'|'house'|'service_product', @Query('ids') ids?: string[]) {
    let q = `SELECT * FROM catalog_visibility_effective`;
    const where: string[] = [];
    const params: any = {};

    if (type) { where.push(`entity_type = :type`); params.type = type; }
    if (ids?.length) { where.push(`entity_id = ANY(:ids)`); params.ids = ids; }
    if (where.length) q += ` WHERE ` + where.join(' AND ');
    return this.ds.query(q, params);
  }
}
```

> La *view* `catalog_visibility_effective` es la SQL que te dejé en la iteración anterior (suma tier editorial + slot activo).

### 2.4 Ingesta (n8n) – seguridad + dedupe

**Tablas auxiliares recomendadas:**

```sql
-- Guarda el crudo para auditoría y re-proceso
CREATE TABLE IF NOT EXISTS raw_provider_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at timestamptz DEFAULT now(),
  idempotency_key TEXT,               -- de header
  payload JSONB NOT NULL,
  normalized JSONB,
  status TEXT DEFAULT 'received',     -- received|matched|created|error
  error TEXT
);

-- Llaves "alias" para resolver duplicados y acelerar matching
CREATE TABLE IF NOT EXISTS provider_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('website_domain','instagram','email')),
  value TEXT NOT NULL,                -- siempre normalizado (lowercase)
  UNIQUE (kind, value)
);
```

**Guard:** HMAC simple o token fijo en `X-Ingestion-Token` + lista blanca de IP n8n.

**Controller/Service (extracto):**

```ts
// ingest.controller.ts
import { Controller, Post, Body, Headers, UnauthorizedException, ConflictException } from '@nestjs/common';
import { IngestService } from './ingest.service';
import { IngestProviderDto } from './dto/ingest-provider.dto';

@Controller('ingest')
export class IngestController {
  constructor(private svc: IngestService) {}

  @Post('providers')
  async ingestProvider(
    @Body() dto: IngestProviderDto,
    @Headers('x-ingestion-token') token: string,
    @Headers('x-idempotency-key') idem?: string
  ) {
    if (token !== process.env.INGESTION_TOKEN) throw new UnauthorizedException();
    return this.svc.upsertProvider(dto, idem);
  }
}
```

```ts
// ingest.service.ts (resumen)
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';

function normDomain(url?: string) {
  if (!url) return null;
  try { return new URL(url).hostname.replace(/^www\./,'').toLowerCase(); } catch { return null; }
}
const normHandle = (h?: string) => h?.replace(/^@/,'').toLowerCase() ?? null;
const normEmail  = (e?: string) => e?.trim().toLowerCase() ?? null;

@Injectable()
export class IngestService {
  constructor(private ds: DataSource) {}

  async upsertProvider(dto: any, idempotencyKey?: string) {
    const website = normDomain(dto.website);
    const insta   = normHandle(dto.instagram);
    const emails  = (dto.emails ?? []).map(normEmail).filter(Boolean);

    // Guardado crudo
    const lead = await this.ds.query(
      `INSERT INTO raw_provider_leads (idempotency_key, payload)
       VALUES ($1,$2) RETURNING id`,
      [idempotencyKey ?? null, dto]
    );

    // Idempotencia por headers + alias conocidos
    const byAlias = await this.ds.query(
      `SELECT p.*
         FROM provider_aliases a
         JOIN providers p ON p.id=a.provider_id
        WHERE (a.kind='website_domain' AND a.value=$1)
           OR (a.kind='instagram' AND a.value=$2)
           OR (a.kind='email' AND a.value = ANY($3))`,
      [website, insta, emails]
    );

    let providerId: string | null = byAlias[0]?.id ?? null;

    if (!providerId) {
      // create draft provider
      const res = await this.ds.query(
        `INSERT INTO providers (name, website, instagram, tier, is_active, status)
         VALUES ($1,$2,$3,'standard',true,'draft') RETURNING id`,
        [dto.name, dto.website ?? null, insta ?? null]
      );
      providerId = res[0].id;

      // Cobertura y capacidades si vienen
      if (dto.regions?.length) {
        for (const code of dto.regions) {
          await this.ds.query(
            `INSERT INTO provider_coverage_regions (provider_id, region_code)
             VALUES ($1,$2) ON CONFLICT DO NOTHING`,
            [providerId, code]
          );
        }
      }

      // Alias
      if (website) await this.ds.query(
        `INSERT INTO provider_aliases (provider_id, kind, value)
         VALUES ($1,'website_domain',$2) ON CONFLICT DO NOTHING`, [providerId, website]);
      if (insta) await this.ds.query(
        `INSERT INTO provider_aliases (provider_id, kind, value)
         VALUES ($1,'instagram',$2) ON CONFLICT DO NOTHING`, [providerId, insta]);
      for (const e of emails) await this.ds.query(
        `INSERT INTO provider_aliases (provider_id, kind, value)
         VALUES ($1,'email',$2) ON CONFLICT DO NOTHING`, [providerId, e]);
    }

    // Actualiza lead
    await this.ds.query(
      `UPDATE raw_provider_leads SET status=$2, normalized=$3 WHERE id=$1`,
      [lead[0].id, providerId ? 'matched' : 'created', { website, insta, emails }]
    );

    return { providerId, status: providerId ? 'matched' : 'created' };
  }
}
```

---

# 3) Admin UI (Next.js + Tailwind + React Hook Form + Zod)

> Enfoque: panel `/admin` con 4 secciones principales:
> **Providers**, **Houses**, **Services**, **Slots**.
>
> 1. *Providers* pide **solo datos corporativos** y cobertura.
> 2. *Houses/Services* usan **FeatureFormBuilder** por categoría.
> 3. *Slots* administra `slot_positions` (conteos) y `slot_orders` (rotación).

## 3.1 Estructura de rutas

```
/admin
  /providers
    index.tsx       # tabla + filtros
    new.tsx         # formulario
    [id].tsx        # edición
  /houses
    index.tsx
    new.tsx
    [id].tsx
  /services
    index.tsx
    new.tsx
    [id].tsx
  /slots
    index.tsx       # conteos + órdenes + vista previa home
```

## 3.2 “Slots” – Página principal (TSX práctico)

* **Arriba**: tarjeta “Visibles por tipo” con 2 inputs (*premium*, *destacado*) → `PUT /slot-positions`.
* **Medio**: tabla de `slot_orders` con filtros (tipo, entidad) + acciones (activar/desactivar, editar fechas, orden).
* **Derecha** (opcional): “Preview Home” que hace un `GET /slot-orders?slotType=premium&activeOn=today` y muestra los 2 que saldrían.

```tsx
// app/admin/slots/index.tsx (extracto)
'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

type SlotPositions = { premium: number; destacado: number };
type SlotOrder = {
  id: string; slotType: 'premium'|'destacado';
  contentType: 'provider'|'house'|'service_product';
  contentId: string; startDate: string; endDate: string;
  rotationOrder: number; isActive: boolean;
};

export default function SlotsPage() {
  const [positions, setPositions] = useState<SlotPositions>({premium:2, destacado:4});
  const [orders, setOrders] = useState<SlotOrder[]>([]);
  const [filters, setFilters] = useState({ slotType: 'premium' as 'premium'|'destacado' });

  const { register, handleSubmit } = useForm<SlotPositions>({ defaultValues: positions });

  useEffect(() => { fetch('/api/slot-positions').then(r=>r.json()).then(setPositions); }, []);
  useEffect(() => {
    const qs = new URLSearchParams({ slotType: filters.slotType, activeOn: new Date().toISOString().slice(0,10) });
    fetch(`/api/slot-orders?${qs}`).then(r=>r.json()).then(d=>setOrders(d.items));
  }, [filters]);

  const onSave = handleSubmit(async (data) => {
    await fetch('/api/slot-positions', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
    setPositions(data);
  });

  return (
    <div className="p-6 grid grid-cols-12 gap-6">
      {/* Conteos visibles */}
      <div className="col-span-12 lg:col-span-4 bg-white/5 rounded-2xl p-4">
        <h2 className="text-xl font-semibold mb-3">Visibles por tipo</h2>
        <form onSubmit={onSave} className="space-y-3">
          <label className="flex items-center gap-3">
            <span className="w-28">Premium</span>
            <input type="number" min={1} {...register('premium', { valueAsNumber: true })} className="input" />
          </label>
          <label className="flex items-center gap-3">
            <span className="w-28">Destacado</span>
            <input type="number" min={1} {...register('destacado', { valueAsNumber: true })} className="input" />
          </label>
          <button className="btn btn-primary mt-2">Guardar</button>
        </form>
      </div>

      {/* Tabla de órdenes */}
      <div className="col-span-12 lg:col-span-8 bg-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Órdenes activas ({filters.slotType})</h2>
          <div className="flex items-center gap-2">
            <select value={filters.slotType} onChange={e=>setFilters({slotType: e.target.value as any})} className="select">
              <option value="premium">Premium</option>
              <option value="destacado">Destacado</option>
            </select>
            <a href="/admin/slots/new" className="btn">Nueva orden</a>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-400">
            <th>Entidad</th><th>Fechas</th><th>Orden</th><th>Activo</th><th></th>
          </tr></thead>
          <tbody>
          {orders.map(o=>(
            <tr key={o.id} className="border-t border-white/10">
              <td className="py-2">{o.contentType} · {o.contentId.slice(0,8)}…</td>
              <td>{o.startDate} → {o.endDate}</td>
              <td>{o.rotationOrder}</td>
              <td>{o.isActive ? '✔︎' : '—'}</td>
              <td className="text-right">
                <a className="btn btn-ghost" href={`/admin/slots/${o.id}`}>Editar</a>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

> Repite este patrón para **Providers/Houses/Services**:
> – ProviderForm: nombre, website, instagram, emails/phones, **cobertura** (select múltiple regiones), **capabilities** (chips), `tier` (standard/destacado/premium) y `has_landing_page` (auto deshabilitado si no es premium).
> – House/ServiceForm: selector de **provider** y **FeatureFormBuilder** por categoría, media, SEO, tier/landing.

---

# 4) Flujo de Ingesta con n8n (pipeline recomendado)

**Objetivo:** cada vez que n8n encuentre un provider nuevo (o un lead), lo enviamos a `/ingest/providers` y el backend decide si **matchea** o **crea** borrador.

### 4.1 Diseño del flujo (n8n)

1. **Fuente**: Google Sheets / Web Scraper / API de directorio.
2. **Transform**: construir JSON con `name`, `website`, `instagram`, `emails`, `phones`, `regions`, `capabilities`.
3. **HTTP Request**:

   * `POST https://api.modtok.com/v1/ingest/providers`
   * Headers: `X-Ingestion-Token`, `X-Idempotency-Key={{$json.website || $json.instagram || $json.name}}`
4. **Branch** por respuesta:

   * `status=created` → Slack/Email “Nuevo provider creado (draft)”.
   * `status=matched` → incrementa un counter y enriquece (p.ej., si falta cobertura, reenvía **PATCH /providers/:id** por admin API — opcional).
5. **Log**: guardar `response.providerId` en tu sheet/bd para no reintentar.

### 4.2 *Dedup* (lógica ya incluida)

* Normaliza `website` a **dominio base** (sin www).
* Normaliza `instagram` (sin @).
* Emails en *lowercase*.
* Tabla `provider_aliases` guarda todos los *keys* para futuras coincidencias.

### 4.3 Seguridad

* Token en `X-Ingestion-Token` + rate-limit.
* (Opcional) HMAC: `X-Signature: sha256(payload, SECRET)` y validar en `IngestService`.

---

# 5) Queries útiles (Home & Catálogo)

**Pool para Home (round-robin):**

```sql
WITH pool AS (
  SELECT * FROM slot_orders
  WHERE slot_type='premium'
    AND is_active
    AND start_date <= CURRENT_DATE
    AND end_date >= CURRENT_DATE
  ORDER BY rotation_order, id
)
SELECT * FROM pool LIMIT (SELECT visible_count FROM slot_positions WHERE slot_type='premium');
```

**Ordenamiento por visibilidad en listados:**

```sql
SELECT h.*, v.effective_tier
FROM houses h
JOIN catalog_visibility_effective v ON v.entity_type='house' AND v.entity_id=h.id
WHERE h.is_active = true
ORDER BY
  CASE v.effective_tier
    WHEN 'premium' THEN 1
    WHEN 'destacado' THEN 2
    ELSE 3
  END,
  h.created_at DESC;
```

---

## 6) Checklist de implementación rápida

* [ ] Montar endpoints del YAML (providers/houses/services/slots/visibility/media/ingest).
* [ ] Migración de *aliases* y *raw leads*.
* [ ] UI Admin: mover filtros correctos a **House/Service**, limpiar **Provider**.
* [ ] Página `/admin/slots` (conteos + órdenes + preview).
* [ ] n8n: crear workflow con token + idempotency.
* [ ] Monitoreo: métricas de `slot_orders` activos, expiraciones (cron diario) y tasa de *match* en ingestión.

---

Si quieres, en la siguiente iteración te paso **los endpoints de Providers/Houses/Services completos (CRUD con filtros avanzados)** y el **FeatureFormBuilder** genérico (Zod + JSON schema de `feature_definitions`) para que los formularios se generen por categoría sin hardcodear checkboxes.
