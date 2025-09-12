// Re-export all database types for convenience
export type {
  Database,
  Json,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Provider,
  ProviderInsert,
  ProviderUpdate,
  House,
  HouseInsert,
  HouseUpdate,
  Service,
  ServiceInsert,
  ServiceUpdate,
  Inquiry,
  InquiryInsert,
  InquiryUpdate,
  Category,
  CategoryInsert,
  CategoryUpdate,
  BlogPost,
  BlogPostInsert,
  BlogPostUpdate,
  BlogComment,
  BlogCommentInsert,
  BlogCommentUpdate,
  UserFavorite,
  UserFavoriteInsert,
  UserFavoriteUpdate,
  UserSearch,
  UserSearchInsert,
  UserSearchUpdate,
  Hotspot,
  HotspotInsert,
  HotspotUpdate,
  HouseTopology,
  HouseTopologyInsert,
  HouseTopologyUpdate,
  Feature,
  FeatureInsert,
  FeatureUpdate,
  AdminAction,
  AdminActionInsert,
  AdminActionUpdate,
  AdminLog,
  AdminLogInsert,
  AdminLogUpdate,
  AnalyticsDaily,
  AnalyticsDailyInsert,
  AnalyticsDailyUpdate,
  AnalyticsEvent,
  AnalyticsEventInsert,
  AnalyticsEventUpdate,
  ContentReview,
  ContentReviewInsert,
  ContentReviewUpdate,
  UserRole,
  UserStatus,
  CategoryType,
  ListingStatus,
  ListingTier,
  BlogStatus,
  BlogCategory,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums
} from './database.types';

// Import for use in local interfaces
import type { Profile, UserRole } from './database.types';

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