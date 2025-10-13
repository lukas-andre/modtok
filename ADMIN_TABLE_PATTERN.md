# 📋 Patrón para Actualizar Páginas de Admin con Tablas

Este documento describe el patrón optimizado para actualizar las páginas de administración que usan tablas de datos.

## 🎯 Objetivo

Reemplazar las tablas HTML custom con el componente **DataTable** actualizado con Design System v2.0.

## ✅ Ejemplo Completado: `/admin/providers`

### Antes (Complejo)
- 550+ líneas de código HTML/Astro
- Tabla HTML manual
- Paginación implementada en el servidor
- Filtros con formularios GET
- Código duplicado de badges y estados

### Después (Simplificado)
- **Página Astro**: 60 líneas (solo fetch de datos y header)
- **Componente React**: 250 líneas (lógica reutilizable)
- Todo manejado por el DataTable component
- Design System v2.0 aplicado automáticamente

## 📝 Patrón a Seguir

### 1. Página Astro (Simplificada)

Archivo: `src/pages/admin/[entity]/index.astro`

```astro
---
import AdminLayout from '../../../layouts/AdminLayout.astro';
import EntityTable from '../../../components/admin/EntityTable';
import { getAdminAuth, requireAdmin } from '../../../lib/auth';
import { createSupabaseClient } from '../../../lib/supabase';

// Auth
const auth = await getAdminAuth(Astro);
const user = requireAdmin(auth);
if (!user) {
  return Astro.redirect('/auth/login?redirect=/admin/entity');
}

// Fetch data (let client handle filtering/pagination)
const supabase = createSupabaseClient(Astro);
const { data: entities, error } = await supabase
  .from('entity_table')
  .select('*, related_table(*)')
  .order('created_at', { ascending: false });

if (error) console.error('Error fetching entities:', error);
---

<AdminLayout title="Gestión de Entity" user={user} currentPage="/admin/entity">
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Gestión de Entity</h2>
        <p class="text-gray-500 mt-1">Descripción breve</p>
      </div>
      <a
        href="/admin/entity/create"
        class="inline-flex items-center gap-2 bg-accent-blue text-white px-4 py-2.5 rounded-lg hover:bg-accent-blue-dark hover:-translate-y-0.5 hover:shadow-apple-md transition-all duration-200 font-semibold shadow-apple-sm"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Crear Entity
      </a>
    </div>

    <!-- Table Component -->
    <EntityTable
      client:load
      entities={entities || []}
      userRole={user.role}
    />
  </div>
</AdminLayout>
```

### 2. Componente React Table

Archivo: `src/components/admin/EntityTable.tsx`

