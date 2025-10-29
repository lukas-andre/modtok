# Admin Form Pattern - Design System v2.0

## 📋 Patrón de Formularios Simplificados

Este documento define el patrón estándar para todos los formularios de administración en MODTOK, aplicando el Design System v2.0.

---

## 🎯 Objetivo

**Reducir formularios de 750+ líneas a ~250 líneas** mediante:
- Uso de componentes UI reutilizables (Input, Select, Button)
- Componente FormSection para secciones consistentes
- Eliminación de código repetitivo
- Aplicación automática del Design System v2.0

---

## 📊 Resultados Esperados

### Antes vs Después

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Líneas de código | ~774 | ~250 | -68% |
| Inputs manuales | 30+ inputs | Componentes | 100% |
| Secciones repetidas | 7 secciones | FormSection | Estandarizado |
| Estilos inline | Repetidos | Design System | Consistente |
| Botones custom | HTML manual | Button component | Reutilizable |

---

## 🧩 Componentes Requeridos

### 1. InputField (Ya existe)
```tsx
import { InputField } from '@/components/ui/input';

<InputField
  label="Nombre de la Casa"
  name="name"
  required
  placeholder="Ej: Casa Lago Premium"
  helperText="Nombre visible en el catálogo"
/>
```

### 2. SelectField (Ya existe)
```tsx
import { SelectField } from '@/components/ui/select';

<SelectField
  label="Estado"
  name="status"
  required
  options={[
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activo' }
  ]}
/>
```

### 3. TextAreaField (Nuevo - crear)
```tsx
import { TextAreaField } from '@/components/ui/textarea';

<TextAreaField
  label="Descripción"
  name="description"
  rows={4}
  placeholder="Descripción detallada..."
/>
```

### 4. FormSection (Nuevo - crear)
```tsx
import { FormSection } from '@/components/admin/FormSection';

<FormSection title="Información Básica" description="Datos principales del producto">
  {/* Form fields here */}
</FormSection>
```

### 5. Button (Ya existe)
```tsx
import { Button } from '@/components/ui/button';

<Button type="submit" variant="default">
  Crear Casa
</Button>

<Button type="button" variant="ghost" onClick={handleCancel}>
  Cancelar
</Button>
```

---

## 📐 Estructura del Formulario

### Patrón Base

```astro
---
import AdminLayout from '@/layouts/AdminLayout.astro';
import HouseForm from '@/components/admin/forms/HouseForm';
import { getAdminAuth, requireAdmin } from '@/lib/auth';
import { createSupabaseClient } from '@/lib/supabase';

const auth = await getAdminAuth(Astro);
const user = requireAdmin(auth);

if (!user) {
  return Astro.redirect('/auth/login?redirect=/admin/catalog/houses/create');
}

const supabase = createSupabaseClient(Astro);

// Fetch dropdown data
const { data: providers } = await supabase
  .from('providers')
  .select('id, company_name')
  .eq('status', 'active')
  .order('company_name');

const { data: topologies } = await supabase
  .from('house_topologies')
  .select('*')
  .eq('is_active', true)
  .order('display_order');
---

<AdminLayout title="Nueva Casa" user={user} currentPage="/admin/catalog/houses">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Nueva Casa</h1>
        <p class="mt-1 text-sm text-gray-500">
          Agregue una nueva casa al catálogo
        </p>
      </div>
      <a
        href="/admin/catalog/houses"
        class="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-accent-blue transition-all duration-200"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Volver al listado
      </a>
    </div>

    <!-- React Form Component -->
    <HouseForm
      client:load
      providers={providers || []}
      topologies={topologies || []}
      mode="create"
    />
  </div>
</AdminLayout>
```

### Componente React Form

