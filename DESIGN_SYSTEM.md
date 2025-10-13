# 🎨 MODTOK Design System

**Versión:** 2.0
**Fecha:** 2025-10-13
**Objetivo:** Sistema de diseño elegante, funcional y consistente con identidad visual Apple Cupertino

---

## 📐 Principios de Diseño

### 1. **Elegancia Funcional**
- Diseño limpio y minimalista
- Espacios en blanco generosos
- Jerarquía visual clara
- Interacciones suaves y predecibles

### 2. **Consistencia**
- Mismos colores, tipografía y componentes en toda la app
- Patrones de UI reutilizables
- Comportamiento coherente entre secciones

### 3. **Claridad**
- Información presentada de forma clara
- CTAs evidentes y bien posicionados
- Feedback visual inmediato en interacciones

---

## 🎨 Paleta de Colores

### Colores de Marca

```css
/* Verde MODTOK (Logo) */
--brand-green: #31453A;
--brand-green-dark: #283A30;
--brand-green-light: #3D5546;

/* Azul Accent (Nuevo) */
--accent-blue: #4DA1F5; /* RGB(77, 161, 245) */
--accent-blue-dark: #3B8FE3;
--accent-blue-light: #6BB3F7;
--accent-blue-pale: rgba(77, 161, 245, 0.1);

/* Dorado Accent (Secundario) */
--accent-gold: #B48C36;
--accent-gold-dark: #A1792F;
```

### Colores Funcionales

```css
/* Backgrounds */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-tertiary: #F3F4F6;
--bg-overlay: rgba(0, 0, 0, 0.5);

/* Text */
--text-primary: #1F2937;    /* Texto principal */
--text-secondary: #6B7280;  /* Texto secundario */
--text-tertiary: #9CA3AF;   /* Texto terciario */
--text-inverse: #FFFFFF;    /* Texto en fondos oscuros */

/* Borders & Dividers */
--border-light: #E5E7EB;
--border-medium: #D1D5DB;
--border-dark: #9CA3AF;

/* States */
--success: #10B981;
--error: #EF4444;
--warning: #F59E0B;
--info: #3B82F6;

/* Shadows */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

### Esquema de Uso

**Admin Panel & Dashboard:**
- Primary: `--accent-blue` (botones principales, enlaces activos)
- Secondary: `--brand-green` (headers, elementos de marca)
- Backgrounds: Blanco + grises claros para secciones

**Blog & Content:**
- Primary: `--accent-blue` (enlaces, CTAs)
- Accents: `--brand-green` (categorías, badges)
- Backgrounds: Blanco limpio con secciones en gris claro

**Landing & Marketing:**
- Hero: Gradiente `--brand-green` con overlay
- CTAs: `--accent-blue` (principal) y `--accent-gold` (secundario)

---

## ✍️ Tipografía

### Font Stack

```css
@import url('https://fonts.cdnfonts.com/css/tex-gyre-heros');

font-family: 'Tex Gyre Heros', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
```

### Escala Tipográfica

```css
/* Display (Títulos grandes - Landing) */
--text-display-2xl: 4.5rem;   /* 72px - Hero principal */
--text-display-xl: 3.75rem;   /* 60px - Hero secundario */
--text-display-lg: 3rem;      /* 48px - Secciones importantes */

/* Headings */
--text-h1: 2.25rem;  /* 36px */
--text-h2: 1.875rem; /* 30px */
--text-h3: 1.5rem;   /* 24px */
--text-h4: 1.25rem;  /* 20px */
--text-h5: 1.125rem; /* 18px */

/* Body */
--text-xl: 1.25rem;  /* 20px - Leads, destacados */
--text-lg: 1.125rem; /* 18px - Párrafos importantes */
--text-base: 1rem;   /* 16px - Texto estándar */
--text-sm: 0.875rem; /* 14px - Ayudas, metadata */
--text-xs: 0.75rem;  /* 12px - Captions, labels */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Aplicación

**Headings:**
```css
h1, h2, h3, h4, h5, h6 {
  font-family: 'Tex Gyre Heros', sans-serif;
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--text-primary);
}
```

**Body:**
```css
body {
  font-family: 'Tex Gyre Heros', sans-serif;
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--text-primary);
}
```

---

## 🧱 Componentes UI

### Botones

**Primary (Azul Accent)**
```css
.btn-primary {
  background: var(--accent-blue);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--accent-blue-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

**Secondary (Verde MODTOK)**
```css
.btn-secondary {
  background: var(--brand-green);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--brand-green-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}
```

**Ghost (Transparente)**
```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-medium);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: var(--bg-secondary);
  border-color: var(--accent-blue);
  color: var(--accent-blue);
}
```

### Cards

**Standard Card**
```css
.card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid var(--border-light);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

**Premium Card (Destacado)**
```css
.card-premium {
  background: linear-gradient(135deg, var(--brand-green) 0%, var(--brand-green-dark) 100%);
  color: white;
  border: 2px solid var(--accent-gold);
  position: relative;
}

.card-premium::before {
  content: 'PREMIUM';
  position: absolute;
  top: -12px;
  right: 1rem;
  background: var(--accent-gold);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}
```