```tsx
import React from 'react';
import DataTable from './catalog/DataTable';
import { Badge } from '@/components/ui/badge';

interface Entity {
  id: string;
  name: string;
  // ... other fields
}

interface EntityTableProps {
  entities: Entity[];
  userRole: string;
}

export default function EntityTable({ entities, userRole }: EntityTableProps) {
  // Define columns
  const columns = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (_: any, row: Entity) => (
        <div className="flex items-center gap-3">
          {/* Custom rendering */}
          <a
            href={`/admin/entity/${row.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-accent-blue"
          >
            {row.name}
          </a>
        </div>
      ),
      width: '280px'
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      width: '120px'
      // DataTable automatically renders status with Badge
    },
    {
      key: 'tier',
      label: 'Nivel',
      sortable: true,
      width: '120px'
      // DataTable automatically renders tier with Badge
    },
    // ... more columns
  ];

  // Define handlers
  const handleView = (entity: Entity) => {
    window.location.href = `/admin/entity/${entity.id}`;
  };

  const handleEdit = (entity: Entity) => {
    window.location.href = `/admin/entity/${entity.id}/edit`;
  };

  const handleDelete = async (entity: Entity) => {
    if (!confirm(`¿Estás seguro de eliminar "${entity.name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/entity/${entity.id}`, {
        method: 'DELETE'
      });
      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  return (
    <DataTable
      data={entities}
      columns={columns}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={userRole === 'super_admin' ? handleDelete : undefined}
      searchable
      selectable
    />
  );
}
```

## 🎨 Características del DataTable (Ya Implementadas)

El componente DataTable ya incluye:

✅ **Búsqueda**: Input con icon y focus ring accent-blue
✅ **Filtros**: Button ghost con icon
✅ **Sorting**: Click en headers, iconos de dirección
✅ **Paginación**: Accent-blue para página activa
✅ **Selección**: Checkboxes con text-accent-blue
✅ **Loading**: Spinner accent-blue
✅ **Empty state**: Icon y mensaje
✅ **Actions**: Botones con hover accent-blue-pale
✅ **Status badges**: Automático con Badge component
✅ **Tier badges**: Automático con Badge component
✅ **Hover**: bg-accent-blue-pale en rows

## 📊 Conversión Automática

El DataTable detecta automáticamente:

- **status column** → Renderiza con Badge (success/error/warning/info/neutral)
- **tier column** → Renderiza con Badge (gold/primary/neutral)
- **price/cost columns** → Formatea como CLP
- **image columns** → Renderiza imagen con rounded-lg y shadow

## 🎯 Páginas Pendientes de Actualizar

### Alta Prioridad (Usan tablas)

1. ✅ `/admin/providers` - **COMPLETADO**
2. ⏳ `/admin/catalog/houses` - Pendiente
3. ⏳ `/admin/catalog/services` - Pendiente
4. ⏳ `/admin/content/blog` - Pendiente
5. ⏳ `/admin/content/news` - Pendiente
6. ⏳ `/admin/users` - Pendiente

### Pasos para cada página:

1. **Crear nuevo archivo Astro** simplificado (60 líneas)
2. **Crear componente React Table** (250-300 líneas)
3. **Definir columns** con renders personalizados
4. **Implementar handlers** (view, edit, delete)
5. **Pasar props** al DataTable
6. **Reemplazar archivo antiguo** una vez testeado
7. **Actualizar PROGRESS.md**

## ⏱️ Tiempo Estimado por Página

- Crear página Astro: 15 min
- Crear componente Table: 45 min
- Testing: 15 min
- **Total por página**: ~1.5 horas

**Total para 5 páginas restantes**: ~7.5 horas

## 💡 Tips

### Renderizado Custom de Columnas

```tsx
{
  key: 'custom_field',
  label: 'Campo Custom',
  render: (_: any, row: Entity) => (
    <div className="...">
      {/* Tu JSX personalizado aquí */}
    </div>
  ),
  width: '200px' // Opcional
}
```

### Badges Personalizados

```tsx
<Badge variant="primary" size="sm">
  Texto
</Badge>

// Variantes disponibles:
// success, error, warning, info, neutral, primary, secondary, gold
```

### Iconos Heroicons

```tsx
<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="..." />
</svg>
```

## 📚 Referencias

- **DataTable component**: `src/components/admin/catalog/DataTable.tsx`
- **Badge component**: `src/components/ui/badge.tsx`
- **Button component**: `src/components/ui/button.tsx`
- **Ejemplo completo**: `src/components/admin/ProvidersTable.tsx`

## 🚀 Beneficios de este Patrón

1. ✅ **Menos código**: 60 líneas vs 550+ líneas
2. ✅ **Más reutilizable**: DataTable se usa en todas las páginas
3. ✅ **Más mantenible**: Cambios en DataTable se aplican a todas
4. ✅ **Design System v2.0**: Aplicado automáticamente
5. ✅ **Performance**: Client-side filtering/sorting más rápido
6. ✅ **UX mejorada**: Interactividad sin recargas de página

---

**Última actualización**: 2025-10-13 16:00 PM
**Autor**: Claude Code - FASE 3 Admin Panel Migration
