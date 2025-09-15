-- MODTOK Database Schema Export
-- Generated on 2025-01-13
-- This file contains the complete database schema including:
-- - Tables
-- - Views
-- - Functions
-- - Triggers
-- - Policies
-- - Indexes

-- ============================================
-- ENUMS
-- ============================================

-- User roles enum
CREATE TYPE IF NOT EXISTS user_role AS ENUM (
  'super_admin',
  'admin',
  'provider',
  'user'
);

-- User status enum
CREATE TYPE IF NOT EXISTS user_status AS ENUM (
  'active',
  'inactive',
  'suspended',
  'pending_verification'
);

-- Category types enum
CREATE TYPE IF NOT EXISTS category_type AS ENUM (
  'casas',
  'fabricantes',
  'habilitacion_servicios',
  'decoracion'
);

-- Listing tiers enum
CREATE TYPE IF NOT EXISTS listing_tier AS ENUM (
  'premium',
  'destacado',
  'standard'
);

-- Listing status enum
CREATE TYPE IF NOT EXISTS listing_status AS ENUM (
  'draft',
  'pending_review',
  'active',
  'inactive',
  'rejected'
);

-- Blog categories enum
CREATE TYPE IF NOT EXISTS blog_category AS ENUM (
  'tendencias',
  'guias',
  'casos_exito',
  'noticias',
  'tutoriales'
);

-- Blog status enum
CREATE TYPE IF NOT EXISTS blog_status AS ENUM (
  'draft',
  'pending_review',
  'published',
  'archived'
);

-- Page types enum
CREATE TYPE IF NOT EXISTS page_type AS ENUM (
  'about_us',
  'terms_conditions',
  'privacy_policy',
  'faq',
  'contact',
  'landing_section'
);

-- Page status enum
CREATE TYPE IF NOT EXISTS page_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  status user_status DEFAULT 'active',
  company_name TEXT,
  rut TEXT,
  bio TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type category_type NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES categories(id),
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Features table
CREATE TABLE IF NOT EXISTS features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL,
  options JSONB,
  filter_location TEXT,
  filter_format TEXT,
  show_in_card_premium BOOLEAN DEFAULT false,
  show_in_card_featured BOOLEAN DEFAULT false,
  show_in_landing BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  category_type category_type NOT NULL,
  company_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  description TEXT,
  description_long TEXT,
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'pending_review',
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  years_experience INTEGER,
  certifications JSONB DEFAULT '[]',
  specialties TEXT[],
  services_offered TEXT[],
  coverage_areas TEXT[],
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  price_per_m2_min NUMERIC,
  price_per_m2_max NUMERIC,
  llave_en_mano BOOLEAN DEFAULT false,
  financing_available BOOLEAN DEFAULT false,
  features JSONB DEFAULT '{}',
  gallery_images TEXT[],
  videos TEXT[],
  catalog_pdf_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  featured_until TIMESTAMPTZ,
  premium_until TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  temp_password TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  admin_notes TEXT,
  internal_rating INTEGER CHECK (internal_rating >= 1 AND internal_rating <= 5),
  featured_order INTEGER
);

-- Provider Categories Junction Table (NEW - Multi-category support)
CREATE TABLE IF NOT EXISTS provider_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  category_type category_type NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(provider_id, category_type)
);

-- House Topologies table
CREATE TABLE IF NOT EXISTS house_topologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Houses table
CREATE TABLE IF NOT EXISTS houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  model_code TEXT,
  description TEXT,
  description_long TEXT,
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'active',
  topology_id UUID REFERENCES house_topologies(id),
  bedrooms INTEGER,
  bathrooms NUMERIC,
  area_m2 NUMERIC,
  area_built_m2 NUMERIC,
  floors INTEGER DEFAULT 1,
  price NUMERIC,
  price_opportunity NUMERIC,
  price_per_m2 NUMERIC,
  currency TEXT DEFAULT 'CLP',
  main_material TEXT,
  technology_materials TEXT[],
  windows_type TEXT[],
  services_included TEXT[],
  llave_en_mano BOOLEAN DEFAULT false,
  expandable BOOLEAN DEFAULT false,
  mobile BOOLEAN DEFAULT false,
  off_grid_ready BOOLEAN DEFAULT false,
  sustainable BOOLEAN DEFAULT false,
  smart_home BOOLEAN DEFAULT false,
  energy_rating TEXT,
  certifications JSONB DEFAULT '[]',
  main_image_url TEXT,
  gallery_images TEXT[],
  floor_plans TEXT[],
  videos TEXT[],
  virtual_tour_url TEXT,
  brochure_pdf_url TEXT,
  location_city TEXT,
  location_region TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  delivery_time_days INTEGER,
  assembly_time_days INTEGER,
  warranty_years INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  features JSONB DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  sku TEXT,
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'available',
  is_available BOOLEAN DEFAULT true,
  has_variants BOOLEAN DEFAULT false,
  variant_attributes JSONB DEFAULT '{}',
  parent_house_id UUID REFERENCES houses(id),
  sales_count INTEGER DEFAULT 0
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_long TEXT,
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'active',
  service_type TEXT NOT NULL,
  price_from NUMERIC,
  price_to NUMERIC,
  price_unit TEXT,
  coverage_areas TEXT[],
  main_image_url TEXT,
  gallery_images TEXT[],
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  features JSONB DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  sku TEXT,
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER,
  current_bookings INTEGER DEFAULT 0,
  booking_calendar JSONB DEFAULT '{}',
  sales_count INTEGER DEFAULT 0
);