```tsx
// src/components/admin/forms/HouseForm.tsx
import React, { useState } from 'react';
import { InputField } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import { TextAreaField } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/admin/FormSection';

interface HouseFormProps {
  providers: Array<{ id: string; company_name: string }>;
  topologies: Array<{ id: string; code: string; description: string }>;
  mode: 'create' | 'edit';
  initialData?: any;
}

export default function HouseForm({ providers, topologies, mode, initialData }: HouseFormProps) {
  const [formData, setFormData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/houses', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        window.location.href = `/admin/catalog/houses/${result.id}/edit`;
      } else {
        const error = await response.json();
        setErrors(error.errors || {});
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <FormSection
        title="Información Básica"
        description="Datos principales de la casa"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nombre de la Casa"
            name="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Ej: Casa Lago Premium"
            errorMessage={errors.name}
          />

          <InputField
            label="Slug URL"
            name="slug"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="casa-lago-premium (auto-generado)"
            helperText="Se genera automáticamente del nombre"
          />

          <SelectField
            label="Proveedor"
            name="provider_id"
            value={formData.provider_id}
            onChange={(e) => handleChange('provider_id', e.target.value)}
            required
            options={[
              { value: '', label: 'Seleccionar proveedor' },
              ...providers.map(p => ({ value: p.id, label: p.company_name }))
            ]}
            errorMessage={errors.provider_id}
          />

          <SelectField
            label="Topología"
            name="topology_id"
            value={formData.topology_id}
            onChange={(e) => handleChange('topology_id', e.target.value)}
            options={[
              { value: '', label: 'Seleccionar topología' },
              ...topologies.map(t => ({
                value: t.id,
                label: `${t.code} - ${t.description}`
              }))
            ]}
          />
        </div>

        <TextAreaField
          label="Descripción Corta"
          name="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
          placeholder="Descripción breve para cards y listados"
        />
      </FormSection>

      {/* Dimensiones */}
      <FormSection title="Dimensiones" description="Especificaciones técnicas">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField
            type="number"
            label="Habitaciones"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
            min={0}
          />

          <InputField
            type="number"
            label="Baños"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={(e) => handleChange('bathrooms', e.target.value)}
            min={0}
            step={0.5}
          />

          <InputField
            type="number"
            label="Área Total (m²)"
            name="area_m2"
            value={formData.area_m2}
            onChange={(e) => handleChange('area_m2', e.target.value)}
            min={0}
            step={0.01}
          />

          <InputField
            type="number"
            label="Pisos"
            name="floors"
            value={formData.floors || 1}
            onChange={(e) => handleChange('floors', e.target.value)}
            min={1}
          />
        </div>
      </FormSection>

      {/* Precio */}
      <FormSection title="Precio y Stock" description="Información comercial">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            type="number"
            label="Precio (CLP)"
            name="price"
            value={formData.price}
            onChange={(e) => handleChange('price', e.target.value)}
            min={0}
          />

          <InputField
            type="number"
            label="Stock Disponible"
            name="stock_quantity"
            value={formData.stock_quantity || 0}
            onChange={(e) => handleChange('stock_quantity', e.target.value)}
            min={0}
          />

          <SelectField
            label="Estado del Stock"
            name="stock_status"
            value={formData.stock_status || 'available'}
            onChange={(e) => handleChange('stock_status', e.target.value)}
            options={[
              { value: 'available', label: 'Disponible' },
              { value: 'low_stock', label: 'Stock Bajo' },
              { value: 'out_of_stock', label: 'Sin Stock' },
              { value: 'pre_order', label: 'Pre-orden' }
            ]}
          />
        </div>
      </FormSection>

      {/* SEO y Estado */}
      <FormSection title="SEO y Estado" description="Optimización y publicación">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Estado"
            name="status"
            value={formData.status || 'draft'}
            onChange={(e) => handleChange('status', e.target.value)}
            required
            options={[
              { value: 'draft', label: 'Borrador' },
              { value: 'pending_review', label: 'Pendiente Revisión' },
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' }
            ]}
          />

          <SelectField
            label="Tier"
            name="tier"
            value={formData.tier || 'standard'}
            onChange={(e) => handleChange('tier', e.target.value)}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'destacado', label: 'Destacado' },
              { value: 'premium', label: 'Premium' }
            ]}
          />
        </div>

        <InputField
          label="Meta Title"
          name="meta_title"
          value={formData.meta_title}
          onChange={(e) => handleChange('meta_title', e.target.value)}
          maxLength={60}
          helperText="Máximo 60 caracteres"
        />

        <TextAreaField
          label="Meta Description"
          name="meta_description"
          value={formData.meta_description}
          onChange={(e) => handleChange('meta_description', e.target.value)}
          rows={2}
          maxLength={160}
          helperText="Máximo 160 caracteres"
        />
      </FormSection>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.location.href = '/admin/catalog/houses'}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            handleChange('status', 'draft');
            handleSubmit(new Event('submit') as any);
          }}
          disabled={loading}
        >
          Guardar Borrador
        </Button>

        <Button
          type="submit"
          variant="default"
          disabled={loading}
        >
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear Casa' : 'Actualizar Casa'}
        </Button>
      </div>
    </form>
  );
}
```

---

## 🎨 Componente FormSection

```tsx
// src/components/admin/FormSection.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const formSectionVariants = cva(
  "bg-white rounded-lg shadow-apple-sm border border-gray-200 overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
        flat: "shadow-none border-0"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface FormSectionProps extends VariantProps<typeof formSectionVariants> {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function FormSection({
  title,
  description,
  children,
  actions,
  variant
}: FormSectionProps) {
  return (
    <div className={formSectionVariants({ variant })}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}
```

---

## 🎨 Componente TextAreaField

