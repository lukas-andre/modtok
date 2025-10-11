# Dynamic Form Builder - Guía de Uso

## ✅ Estado: P1.1 COMPLETADO

El Form Builder Dinámico está implementado y listo para usar. Este sistema renderiza automáticamente inputs basados en `feature_definitions` de Supabase.

---

## 📦 Componentes Creados

### 1. **Hook: `useFeatureDefinitions`**
📁 `src/hooks/useFeatureDefinitions.ts`

Hook para cargar feature definitions desde Supabase:

```typescript
import { useFeatureDefinitions } from '@/hooks/useFeatureDefinitions';

const { features, groupedFeatures, loading, error } = useFeatureDefinitions('fabrica', false);
```

**Parámetros:**
- `category`: `'fabrica' | 'casas' | 'habilitacion_servicios' | null`
- `includeInactive`: `boolean` - incluir features inactivas (default: false)

**Returns:**
- `features`: Array de todas las features
- `groupedFeatures`: Features agrupadas por `group_name`
- `loading`: Estado de carga
- `error`: Error si ocurrió alguno

---

### 2. **Componente: `DynamicFeatureInput`**
📁 `src/components/admin/DynamicFeatureInput.tsx`

Renderiza el input correcto según el tipo de dato:

```typescript
<DynamicFeatureInput
  feature={featureDefinition}
  value={currentValue}
  onChange={(newValue) => handleChange(newValue)}
  disabled={false}
/>
```

**Tipos de Input Soportados:**

| data_type | admin_input_type | Renderiza |
|-----------|------------------|-----------|
| `boolean` | - | Checkbox |
| `number` | - | Input number con min/max |
| `text` | `textarea` | Textarea |
| `text` | `select` | Select dropdown |
| `text` | `radio` | Radio buttons |
| `text` | - | Input text |
| `text_array` | - | Input de tags (separados por coma) |
| `json` | - | Textarea JSON |

---

### 3. **Componente: `FeatureFormBuilder`**
📁 `src/components/admin/FeatureFormBuilder.tsx`

Form builder completo con agrupación y progreso:

```tsx
import FeatureFormBuilder from '@/components/admin/FeatureFormBuilder';

<FeatureFormBuilder
  category={provider.primary_category}
  currentFeatures={provider.features}
  onChange={(newFeatures) => setProvider({ ...provider, features: newFeatures })}
  disabled={false}
/>
```

**Features:**
- ✅ Carga automática desde `feature_definitions`
- ✅ Agrupación por `group_name`
- ✅ Grupos colapsables
- ✅ Barra de progreso por grupo
- ✅ Estadísticas de completitud
- ✅ Validaciones según `validation_rules`

---

## 🚀 Cómo Usar en Formularios Astro

### Opción 1: Integración en `.astro` con React Island

```astro
---
import AdminLayout from '@/layouts/AdminLayout.astro';
import FeatureFormBuilder from '@/components/admin/FeatureFormBuilder';

const { provider } = Astro.props;
---

<AdminLayout title="Editar Proveedor" user={user}>
  <form id="providerForm">
    <!-- Campos estáticos -->
    <input type="text" name="company_name" value={provider.company_name} />
    <select name="primary_category" id="categorySelect">
      <option value="fabrica">Fábrica</option>
      <option value="casas">Casas</option>
      <option value="habilitacion_servicios">Servicios</option>
    </select>

    <!-- Form Builder Dinámico -->
    <div id="features-section">
      <FeatureFormBuilder
        client:load
        category={provider.primary_category}
        currentFeatures={provider.features || {}}
        onChange={(features) => {
          // Los features se almacenan en un hidden input
          document.getElementById('features-data').value = JSON.stringify(features);
        }}
      />
    </div>

    <input type="hidden" id="features-data" name="features" />

    <button type="submit">Guardar</button>
  </form>

  <script>
    // Actualizar category cuando cambia el select
    const categorySelect = document.getElementById('categorySelect');
    categorySelect?.addEventListener('change', (e) => {
      // Re-render del FeatureFormBuilder con nueva categoría
      // Esto requiere una actualización del componente
    });

    // Submit handler
    document.getElementById('providerForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);

      const data = {
        company_name: formData.get('company_name'),
        primary_category: formData.get('primary_category'),
        features: JSON.parse(formData.get('features') || '{}')
      };

      const response = await fetch('/api/admin/providers/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Proveedor actualizado');
      }
    });
  </script>
</AdminLayout>
```

---

### Opción 2: Componente React Wrapper Completo