-- Decorations table
CREATE TABLE IF NOT EXISTS decorations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id),
  category_id UUID REFERENCES categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  description TEXT,
  description_long TEXT,
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'active',
  product_type TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  price NUMERIC,
  price_wholesale NUMERIC,
  discount_percentage NUMERIC,
  currency TEXT DEFAULT 'CLP',
  stock_quantity INTEGER DEFAULT 0,
  stock_status TEXT DEFAULT 'in_stock',
  availability_date DATE,
  is_available BOOLEAN DEFAULT true,
  dimensions JSONB DEFAULT '{}',
  materials TEXT[],
  colors TEXT[],
  sizes TEXT[],
  has_variants BOOLEAN DEFAULT false,
  variant_attributes JSONB DEFAULT '{}',
  parent_product_id UUID REFERENCES decorations(id),
  main_image_url TEXT,
  gallery_images TEXT[],
  videos TEXT[],
  technical_sheet_url TEXT,
  installation_guide_url TEXT,
  installation_required BOOLEAN DEFAULT false,
  installation_price NUMERIC,
  delivery_time_days INTEGER,
  warranty_months INTEGER,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  features JSONB DEFAULT '{}',
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Hotspots table
CREATE TABLE IF NOT EXISTS hotspots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  description_long TEXT,
  city TEXT NOT NULL,
  region TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  population INTEGER,
  altitude_m INTEGER,
  distance_santiago_km INTEGER,
  nearest_airport TEXT,
  climate_data JSONB DEFAULT '{}',
  terrain_cost_min NUMERIC,
  terrain_cost_max NUMERIC,
  construction_cost_m2_avg NUMERIC,
  regulations_info TEXT,
  permits_info TEXT,
  restrictions TEXT,
  hero_image_url TEXT,
  gallery_images TEXT[],
  why_build_here TEXT,
  useful_links JSONB DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  providers_count INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hotspot Providers table
CREATE TABLE IF NOT EXISTS hotspot_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id UUID REFERENCES hotspots(id),
  provider_id UUID REFERENCES providers(id),
  coverage_type TEXT CHECK (coverage_type IN ('full', 'partial', 'preferred')),
  service_radius_km INTEGER,
  priority_order INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hotspot Features table
CREATE TABLE IF NOT EXISTS hotspot_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id UUID REFERENCES hotspots(id),
  feature_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  distance_km NUMERIC,
  rating NUMERIC,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hotspot Demographics table
CREATE TABLE IF NOT EXISTS hotspot_demographics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id UUID REFERENCES hotspots(id),
  year INTEGER NOT NULL,
  population INTEGER,
  population_density NUMERIC,
  median_income INTEGER,
  education_index NUMERIC,
  age_distribution JSONB DEFAULT '{}',
  economic_indicators JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Hotspot Cost Estimates table
CREATE TABLE IF NOT EXISTS hotspot_cost_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotspot_id UUID REFERENCES hotspots(id),
  estimate_type TEXT NOT NULL,
  category TEXT NOT NULL,
  min_cost INTEGER,
  max_cost INTEGER,
  avg_cost INTEGER,
  unit TEXT,
  currency TEXT DEFAULT 'CLP',
  notes TEXT,
  last_updated TIMESTAMPTZ DEFAULT now(),
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User Favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  notes TEXT,
  tags TEXT[],
  priority INTEGER DEFAULT 1,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- User Searches table
