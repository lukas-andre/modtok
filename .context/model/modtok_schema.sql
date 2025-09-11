-- MODTOK Marketplace Database Schema
-- PostgreSQL schema for Supabase
-- Created: 2024

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'author', 'provider', 'user');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification');

-- Extended user profiles (extends Supabase auth.users)
CREATE TABLE profiles (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- CATEGORIES & TAXONOMIES
-- =============================================

-- Main category types
CREATE TYPE category_type AS ENUM ('casas', 'fabricantes', 'habilitacion_servicios', 'decoracion');
CREATE TYPE listing_tier AS ENUM ('premium', 'destacado', 'standard');
CREATE TYPE listing_status AS ENUM ('draft', 'pending_review', 'active', 'inactive', 'rejected');

-- Categories (from CSV structure)
CREATE TABLE categories (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Features/Attributes that can be filtered
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    type TEXT NOT NULL, -- 'boolean', 'select', 'multiselect', 'range', 'text'
    options JSONB, -- For select/multiselect types
    filter_location TEXT, -- 'lateral', 'top', etc.
    filter_format TEXT, -- 'checkbox', 'slider', 'select'
    show_in_card_premium BOOLEAN DEFAULT false,
    show_in_card_featured BOOLEAN DEFAULT false,
    show_in_landing BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROVIDERS & MANUFACTURERS
-- =============================================

CREATE TABLE providers (
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
    
    -- Contact information
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    website TEXT,
    address TEXT,
    city TEXT,
    region TEXT,
    
    -- Business details
    years_experience INTEGER,
    certifications JSONB DEFAULT '[]',
    specialties TEXT[],
    services_offered TEXT[],
    coverage_areas TEXT[], -- Regions they serve
    
    -- Pricing
    price_range_min DECIMAL(12,2),
    price_range_max DECIMAL(12,2),
    price_per_m2_min DECIMAL(12,2),
    price_per_m2_max DECIMAL(12,2),
    
    -- Features (from CSV structure)
    llave_en_mano BOOLEAN DEFAULT false,
    financing_available BOOLEAN DEFAULT false,
    features JSONB DEFAULT '{}', -- Store all feature values
    
    -- Media
    gallery_images TEXT[],
    videos TEXT[],
    catalog_pdf_url TEXT,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    
    -- Admin
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    featured_until TIMESTAMPTZ,
    premium_until TIMESTAMPTZ,
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- HOUSES / PRODUCTS
-- =============================================

-- House topology/configuration
CREATE TABLE house_topologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- e.g., '2B1B' for 2 bedrooms, 1 bathroom
    bedrooms INTEGER NOT NULL,
    bathrooms DECIMAL(2,1) NOT NULL, -- Allow 1.5 bathrooms
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    
    -- Basic info
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    model_code TEXT,
    description TEXT,
    description_long TEXT,
    tier listing_tier DEFAULT 'standard',
    status listing_status DEFAULT 'active',
    
    -- Specifications
    topology_id UUID REFERENCES house_topologies(id),
    bedrooms INTEGER,
    bathrooms DECIMAL(2,1),
    area_m2 DECIMAL(8,2),
    area_built_m2 DECIMAL(8,2),
    floors INTEGER DEFAULT 1,
    
    -- Pricing
    price DECIMAL(12,2),
    price_opportunity DECIMAL(12,2), -- Special/discount price
    price_per_m2 DECIMAL(10,2),
    currency TEXT DEFAULT 'CLP',
    
    -- Features & Materials
    main_material TEXT,
    technology_materials TEXT[], -- Panel SIP, Container, etc.
    windows_type TEXT[], -- Termopanel, PVC, etc.
    services_included TEXT[], -- From CSV structure
    
    -- Characteristics
    llave_en_mano BOOLEAN DEFAULT false,
    expandable BOOLEAN DEFAULT false,
    mobile BOOLEAN DEFAULT false,
    off_grid_ready BOOLEAN DEFAULT false,
    sustainable BOOLEAN DEFAULT false,
    smart_home BOOLEAN DEFAULT false,
    
    -- Energy & Sustainability
    energy_rating TEXT,
    certifications JSONB DEFAULT '[]',
    
    -- Media
    main_image_url TEXT,
    gallery_images TEXT[],
    floor_plans TEXT[],
    videos TEXT[],
    virtual_tour_url TEXT,
    brochure_pdf_url TEXT,
    
    -- Location (if specific)
    location_city TEXT,
    location_region TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Delivery
    delivery_time_days INTEGER,
    assembly_time_days INTEGER,
    warranty_years INTEGER,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    
    -- Features JSON (flexible storage)
    features JSONB DEFAULT '{}',
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- SERVICES
-- =============================================

CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id),
    
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    description_long TEXT,
    tier listing_tier DEFAULT 'standard',
    status listing_status DEFAULT 'active',
    
    -- Service specifics
    service_type TEXT NOT NULL,
    price_from DECIMAL(12,2),
    price_to DECIMAL(12,2),
    price_unit TEXT, -- 'per_m2', 'per_project', 'per_hour'
    
    -- Coverage
    coverage_areas TEXT[],
    
    -- Media
    main_image_url TEXT,
    gallery_images TEXT[],
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    
    -- Features
    features JSONB DEFAULT '{}',
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- HOTSPOTS (Geographic locations)
-- =============================================

CREATE TABLE hotspots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    description_long TEXT,
    
    -- Location
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Stats
    population INTEGER,
    altitude_m INTEGER,
    distance_santiago_km INTEGER,
    nearest_airport TEXT,
    
    -- Climate
    climate_data JSONB DEFAULT '{}',
    
    -- Costs estimates
    terrain_cost_min DECIMAL(12,2),
    terrain_cost_max DECIMAL(12,2),
    construction_cost_m2_avg DECIMAL(10,2),
    
    -- Regulations
    regulations_info TEXT,
    permits_info TEXT,
    restrictions TEXT,
    
    -- Media
    hero_image_url TEXT,
    gallery_images TEXT[],
    
    -- Content
    why_build_here TEXT,
    useful_links JSONB DEFAULT '[]',
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    -- Counts
    providers_count INTEGER DEFAULT 0,
    projects_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER INTERACTIONS
-- =============================================

-- User watchlist/favorites with notes
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'house', 'provider', 'service', 'decoration'
    item_id UUID NOT NULL,
    notes TEXT, -- User can add personal notes about the item
    tags TEXT[], -- User can add custom tags
    priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high priority
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, item_type, item_id)
);

