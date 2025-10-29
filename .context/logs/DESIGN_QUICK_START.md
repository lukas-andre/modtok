# ⚡ Design System v2.0 - Quick Start Guide

**Empezar AHORA:** Implementación rápida en 8 horas para ver resultados inmediatos

---

## 🎯 Objetivo

Migrar la aplicación MODTOK al nuevo design system Apple Cupertino con:
- ✨ **Accent Blue:** #4DA1F5 (RGB 77, 161, 245)
- 🌲 **Brand Green:** #31453A (del logo)
- 📝 **Font:** Tex Gyre Heros (ya configurada)

---

## 🚀 Quick Wins (8 horas)

### 1️⃣ Actualizar Colores Base (1 hora)

**Editar:** `src/styles/globals.css`

```css
@import url('https://fonts.cdnfonts.com/css/tex-gyre-heros');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Brand Colors MODTOK */
    --brand-green: #31453A;
    --brand-green-dark: #283A30;

    --accent-blue: #4DA1F5;
    --accent-blue-dark: #3B8FE3;
    --accent-blue-light: #6BB3F7;
    --accent-blue-pale: rgba(77, 161, 245, 0.1);

    --accent-gold: #B48C36;

    /* Grays */
    --gray-50: #F9FAFB;
    --gray-100: #F3F4F6;
    --gray-200: #E5E7EB;
    --gray-300: #D1D5DB;
    --gray-600: #6B7280;
    --gray-900: #1F2937;

    /* Shadows Apple-style */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  * {
    border-color: var(--gray-200);
  }

  body {
    font-family: 'Tex Gyre Heros', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: white;
    color: var(--gray-900);
  }
}
```

---

### 2️⃣ Actualizar Tailwind Config (30 min)

**Editar:** `tailwind.config.mjs`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
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
      },
    },
  },
  plugins: [],
}
```

---

### 3️⃣ Crear Componente Button (2 horas)

**Crear archivo:** `src/components/ui/Button.tsx`

```tsx
import type { JSX } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: JSX.Element;
  iconPosition?: 'left' | 'right';
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-accent-blue text-white hover:bg-accent-blue-dark focus:ring-accent-blue shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5',
    secondary: 'bg-brand-green text-white hover:bg-brand-green-dark focus:ring-brand-green shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5',
    ghost: 'bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-accent-blue hover:text-accent-blue focus:ring-accent-blue',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-apple-sm hover:shadow-apple-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && iconPosition === 'left' && !loading && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && !loading && <span className="ml-2">{icon}</span>}
    </button>
  );
}
```

**Uso:**
```tsx
// Primary
<Button variant="primary">Guardar</Button>

// Secondary
<Button variant="secondary">Cancelar</Button>

// Ghost
<Button variant="ghost">Ver más</Button>

// Con loading
<Button variant="primary" loading={isLoading}>Guardando...</Button>

// Con ícono
<Button variant="primary" icon={<SaveIcon />}>Guardar</Button>
```

---

### 4️⃣ Actualizar AdminLayout Sidebar (2 horas)

**Editar:** `src/layouts/AdminLayout.astro`

**Cambios clave en el sidebar:**

```html
<!-- Sidebar Container -->
<aside class="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 overflow-y-auto">

  <!-- Logo Header -->
  <div class="p-6 border-b border-gray-200">
    <a href="/admin" class="flex items-center space-x-3">
      <div class="w-10 h-10 bg-brand-green rounded-lg flex items-center justify-center">
        <span class="text-white font-bold text-xl">M</span>
      </div>
      <span class="text-xl font-bold text-gray-900">MODTOK</span>
    </a>
  </div>

  <!-- Navigation -->
  <nav class="p-4 space-y-1">
    <!-- Dashboard -->
    <a
      href="/admin"
      class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
             hover:bg-accent-blue-pale hover:text-accent-blue
             {currentPage === '/admin' ? 'bg-accent-blue text-white shadow-apple-sm' : 'text-gray-600'}"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
      </svg>
      <span class="font-medium">Dashboard</span>
    </a>

    <!-- Content Section -->
    <div class="pt-4">
      <h3 class="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Contenido
      </h3>

      <a
        href="/admin/content/blog"
        class="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
               hover:bg-accent-blue-pale hover:text-accent-blue
               {currentPage.includes('/admin/content/blog') ? 'bg-accent-blue text-white shadow-apple-sm' : 'text-gray-600'}"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
        </svg>
        <span class="font-medium">Blog</span>
      </a>

      <!-- Más items... -->
    </div>
  </nav>
</aside>

