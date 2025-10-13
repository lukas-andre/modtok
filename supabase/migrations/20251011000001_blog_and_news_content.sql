-- FASE 4: Blog y Noticias - Sistema de contenido con SEO completo
-- Fecha: 2025-10-11
-- Descripción: Tablas separadas para Blog y Noticias con campos SEO optimizados

-- ============================================================================
-- 1. CREAR TABLA BLOG_POSTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contenido principal
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  -- Autor
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT, -- Cached para performance

  -- Imágenes
  featured_image_url TEXT,
  featured_image_alt TEXT,

  -- Categorización
  category TEXT CHECK (category IN ('guias', 'tutoriales', 'tendencias', 'consejos', 'casos-exito')),
  tags TEXT[],

  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  og_image_url TEXT,
  canonical_url TEXT,

  -- Engagement
  reading_time_minutes INTEGER,
  views_count INTEGER DEFAULT 0,

  -- Estado y fechas
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- JSON-LD structured data
  structured_data JSONB
);

-- Índices para blog_posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- Comentarios
COMMENT ON TABLE blog_posts IS 'Artículos de blog: guías, tutoriales, casos de éxito';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly slug único para /blog/[slug]';
COMMENT ON COLUMN blog_posts.reading_time_minutes IS 'Tiempo de lectura calculado automáticamente';
COMMENT ON COLUMN blog_posts.structured_data IS 'JSON-LD para Article schema.org';

-- ============================================================================
-- 2. CREAR TABLA NEWS_POSTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS news_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contenido principal
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,

  -- Autor
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  author_name TEXT,

  -- Imágenes
  featured_image_url TEXT,
  featured_image_alt TEXT,

  -- Categorización
  news_type TEXT CHECK (news_type IN ('industria', 'empresa', 'producto', 'evento', 'normativa')),
  tags TEXT[],

  -- SEO Fields
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  og_image_url TEXT,
  canonical_url TEXT,

  -- Engagement
  reading_time_minutes INTEGER,
  views_count INTEGER DEFAULT 0,

  -- Estado y fechas
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
  published_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- JSON-LD structured data
  structured_data JSONB,

  -- News-specific
  is_breaking BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ
);

