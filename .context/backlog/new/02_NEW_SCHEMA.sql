-- ============================================
-- MODTOK NEW DATABASE SCHEMA v2.0
-- ============================================
-- Diseñado para 3 categorías: Fábricas, Casas, Habilitación & Servicios
-- Elimina: Decoraciones
-- Sistema de features flexible basado en JSONB
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Category types (REDUCIDO A 3)
CREATE TYPE category_type AS ENUM (
  'fabrica',
  'casas',
  'habilitacion_servicios'
);

-- User roles
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'provider',
  'user'
);

-- User status
CREATE TYPE user_status AS ENUM (
  'active',
  'inactive',
  'suspended',
  'pending_verification'
);

-- Listing tiers
CREATE TYPE listing_tier AS ENUM (
  'premium',    -- Más cara, más espacio (1-2 por columna), con landing dedicada
  'destacado',  -- Medio, 4 por columna
  'standard'    -- Básico, listado simple
);

-- Listing status
CREATE TYPE listing_status AS ENUM (
  'draft',
  'pending_review',
  'active',
  'inactive',
  'rejected'
);

-- Feature data types
CREATE TYPE feature_data_type AS ENUM (
  'boolean',
  'number',
  'text',
  'text_array',
  'json'
);

-- Filter types
CREATE TYPE filter_type AS ENUM (
  'checklist',
  'slider',
  'checkbox',
  'radio',
  'select'
);

-- Blog/Content status
CREATE TYPE content_status AS ENUM (
  'draft',
  'pending_review',
  'published',
  'archived'
);

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  status user_status DEFAULT 'active',

  -- Provider specific fields
  company_name TEXT,
  rut TEXT,
  bio TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',

  -- Settings & preferences
  preferences JSONB DEFAULT '{}',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- FEATURE DEFINITIONS (Metadata)
-- ============================================

CREATE TABLE feature_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Categorization
  category category_type NOT NULL,
  group_name TEXT NOT NULL, -- 'servicios_disponibles', 'especialidad', 'generales', etc.
  feature_key TEXT NOT NULL, -- 'dise_std', 'tiny_houses', 'experiencia', etc.

  -- Display
  label TEXT NOT NULL, -- 'Diseño estándar', 'Tiny Houses', 'Experiencia'
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,

  -- Data type & validation
  data_type feature_data_type NOT NULL,
  validation_rules JSONB DEFAULT '{}', -- min, max, pattern, enum values, etc.
  default_value JSONB,

  -- Filter configuration
  is_filterable BOOLEAN DEFAULT false,
  filter_type filter_type,
  filter_location TEXT, -- 'lateral', 'top', null
  filter_format TEXT, -- 'checklist|varios|todos', 'slider', etc.

  -- Display rules by tier
  show_in_card_standard BOOLEAN DEFAULT false,
  show_in_card_destacado BOOLEAN DEFAULT false,
  show_in_card_premium BOOLEAN DEFAULT false,
  show_in_landing BOOLEAN DEFAULT false,
  requires_login BOOLEAN DEFAULT false, -- Si se muestra solo con login

  -- Admin form configuration
  admin_input_type TEXT, -- 'checkbox', 'input text string', 'checklist', 'slider', etc.
  admin_helper_text TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(category, feature_key)
);

-- Índice para búsquedas rápidas por categoría y grupo
CREATE INDEX idx_feature_definitions_category ON feature_definitions(category);
CREATE INDEX idx_feature_definitions_group ON feature_definitions(category, group_name);
CREATE INDEX idx_feature_definitions_filterable ON feature_definitions(is_filterable) WHERE is_filterable = true;

