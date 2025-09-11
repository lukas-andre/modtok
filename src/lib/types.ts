export type UserRole = 'super_admin' | 'admin' | 'editor' | 'author' | 'provider' | 'user';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';
export type CategoryType = 'casas' | 'fabricantes' | 'habilitacion_servicios' | 'decoracion';
export type ListingTier = 'premium' | 'destacado' | 'standard';
export type ListingStatus = 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected';
export type BlogStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type BlogCategory = 'tendencias' | 'guias' | 'casos_exito' | 'noticias' | 'tutoriales';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  company_name?: string;
  rut?: string;
  bio?: string;
  website?: string;
  social_links?: Record<string, any>;
  preferences?: Record<string, any>;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  metadata?: Record<string, any>;
}

export interface Provider {
  id: string;
  profile_id?: string;
  category_type: CategoryType;
  company_name: string;
  slug: string;
  logo_url?: string;
  cover_image_url?: string;
  description?: string;
  description_long?: string;
  tier: ListingTier;
  status: ListingStatus;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  address?: string;
  city?: string;
  region?: string;
  years_experience?: number;
  certifications?: any[];
  specialties?: string[];
  services_offered?: string[];
  coverage_areas?: string[];
  price_range_min?: number;
  price_range_max?: number;
  price_per_m2_min?: number;
  price_per_m2_max?: number;
  llave_en_mano: boolean;
  financing_available: boolean;
  features?: Record<string, any>;
  gallery_images?: string[];
  videos?: string[];
  catalog_pdf_url?: string;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  featured_until?: string;
  premium_until?: string;
  views_count: number;
  clicks_count: number;
  inquiries_count: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface House {
  id: string;
  provider_id?: string;
  name: string;
  slug: string;
  model_code?: string;
  description?: string;
  description_long?: string;
  tier: ListingTier;
  status: ListingStatus;
  topology_id?: string;
  bedrooms?: number;
  bathrooms?: number;
  area_m2?: number;
  area_built_m2?: number;
  floors?: number;
  price?: number;
  price_opportunity?: number;
  price_per_m2?: number;
  currency?: string;
  main_material?: string;
  technology_materials?: string[];
  windows_type?: string[];
  services_included?: string[];
  llave_en_mano: boolean;
  expandable: boolean;
  mobile: boolean;
  off_grid_ready: boolean;
  sustainable: boolean;
  smart_home: boolean;
  energy_rating?: string;
  certifications?: any[];
  main_image_url?: string;
  gallery_images?: string[];
  floor_plans?: string[];
  videos?: string[];
  virtual_tour_url?: string;
  brochure_pdf_url?: string;
  location_city?: string;
  location_region?: string;
  latitude?: number;
  longitude?: number;
  delivery_time_days?: number;
  assembly_time_days?: number;
  warranty_years?: number;
  meta_title?: string;
  meta_description?: string;
  keywords?: string[];
  features?: Record<string, any>;
  views_count: number;
  clicks_count: number;
  saves_count: number;
  inquiries_count: number;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Profile | null;
  loading: boolean;
}

export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  full_name: string;
  phone?: string;
  role?: UserRole;
}