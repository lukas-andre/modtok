# 🎨 MODTOK Design System - Componentes UI

**Versión:** 2.0
**Fecha:** 2025-10-13
**Sistema de Diseño:** Apple Cupertino + MODTOK Identity

---

## 📚 Índice de Componentes

1. [Button](#button)
2. [Card](#card)
3. [Input & InputField](#input--inputfield)
4. [Select & SelectField](#select--selectfield)
5. [Badge](#badge)
6. [StatusBadge](#statusbadge)
7. [TierBadge](#tierbadge)

---

## Button

### Descripción
Componente de botón con múltiples variantes siguiendo el Design System Cupertino de Apple.

### Ubicación
`src/components/ui/button.tsx`

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'secondary' \| 'ghost' \| 'destructive' \| 'outline' \| 'link'` | `'default'` | Variante visual del botón |
| `size` | `'sm' \| 'default' \| 'lg' \| 'icon'` | `'default'` | Tamaño del botón |
| `disabled` | `boolean` | `false` | Deshabilita el botón |
| `className` | `string` | `''` | Clases CSS adicionales |

### Variantes

#### Default (Primary)
Accent Blue con hover effect y lift animation.

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">
  Guardar Cambios
</Button>
```

**Uso:** Acciones principales, CTAs importantes

---

#### Secondary
Brand Green para acciones de marca.

```tsx
<Button variant="secondary">
  Ir al Catálogo
</Button>
```

**Uso:** Acciones secundarias importantes, elementos de marca

---

#### Ghost
Transparente con border sutil.

```tsx
<Button variant="ghost">
  Cancelar
</Button>
```

**Uso:** Acciones terciarias, cancelar, cerrar

---

#### Destructive
Rojo para acciones peligrosas.

```tsx
<Button variant="destructive">
  Eliminar Cuenta
</Button>
```

**Uso:** Acciones destructivas irreversibles

---

#### Outline
Border accent-blue con fill en hover.

```tsx
<Button variant="outline">
  Ver Más
</Button>
```

**Uso:** Acciones alternativas, navegación

---

#### Link
Solo texto accent-blue con underline en hover.

```tsx
<Button variant="link">
  Términos y Condiciones
</Button>
```

**Uso:** Links de navegación, acciones inline

---

### Tamaños

```tsx
// Small
<Button size="sm">Pequeño</Button>

// Default
<Button size="default">Normal</Button>

// Large
<Button size="lg">Grande</Button>

// Icon only
<Button size="icon">
  <IconoSVG />
</Button>
```

---

### Ejemplos Completos

**Formulario con botones:**

```tsx
<div className="flex gap-3">
  <Button variant="default" type="submit">
    Guardar
  </Button>
  <Button variant="ghost" type="button" onClick={handleCancel}>
    Cancelar
  </Button>
</div>
```

**Con loading state (agregar manualmente):**

```tsx
<Button variant="default" disabled={isLoading}>
  {isLoading ? (
    <>
      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" /* ... */>
        {/* Spinner SVG */}
      </svg>
      Guardando...
    </>
  ) : (
    'Guardar'
  )}
</Button>
```

---

## Card

### Descripción
Componente de tarjeta con variantes premium, featured y default. Incluye hover effects elegantes.

### Ubicación
`src/components/ui/card.tsx`

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'premium' \| 'featured' \| 'ghost'` | `'default'` | Variante visual |
| `clickable` | `boolean` | `false` | Si es clickeable |
| `isPremium` | `boolean` | `false` | Muestra badge Premium dorado |
| `className` | `string` | `''` | Clases CSS adicionales |

### Subcomponentes

- `Card` - Container principal
- `CardHeader` - Header con padding
- `CardTitle` - Título (h3)
- `CardDescription` - Descripción
- `CardContent` - Contenido principal
- `CardFooter` - Footer con acciones

### Variantes

#### Default
Blanco limpio con border sutil.

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

<Card variant="default">
  <CardHeader>
    <CardTitle>Casa Modular 60m²</CardTitle>
    <CardDescription>2 dormitorios, 1 baño, cocina integrada</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-gray-600">
      Casa prefabricada de alta calidad con terminaciones premium.
    </p>
  </CardContent>
  <CardFooter>
    <Button variant="default" size="sm">Ver Detalles</Button>
  </CardFooter>
</Card>
```

---

#### Premium
Gradiente brand-green con badge dorado.

```tsx
<Card variant="premium" isPremium>
  <CardHeader>
    <CardTitle className="text-white">Casa Premium 120m²</CardTitle>
    <CardDescription className="text-blue-100">
      Plan exclusivo con todas las características
    </CardDescription>
  </CardHeader>
  <CardContent>
    <ul className="space-y-2 text-white">
      <li>✓ Diseño personalizado</li>
      <li>✓ Materiales premium</li>
      <li>✓ Garantía extendida</li>
    </ul>
  </CardContent>
  <CardFooter>
    <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-brand-green">
      Contactar
    </Button>
  </CardFooter>
</Card>
```

---

#### Featured
Border accent-blue destacado.

```tsx
<Card variant="featured">
  <CardHeader>
    <CardTitle>Oferta Especial</CardTitle>
    <CardDescription>Por tiempo limitado</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-2xl font-bold text-accent-blue">
      $45.000.000 CLP
    </p>
  </CardContent>
</Card>
```

---

#### Ghost
Transparente con hover sutil.

```tsx
<Card variant="ghost">
  <CardContent className="p-4">
    <p className="text-sm text-gray-600">Información adicional</p>
  </CardContent>
</Card>
```

---

### Card Clickeable

```tsx
<Card variant="default" clickable onClick={() => navigate('/casa/123')}>
  <CardHeader>
    <CardTitle>Casa Clickeable</CardTitle>
  </CardHeader>
</Card>
```

---

## Input & InputField

### Descripción
Input con estados, validación visual, iconos y soporte completo para labels/helper text.

### Ubicación
`src/components/ui/input.tsx`

### Input Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'error'` | `'default'` | Variante visual |
| `inputSize` | `'sm' \| 'default' \| 'lg'` | `'default'` | Tamaño |
| `error` | `boolean` | `false` | Estado de error |
| `leadingIcon` | `ReactNode` | - | Icono al inicio |
| `trailingIcon` | `ReactNode` | - | Icono al final |

### InputField Props

Incluye todas las props de Input más:

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Etiqueta del campo |
| `helperText` | `string` | - | Texto de ayuda |
| `errorMessage` | `string` | - | Mensaje de error |
| `required` | `boolean` | `false` | Campo requerido |

### Ejemplos

#### Input Básico

```tsx
import { Input } from '@/components/ui/input';

<Input
  type="text"
  placeholder="Ingresa tu nombre"
/>
```

---

#### InputField con Label y Helper

```tsx
import { InputField } from '@/components/ui/input';

<InputField
  label="Correo Electrónico"
  type="email"
  placeholder="tu@email.com"
  helperText="Nunca compartiremos tu correo"
  required
/>
```

---

#### Input con Error

```tsx
<InputField
  label="Teléfono"
  type="tel"
  placeholder="+56 9 1234 5678"
  errorMessage="Formato de teléfono inválido"
  required
/>
```

---

#### Input con Iconos

```tsx
import { Input } from '@/components/ui/input';

// Icono leading (búsqueda)
<Input
  type="text"
  placeholder="Buscar..."
  leadingIcon={
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  }
/>

// Icono trailing (mostrar/ocultar password)
<Input
  type={showPassword ? 'text' : 'password'}
  placeholder="Contraseña"
  trailingIcon={
    <button onClick={() => setShowPassword(!showPassword)}>
      <svg className="w-5 h-5" /* ... */>
        {/* Eye icon */}
      </svg>
    </button>
  }
/>
```

---

#### Diferentes Tamaños

```tsx
<InputField label="Small" inputSize="sm" />
<InputField label="Default" inputSize="default" />
<InputField label="Large" inputSize="lg" />
```

---

## Select & SelectField

### Descripción
Select personalizado con chevron custom y Apple-style focus ring.

### Ubicación
`src/components/ui/select.tsx`

### Select Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'error'` | `'default'` | Variante visual |
| `selectSize` | `'sm' \| 'default' \| 'lg'` | `'default'` | Tamaño |
| `error` | `boolean` | `false` | Estado de error |
| `options` | `Array<{value, label, disabled?}>` | - | Array de opciones |

### SelectField Props

Incluye todas las props de Select más:

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Etiqueta del campo |
| `helperText` | `string` | - | Texto de ayuda |
| `errorMessage` | `string` | - | Mensaje de error |
| `required` | `boolean` | `false` | Campo requerido |

### Ejemplos

#### Select Básico

```tsx
import { Select } from '@/components/ui/select';

<Select>
  <option value="">Selecciona una opción</option>
  <option value="1">Opción 1</option>
  <option value="2">Opción 2</option>
  <option value="3">Opción 3</option>
</Select>
```

---

#### Select con Array de Options

```tsx
const regiones = [
  { value: 'rm', label: 'Región Metropolitana' },
  { value: 'v', label: 'Región de Valparaíso' },
  { value: 'viii', label: 'Región del Biobío' },
];

<Select
  options={regiones}
  defaultValue="rm"
/>
```

---

#### SelectField Completo

```tsx
import { SelectField } from '@/components/ui/select';

<SelectField
  label="Tipo de Casa"
  helperText="Selecciona el tipo de casa que buscas"
  required
  options={[
    { value: '', label: 'Selecciona un tipo', disabled: true },
    { value: 'modular', label: 'Casa Modular' },
    { value: 'prefabricada', label: 'Casa Prefabricada' },
    { value: 'container', label: 'Casa Container' },
  ]}
/>
```

---

#### Select con Error

```tsx
<SelectField
  label="Región"
  errorMessage="Debes seleccionar una región"
  required
  options={regiones}
/>
```

---

## Badge

### Descripción
Badge/Tag component con múltiples variantes y tamaños.

### Ubicación
`src/components/ui/badge.tsx`

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'success' \| 'error' \| 'warning' \| 'info' \| 'neutral' \| 'primary' \| 'secondary' \| 'gold'` | `'neutral'` | Variante de color |
| `size` | `'sm' \| 'default' \| 'lg'` | `'default'` | Tamaño |
| `withDot` | `boolean` | `false` | Muestra un dot indicator |
| `icon` | `ReactNode` | - | Icono personalizado |
| `onRemove` | `() => void` | - | Función para remover (muestra X) |

### Variantes de Color

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="success">Activo</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="warning">Pendiente</Badge>
<Badge variant="info">Información</Badge>
<Badge variant="neutral">Neutral</Badge>
<Badge variant="primary">Primario</Badge>
<Badge variant="secondary">Secundario</Badge>
<Badge variant="gold">Premium</Badge>
```

---

### Tamaños

```tsx
<Badge size="sm">Pequeño</Badge>
<Badge size="default">Normal</Badge>
<Badge size="lg">Grande</Badge>
```

---

### Con Dot Indicator

```tsx
<Badge variant="success" withDot>
  En línea
</Badge>
```

---

### Con Icono

```tsx
<Badge
  variant="gold"
  icon={
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
      {/* Star icon */}
    </svg>
  }
>
  Premium
</Badge>
```

---

### Badge Removible

```tsx
<Badge
  variant="info"
  onRemove={() => handleRemoveTag('react')}
>
  React
</Badge>
```

---

## StatusBadge

### Descripción
Badge especializado para mostrar estados con dot indicator automático.

### Ubicación
`src/components/ui/badge.tsx`

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `status` | `'active' \| 'inactive' \| 'pending' \| 'error' \| 'success'` | Estado a mostrar |

### Ejemplos

```tsx
import { StatusBadge } from '@/components/ui/badge';

<StatusBadge status="active" />    // Verde: "Activo"
<StatusBadge status="inactive" />  // Gris: "Inactivo"
<StatusBadge status="pending" />   // Amarillo: "Pendiente"
<StatusBadge status="error" />     // Rojo: "Error"
<StatusBadge status="success" />   // Verde: "Éxito"
```

**Uso típico en tablas:**

```tsx
<td>
  <StatusBadge status={provider.status} />
</td>
```

---

## TierBadge

### Descripción
Badge especializado para mostrar tiers/planes con iconos automáticos.

### Ubicación
`src/components/ui/badge.tsx`

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `tier` | `'free' \| 'basic' \| 'premium' \| 'enterprise'` | Tier a mostrar |

### Ejemplos

```tsx
import { TierBadge } from '@/components/ui/badge';

<TierBadge tier="free" />        // Gris: "Gratis"
<TierBadge tier="basic" />       // Azul: "Básico"
<TierBadge tier="premium" />     // Dorado: "Premium" ⭐
<TierBadge tier="enterprise" />  // Verde: "Enterprise" 💼
```

**Uso típico en cards:**

```tsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Casa Modular</CardTitle>
      <TierBadge tier="premium" />
    </div>
  </CardHeader>
</Card>
```

---

## 🎨 Ejemplos de Composición

### Formulario Completo

```tsx
import { InputField, SelectField } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

function ContactForm() {
  return (
    <form className="space-y-6">
      <InputField
        label="Nombre Completo"
        type="text"
        placeholder="Juan Pérez"
        required
      />

      <InputField
        label="Correo Electrónico"
        type="email"
        placeholder="juan@email.com"
        helperText="Te contactaremos a este correo"
        required
      />

      <InputField
        label="Teléfono"
        type="tel"
        placeholder="+56 9 1234 5678"
        leadingIcon={
          <svg className="w-5 h-5" /* Phone icon */>
        }
      />

      <SelectField
        label="Región"
        helperText="¿En qué región buscas tu casa?"
        required
        options={[
          { value: '', label: 'Selecciona una región', disabled: true },
          { value: 'rm', label: 'Región Metropolitana' },
          { value: 'v', label: 'Región de Valparaíso' },
        ]}
      />

      <div className="flex gap-3">
        <Button variant="default" type="submit" className="flex-1">
          Enviar Consulta
        </Button>
        <Button variant="ghost" type="button">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
```

---

### Grid de Cards con Badges

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TierBadge, StatusBadge } from '@/components/ui/badge';

function CatalogGrid({ casas }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {casas.map((casa) => (
        <Card key={casa.id} variant={casa.tier === 'premium' ? 'premium' : 'default'} isPremium={casa.tier === 'premium'}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <TierBadge tier={casa.tier} />
              <StatusBadge status={casa.status} />
            </div>
            <CardTitle className={casa.tier === 'premium' ? 'text-white' : ''}>
              {casa.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={casa.tier === 'premium' ? 'text-blue-100' : 'text-gray-600'}>
              {casa.description}
            </p>
            <div className="mt-4 flex gap-2 flex-wrap">
              <Badge variant="info" size="sm">{casa.bedrooms} dorm</Badge>
              <Badge variant="info" size="sm">{casa.bathrooms} baño</Badge>
              <Badge variant="info" size="sm">{casa.size}m²</Badge>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant={casa.tier === 'premium' ? 'outline' : 'default'}
              size="sm"
              className="w-full"
            >
              Ver Detalles
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

---

## 🚀 Best Practices

### 1. Consistencia de Colores
Usar siempre las variantes definidas en lugar de clases custom:

```tsx
// ✅ Correcto
<Button variant="default">Guardar</Button>
<Badge variant="success">Activo</Badge>

// ❌ Incorrecto
<button className="bg-blue-500">Guardar</button>
<span className="bg-green-100">Activo</span>
```

---

### 2. Accesibilidad

Siempre usar `label` con inputs:

```tsx
// ✅ Correcto
<InputField label="Email" type="email" />

// ❌ Incorrecto (sin label)
<Input type="email" placeholder="Email" />
```

Usar `required` cuando sea necesario:

```tsx
<InputField label="Nombre" required />
```

---

### 3. Validación Visual

Mostrar errores de forma clara:

```tsx
<InputField
  label="Teléfono"
  type="tel"
  errorMessage={errors.phone}
  value={formData.phone}
  onChange={handleChange}
/>
```

---

### 4. Estados de Loading

Deshabilitar botones durante operaciones:

```tsx
<Button
  variant="default"
  disabled={isLoading}
  onClick={handleSubmit}
>
  {isLoading ? 'Guardando...' : 'Guardar'}
</Button>
```

---

### 5. Responsive Design

Los componentes son responsive por defecto, pero puedes ajustar tamaños:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <InputField label="Nombre" />
  <InputField label="Apellido" />
</div>
```

---

## 📦 Imports Rápidos

```tsx
// Botones
import { Button } from '@/components/ui/button';

// Cards
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

// Inputs
import { Input, InputField } from '@/components/ui/input';

// Selects
import { Select, SelectField } from '@/components/ui/select';

// Badges
import { Badge, StatusBadge, TierBadge } from '@/components/ui/badge';
```

---

## 🎯 Próximos Componentes

Componentes planificados para futuras versiones:

- [ ] Modal/Dialog
- [ ] Toast/Notification
- [ ] Tabs
- [ ] Accordion
- [ ] Pagination
- [ ] Tooltip
- [ ] Dropdown Menu
- [ ] DatePicker
- [ ] File Upload
- [ ] Progress Bar
- [ ] Skeleton Loader

---

**Mantenido por:** Equipo MODTOK
**Última actualización:** 2025-10-13
**Versión Design System:** 2.0
