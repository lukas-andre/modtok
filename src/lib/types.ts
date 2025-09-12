// Re-export database types for convenience
export type {
  Database,
  Json,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Provider,
  ProviderInsert,
  ProviderUpdate,
  UserRole,
  UserStatus,
  CategoryType,
  ListingStatus,
  ListingTier,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums
} from './database.types';

// Import for use in local interfaces
import type { Profile, UserRole, ListingTier, ListingStatus } from './database.types';

// Additional app-specific types
export type BlogStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type BlogCategory = 'tendencias' | 'guias' | 'casos_exito' | 'noticias' | 'tutoriales';

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