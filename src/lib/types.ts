// ============================================================================
// RE-EXPORTS - Database Types (P0.3 - Schema v3)
// ============================================================================

// Base database types
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums
} from './database.types';

// Core entities
export type {
  Provider,
  ProviderInsert,
  ProviderUpdate,
  House,
  HouseInsert,
  HouseUpdate,
  ServiceProduct,
  ServiceProductInsert,
  ServiceProductUpdate,
} from './database.helpers';

// Schema v3 - Lookups & Normalization
export type {
  Region,
  ProviderCoverageRegion,
  ProviderCoverageRegionInsert,
  MediaAsset,
  MediaAssetInsert,
  MediaAssetUpdate,
} from './database.helpers';

// Schema v3 - Slots System
export type {
  SlotPosition,
  SlotOrder,
  SlotOrderInsert,
  SlotOrderUpdate,
  SlotRotationState,
} from './database.helpers';

// Schema v3 - Ingestion System
export type {
  RawProviderLead,
  RawProviderLeadInsert,
  ProviderAlias,
  ProviderAliasInsert,
} from './database.helpers';

// Schema v3 - Views
export type {
  CatalogVisibility,
} from './database.helpers';

// User/Auth types
export type {
  Profile,
  ProfileInsert,
  ProfileUpdate,
} from './database.helpers';

// Enums
export type {
  UserRole,
  UserStatus,
  CategoryType,
  ListingStatus,
  ListingTier,
  ContentStatus,
  FeatureDataType,
  FilterType,
} from './database.helpers';

// Blog types
export type {
  BlogPost,
  BlogPostInsert,
  BlogPostUpdate,
} from './database.helpers';

// Homepage Slots
export type {
  HomepageSlot,
} from './database.helpers';

// Import for use in local interfaces
import type { Profile, UserRole } from './database.helpers';

// Additional app-specific types that aren't in the database

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