### Inputs & Forms

**Input Fields**
```css
.input {
  background: white;
  border: 1px solid var(--border-medium);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px var(--accent-blue-pale);
}
```

**Select Dropdown**
```css
.select {
  background: white;
  border: 1px solid var(--border-medium);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* Chevron icon */
}
```

### Badges & Tags

**Status Badge**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.025em;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.badge-primary {
  background: var(--accent-blue-pale);
  color: var(--accent-blue);
}
```

**Category Tag**
```css
.tag {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
}

.tag:hover {
  background: var(--accent-blue);
  color: white;
}
```

---

## 📏 Espaciado & Layout

### Sistema de Espaciado (8px base)

```css
--space-0: 0;
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
```

### Grid System

**Container Widths**
```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;
```

**Standard Layout**
```css
.container {
  width: 100%;
  max-width: var(--container-xl);
  margin: 0 auto;
  padding: 0 var(--space-6);
}

@media (min-width: 1536px) {
  .container {
    max-width: var(--container-2xl);
  }
}
```

---

## 🎭 Animaciones & Transiciones

### Duración

```css
--duration-75: 75ms;
--duration-100: 100ms;
--duration-150: 150ms;
--duration-200: 200ms;
--duration-300: 300ms;
--duration-500: 500ms;
--duration-700: 700ms;
```

### Timing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

/* Apple-style spring */
--ease-spring: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Transiciones Estándar

```css
/* Hover states */
transition: all var(--duration-200) var(--ease-out);

/* Complex animations */
transition: transform var(--duration-300) var(--ease-spring),
            opacity var(--duration-200) var(--ease-out);

/* Micro-interactions */
transition: transform var(--duration-150) var(--ease-out);
```

---

## 🖼️ Iconografía

**Sistema de Iconos:** Heroicons (Outline & Solid)

**Tamaños Estándar:**
```css
--icon-xs: 1rem;    /* 16px */
--icon-sm: 1.25rem; /* 20px */
--icon-md: 1.5rem;  /* 24px */
--icon-lg: 2rem;    /* 32px */
--icon-xl: 2.5rem;  /* 40px */
```

**Aplicación:**
```html
<!-- Small icon (inline) -->
<svg class="w-4 h-4 inline-block">...</svg>

<!-- Standard icon (buttons) -->
<svg class="w-5 h-5">...</svg>

<!-- Large icon (features) -->
<svg class="w-8 h-8">...</svg>
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
/* xs: 0px - 639px (default) */
/* sm: 640px+ */
@media (min-width: 640px) { }

/* md: 768px+ */
@media (min-width: 768px) { }

/* lg: 1024px+ */
@media (min-width: 1024px) { }

/* xl: 1280px+ */
@media (min-width: 1280px) { }

/* 2xl: 1536px+ */
@media (min-width: 1536px) { }
```

---

## 🎯 Casos de Uso por Sección

### 1. Admin Panel

**Estilo:** Cupertino clean & profesional

- **Sidebar:** Fondo blanco, items con hover `--accent-blue-pale`
- **Headers:** Texto `--brand-green` con accent `--accent-blue`
- **Cards:** Blanco con bordes sutiles, hover con sombra
- **Botones:** Primario `--accent-blue`, secundario `--brand-green`
- **Tables:** Zebra stripes con `--bg-secondary`, headers con `--accent-blue`

### 2. Blog & Content

**Estilo:** Editorial elegante

- **Headers:** Gradiente suave `--brand-green` a `--brand-green-dark`
- **Links:** `--accent-blue` con underline en hover
- **Categorías:** Tags con colores pastel + `--accent-blue` en hover
- **Cards:** Blanco limpio, imagen destacada arriba
- **CTAs:** `--accent-blue` principal, `--brand-green` secundario

### 3. Landing Pages

**Estilo:** Marketing impactante

- **Hero:** Gradiente `--brand-green` con overlay, CTA `--accent-blue`
- **Features:** Cards blancos con iconos `--accent-blue`
- **Testimonials:** Fondo `--bg-secondary`, accent `--accent-gold`
- **Footer:** `--brand-green` oscuro con links blancos

---

## ✅ Checklist de Implementación

- [ ] Actualizar `globals.css` con nuevas variables CSS
- [ ] Crear componente `Button.tsx` con variantes
- [ ] Crear componente `Card.tsx` con variantes
- [ ] Crear componente `Input.tsx` y `Select.tsx`
- [ ] Crear componente `Badge.tsx` con estados
- [ ] Aplicar a AdminLayout
- [ ] Aplicar a BaseLayout
- [ ] Aplicar a páginas de blog
- [ ] Aplicar a páginas de noticias
- [ ] Crear guías de categorías
- [ ] Documentar patrones en Storybook (futuro)

---

**Mantenido por:** Equipo MODTOK
**Última actualización:** 2025-10-13