```tsx
// src/components/ui/textarea.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  "block w-full rounded-lg border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-accent-blue focus:ring-accent-blue/20",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      },
      textSize: {
        sm: "text-sm px-3 py-2",
        default: "text-sm px-3.5 py-2.5",
        lg: "text-base px-4 py-3"
      }
    },
    defaultVariants: {
      variant: "default",
      textSize: "default"
    }
  }
);

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, variant, textSize, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, textSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
TextArea.displayName = "TextArea";

// TextAreaField with label, helper, and error
interface TextAreaFieldProps extends TextAreaProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
}

const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, helperText, errorMessage, required, id, className, ...props }, ref) => {
    const fieldId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!errorMessage;

    return (
      <div className={className}>
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <TextArea
          id={fieldId}
          ref={ref}
          variant={hasError ? 'error' : 'default'}
          {...props}
        />

        {helperText && !hasError && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}

        {hasError && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
TextAreaField.displayName = "TextAreaField";

export { TextArea, TextAreaField, textareaVariants };
```

---

## 📋 Checklist de Migración

Para cada formulario (create.astro y [id]/edit.astro):

### 1. Preparación
- [ ] Leer formulario original y crear backup (*-old.astro)
- [ ] Identificar todas las secciones del formulario
- [ ] Listar todos los campos y sus tipos
- [ ] Identificar dropdowns que necesitan datos

### 2. Crear Componente React
- [ ] Crear archivo en `src/components/admin/forms/`
- [ ] Definir interface de props (providers, initialData, etc.)
- [ ] Implementar useState para formData y errors
- [ ] Crear handleSubmit function
- [ ] Crear handleChange function con auto-slug generation

### 3. Migrar Secciones
- [ ] Usar FormSection para cada sección
- [ ] Reemplazar inputs con InputField
- [ ] Reemplazar selects con SelectField
- [ ] Reemplazar textareas con TextAreaField
- [ ] Usar grid layout (grid-cols-2, grid-cols-4)

### 4. Simplificar Página Astro
- [ ] Mantener solo auth y data fetching en frontmatter
- [ ] Crear header con título y botón volver
- [ ] Renderizar componente React con client:load
- [ ] Pasar datos como props
- [ ] Eliminar todo el HTML del formulario

### 5. Testing
- [ ] Verificar que todos los campos se renderizan
- [ ] Probar submit (create y update)
- [ ] Verificar validación de errores
- [ ] Probar auto-slug generation
- [ ] Verificar responsive design

---

## 📦 Forms a Migrar

### Alta Prioridad
1. **Houses** (create.astro + [id]/edit.astro)
   - 774 líneas → ~250 líneas
   - 7 secciones principales
   - 30+ campos

2. **Services** (create.astro + [id]/edit.astro)
   - Similar a houses
   - Campos de servicios específicos

3. **Providers** (create.astro + [id]/edit.astro)
   - Información de empresa
   - Categorías y tier

### Media Prioridad
4. **Blog Posts** (create.astro + [id]/edit.astro)
   - Editor de contenido
   - Categorías y tags
   - SEO fields

5. **News** (create.astro + [id]/edit.astro)
   - Similar a blog
   - Breaking news toggle

### Baja Prioridad
6. **Users** (create.astro + [id]/edit.astro)
   - Crear estos formularios (no existen)
   - Info de usuario y rol

---

## 🚀 Beneficios

### Mantenibilidad
- ✅ Cambios en Input/Select se reflejan en todos los forms
- ✅ Design System v2.0 aplicado automáticamente
- ✅ Validación consistente en todos los formularios
- ✅ Código DRY (Don't Repeat Yourself)

### Performance
- ✅ React component con estado optimizado
- ✅ Validación en tiempo real sin recargar
- ✅ Auto-save drafts posible

### UX
- ✅ Focus rings consistentes (accent-blue)
- ✅ Error messages elegantes con iconos
- ✅ Helper texts útiles
- ✅ Transiciones suaves
- ✅ Loading states en botones

### Developer Experience
- ✅ Props typed con TypeScript
- ✅ Componentes reutilizables
- ✅ Patrón documentado y fácil de seguir
- ✅ Menos código = menos bugs

---

## 📝 Notas Importantes

### Auto-slug Generation
```tsx
// En el handleChange del nombre
if (name === 'name' && !formData.slug) {
  const slug = value
    .toLowerCase()
    .replace(/[áàäâã]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöôõ]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  handleChange('slug', slug);
}
```

### API Routes
Los formularios deben hacer fetch a:
- `POST /api/admin/{entity}` para crear
- `PUT /api/admin/{entity}` para actualizar

### Validation
- Required fields validados en cliente
- Server-side validation en API routes
- Errores mostrados inline con errorMessage prop

---

**Última actualización:** 2025-10-13
**Mantenido por:** Claude Code & Equipo MODTOK