-- User searches (for saved searches feature)
CREATE TABLE user_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT,
    search_params JSONB NOT NULL,
    alert_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries/Quotes
CREATE TABLE inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    provider_id UUID REFERENCES providers(id),
    item_type TEXT, -- 'house', 'service'
    item_id UUID,
    
    -- Contact info (for non-registered users)
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    
    -- Inquiry details
    message TEXT,
    project_location TEXT,
    budget_min DECIMAL(12,2),
    budget_max DECIMAL(12,2),
    timeline TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'contacted', 'quoted', 'closed'
    provider_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BLOG & CONTENT
-- =============================================

CREATE TYPE blog_status AS ENUM ('draft', 'pending_review', 'published', 'archived');
CREATE TYPE blog_category AS ENUM ('tendencias', 'guias', 'casos_exito', 'noticias', 'tutoriales');

CREATE TABLE blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES profiles(id),
    editor_id UUID REFERENCES profiles(id),
    
    -- Content
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL, -- Markdown or HTML
    featured_image_url TEXT,
    
    -- Categorization
    category blog_category,
    tags TEXT[],
    
    -- Status
    status blog_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    
    -- Stats
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog comments
CREATE TABLE blog_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    parent_id UUID REFERENCES blog_comments(id),
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =============================================
-- ANALYTICS & TRACKING
-- =============================================

-- Page views tracking
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    session_id TEXT,
    
    -- Event details
    event_type TEXT NOT NULL, -- 'page_view', 'click', 'save', 'inquiry', 'share'
    event_category TEXT, -- 'house', 'provider', 'service', 'blog'
    event_action TEXT, -- 'view_details', 'view_contact', 'download_pdf', etc.
    event_label TEXT,
    event_value DECIMAL(10,2),
    
    -- Target
    target_type TEXT, -- 'house', 'provider', 'service', 'blog_post'
    target_id UUID,
    
    -- Context
    page_url TEXT,
    referrer_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- User info
    ip_address INET,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    country TEXT,
    region TEXT,
    city TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Aggregated analytics (for performance)
CREATE TABLE analytics_daily (
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
    shares_count INTEGER DEFAULT 0,
    
    UNIQUE(date, item_type, item_id)
);


-- =============================================
-- ADMIN ACTIVITY LOG
-- =============================================

CREATE TABLE admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Provider indexes
CREATE INDEX idx_providers_tier ON providers(tier);
CREATE INDEX idx_providers_status ON providers(status);
CREATE INDEX idx_providers_category ON providers(category_type);
CREATE INDEX idx_providers_region ON providers(region);
CREATE INDEX idx_providers_slug ON providers(slug);