-- ============================================
-- PROVIDERS (Fábricas y Servicios)
-- ============================================

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Core fields
  company_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,

  -- Primary category (for backwards compatibility and main classification)
  primary_category category_type NOT NULL,

  -- Visual assets
  logo_url TEXT,
  cover_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',

  -- Content
  description TEXT, -- Breve
  description_long TEXT, -- Detallada para landing

  -- Tier & Status
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'pending_review',

  -- Contact info (core fields, siempre accesibles)
  email TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  website TEXT,

  -- Location (core fields)
  address TEXT,
  city TEXT,
  region TEXT, -- Código ISO región

  -- FEATURES DINÁMICAS (JSONB)
  features JSONB DEFAULT '{}',
  /* Estructura:
  {
    "servicios_disponibles": {
      "dise_std": true,
      "dise_pers": false,
      "insta_premontada": true,
      ...
    },
    "especialidad": {
      "tiny_houses": true,
      "modulares_sip": false,
      ...
    },
    "generales": {
      "experiencia": 15,
      "llave_en_mano": true,
      "precio_ref_min_m2": 800000,
      "precio_ref_max_m2": 1500000,
      "cobertura": ["RM", "V", "VIII"],
      ...
    }
  }
  */

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Premium features
  featured_until TIMESTAMPTZ,
  premium_until TIMESTAMPTZ,
  featured_order INTEGER, -- Orden manual para destacados

  -- Editorial control
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  admin_notes TEXT,
  internal_rating INTEGER CHECK (internal_rating >= 1 AND internal_rating <= 5),

  -- Content quality flags (para control editorial)
  has_quality_images BOOLEAN DEFAULT false,
  has_complete_info BOOLEAN DEFAULT false,
  editor_approved_for_premium BOOLEAN DEFAULT false,

  -- Analytics
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Índices
CREATE INDEX idx_providers_primary_category ON providers(primary_category);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_tier ON providers(tier);
CREATE INDEX idx_providers_region ON providers(region);
CREATE INDEX idx_providers_featured_order ON providers(featured_order) WHERE featured_order IS NOT NULL;

-- GIN index para búsquedas en features JSONB
CREATE INDEX idx_providers_features ON providers USING GIN (features);

-- ============================================
-- PROVIDER CATEGORIES (Multi-category support)
-- ============================================

CREATE TABLE provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  category category_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(provider_id, category)
);

-- Índices
CREATE INDEX idx_provider_categories_provider ON provider_categories(provider_id);
CREATE INDEX idx_provider_categories_category ON provider_categories(category);
CREATE INDEX idx_provider_categories_primary ON provider_categories(provider_id, is_primary) WHERE is_primary = true;

-- ============================================
-- HOUSES (Casas - Catálogo de productos)
-- ============================================

CREATE TABLE houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  model_code TEXT,
  sku TEXT,

  -- Content
  description TEXT,
  description_long TEXT,

  -- Tier & Status
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'active',

  -- Basic specs (campos core, no dinámicos)
  topology_code TEXT, -- '2D-1B', '3D-2B', etc.
  bedrooms INTEGER,
  bathrooms NUMERIC,
  area_m2 NUMERIC,
  floors INTEGER DEFAULT 1,

  -- Pricing
  price NUMERIC,
  price_opportunity NUMERIC,
  price_per_m2 NUMERIC,
  currency TEXT DEFAULT 'CLP',

  -- FEATURES DINÁMICAS (JSONB)
  features JSONB DEFAULT '{}',
  /* Estructura:
  {
    "servicios_disponibles": {
      "insta_premontada": true,
      "contr_terreno": false,
      ...
    },
    "ventanas": {
      "vent_termopanel": true,
      "vent_pvc": false,
      ...
    },
    "tecnologia_materiales": {
      "tec_panel_sip": true,
      "tec_madera": true,
      ...
    },
    "generales": {
      "llave_en_mano": true,
      "modelo": "EcoModular 120",
      ...
    }
  }
  */

  -- Visual assets
  main_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  floor_plans TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  virtual_tour_url TEXT,
  brochure_pdf_url TEXT,

  -- Location (opcional, para proyectos específicos)
  location_city TEXT,
  location_region TEXT,
  latitude NUMERIC,
  longitude NUMERIC,

  -- Delivery & warranty
  delivery_time_days INTEGER,
  assembly_time_days INTEGER,
  warranty_years INTEGER,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Stock & availability
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'available',
  is_available BOOLEAN DEFAULT true,

  -- Variants support
  has_variants BOOLEAN DEFAULT false,
  variant_attributes JSONB DEFAULT '{}',
  parent_house_id UUID REFERENCES houses(id),

  -- Analytics
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Índices
CREATE INDEX idx_houses_provider ON houses(provider_id);
CREATE INDEX idx_houses_slug ON houses(slug);
CREATE INDEX idx_houses_status ON houses(status);
CREATE INDEX idx_houses_tier ON houses(tier);
CREATE INDEX idx_houses_topology ON houses(topology_code);
CREATE INDEX idx_houses_price ON houses(price);
CREATE INDEX idx_houses_area ON houses(area_m2);

-- GIN index para features
CREATE INDEX idx_houses_features ON houses USING GIN (features);

-- ============================================
-- SERVICES (Ya no es una tabla separada,
-- los servicios son providers con category='habilitacion_servicios')
-- PERO mantenemos esta tabla para servicios específicos
-- que un provider de habilitación ofrece como productos
-- ============================================