-- Índices para news_posts
CREATE INDEX IF NOT EXISTS idx_news_posts_slug ON news_posts(slug);
CREATE INDEX IF NOT EXISTS idx_news_posts_status ON news_posts(status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_news_posts_published_at ON news_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_news_posts_news_type ON news_posts(news_type) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_news_posts_tags ON news_posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_news_posts_breaking ON news_posts(is_breaking) WHERE is_breaking = true AND status = 'published';

-- Comentarios
COMMENT ON TABLE news_posts IS 'Noticias: actualizaciones de industria, productos, eventos';
COMMENT ON COLUMN news_posts.slug IS 'URL-friendly slug único para /noticias/[slug]';
COMMENT ON COLUMN news_posts.is_breaking IS 'Noticia urgente, mostrar con badge especial';
COMMENT ON COLUMN news_posts.expires_at IS 'Fecha de expiración para noticias con vigencia limitada';

-- ============================================================================
-- 3. TRIGGERS PARA UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 4. FUNCIÓN: AUTO-CALCULAR READING TIME
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_reading_time(content_text TEXT)
RETURNS INTEGER AS $$
DECLARE
  word_count INTEGER;
  words_per_minute INTEGER := 200; -- Velocidad promedio de lectura
BEGIN
  -- Contar palabras (split por espacios)
  word_count := array_length(string_to_array(content_text, ' '), 1);

  -- Calcular minutos (mínimo 1 minuto)
  RETURN GREATEST(1, CEIL(word_count::DECIMAL / words_per_minute));
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-calcular reading time en blog_posts
CREATE OR REPLACE FUNCTION auto_calculate_blog_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reading_time_minutes := calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_blog_reading_time ON blog_posts;
CREATE TRIGGER calculate_blog_reading_time
  BEFORE INSERT OR UPDATE OF content ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_blog_reading_time();

-- Trigger para auto-calcular reading time en news_posts
CREATE OR REPLACE FUNCTION auto_calculate_news_reading_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.reading_time_minutes := calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_news_reading_time ON news_posts;
CREATE TRIGGER calculate_news_reading_time
  BEFORE INSERT OR UPDATE OF content ON news_posts
  FOR EACH ROW
  EXECUTE FUNCTION auto_calculate_news_reading_time();

-- ============================================================================
-- 5. FUNCIÓN: AUTO-GENERAR SLUG
-- ============================================================================

CREATE OR REPLACE FUNCTION slugify(text_input TEXT)
RETURNS TEXT AS $$
DECLARE
  slug_output TEXT;
BEGIN
  -- Convertir a minúsculas
  slug_output := LOWER(text_input);

  -- Reemplazar caracteres especiales españoles
  slug_output := REPLACE(slug_output, 'á', 'a');
  slug_output := REPLACE(slug_output, 'é', 'e');
  slug_output := REPLACE(slug_output, 'í', 'i');
  slug_output := REPLACE(slug_output, 'ó', 'o');
  slug_output := REPLACE(slug_output, 'ú', 'u');
  slug_output := REPLACE(slug_output, 'ñ', 'n');

  -- Reemplazar espacios y caracteres no permitidos por guiones
  slug_output := REGEXP_REPLACE(slug_output, '[^a-z0-9]+', '-', 'g');

  -- Eliminar guiones al inicio y final
  slug_output := TRIM(BOTH '-' FROM slug_output);

  RETURN slug_output;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. RLS POLICIES
-- ============================================================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;

-- Blog Posts: Todos pueden ver posts publicados
CREATE POLICY "Public can view published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published' AND published_at <= now());

-- Blog Posts: Solo admins pueden gestionar
CREATE POLICY "Admins can manage blog posts"
  ON blog_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- News Posts: Todos pueden ver noticias publicadas y no expiradas
CREATE POLICY "Public can view published news posts"
  ON news_posts
  FOR SELECT
  USING (
    status = 'published'
    AND published_at <= now()
    AND (expires_at IS NULL OR expires_at >= now())
  );

-- News Posts: Solo admins pueden gestionar
CREATE POLICY "Admins can manage news posts"
  ON news_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- 7. CREAR TABLA CONTENT_VIEWS (Analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS content_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('blog', 'news')),
  content_id UUID NOT NULL,
  viewer_ip TEXT,
  viewer_country TEXT,
  viewer_device TEXT,
  referrer TEXT,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para analytics
CREATE INDEX IF NOT EXISTS idx_content_views_content ON content_views(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_views_date ON content_views(viewed_at DESC);

-- RLS para content_views
ALTER TABLE content_views ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver analytics
CREATE POLICY "Admins can view content analytics"
  ON content_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Cualquiera puede insertar una vista (anónimo)
CREATE POLICY "Anyone can track content views"
  ON content_views
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 8. GRANTS Y PERMISOS
-- ============================================================================

GRANT ALL ON TABLE blog_posts TO postgres;
GRANT ALL ON TABLE blog_posts TO anon;
GRANT ALL ON TABLE blog_posts TO authenticated;
GRANT ALL ON TABLE blog_posts TO service_role;

GRANT ALL ON TABLE news_posts TO postgres;
GRANT ALL ON TABLE news_posts TO anon;
GRANT ALL ON TABLE news_posts TO authenticated;
GRANT ALL ON TABLE news_posts TO service_role;

GRANT ALL ON TABLE content_views TO postgres;
GRANT ALL ON TABLE content_views TO anon;
GRANT ALL ON TABLE content_views TO authenticated;
GRANT ALL ON TABLE content_views TO service_role;

GRANT EXECUTE ON FUNCTION calculate_reading_time(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION calculate_reading_time(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION slugify(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION slugify(TEXT) TO authenticated;

-- ============================================================================
-- 9. SEED DATA DE EJEMPLO (OPCIONAL)
-- ============================================================================

-- Ejemplo de blog post
INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  category,
  tags,
  meta_title,
  meta_description,
  keywords,
  status,
  published_at
) VALUES (
  'Guía completa para construir tu casa modular en Chile',
  'guia-completa-casa-modular-chile',
  'Todo lo que necesitas saber antes de construir tu casa modular: permisos, costos, plazos y más.',
  '<h2>Introducción</h2><p>Las casas modulares han revolucionado el mercado inmobiliario chileno...</p>',
  'guias',
  ARRAY['casas-modulares', 'construccion', 'chile', 'guia'],
  'Guía Completa: Cómo Construir tu Casa Modular en Chile 2025',
  'Descubre todo sobre construcción modular en Chile: permisos, costos, plazos, proveedores y más. Guía actualizada 2025.',
  ARRAY['casa modular', 'construcción modular', 'casas prefabricadas chile', 'permisos construcción'],
  'published',
  now()
) ON CONFLICT (slug) DO NOTHING;

-- Ejemplo de noticia
INSERT INTO news_posts (
  title,
  slug,
  summary,
  content,
  news_type,
  tags,
  meta_title,
  meta_description,
  keywords,
  status,
  published_at,
  is_breaking
) VALUES (
  'Nueva normativa chilena impulsa la construcción modular sostenible',
  'nueva-normativa-construccion-modular-sostenible',
  'El Ministerio de Vivienda anuncia incentivos para construcción modular con certificación sustentable.',
  '<h2>Cambios normativos</h2><p>El gobierno chileno ha anunciado nuevos incentivos...</p>',
  'normativa',
  ARRAY['normativa', 'sustentabilidad', 'construccion-modular'],
  'Nueva Normativa Chilena Impulsa Construcción Modular Sostenible',
  'Ministerio de Vivienda anuncia incentivos para construcción modular con certificación sustentable. Conoce los detalles.',
  ARRAY['normativa construcción', 'construcción sostenible', 'incentivos vivienda'],
  'published',
  now(),
  true
) ON CONFLICT (slug) DO NOTHING;
