# 🚀 Plan de Migración al Nuevo Design System

**Versión:** 2.0
**Fecha Inicio:** 2025-10-13
**Objetivo:** Migrar toda la aplicación al nuevo design system Apple Cupertino con identidad MODTOK

---

## 📊 Resumen Ejecutivo

### Problemas Identificados

1. ❌ **Dashboard obsoleto** (`/dashboard`) - existe pero debe eliminarse y redirigir a `/admin`
2. ❌ **Blog sin categorías funcionales** - `/blog/categoria/*` no existen
3. ❌ **Noticias sin categorías funcionales** - `/noticias/categoria/*` no existen
4. ❌ **Diseño inconsistente** - Diferentes estilos entre admin y frontend
5. ❌ **Colores desactualizados** - No usa el accent blue #4DA1F5
6. ❌ **Admin panel sin estilo Cupertino** - Diseño antiguo y poco elegante

### Objetivos

- ✅ Unificar design system en toda la app
- ✅ Implementar estilo Apple Cupertino elegante
- ✅ Crear páginas de categorías funcionales
- ✅ Eliminar código obsoleto
- ✅ Mejorar experiencia de usuario

---

## 📋 FASE 1: Actualización del Sistema Base

### 1.1 Actualizar Variables CSS Globales

**Archivo:** `src/styles/globals.css`

**Tareas:**
- [ ] Añadir variables de color del nuevo design system
- [ ] Actualizar `--accent` de Tailwind con `#4DA1F5`
- [ ] Añadir variable `--brand-green: #31453A`
- [ ] Añadir variable `--accent-blue: #4DA1F5`
- [ ] Definir escala completa de grises
- [ ] Añadir variables de sombras Apple-style
- [ ] Configurar variables de animación

**Código sugerido:**
```css
@import url('https://fonts.cdnfonts.com/css/tex-gyre-heros');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand Colors */
    --brand-green: #31453A;
    --brand-green-dark: #283A30;
    --brand-green-light: #3D5546;

    --accent-blue: #4DA1F5;
    --accent-blue-dark: #3B8FE3;
    --accent-blue-light: #6BB3F7;
    --accent-blue-pale: rgba(77, 161, 245, 0.1);

    --accent-gold: #B48C36;
    --accent-gold-dark: #A1792F;

    /* Backgrounds */
    --bg-primary: #FFFFFF;
    --bg-secondary: #F9FAFB;
    --bg-tertiary: #F3F4F6;

    /* Text */
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --text-tertiary: #9CA3AF;

    /* Borders */
    --border-light: #E5E7EB;
    --border-medium: #D1D5DB;

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    /* Transitions */
    --transition-base: 200ms cubic-bezier(0, 0, 0.2, 1);
    --transition-spring: 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  body {
    font-family: 'Tex Gyre Heros', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }
}
```

**Prioridad:** 🔴 ALTA
**Tiempo estimado:** 1 hora

---

### 1.2 Actualizar Tailwind Config

**Archivo:** `tailwind.config.mjs`

**Tareas:**
- [ ] Extender tema con colores del design system
- [ ] Configurar `accent-blue` como color primario
- [ ] Añadir `brand-green` a la paleta
- [ ] Configurar font family con Tex Gyre Heros
- [ ] Añadir utilidades personalizadas para sombras Apple

**Código sugerido:**
```js
export default {
  theme: {
    extend: {
      colors: {
        'brand-green': {
          DEFAULT: '#31453A',
          dark: '#283A30',
          light: '#3D5546',
        },
        'accent-blue': {
          DEFAULT: '#4DA1F5',
          dark: '#3B8FE3',
          light: '#6BB3F7',
          pale: 'rgba(77, 161, 245, 0.1)',
        },
        'accent-gold': {
          DEFAULT: '#B48C36',
          dark: '#A1792F',
        },
      },
      fontFamily: {
        sans: ['Tex Gyre Heros', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'apple-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'apple-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'apple-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
}
```

**Prioridad:** 🔴 ALTA
**Tiempo estimado:** 30 minutos

---

## 📋 FASE 2: Crear Componentes Base Reutilizables

### 2.1 Componente Button

**Archivo:** `src/components/ui/Button.tsx`

**Variantes:**
- `primary` - Accent blue
- `secondary` - Brand green
- `ghost` - Transparente con border
- `danger` - Rojo para acciones destructivas
- `link` - Sin background, solo texto

**Tareas:**
- [ ] Crear componente base con variantes
- [ ] Añadir estados hover/active/disabled
- [ ] Soportar icons (leading/trailing)
- [ ] Añadir prop `loading` con spinner
- [ ] Documentar props y ejemplos

**Prioridad:** 🔴 ALTA
**Tiempo estimado:** 2 horas

---

### 2.2 Componente Card