Crear un wrapper que maneje todo el estado:

📁 `src/components/admin/ProviderFeaturesForm.tsx`

```tsx
import { useState, useEffect } from 'react';
import FeatureFormBuilder from './FeatureFormBuilder';
import type { Database } from '@/lib/database.types';

type CategoryType = Database['public']['Enums']['category_type'];

interface Props {
  initialCategory: CategoryType;
  initialFeatures: Record<string, any>;
  onSave: (features: Record<string, any>) => Promise<void>;
}

export default function ProviderFeaturesForm({ initialCategory, initialFeatures, onSave }: Props) {
  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [features, setFeatures] = useState(initialFeatures);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(features);
      alert('Features guardadas exitosamente');
    } catch (error) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría Principal
        </label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as CategoryType);
            setFeatures({}); // Reset features cuando cambia categoría
          }}
          className="block w-full rounded-md border-gray-300"
        >
          <option value="fabrica">Fábrica</option>
          <option value="casas">Casas</option>
          <option value="habilitacion_servicios">Habilitación y Servicios</option>
        </select>
      </div>

      <FeatureFormBuilder
        category={category}
        currentFeatures={features}
        onChange={setFeatures}
        disabled={saving}
      />

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'Guardar Features'}
        </button>
      </div>
    </div>
  );
}
```

Uso en `.astro`:

```astro
<ProviderFeaturesForm
  client:load
  initialCategory={provider.primary_category}
  initialFeatures={provider.features}
  onSave={async (features) => {
    const response = await fetch(`/api/admin/providers/${provider.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    if (!response.ok) throw new Error('Failed to save');
  }}
/>
```

---

## 📊 Estructura de Datos

### Input: `feature_definitions` (DB)

```sql
SELECT * FROM feature_definitions
WHERE category = 'fabrica'
  AND is_active = true
ORDER BY display_order;
```

Ejemplo de registro:

```json
{
  "id": "uuid",
  "category": "fabrica",
  "group_name": "servicios_disponibles",
  "feature_key": "dise_pers",
  "label": "Diseño Personalizado",
  "data_type": "boolean",
  "admin_input_type": null,
  "validation_rules": {
    "required": false
  },
  "show_in_card_premium": true,
  "show_in_card_destacado": true,
  "show_in_card_standard": false,
  "requires_login": false
}
```

### Output: `features` JSONB

```json
{
  "servicios_disponibles": {
    "dise_pers": true,
    "instalacion": true,
    "transporte": false
  },
  "especialidad": {
    "tiny_houses": true,
    "panel_sip": true
  },
  "generales": {
    "experiencia": 15,
    "precio_ref_min_m2": 800000
  }
}
```

---

## ✅ Validaciones

El sistema soporta validaciones en `validation_rules` JSONB:

```json
{
  "required": true,
  "min": 0,
  "max": 100,
  "pattern": "^[A-Z]{2}[0-9]{4}$",
  "options": ["Opción A", "Opción B", "Opción C"]
}
```

---

## 🎯 Próximos Pasos (P1.2+)

Para integrar completamente en formularios admin:

1. **Actualizar `/admin/providers/create.astro`**:
   - Reemplazar sección "Features" legacy por `<FeatureFormBuilder>`
   - Conectar con el submit handler

2. **Actualizar `/admin/providers/[id]/edit.astro`**:
   - Usar `FeatureFormBuilder` con datos existentes
   - Manejar actualización de features

3. **Actualizar `SpecificationBuilder.tsx`**:
   - Opcionalmente migrar a usar `feature_definitions` también

---

## 📝 Notas Técnicas

- **Performance**: El hook `useFeatureDefinitions` cachea en el cliente
- **Tipos**: Totalmente tipado con TypeScript + database.types.ts
- **Accesibilidad**: Labels, ARIA attributes, keyboard navigation
- **Responsive**: Funciona en mobile/tablet/desktop

---

## ❓ FAQ

**Q: ¿Puedo usar esto fuera del admin?**
A: Sí, pero asegúrate de controlar permisos. El hook usa `createBrowserSupabaseClient` que respeta RLS.

**Q: ¿Cómo agrego una nueva feature?**
A: Inserta en `feature_definitions` vía SQL o admin. El form builder la mostrará automáticamente.

**Q: ¿Puedo personalizar los inputs?**
A: Sí, modifica `DynamicFeatureInput.tsx` o crea un input custom y pásalo como prop.

---

**✅ P1.1 Form Builder Dinámico - COMPLETADO**