CREATE TABLE IF NOT EXISTS user_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT,
  search_params JSONB NOT NULL,
  alert_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  provider_id UUID REFERENCES providers(id),
  item_type TEXT,
  item_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  project_location TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  timeline TEXT,
  status TEXT DEFAULT 'pending',
  provider_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog Posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id),
  editor_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category blog_category,
  tags TEXT[],
  status blog_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  reading_time_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog Comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES blog_posts(id),
  user_id UUID REFERENCES profiles(id),
  parent_id UUID REFERENCES blog_comments(id),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics Events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_category TEXT,
  event_action TEXT,
  event_label TEXT,
  event_value NUMERIC,
  target_type TEXT,
  target_id UUID,
  page_url TEXT,
  referrer_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics Daily table
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  views_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  clicks_detail INTEGER DEFAULT 0,
  clicks_contact INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0
);

-- Admin Logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admin Actions table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  changes JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content Reviews table
CREATE TABLE IF NOT EXISTS content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  reviewed_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_needed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Import Logs table
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by UUID REFERENCES profiles(id),
  import_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  total_rows INTEGER,
  successful_rows INTEGER,
  failed_rows INTEGER,
  errors JSONB DEFAULT '[]',
  status TEXT DEFAULT 'processing',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Product Variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL,
  product_id UUID NOT NULL,
  variant_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  attributes JSONB NOT NULL,
  price NUMERIC,
  stock_quantity INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comparison Lists table
CREATE TABLE IF NOT EXISTS comparison_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT,
  item_type TEXT NOT NULL,
  item_ids UUID[],
  is_public BOOLEAN DEFAULT false,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Static Pages table
CREATE TABLE IF NOT EXISTS static_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type page_type NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  status page_status DEFAULT 'draft',
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],
  settings JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_system_page BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FAQ Items table
CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES static_pages(id),
  category TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[],
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact Settings table
CREATE TABLE IF NOT EXISTS contact_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_type TEXT UNIQUE NOT NULL,
  title TEXT,
  value TEXT,
  extra_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Landing Sections table
CREATE TABLE IF NOT EXISTS landing_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES static_pages(id),
  section_type TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  content TEXT,
  background_image_url TEXT,
  settings JSONB DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Provider Categories indexes
CREATE INDEX idx_provider_categories_provider_id ON provider_categories(provider_id);
CREATE INDEX idx_provider_categories_category_type ON provider_categories(category_type);
CREATE INDEX idx_provider_categories_primary ON provider_categories(provider_id, is_primary) WHERE is_primary = true;

-- Providers indexes
CREATE INDEX idx_providers_category_type ON providers(category_type);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_tier ON providers(tier);
CREATE INDEX idx_providers_slug ON providers(slug);
CREATE INDEX idx_providers_featured_order ON providers(featured_order) WHERE featured_order IS NOT NULL;

-- Houses indexes
CREATE INDEX idx_houses_provider_id ON houses(provider_id);
CREATE INDEX idx_houses_status ON houses(status);
CREATE INDEX idx_houses_slug ON houses(slug);
CREATE INDEX idx_houses_tier ON houses(tier);

-- Services indexes
CREATE INDEX idx_services_provider_id ON services(provider_id);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_slug ON services(slug);

-- Decorations indexes
CREATE INDEX idx_decorations_provider_id ON decorations(provider_id);
CREATE INDEX idx_decorations_category_id ON decorations(category_id);
CREATE INDEX idx_decorations_status ON decorations(status);
CREATE INDEX idx_decorations_slug ON decorations(slug);

-- Hotspots indexes
CREATE INDEX idx_hotspots_slug ON hotspots(slug);
CREATE INDEX idx_hotspots_region ON hotspots(region);

-- User Favorites indexes
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_item ON user_favorites(item_type, item_id);

-- Blog Posts indexes
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);

-- ============================================
-- VIEWS
-- ============================================

-- Providers with categories view
CREATE OR REPLACE VIEW providers_with_categories AS
SELECT
  p.*,
  array_agg(
    DISTINCT pc.category_type
    ORDER BY pc.category_type
  ) FILTER (WHERE pc.category_type IS NOT NULL) as categories,
  (
    SELECT category_type
    FROM provider_categories
    WHERE provider_id = p.id AND is_primary = true
    LIMIT 1
  ) as primary_category
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
    array_agg(DISTINCT pc.category_type ORDER BY pc.category_type) as categories
  FROM providers p
  INNER JOIN provider_categories pc ON pc.provider_id = p.id
  WHERE pc.category_type = p_category
    AND (p_status IS NULL OR p.status = p_status)
    AND (p_tier IS NULL OR p.tier = p_tier)
  GROUP BY p.id;
END;
$$;

