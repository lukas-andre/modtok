# 🧪 QA Manual - FASE 4: CMS Blog/Noticias

**Fecha:** 2025-10-11
**Versión:** 1.0
**Scope:** Testing completo del CMS Blog/Noticias + SEO

---

## 📋 Índice

1. [Pre-requisitos](#pre-requisitos)
2. [Testing Admin Blog](#testing-admin-blog)
3. [Testing Admin Noticias](#testing-admin-noticias)
4. [Testing Frontend Blog](#testing-frontend-blog)
5. [Testing Frontend Noticias](#testing-frontend-noticias)
6. [Testing SEO](#testing-seo)
7. [Testing APIs](#testing-apis)
8. [Checklist Final](#checklist-final)

---

## Pre-requisitos

### 1. Levantar el proyecto
```bash
# Terminal 1 - Supabase local
supabase start

# Terminal 2 - Dev server
pnpm dev
```

### 2. Verificar acceso admin
- URL: http://localhost:4321/auth/login
- Email: admin@modtok.cl (o tu super admin)
- Verificar que tienes rol `super_admin` o `admin`

### 3. URLs a testear
- **Admin Blog:** http://localhost:4321/admin/blog
- **Admin Noticias:** http://localhost:4321/admin/noticias
- **Frontend Blog:** http://localhost:4321/blog
- **Frontend Noticias:** http://localhost:4321/noticias

---

## Testing Admin Blog

### Test 1: Crear Artículo de Blog

#### Paso 1: Navegar al dashboard
1. Ve a: http://localhost:4321/admin/blog
2. ✅ Verifica que carga la página correctamente
3. ✅ Verifica que ves el botón "+ Nuevo Artículo"

#### Paso 2: Abrir formulario
1. Click en "+ Nuevo Artículo"
2. ✅ Verifica que se abre el formulario (BlogPostForm)
3. ✅ Verifica que ves 2 tabs: "Contenido" y "SEO"

#### Paso 3: Llenar tab Contenido
1. **Título:** "Guía Completa de Casas Modulares 2025"
2. ✅ Verifica que el slug se genera automáticamente: `guia-completa-de-casas-modulares-2025`
3. **Categoría:** Selecciona "Guías"
4. **Tags:** Agrega "casas modulares", "construcción", "2025"
5. **Excerpt:** "Descubre todo sobre casas modulares en Chile"
6. **Autor:** Debería estar pre-seleccionado tu usuario
7. **Status:** Deja en "Borrador"

#### Paso 4: Usar el editor TipTap
1. En el campo "Contenido", escribe un texto de prueba
2. ✅ Verifica que el toolbar funciona:
   - Click en **B** (Bold) → texto en negrita
   - Click en **I** (Italic) → texto en cursiva
   - Click en **H2** → crear título nivel 2
   - Click en lista → crear lista con bullets
3. **Agregar imagen:**
   - Click en ícono 📷
   - Pega URL: `https://picsum.photos/800/400`
   - Click "Insertar"
   - ✅ Verifica que la imagen aparece en el editor
4. **Agregar link:**
   - Selecciona texto
   - Click en ícono 🔗
   - URL: `https://modtok.cl`
   - Texto: "MODTOK"
   - Click "Insertar"
   - ✅ Verifica que el link aparece
5. **Preview mode:**
   - Click en "👁 Preview"
   - ✅ Verifica que ves el HTML renderizado
   - Click nuevamente para volver al editor

#### Paso 5: Llenar tab SEO
1. Click en tab "SEO"
2. ✅ Verifica que el Meta Title está pre-llenado con el título
3. **Meta Description:** "Guía completa sobre casas modulares en Chile 2025. Ventajas, costos y proveedores certificados."
4. **Keywords:** Agrega "casas modulares", "prefabricadas", "chile"
5. **OG Image:** `https://picsum.photos/1200/630`
6. **Canonical URL:** Deja vacío (se genera automático)

#### Paso 6: Auto-save (Test crítico)
1. Deja el cursor en el editor
2. Espera 3 segundos sin escribir
3. ✅ Verifica que aparece mensaje "Borrador guardado automáticamente"
4. Refresca la página
5. Click en "Editar" del post guardado
6. ✅ Verifica que el contenido se mantuvo

#### Paso 7: Publicar
1. Cambia Status a "Publicado"
2. ✅ Verifica que aparece el campo "Fecha de Publicación"
3. Click "Guardar Artículo"
4. ✅ Verifica mensaje de éxito
5. ✅ Verifica que vuelves a la lista
6. ✅ Verifica que el post aparece con badge verde "Publicado"

---

### Test 2: Editar Artículo Existente

1. En la lista de blog posts, click "Editar" en cualquier post
2. ✅ Verifica que carga los datos correctamente
3. Modifica el título: agrega " - Actualizado"
4. ✅ Verifica que el slug NO cambia (mantiene el original)
5. Guarda cambios
6. ✅ Verifica que se actualizó

---

### Test 3: Filtros y Búsqueda

#### Filtro por Status
1. En el dashboard /admin/blog
2. Dropdown "Status" → Selecciona "Publicado"
3. ✅ Verifica que solo muestra posts publicados
4. Selecciona "Borrador"
5. ✅ Verifica que solo muestra borradores

#### Filtro por Categoría
1. Dropdown "Categoría" → Selecciona "Guías"
2. ✅ Verifica que filtra correctamente

#### Búsqueda
1. Campo de búsqueda → Escribe "casa"
2. ✅ Verifica que filtra posts que contengan "casa" en título o contenido

#### Ordenamiento
1. Dropdown "Ordenar por" → Selecciona "Fecha de publicación"
2. ✅ Verifica que ordena correctamente
3. Prueba con "Título", "Vistas", etc.

---

### Test 4: Bulk Operations (Crítico)

#### Publicar en masa
1. Selecciona 2-3 posts con status "Borrador" (checkboxes)
2. ✅ Verifica que aparece contador: "3 seleccionado(s)"
3. Dropdown "Acción masiva" → "Publicar"
4. Click "Aplicar"
5. ✅ Confirma el alert
6. ✅ Verifica que todos cambiaron a "Publicado"

#### Cambiar categoría en masa
1. Selecciona 2 posts
2. Acción masiva → "Cambiar categoría"
3. NO debería funcionar (falta implementar selector de categoría)
4. ✅ Verifica error o que no hace nada

#### Eliminar en masa
1. Selecciona 1 post de prueba
2. Acción masiva → "Eliminar"
3. Click "Aplicar"
4. ✅ Confirma el alert
5. ✅ Verifica que el post desapareció
6. Recarga página para confirmar

---

### Test 5: Pagination

1. Si tienes menos de 20 posts, crea más posts de prueba
2. ✅ Verifica que aparece paginación
3. Click "Siguiente"
4. ✅ Verifica que carga página 2
5. ✅ Verifica que muestra "Página 2 de X"
6. Click "Anterior"
7. ✅ Verifica que vuelve a página 1

---

## Testing Admin Noticias

### Test 6: Crear Noticia Normal

#### Paso 1: Navegar
1. Ve a: http://localhost:4321/admin/noticias
2. ✅ Verifica que carga con tema ROJO (diferente al blog)
3. Click "+ Nueva Noticia"

#### Paso 2: Crear noticia
1. **Título:** "Nuevo Fabricante de Casas Modulares en Región del Biobío"
2. **News Type:** Selecciona "🏢 Empresa"
3. **Contenido:** Escribe texto de prueba con el editor TipTap
4. **Tags:** "fabricante", "biobío", "casas"
5. **Status:** "Publicado"
6. ✅ NO marcar como noticia urgente (dejar desmarcado)
7. Llenar tab SEO (similar al blog)
8. Click "Guardar Noticia"
9. ✅ Verifica que se creó correctamente

---

### Test 7: Crear Breaking News (CRÍTICO)

#### Paso 1: Crear noticia urgente
1. Click "+ Nueva Noticia"
2. **Título:** "🔴 URGENTE: Nueva Normativa de Construcción en Chile"
3. **News Type:** "📋 Normativa"
4. **Contenido:** Texto de prueba

#### Paso 2: Activar Breaking News
1. ✅ Verifica que ves el panel rojo "🔴 NOTICIA URGENTE"
2. ☑ **Marca el checkbox** "Marcar como noticia de última hora"
3. ✅ Verifica que aparece el mensaje explicativo
4. **Status:** "Publicado"
5. Guardar

#### Paso 3: Verificar en lista
1. Vuelve a /admin/noticias
2. ✅ Verifica que la noticia tiene:
   - Badge animado "🔴 URGENTE" pulsando
   - Se muestra prominente

---

### Test 8: Expiración de Noticias

#### Paso 1: Crear noticia con expiración
1. Crea nueva noticia: "Oferta Limitada - Casa Modular 20% OFF"
2. **News Type:** "📦 Producto"
3. Scroll hasta "Fecha de Expiración"
4. Selecciona fecha/hora: **Mañana a las 12:00**
5. ✅ Verifica que el campo acepta la fecha
6. Guardar

#### Paso 2: Crear noticia YA expirada (test visual)
1. Crea otra noticia
2. **Fecha de Expiración:** Ayer (cualquier fecha pasada)
3. Guardar
4. En la lista de noticias:
5. ✅ Verifica que muestra "⏱️ Expirada" en rojo

---

### Test 9: Filtros Específicos de Noticias

#### Filtro Breaking News
1. En /admin/noticias
2. Dropdown filtro → "🔴 Solo urgentes"
3. ✅ Verifica que solo muestra breaking news

#### Filtro News Type
1. Dropdown "Tipo" → Selecciona "🏢 Empresa"
2. ✅ Verifica que filtra por tipo

#### Filtro Expiración
1. Crea filtro para noticias expiradas
2. (Si no existe en UI, skip - está en el API pero quizás falta en UI)

---

### Test 10: Bulk Breaking News Toggle

1. Selecciona 2-3 noticias normales (no urgentes)
2. Acción masiva → "Marcar urgente"
3. Click "Aplicar"
4. ✅ Verifica que todas se marcaron como breaking news
5. Selecciona las mismas
6. Acción masiva → "Desmarcar urgente"
7. ✅ Verifica que se desmarcaron

---

## Testing Frontend Blog

### Test 11: Ver Blog Listing

1. Ve a: http://localhost:4321/blog
2. ✅ Verifica que carga la página
3. ✅ Verifica que muestra grid de artículos publicados
4. ✅ Verifica que cada card tiene:
   - Imagen destacada
   - Título
   - Excerpt
   - Fecha de publicación
   - Categoría
   - Autor
   - Tiempo de lectura
5. ✅ Verifica que NO muestra borradores

---

### Test 12: Ver Artículo Individual

1. Click en cualquier artículo del listing
2. ✅ Verifica URL: `/blog/el-slug-del-articulo`
3. ✅ Verifica que muestra:
   - Título completo
   - Imagen destacada
   - Contenido HTML renderizado
   - Autor y fecha
   - Tiempo de lectura
   - Tags
4. ✅ Verifica que los links del contenido funcionan
5. ✅ Verifica que las imágenes cargan

---

### Test 13: SEO Meta Tags (Blog)

1. Abre el artículo individual
2. Inspeccionar → View Page Source (Ver código fuente)
3. ✅ Busca y verifica estas meta tags:

```html
<!-- Open Graph -->
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:type" content="article" />
<meta property="og:locale" content="es_CL" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />

<!-- JSON-LD -->
<script type="application/ld+json">
{
  "@type": "Article",
  "headline": "...",
  "author": {...}
}
</script>
```

---

### Test 14: Analytics Tracking (Blog)

1. Abre un artículo individual
2. Abre Supabase Studio: http://localhost:54323
3. Ve a Table Editor → `content_views`
4. ✅ Verifica que se creó un registro con:
   - `content_type`: "blog_post"
   - `content_id`: el UUID del post
   - `viewer_ip`: tu IP
   - Timestamp actual

---

## Testing Frontend Noticias

### Test 15: Ver Noticias Listing

1. Ve a: http://localhost:4321/noticias
2. ✅ Verifica tema ROJO diferente al blog
3. ✅ Verifica que muestra grid de noticias

#### Breaking News Banner
4. Si creaste breaking news en el test 7:
5. ✅ Verifica que aparece BANNER superior:
   - Fondo rojo
   - Texto "🔴 NOTICIAS DE ÚLTIMA HORA"
   - Lista de breaking news
6. ✅ Click en breaking news del banner
7. ✅ Verifica que navega al artículo

---

### Test 16: Ver Noticia Individual

1. Click en cualquier noticia
2. ✅ Verifica URL: `/noticias/el-slug-de-la-noticia`
3. ✅ Verifica que muestra:
   - Badge de news type (🏢 Empresa, etc.)
   - Título
   - Contenido
   - Fecha

#### Si es Breaking News:
4. ✅ Verifica badge animado "🔴 NOTICIA URGENTE" en rojo
5. ✅ Verifica animación de pulso

#### Si tiene expiración:
6. Si la noticia está expirada:
7. ✅ Verifica badge "⏱️ Esta noticia ha expirado"

---

### Test 17: SEO Meta Tags (Noticias)

Similar al Test 13, pero con noticias:
1. View Page Source de una noticia
2. ✅ Verifica Open Graph, Twitter Cards, JSON-LD
3. ✅ Verifica que `@type` es "NewsArticle" (no Article)

---

## Testing SEO

### Test 18: Sitemap.xml

1. Ve a: http://localhost:4321/sitemap.xml
2. ✅ Verifica que carga XML válido
3. ✅ Busca URLs de blog: `<loc>http://localhost:4321/blog/...</loc>`
4. ✅ Busca URLs de noticias: `<loc>http://localhost:4321/noticias/...</loc>`
5. ✅ Busca Google News tags: `<news:news>` (si existen)

**Validar online:**
6. Copia el contenido del sitemap
7. Ve a: https://www.xml-sitemaps.com/validate-xml-sitemap.html
8. Pega y valida
9. ✅ Verifica que pasa validación

---

### Test 19: RSS Feed Blog

1. Ve a: http://localhost:4321/blog/rss.xml
2. ✅ Verifica que carga XML válido
3. ✅ Verifica elementos RSS:
   - `<channel>` con título "MODTOK - Blog"
   - `<item>` por cada post
   - `<title>`, `<link>`, `<description>`, `<pubDate>`
   - `<content:encoded>` con HTML completo
   - `<dc:creator>` con autor

**Validar online:**
4. Copia URL del RSS
5. Ve a: https://validator.w3.org/feed/
6. Pega URL y valida
7. ✅ Verifica que es válido RSS 2.0

---

### Test 20: RSS Feed Noticias

1. Ve a: http://localhost:4321/noticias/rss.xml
2. ✅ Verifica similar al Test 19
3. ✅ Verifica que items de breaking news tienen prefijo "🔴 URGENTE:"
4. Validar en: https://validator.w3.org/feed/

---

### Test 21: Open Graph Validator

1. Si tienes el sitio en producción/staging, usa la URL real
2. Si es local, usa ngrok para exponer:
   ```bash
   ngrok http 4321
   ```
3. Copia URL de ngrok
4. Ve a: https://www.opengraph.xyz/
5. Pega URL de un artículo: `https://xxx.ngrok.io/blog/articulo`
6. ✅ Verifica que muestra:
   - Título correcto
   - Descripción correcta
   - Imagen destacada (OG image)
   - Tipo "article"

---

### Test 22: Twitter Card Validator

1. Con URL de ngrok (o producción)
2. Ve a: https://cards-dev.twitter.com/validator
3. Pega URL del artículo
4. ✅ Verifica preview de Twitter Card:
   - Summary Large Image
   - Título
   - Descripción
   - Imagen grande

---

### Test 23: Google Rich Results

1. Ve a: https://search.google.com/test/rich-results
2. Pega URL del artículo (ngrok o producción)
3. ✅ Verifica que detecta "Article" schema
4. ✅ Verifica que pasa validación sin errores

---

## Testing APIs

### Test 24: API Blog List (GET)

**Con curl:**
```bash
# Listar todos los posts
curl http://localhost:4321/api/admin/blog \
  -H "Cookie: sb-access-token=TU_TOKEN_AQUI"

# Con filtros
curl "http://localhost:4321/api/admin/blog?status=published&category=guias" \
  -H "Cookie: sb-access-token=TU_TOKEN_AQUI"
```

✅ Verifica respuesta:
```json
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasMore": false,
    "hasPrev": false
  }
}
```

---

### Test 25: API Blog Create (POST)

**Con curl:**
```bash
curl -X POST http://localhost:4321/api/admin/blog/create \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=TU_TOKEN_AQUI" \
  -d '{
    "title": "Test API Post",
    "content": "<p>Contenido de prueba</p>",
    "excerpt": "Excerpt de prueba",
    "category": "guias",
    "status": "draft"
  }'
```

✅ Verifica respuesta:
```json
{
  "success": true,
  "message": "Blog post created successfully",
  "post": {
    "id": "...",
    "title": "Test API Post",
    "slug": "test-api-post",
    "status": "draft"
  }
}
```

---

### Test 26: API Noticias Breaking News Toggle (POST)

**Con curl:**
```bash
# Marcar como breaking news
curl -X POST http://localhost:4321/api/admin/noticias \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=TU_TOKEN_AQUI" \
  -d '{
    "action": "set_breaking",
    "post_ids": ["uuid-de-la-noticia"]
  }'
```

✅ Verifica que responde success y actualiza la noticia

---

### Test 27: API Error Handling

**Test sin autenticación:**
```bash
curl http://localhost:4321/api/admin/blog
```

✅ Verifica respuesta 401 o 403:
```json
{
  "error": "Unauthorized"
}
```

**Test con datos inválidos:**
```bash
curl -X POST http://localhost:4321/api/admin/blog/create \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=TU_TOKEN_AQUI" \
  -d '{
    "title": "",
    "content": ""
  }'
```

✅ Verifica respuesta 400:
```json
{
  "error": "Title and content are required"
}
```

---

## Checklist Final

### Funcionalidad Core
- [ ] Blog: Crear artículo ✅
- [ ] Blog: Editar artículo ✅
- [ ] Blog: Eliminar artículo ✅
- [ ] Blog: Auto-save funciona ✅
- [ ] Blog: Auto-slug funciona ✅
- [ ] Blog: Editor TipTap completo ✅
- [ ] Blog: Filtros y búsqueda ✅
- [ ] Blog: Bulk operations ✅
- [ ] Blog: Pagination ✅

### Noticias
- [ ] Noticias: Crear noticia ✅
- [ ] Noticias: Breaking news toggle ✅
- [ ] Noticias: Expiration date ✅
- [ ] Noticias: News types ✅
- [ ] Noticias: Filtros específicos ✅
- [ ] Noticias: Bulk breaking toggle ✅

### Frontend
- [ ] Blog listing carga ✅
- [ ] Blog post individual carga ✅
- [ ] Noticias listing carga ✅
- [ ] Noticias post individual carga ✅
- [ ] Breaking news banner funciona ✅
- [ ] Tema rojo en noticias ✅

### SEO
- [ ] Open Graph tags presentes ✅
- [ ] Twitter Cards presentes ✅
- [ ] JSON-LD schema presente ✅
- [ ] Sitemap.xml funciona ✅
- [ ] Blog RSS feed válido ✅
- [ ] Noticias RSS feed válido ✅
- [ ] Open Graph validator pasa ✅
- [ ] Twitter Card validator pasa ✅
- [ ] Google Rich Results pasa ✅

### Analytics
- [ ] content_views tracking funciona ✅
- [ ] Admin actions logging funciona ✅

### APIs
- [ ] GET endpoints responden ✅
- [ ] POST endpoints crean datos ✅
- [ ] PUT endpoints actualizan ✅
- [ ] DELETE endpoints eliminan ✅
- [ ] Auth funciona (401/403) ✅
- [ ] Validación funciona (400) ✅

### Performance
- [ ] Build SSG sin errores ✅
- [ ] Type check pasa ✅
- [ ] No errores en consola ✅

---

## 🐛 Reportar Bugs

Si encuentras bugs durante el QA:

1. **Captura de pantalla** del error
2. **Pasos para reproducir** exactos
3. **Consola del navegador** (errores JS)
4. **Respuesta del servidor** (si es API)
5. **Tipo de error:**
   - UI/UX issue
   - Funcionalidad rota
   - Error de validación
   - Performance issue
   - SEO issue

**Formato de reporte:**
```markdown
## Bug: [Título corto]

**Severidad:** Alta / Media / Baja
**Componente:** BlogManager / API / SEO / etc.

**Pasos para reproducir:**
1. Ir a /admin/blog
2. Click en "Nuevo Artículo"
3. ...

**Resultado esperado:**
Debería guardar el artículo

**Resultado actual:**
Error 500 en consola

**Screenshots:**
[pegar screenshot]

**Logs:**
[pegar error de consola]
```

---

## ✅ Criterios de Aprobación

**Para dar OK a FASE 4:**

1. ✅ **Todas las funcionalidades core funcionan** sin errores críticos
2. ✅ **SEO validators pasan** (Open Graph, Twitter, Rich Results)
3. ✅ **RSS feeds válidos** según W3C validator
4. ✅ **Sitemap.xml válido** y completo
5. ✅ **No hay errores en consola** del navegador
6. ✅ **Type check pasa** sin errores
7. ✅ **Build SSG completa** sin errores
8. ✅ **Analytics tracking funciona** correctamente

**Bugs aceptables (no bloqueantes):**
- Warnings menores de TypeScript
- Estilos visuales menores
- Mejoras de UX (no bugs funcionales)

---

*Última actualización: 2025-10-11*
*Para reportar issues: crear archivo BUGS_FASE_4.md*