**Archivo:** `src/components/ui/Card.tsx`

**Variantes:**
- `default` - Blanco con border sutil
- `premium` - Gradiente verde con badge dorado
- `featured` - Border accent-blue

**Tareas:**
- [ ] Crear componente base con variantes
- [ ] Añadir hover effects (shadow + transform)
- [ ] Soportar header/body/footer slots
- [ ] Añadir prop `clickable`

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 2 horas

---

### 2.3 Componente Input & Select

**Archivos:**
- `src/components/ui/Input.tsx`
- `src/components/ui/Select.tsx`

**Tareas:**
- [ ] Crear Input con estados focus/error/disabled
- [ ] Crear Select con custom chevron
- [ ] Añadir soporte para labels y helper text
- [ ] Implementar validación visual
- [ ] Focus ring estilo Apple (accent-blue)

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 3 horas

---

### 2.4 Componente Badge

**Archivo:** `src/components/ui/Badge.tsx`

**Variantes:**
- `success` - Verde
- `error` - Rojo
- `warning` - Dorado
- `info` - Accent blue
- `neutral` - Gris

**Tareas:**
- [ ] Crear componente con variantes
- [ ] Añadir dots opcionales
- [ ] Soportar custom colors
- [ ] Tamaños (sm, md, lg)

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 1 hora

---

## 📋 FASE 3: Migrar Admin Panel a Cupertino Style

### 3.1 Actualizar AdminLayout

**Archivo:** `src/layouts/AdminLayout.astro`

**Tareas:**
- [ ] Rediseñar sidebar con estilo Cupertino
- [ ] Cambiar colores a accent-blue y brand-green
- [ ] Añadir hover states suaves
- [ ] Mejorar iconografía (Heroicons)
- [ ] Añadir active states con accent-blue-pale
- [ ] Implementar transiciones suaves
- [ ] Responsive collapse en mobile

**Elementos a actualizar:**
- Sidebar background: `bg-white` con `border-r border-gray-200`
- Menu items hover: `bg-accent-blue-pale` con `text-accent-blue`
- Active item: `bg-accent-blue text-white`
- Header: `bg-white` con `border-b border-gray-200`

**Prioridad:** 🔴 ALTA
**Tiempo estimado:** 4 horas

---

### 3.2 Actualizar Admin Dashboard Principal

**Archivo:** `src/pages/admin/index.astro`

**Tareas:**
- [ ] Rediseñar stats cards con nuevos colores
- [ ] Actualizar gráficos a accent-blue
- [ ] Mejorar tablas con zebra stripes
- [ ] Añadir loading states elegantes
- [ ] Implementar empty states ilustrados

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 3 horas

---

### 3.3 Actualizar Tablas de Datos

**Archivos:** Todos los `index.astro` de admin (providers, houses, services, etc.)

**Tareas:**
- [ ] Implementar DataTable component unificado
- [ ] Headers con fondo `bg-gray-50`
- [ ] Hover rows con `bg-accent-blue-pale`
- [ ] Action buttons con iconos Heroicons
- [ ] Paginación estilo Apple
- [ ] Filtros y búsqueda mejorados

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 6 horas

---

### 3.4 Actualizar Forms de Admin

**Archivos:** Todos los `create.astro` y `[id]/edit.astro`

**Tareas:**
- [ ] Usar nuevos componentes Input/Select
- [ ] Mejorar layout de forms (2 columnas en desktop)
- [ ] Añadir validación visual inline
- [ ] Botones con nuevos estilos
- [ ] Loading states en submit
- [ ] Success/Error feedback visual

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 8 horas

---

## 📋 FASE 4: Migrar Blog & Noticias

### 4.1 Actualizar Blog Index

**Archivo:** `src/pages/blog/index.astro`

**Tareas:**
- [ ] Hero con gradiente brand-green mejorado
- [ ] Cards de posts con accent-blue en CTAs
- [ ] Categorías con colores pastel + hover accent-blue
- [ ] Featured post destacado visualmente
- [ ] Newsletter section con accent-blue
- [ ] Mejorar spacing y typography

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 3 horas

---

### 4.2 Actualizar Blog Post Detail

**Archivo:** `src/pages/blog/[slug].astro`

**Tareas:**
- [ ] Breadcrumb con accent-blue links
- [ ] Mejorar tipografía del artículo
- [ ] Share buttons con accent-blue
- [ ] Related posts cards actualizados
- [ ] CTA section con accent-blue
- [ ] Author bio card mejorada

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 2 horas

---

### 4.3 Crear Páginas de Categorías de Blog

**Archivos a crear:**
- `src/pages/blog/categoria/[slug].astro`

**Categorías a implementar:**
- Tendencias
- Guías
- Casos de Éxito
- Noticias
- Tutoriales