<!-- Main Content (shifted for sidebar) -->
<main class="ml-64 min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">{title}</h1>

      <!-- User menu -->
      <div class="flex items-center space-x-4">
        <button class="p-2 text-gray-400 hover:text-accent-blue transition-colors rounded-lg hover:bg-accent-blue-pale">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
        </button>

        <div class="flex items-center space-x-3">
          <img src={user.avatar_url || '/default-avatar.png'} alt={user.full_name} class="w-8 h-8 rounded-full border-2 border-gray-200">
          <span class="text-sm font-medium text-gray-700">{user.full_name}</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Page Content -->
  <div class="p-6">
    <slot />
  </div>
</main>
```

---

### 5️⃣ Crear Páginas de Categorías Blog (2 horas)

**Crear archivo:** `src/pages/blog/categoria/[slug].astro`

```astro
---
import { createSupabaseClient } from '@/lib/supabase';
import BaseLayout from '@/layouts/BaseLayout.astro';
import SEOHead from '@/components/SEOHead.astro';

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
  'tendencias': {
    name: 'Tendencias',
    color: 'purple',
    description: 'Últimas tendencias en construcción modular y prefabricada en Chile',
    icon: '📈'
  },
  'guias': {
    name: 'Guías',
    color: 'blue',
    description: 'Guías prácticas para construir tu casa modular en Chile',
    icon: '📚'
  },
  'casos_exito': {
    name: 'Casos de Éxito',
    color: 'green',
    description: 'Proyectos exitosos de casas modulares en diferentes regiones de Chile',
    icon: '🏆'
  },
  'noticias': {
    name: 'Noticias',
    color: 'red',
    description: 'Noticias del sector de construcción modular en Chile',
    icon: '📰'
  },
  'tutoriales': {
    name: 'Tutoriales',
    color: 'orange',
    description: 'Tutoriales paso a paso para tu proyecto de construcción modular',
    icon: '🎓'
  }
};

const category = categories[slug];

// Fetch posts by category
const { data: posts } = await supabase
  .from('blog_posts')
  .select(`
    *,
    author:profiles!blog_posts_author_id_fkey(full_name, avatar_url)
  `)
  .eq('category', slug)
  .eq('status', 'published')
  .lte('published_at', new Date().toISOString())
  .order('published_at', { ascending: false })
  .limit(20);

const siteUrl = Astro.site?.href || 'https://modtok.cl';
---