CREATE TABLE service_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,

  -- Core fields
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,

  -- Content
  description TEXT,
  description_long TEXT,

  -- Tier & Status
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'active',

  -- Service type
  service_family TEXT, -- 'agua_sanitarios', 'contratistas', 'energia', etc.
  service_type TEXT, -- Tipo específico del servicio

  -- Pricing
  price_from NUMERIC,
  price_to NUMERIC,
  price_unit TEXT, -- 'm2', 'unidad', 'proyecto', etc.
  currency TEXT DEFAULT 'CLP',

  -- FEATURES DINÁMICAS
  features JSONB DEFAULT '{}',

  -- Coverage
  coverage_areas TEXT[] DEFAULT '{}', -- Regiones ISO

  -- Visual assets
  main_image_url TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Availability
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER,
  current_bookings INTEGER DEFAULT 0,
  booking_calendar JSONB DEFAULT '{}',

  -- Analytics
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Índices
CREATE INDEX idx_service_products_provider ON service_products(provider_id);
CREATE INDEX idx_service_products_slug ON service_products(slug);
CREATE INDEX idx_service_products_status ON service_products(status);
CREATE INDEX idx_service_products_family ON service_products(service_family);
CREATE INDEX idx_service_products_features ON service_products USING GIN (features);

-- ============================================
-- TOPOLOGIES (Tipologías de casas)
-- ============================================

CREATE TABLE house_topologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- '2D-1B', '3D-2B', etc.
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Insert common topologies
INSERT INTO house_topologies (code, bedrooms, bathrooms, display_order) VALUES
('1D-1B', 1, 1, 1),
('2D-1B', 2, 1, 2),
('2D-2B', 2, 2, 3),
('3D-2B', 3, 2, 4),
('3D-3B', 3, 3, 5),
('4D-2B', 4, 2, 6),
('4D-3B', 4, 3, 7),
('4D-4B', 4, 4, 8);

-- ============================================
-- BLOG & CONTENT
-- ============================================

CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  editor_id UUID REFERENCES profiles(id),

  -- Content
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,

  -- Categorization
  category TEXT, -- 'tendencias', 'guias', 'casos_exito', 'noticias', 'tutoriales'
  tags TEXT[] DEFAULT '{}',

  -- Status
  status content_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Analytics
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at) WHERE status = 'published';

-- ============================================
-- STATIC PAGES
-- ============================================

CREATE TABLE static_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Core
  type TEXT NOT NULL, -- 'about_us', 'terms', 'privacy', 'faq', 'contact', 'landing_section'
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,

  -- Status
  status content_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[] DEFAULT '{}',

  -- Settings
  settings JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_system_page BOOLEAN DEFAULT false,

  -- Authorship
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_static_pages_slug ON static_pages(slug);
CREATE INDEX idx_static_pages_type ON static_pages(type);
CREATE INDEX idx_static_pages_status ON static_pages(status);

-- ============================================
-- USER INTERACTIONS
-- ============================================

-- User Favorites
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'provider', 'house', 'service'
  item_id UUID NOT NULL,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, item_type, item_id)
);

-- Índices
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_item ON user_favorites(item_type, item_id);

-- Inquiries
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  provider_id UUID REFERENCES providers(id),

  -- Item reference (optional)
  item_type TEXT, -- 'house', 'service', null para consulta general
  item_id UUID,

  -- Contact info
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,

  -- Project details
  project_location TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  timeline TEXT,

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'in_progress', 'closed'
  provider_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_inquiries_user ON inquiries(user_id);
CREATE INDEX idx_inquiries_provider ON inquiries(provider_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- ============================================
-- ANALYTICS
-- ============================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,

  -- Event details
  event_type TEXT NOT NULL, -- 'view', 'click', 'inquiry', 'save', etc.
  event_category TEXT,
  event_action TEXT,
  event_label TEXT,
  event_value NUMERIC,

  -- Target
  target_type TEXT, -- 'provider', 'house', 'service'
  target_id UUID,

  -- Context
  page_url TEXT,
  referrer_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Device info
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,

  -- Location
  country TEXT,
  region TEXT,
  city TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_target ON analytics_events(target_type, target_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);

-- ============================================
-- ADMIN LOGS
-- ============================================

CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),

  -- Action details
  action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'approve', 'reject', etc.
  target_type TEXT NOT NULL, -- 'provider', 'house', 'blog_post', etc.
  target_id UUID,

  -- Changes
  changes JSONB DEFAULT '{}',

  -- Context
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_type, target_id);

-- ============================================
-- VIEWS
-- ============================================