**Tareas:**
- [ ] Crear página dinámica `[slug].astro`
- [ ] Implementar filtrado por categoría en query
- [ ] Header específico por categoría con color único
- [ ] Breadcrumb navegable
- [ ] Grid de posts de la categoría
- [ ] Sidebar con otras categorías
- [ ] Paginación funcional

**Código sugerido:**
```astro
---
// src/pages/blog/categoria/[slug].astro
import { createSupabaseClient } from '@/lib/supabase';
import BaseLayout from '@/layouts/BaseLayout.astro';

export async function getStaticPaths() {
  return [
    { params: { slug: 'tendencias' } },
    { params: { slug: 'guias' } },
    { params: { slug: 'casos_exito' } },
    { params: { slug: 'noticias' } },
    { params: { slug: 'tutoriales' } },
  ];
}

const { slug } = Astro.params;
const supabase = createSupabaseClient(Astro);

const categories = {
  'tendencias': { name: 'Tendencias', color: 'purple', description: 'Últimas tendencias en construcción modular' },
  'guias': { name: 'Guías', color: 'blue', description: 'Guías prácticas para tu proyecto' },
  'casos_exito': { name: 'Casos de Éxito', color: 'green', description: 'Proyectos exitosos de casas modulares' },
  'noticias': { name: 'Noticias', color: 'red', description: 'Noticias del sector' },
  'tutoriales': { name: 'Tutoriales', color: 'orange', description: 'Tutoriales paso a paso' },
};

const category = categories[slug];

// Fetch posts by category
const { data: posts } = await supabase
  .from('blog_posts')
  .select('*')
  .eq('category', slug)
  .eq('status', 'published')
  .order('published_at', { ascending: false });
---

<BaseLayout>
  <main>
    <section class="bg-gradient-to-br from-{category.color}-600 to-{category.color}-800 text-white py-16">
      <div class="max-w-7xl mx-auto px-4">
        <h1 class="text-4xl font-bold mb-4">{category.name}</h1>
        <p class="text-xl opacity-90">{category.description}</p>
      </div>
    </section>

    <section class="py-12">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Posts grid here -->
      </div>
    </section>
  </main>
</BaseLayout>
```

**Prioridad:** 🔴 ALTA (Funcionalidad rota)
**Tiempo estimado:** 4 horas

---

### 4.4 Crear Páginas de Categorías de Noticias

**Archivos a crear:**
- `src/pages/noticias/categoria/[tipo].astro`

**Tipos de noticias:**
- Industria
- Empresa
- Producto
- Evento
- Normativa

**Tareas:**
- [ ] Crear página dinámica `[tipo].astro`
- [ ] Implementar filtrado por news_type
- [ ] Header con color según tipo
- [ ] Grid de noticias del tipo
- [ ] Breaking news banner si hay
- [ ] Paginación

**Prioridad:** 🔴 ALTA (Funcionalidad rota)
**Tiempo estimado:** 3 horas

---

### 4.5 Actualizar Admin Blog Editor

**Archivo:** `src/pages/admin/content/blog/[id]/edit.astro`

**Tareas:**
- [ ] Actualizar toolbar del editor con accent-blue
- [ ] Mejorar preview con nuevos estilos
- [ ] Sidebar con cards estilo Cupertino
- [ ] Botones actualizados
- [ ] Stats cards mejoradas
- [ ] Loading states elegantes

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 3 horas

---

## 📋 FASE 5: Limpiar Código Obsoleto

### 5.1 Eliminar Dashboard Obsoleto

**Archivos a eliminar:**
- `src/pages/dashboard.astro` (si existe)

**Tareas:**
- [ ] Verificar si existe `/dashboard`
- [ ] Crear redirect en middleware o en archivo
- [ ] Redirect `/dashboard` → `/admin`
- [ ] Verificar que no hay links a `/dashboard` en el código
- [ ] Eliminar archivo

**Código para redirect:**
```js
// src/middleware.ts o astro.config.mjs
export function onRequest({ url, redirect }) {
  if (url.pathname === '/dashboard') {
    return redirect('/admin', 301);
  }
}
```

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 30 minutos

---

### 5.2 Audit y Limpieza de CSS Antiguo

**Archivos:**
- `mockup/styles.css` (referencia, no eliminar)
- Cualquier CSS inline obsoleto

**Tareas:**
- [ ] Buscar y reemplazar colores antiguos
- [ ] Eliminar CSS duplicado
- [ ] Consolidar utilidades en globals.css
- [ ] Documentar clases deprecadas

**Prioridad:** 🟢 BAJA
**Tiempo estimado:** 2 horas

---

## 📋 FASE 6: Testing & QA

### 6.1 Testing Visual