-- Add category to provider
CREATE OR REPLACE FUNCTION add_provider_category(
  p_provider_id UUID,
  p_category category_type,
  p_is_primary BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  -- If setting as primary, unset other primary categories
  IF p_is_primary THEN
    UPDATE provider_categories
    SET is_primary = false
    WHERE provider_id = p_provider_id;
  END IF;

  INSERT INTO provider_categories (provider_id, category_type, is_primary)
  VALUES (p_provider_id, p_category, p_is_primary)
  ON CONFLICT (provider_id, category_type)
  DO UPDATE SET is_primary = EXCLUDED.is_primary;

  RETURN true;
END;
$$;

-- Remove category from provider
CREATE OR REPLACE FUNCTION remove_provider_category(
  p_provider_id UUID,
  p_category category_type
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM provider_categories
  WHERE provider_id = p_provider_id
    AND category_type = p_category;

  RETURN true;
END;
$$;

-- Handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'::user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sync provider category
CREATE OR REPLACE FUNCTION sync_provider_category()
RETURNS TRIGGER AS $$
BEGIN
  -- When category_type changes in providers table, sync with junction table
  IF TG_OP = 'UPDATE' AND OLD.category_type IS DISTINCT FROM NEW.category_type THEN
    -- Remove old category if exists
    IF OLD.category_type IS NOT NULL THEN
      DELETE FROM provider_categories
      WHERE provider_id = NEW.id AND category_type = OLD.category_type;
    END IF;

    -- Add new category as primary
    IF NEW.category_type IS NOT NULL THEN
      INSERT INTO provider_categories (provider_id, category_type, is_primary)
      VALUES (NEW.id, NEW.category_type, true)
      ON CONFLICT (provider_id, category_type)
      DO UPDATE SET is_primary = true;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sync provider category on insert
CREATE OR REPLACE FUNCTION sync_provider_category_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new provider is created with category_type, add to junction table
  IF NEW.category_type IS NOT NULL THEN
    INSERT INTO provider_categories (provider_id, category_type, is_primary)
    VALUES (NEW.id, NEW.category_type, true);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger for provider category sync on update
CREATE TRIGGER sync_provider_category_on_update
  AFTER UPDATE OF category_type ON providers
  FOR EACH ROW
  EXECUTE FUNCTION sync_provider_category();

-- Trigger for provider category sync on insert
CREATE TRIGGER sync_provider_category_on_insert_trigger
  AFTER INSERT ON providers
  FOR EACH ROW
  EXECUTE FUNCTION sync_provider_category_on_insert();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE decorations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE static_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Providers policies
CREATE POLICY "Providers are viewable by everyone"
  ON providers FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage providers"
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

-- Provider Categories policies
CREATE POLICY "Provider categories are viewable by everyone"
  ON provider_categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage provider categories"
  ON provider_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Houses policies
CREATE POLICY "Houses are viewable by everyone"
  ON houses FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage houses"
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

-- Services policies
CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Providers can manage own services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE id = services.provider_id
      AND profile_id = auth.uid()
    )
  );

-- Decorations policies
CREATE POLICY "Decorations are viewable by everyone"
  ON decorations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage decorations"
  ON decorations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Providers can manage own decorations"
  ON decorations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE id = decorations.provider_id
      AND profile_id = auth.uid()
    )
  );

-- User Favorites policies
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites"
  ON user_favorites FOR ALL
  USING (user_id = auth.uid());

-- Inquiries policies
CREATE POLICY "Users can view own inquiries"
  ON inquiries FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Providers can view their inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM providers
      WHERE id = inquiries.provider_id
      AND profile_id = auth.uid()
    )
  );

-- Blog Posts policies
CREATE POLICY "Published posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Authors can manage own posts"
  ON blog_posts FOR ALL
  USING (author_id = auth.uid());

CREATE POLICY "Admins can manage all posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Static Pages policies
CREATE POLICY "Published pages are viewable by everyone"
  ON static_pages FOR SELECT
  USING (status = 'published' OR created_by = auth.uid());

CREATE POLICY "Admins can manage static pages"
  ON static_pages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('provider-logos', 'provider-logos', true),
  ('provider-covers', 'provider-covers', true),
  ('house-images', 'house-images', true),
  ('service-images', 'service-images', true),
  ('decoration-images', 'decoration-images', true),
  ('blog-images', 'blog-images', true),
  ('hotspot-images', 'hotspot-images', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Provider images policies
CREATE POLICY "Provider images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('provider-logos', 'provider-covers'));

CREATE POLICY "Admins can manage provider images"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('provider-logos', 'provider-covers') AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Product images policies
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('house-images', 'service-images', 'decoration-images', 'hotspot-images'));

CREATE POLICY "Admins can manage product images"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('house-images', 'service-images', 'decoration-images', 'hotspot-images') AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ============================================
-- END OF SCHEMA
-- ============================================