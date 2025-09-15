-- Create fabricantes table for fabrication services catalog
CREATE TABLE IF NOT EXISTS fabricantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  description TEXT,
  description_long TEXT,
  tier listing_tier DEFAULT 'standard',
  status listing_status DEFAULT 'draft',

  -- Fabrication specific fields
  service_type TEXT[], -- Types of fabrication services offered
  materials TEXT[], -- Materials they work with
  specialties TEXT[], -- Specialization areas
  production_capacity TEXT,
  lead_time_days INTEGER,
  minimum_order TEXT,
  certifications TEXT[],

  -- Pricing
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  price_per_unit NUMERIC,
  currency TEXT DEFAULT 'CLP',

  -- Location and coverage
  regions TEXT[],
  coverage_national BOOLEAN DEFAULT false,
  factory_location TEXT,

  -- Features and capabilities
  custom_design BOOLEAN DEFAULT false,
  cad_service BOOLEAN DEFAULT false,
  installation_service BOOLEAN DEFAULT false,
  warranty_years INTEGER,

  -- Media
  main_image_url TEXT,
  gallery_images TEXT[],
  video_url TEXT,
  catalog_pdf_url TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  keywords TEXT[],

  -- Admin fields
  internal_notes TEXT,
  internal_rating NUMERIC,
  featured BOOLEAN DEFAULT false,
  featured_order INTEGER,
  clicks INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,

  -- Timestamps
  created_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fabricantes_provider_id ON fabricantes(provider_id);
CREATE INDEX IF NOT EXISTS idx_fabricantes_status ON fabricantes(status);
CREATE INDEX IF NOT EXISTS idx_fabricantes_tier ON fabricantes(tier);
CREATE INDEX IF NOT EXISTS idx_fabricantes_slug ON fabricantes(slug);
CREATE INDEX IF NOT EXISTS idx_fabricantes_featured ON fabricantes(featured);

-- Add RLS policies
ALTER TABLE fabricantes ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (active items only)
CREATE POLICY "Public can view active fabricantes" ON fabricantes
  FOR SELECT
  USING (status = 'active');

-- Policy for admin full access
CREATE POLICY "Admins can manage fabricantes" ON fabricantes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_fabricantes_updated_at
  BEFORE UPDATE ON fabricantes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();