-- House indexes
CREATE INDEX idx_houses_provider ON houses(provider_id);
CREATE INDEX idx_houses_tier ON houses(tier);
CREATE INDEX idx_houses_status ON houses(status);
CREATE INDEX idx_houses_price ON houses(price);
CREATE INDEX idx_houses_area ON houses(area_m2);
CREATE INDEX idx_houses_topology ON houses(topology_id);
CREATE INDEX idx_houses_slug ON houses(slug);

-- Service indexes
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_type ON services(service_type);

-- Blog indexes
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_target ON analytics_events(target_type, target_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_daily_date ON analytics_daily(date);
CREATE INDEX idx_analytics_daily_item ON analytics_daily(item_type, item_id);

-- Favorites index
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_item ON user_favorites(item_type, item_id);

-- Inquiries index
CREATE INDEX idx_inquiries_provider ON inquiries(provider_id);
CREATE INDEX idx_inquiries_user ON inquiries(user_id);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be expanded based on specific requirements)

-- Profiles: Users can read all profiles but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Providers: Public read for active, admins can do everything
CREATE POLICY "Active providers are viewable by everyone" ON providers
    FOR SELECT USING (status = 'active' OR auth.uid() IN (
        SELECT id FROM profiles WHERE role IN ('super_admin', 'admin', 'editor')
    ));

-- Houses: Public read for active, providers can manage their own
CREATE POLICY "Active houses are viewable by everyone" ON houses
    FOR SELECT USING (status = 'active' OR provider_id IN (
        SELECT id FROM providers WHERE profile_id = auth.uid()
    ));

-- User favorites: Users can only see and manage their own
CREATE POLICY "Users can manage own favorites" ON user_favorites
    FOR ALL USING (user_id = auth.uid());

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to track analytics events
CREATE OR REPLACE FUNCTION track_view_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment view counter
    IF TG_TABLE_NAME = 'houses' THEN
        UPDATE houses SET views_count = views_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_TABLE_NAME = 'providers' THEN
        UPDATE providers SET views_count = views_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_TABLE_NAME = 'services' THEN
        UPDATE services SET views_count = views_count + 1 WHERE id = NEW.target_id;
    ELSIF TG_TABLE_NAME = 'blog_posts' THEN
        UPDATE blog_posts SET views_count = views_count + 1 WHERE id = NEW.target_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate SEO-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(
                        input_text,
                        '[áàäâã]', 'a', 'g'
                    ),
                    '[éèëê]', 'e', 'g'
                ),
                '[íìïî]', 'i', 'g'
            ),
            '[^a-z0-9\-]', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA & SEEDS
-- =============================================

-- Insert default categories
INSERT INTO categories (type, name, slug, description, display_order) VALUES
    ('fabricantes', 'Fabricantes de Casas Modulares', 'fabricantes', 'Empresas fabricantes de casas modulares y prefabricadas', 1),
    ('casas', 'Casas Modulares', 'casas', 'Modelos de casas modulares y prefabricadas', 2),
    ('habilitacion_servicios', 'Habilitación & Servicios', 'habilitacion-servicios', 'Servicios de habilitación y construcción', 3),
    ('decoracion', 'Decoración y Mejoras', 'decoracion', 'Productos y servicios de decoración', 4);

-- Insert house topologies
INSERT INTO house_topologies (code, bedrooms, bathrooms, description, display_order) VALUES
    ('1B1B', 1, 1, '1 habitación, 1 baño', 1),
    ('2B1B', 2, 1, '2 habitaciones, 1 baño', 2),
    ('2B2B', 2, 2, '2 habitaciones, 2 baños', 3),
    ('3B1B', 3, 1, '3 habitaciones, 1 baño', 4),
    ('3B2B', 3, 2, '3 habitaciones, 2 baños', 5),
    ('3B2.5B', 3, 2.5, '3 habitaciones, 2.5 baños', 6),
    ('4B2B', 4, 2, '4 habitaciones, 2 baños', 7),
    ('4B3B', 4, 3, '4 habitaciones, 3 baños', 8),
    ('STUDIO', 0, 1, 'Estudio', 9),
    ('LOFT', 1, 1, 'Loft', 10);

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE profiles IS 'Extended user profiles with roles and permissions';
COMMENT ON TABLE providers IS 'Manufacturers and service providers listings';
COMMENT ON TABLE houses IS 'House models and products catalog';
COMMENT ON TABLE services IS 'Services offered by providers';
COMMENT ON TABLE hotspots IS 'Geographic locations with high demand';
COMMENT ON TABLE blog_posts IS 'Blog articles and content';
COMMENT ON TABLE analytics_events IS 'Detailed event tracking for analytics';
COMMENT ON TABLE inquiries IS 'User inquiries and quote requests';
COMMENT ON TABLE user_favorites IS 'User saved items/watchlist with notes and tags';