-- Providers with categories
CREATE OR REPLACE VIEW providers_with_categories AS
SELECT
  p.*,
  array_agg(
    DISTINCT pc.category
    ORDER BY pc.category
  ) FILTER (WHERE pc.category IS NOT NULL) as categories,
  (
    SELECT category
    FROM provider_categories
    WHERE provider_id = p.id AND is_primary = true
    LIMIT 1
  ) as primary_category_from_junction
FROM providers p
LEFT JOIN provider_categories pc ON pc.provider_id = p.id
GROUP BY p.id;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Get providers by category
CREATE OR REPLACE FUNCTION get_providers_by_category(
  p_category category_type,
  p_status listing_status DEFAULT NULL,
  p_tier listing_tier DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  company_name TEXT,
  slug TEXT,
  email TEXT,
  phone TEXT,
  status listing_status,
  tier listing_tier,
  categories category_type[]
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.company_name,
    p.slug,
    p.email,
    p.phone,
    p.status,
    p.tier,
    array_agg(DISTINCT pc.category ORDER BY pc.category) as categories
  FROM providers p
  INNER JOIN provider_categories pc ON pc.provider_id = p.id
  WHERE pc.category = p_category
    AND (p_status IS NULL OR p.status = p_status)
    AND (p_tier IS NULL OR p.tier = p_tier)
  GROUP BY p.id;
END;
$$;

-- Get feature value from JSONB
CREATE OR REPLACE FUNCTION get_feature_value(
  p_features JSONB,
  p_group TEXT,
  p_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN p_features -> p_group -> p_key;
END;
$$;

-- Search providers by features (example for boolean features)
CREATE OR REPLACE FUNCTION search_providers_by_feature(
  p_category category_type,
  p_group TEXT,
  p_key TEXT,
  p_value BOOLEAN
)
RETURNS TABLE(
  id UUID,
  company_name TEXT,
  slug TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.company_name,
    p.slug
  FROM providers p
  WHERE p.primary_category = p_category
    AND (p.features -> p_group ->> p_key)::boolean = p_value;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all relevant tables
CREATE TRIGGER update_providers_updated_at
  BEFORE UPDATE ON providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_houses_updated_at
  BEFORE UPDATE ON houses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_service_products_updated_at
  BEFORE UPDATE ON service_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_static_pages_updated_at
  BEFORE UPDATE ON static_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sync provider category on insert
CREATE OR REPLACE FUNCTION sync_provider_category_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.primary_category IS NOT NULL THEN
    INSERT INTO provider_categories (provider_id, category, is_primary)
    VALUES (NEW.id, NEW.primary_category, true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_provider_category_trigger
  AFTER INSERT ON providers
  FOR EACH ROW EXECUTE FUNCTION sync_provider_category_on_insert();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Providers policies
CREATE POLICY "Active providers are viewable by everyone"
  ON providers FOR SELECT
  USING (status = 'active' OR profile_id = auth.uid());

CREATE POLICY "Admins can manage all providers"
  ON providers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Providers can update own listing"
  ON providers FOR UPDATE
  USING (profile_id = auth.uid());

-- Houses policies
CREATE POLICY "Active houses are viewable by everyone"
  ON houses FOR SELECT
  USING (
    status = 'active'
    OR EXISTS (
      SELECT 1 FROM providers
      WHERE id = houses.provider_id
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all houses"
  ON houses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Providers can manage own houses"
  ON houses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE id = houses.provider_id
      AND profile_id = auth.uid()
    )
  );

-- Similar policies for other tables...

-- ============================================
-- STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('provider-logos', 'provider-logos', true),
  ('provider-covers', 'provider-covers', true),
  ('provider-galleries', 'provider-galleries', true),
  ('house-images', 'house-images', true),
  ('house-plans', 'house-plans', true),
  ('service-images', 'service-images', true),
  ('blog-images', 'blog-images', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE providers IS 'Proveedores principales (Fábricas y Servicios de Habilitación)';
COMMENT ON TABLE houses IS 'Catálogo de casas ofrecidas por las fábricas';
COMMENT ON TABLE service_products IS 'Productos/servicios específicos ofrecidos por proveedores de habilitación';
COMMENT ON TABLE feature_definitions IS 'Metadatos de features dinámicas por categoría';
COMMENT ON COLUMN providers.features IS 'Features dinámicas en formato JSONB según categoría';
COMMENT ON COLUMN providers.tier IS 'premium: 1-2 por columna + landing, destacado: 4 por columna, standard: listado básico';
COMMENT ON COLUMN providers.editor_approved_for_premium IS 'Flag de control editorial para aprobar contenido premium basado en calidad';

-- ============================================
-- END OF SCHEMA
-- ============================================