**Tareas:**
- [ ] Verificar todos los botones en diferentes estados
- [ ] Verificar cards en diferentes variantes
- [ ] Verificar forms con validación
- [ ] Verificar tablas con datos
- [ ] Verificar responsive en mobile/tablet/desktop
- [ ] Verificar dark mode (si aplica)

**Prioridad:** 🔴 ALTA
**Tiempo estimado:** 4 horas

---

### 6.2 Testing Funcional

**Páginas críticas a testear:**
- [ ] `/admin` - Dashboard principal
- [ ] `/admin/content/blog` - Lista de blogs
- [ ] `/admin/content/blog/create` - Crear blog
- [ ] `/admin/content/blog/[id]/edit` - Editar blog
- [ ] `/blog` - Index de blog
- [ ] `/blog/categoria/tendencias` - Categoría
- [ ] `/blog/[slug]` - Post detail
- [ ] `/noticias` - Index de noticias
- [ ] `/noticias/categoria/industria` - Categoría
- [ ] `/noticias/[slug]` - Noticia detail

**Prioridad:** 🔴 ALTA
**Tiempo estimado:** 3 horas

---

### 6.3 Performance Audit

**Tareas:**
- [ ] Verificar bundle size de CSS
- [ ] Optimizar imágenes si es necesario
- [ ] Verificar carga de fuentes (Tex Gyre Heros)
- [ ] Lighthouse score en páginas principales
- [ ] Verificar tiempo de carga inicial

**Prioridad:** 🟡 MEDIA
**Tiempo estimado:** 2 horas

---

## 📋 FASE 7: Documentación

### 7.1 Actualizar README

**Archivo:** `README.md`

**Tareas:**
- [ ] Añadir sección de Design System
- [ ] Documentar nuevos componentes
- [ ] Añadir screenshots del nuevo diseño
- [ ] Actualizar guía de desarrollo

**Prioridad:** 🟢 BAJA
**Tiempo estimado:** 1 hora

---

### 7.2 Crear Guía de Componentes

**Archivo:** `COMPONENTS.md`

**Tareas:**
- [ ] Documentar todos los componentes UI
- [ ] Ejemplos de uso de cada componente
- [ ] Props y variantes
- [ ] Capturas de pantalla

**Prioridad:** 🟢 BAJA
**Tiempo estimado:** 2 horas

---

## 📊 Resumen de Tareas

### Por Prioridad

**🔴 ALTA (Críticas)**
- Actualizar variables CSS globales
- Actualizar Tailwind config
- Componente Button
- AdminLayout Cupertino
- Páginas de categorías Blog
- Páginas de categorías Noticias
- Testing visual
- Testing funcional

**🟡 MEDIA (Importantes)**
- Componentes Card, Input, Select, Badge
- Admin dashboard
- Admin tables
- Admin forms
- Blog index y detail
- Noticias updates
- Dashboard redirect
- Performance audit

**🟢 BAJA (Nice to have)**
- CSS cleanup
- Documentación
- Guía de componentes

---

### Tiempo Total Estimado

- **FASE 1:** 1.5 horas
- **FASE 2:** 8 horas
- **FASE 3:** 21 horas
- **FASE 4:** 15 horas
- **FASE 5:** 2.5 horas
- **FASE 6:** 9 horas
- **FASE 7:** 3 horas

**TOTAL: ~60 horas** (1.5 semanas a tiempo completo)

---

## 🎯 Quick Wins (Primeras 8 horas)

Para ver resultados inmediatos, empezar con:

1. ✅ Actualizar `globals.css` con nuevas variables (1h)
2. ✅ Actualizar `tailwind.config.mjs` (30min)
3. ✅ Crear componente Button (2h)
4. ✅ Actualizar AdminLayout sidebar (2h)
5. ✅ Crear páginas de categorías Blog (2h)
6. ✅ Crear redirect de /dashboard a /admin (30min)

**Total Quick Wins: 8 horas**
**Resultado:** Admin panel con nuevo look + Blog categorías funcionales

---

## 📝 Checklist de Implementación

### Preparación
- [ ] Revisar DESIGN_SYSTEM.md
- [ ] Hacer backup de archivos críticos
- [ ] Crear rama `feature/design-system-v2`

### Desarrollo
- [ ] Completar FASE 1 (Base)
- [ ] Completar FASE 2 (Componentes)
- [ ] Completar FASE 3 (Admin)
- [ ] Completar FASE 4 (Blog/Noticias)
- [ ] Completar FASE 5 (Limpieza)

### Testing
- [ ] Testing visual completo
- [ ] Testing funcional completo
- [ ] Performance audit
- [ ] Browser compatibility check

### Deploy
- [ ] Merge a develop
- [ ] Deploy a staging
- [ ] QA en staging
- [ ] Merge a main
- [ ] Deploy a producción

---

**Mantenido por:** Equipo MODTOK
**Última actualización:** 2025-10-13