<BaseLayout>
  <SEOHead
    slot="head"
    title={`${category.name} - Blog de Construcción Modular en Chile`}
    description={category.description}
    type="website"
    url={`${siteUrl}blog/categoria/${slug}`}
    keywords={[`${category.name.toLowerCase()} construcción modular`, 'casas prefabricadas Chile']}
  />

  <main class="min-h-screen bg-gray-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-accent-blue via-accent-blue-dark to-brand-green text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="mb-8">
          <div class="flex items-center space-x-2 text-sm text-blue-100">
            <a href="/" class="hover:text-white transition-colors">Inicio</a>
            <span>/</span>
            <a href="/blog" class="hover:text-white transition-colors">Blog</a>
            <span>/</span>
            <span class="text-white font-medium">{category.name}</span>
          </div>
        </nav>

        <div class="text-center">
          <div class="text-6xl mb-6">{category.icon}</div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6">{category.name}</h1>
          <p class="text-xl text-blue-100 max-w-3xl mx-auto">{category.description}</p>

          <div class="mt-8 flex items-center justify-center space-x-4 text-sm">
            <span class="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              {posts?.length || 0} artículos
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Posts Grid -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {posts && posts.length > 0 ? (
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article class="bg-white rounded-xl shadow-apple-sm overflow-hidden hover:shadow-apple-lg transition-all duration-300 hover:-translate-y-1">
                <div class="relative">
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      class="w-full h-48 object-cover"
                    />
                  ) : (
                    <div class="w-full h-48 bg-gradient-to-br from-accent-blue-light to-accent-blue flex items-center justify-center">
                      <div class="text-4xl">{category.icon}</div>
                    </div>
                  )}
                </div>

                <div class="p-6">
                  <div class="flex items-center space-x-2 mb-3">
                    <time class="text-sm text-gray-500">
                      {new Date(post.published_at!).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                    <span class="text-gray-300">•</span>
                    <span class="text-sm text-gray-500">{post.reading_time_minutes} min lectura</span>
                  </div>

                  <h3 class="text-xl font-bold text-gray-900 mb-3 hover:text-accent-blue transition-colors">
                    <a href={`/blog/${post.slug}`}>{post.title}</a>
                  </h3>

                  {post.excerpt && (
                    <p class="text-gray-600 mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
                  )}

                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      {post.author?.avatar_url ? (
                        <img
                          src={post.author.avatar_url}
                          alt={post.author.full_name}
                          class="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div class="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {post.author?.full_name?.charAt(0) || 'M'}
                        </div>
                      )}
                      <span class="text-sm text-gray-700">{post.author?.full_name || 'MODTOK'}</span>
                    </div>

                    <a
                      href={`/blog/${post.slug}`}
                      class="text-accent-blue hover:text-accent-blue-dark font-medium text-sm inline-flex items-center"
                    >
                      Leer más
                      <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div class="text-center py-16">
            <div class="text-6xl mb-4">{category.icon}</div>
            <h3 class="text-2xl font-semibold text-gray-900 mb-2">No hay artículos en esta categoría aún</h3>
            <p class="text-gray-600 mb-6">Pronto publicaremos contenido sobre {category.name.toLowerCase()}.</p>
            <a
              href="/blog"
              class="inline-flex items-center px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue-dark transition-colors font-medium shadow-apple-sm hover:shadow-apple-md"
            >
              Ver todos los artículos
            </a>
          </div>
        )}
      </div>
    </section>

    <!-- Other Categories -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Explorar Otras Categorías</h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(categories).filter(([key]) => key !== slug).map(([key, cat]) => (
            <a
              href={`/blog/categoria/${key}`}
              class="group p-6 bg-gray-50 rounded-xl border-2 border-transparent hover:border-accent-blue hover:shadow-apple-md transition-all duration-200"
            >
              <div class="text-4xl mb-3">{cat.icon}</div>
              <h3 class="font-semibold text-gray-900 group-hover:text-accent-blue transition-colors">{cat.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  </main>
</BaseLayout>
```

---

### 6️⃣ Crear Redirect Dashboard → Admin (30 min)

**Opción A: Crear archivo de redirect**

**Crear:** `src/pages/dashboard.astro`

```astro
---
return Astro.redirect('/admin', 301);
---
```

**Opción B: Middleware (más robusto)**

**Crear:** `src/middleware.ts`

```ts
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ url, redirect }, next) => {
  // Redirect /dashboard to /admin
  if (url.pathname === '/dashboard' || url.pathname === '/dashboard/') {
    return redirect('/admin', 301);
  }

  return next();
});
```

---

## ✅ Checklist de Implementación

### Preparación (15 min)
- [ ] Hacer backup de archivos a modificar
- [ ] Crear rama `feature/design-cupertino`
- [ ] Leer DESIGN_SYSTEM.md completo

### Implementación (8 horas)
- [ ] ✅ Actualizar globals.css (1h)
- [ ] ✅ Actualizar tailwind.config (30min)
- [ ] ✅ Crear componente Button (2h)
- [ ] ✅ Actualizar AdminLayout (2h)
- [ ] ✅ Crear páginas categorías Blog (2h)
- [ ] ✅ Crear redirect dashboard (30min)

### Testing (1 hora)
- [ ] Verificar admin panel carga correctamente
- [ ] Verificar sidebar con nuevo diseño
- [ ] Verificar categorías blog funcionan
- [ ] Verificar redirect /dashboard → /admin
- [ ] Verificar colores accent-blue aplicados
- [ ] Mobile responsive check

---

## 🎨 Resultado Esperado

Después de completar estos Quick Wins tendrás:

1. ✅ **Colores Actualizados**
   - Accent blue #4DA1F5 en toda la app
   - Brand green #31453A del logo
   - Paleta Cupertino elegante

2. ✅ **Admin Panel Moderno**
   - Sidebar estilo Apple
   - Hover states suaves
   - Active states con accent-blue
   - Iconografía Heroicons

3. ✅ **Blog Funcional**
   - Categorías navegables
   - Páginas de categoría con diseño
   - Grid de posts actualizado

4. ✅ **Componente Button**
   - Reutilizable en toda la app
   - Variantes: primary, secondary, ghost
   - Estados: hover, loading, disabled

5. ✅ **Sin Código Obsoleto**
   - Dashboard eliminado/redirigido
   - Links actualizados

---

## 📚 Próximos Pasos

Después de completar los Quick Wins, continuar con:

1. **FASE 2:** Crear componentes Card, Input, Select (8h)
2. **FASE 3:** Migrar resto del Admin Panel (15h)
3. **FASE 4:** Migrar Blog completo + Noticias (15h)

Ver `DESIGN_MIGRATION_PLAN.md` para el plan completo.

---

## 🆘 Ayuda

**Problemas comunes:**

1. **Colores no se aplican:**
   - Verificar que `globals.css` está importado en layout
   - Reiniciar dev server: `pnpm dev`

2. **Tailwind no reconoce clases custom:**
   - Verificar `tailwind.config.mjs`
   - Ejecutar: `pnpm check`

3. **Fuente no carga:**
   - Verificar CDN en globals.css
   - Clear browser cache

**Comandos útiles:**
```bash
# Dev server
pnpm dev

# Type check
pnpm check

# Build
pnpm build
```

---

**¡Empezar ahora!** 🚀
**Tiempo total:** 8 horas
**Resultado:** Admin panel Cupertino + Blog categorías funcionales
