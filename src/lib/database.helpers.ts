// ============================================================================
// HELPER TYPE EXPORTS for database.types.ts
// ============================================================================
// Import these in your code alongside Database types

import type { Tables, TablesInsert, TablesUpdate, Database } from './database.types'

// Re-export Database for convenience
export type { Database } from './database.types'

// Blog
export type BlogPost = Tables<'blog_posts'>
export type BlogPostInsert = TablesInsert<'blog_posts'>
export type BlogPostUpdate = TablesUpdate<'blog_posts'>

// Providers
export type Provider = Tables<'providers'>
export type ProviderInsert = TablesInsert<'providers'>
export type ProviderUpdate = TablesUpdate<'providers'>

// Houses
export type House = Tables<'houses'>
export type HouseInsert = TablesInsert<'houses'>
export type HouseUpdate = TablesUpdate<'houses'>

// Service Products
export type ServiceProduct = Tables<'service_products'>
export type ServiceProductInsert = TablesInsert<'service_products'>
export type ServiceProductUpdate = TablesUpdate<'service_products'>

// Profiles
export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

// Regions
export type Region = Tables<'regions_lkp'>

// Provider Coverage
export type ProviderCoverageRegion = Tables<'provider_coverage_regions'>
export type ProviderCoverageRegionInsert = TablesInsert<'provider_coverage_regions'>

// Media Assets
export type MediaAsset = Tables<'media_assets'>
export type MediaAssetInsert = TablesInsert<'media_assets'>
export type MediaAssetUpdate = TablesUpdate<'media_assets'>

// Slots
export type SlotPosition = Tables<'slot_positions'>
export type SlotOrder = Tables<'slot_orders'>
export type SlotOrderInsert = TablesInsert<'slot_orders'>
export type SlotOrderUpdate = TablesUpdate<'slot_orders'>
export type SlotRotationState = Tables<'slot_rotation_state'>

// Homepage Slots (alias for SlotOrder for backwards compatibility)
export type HomepageSlot = SlotOrder

// Raw Provider Leads
export type RawProviderLead = Tables<'raw_provider_leads'>
export type RawProviderLeadInsert = TablesInsert<'raw_provider_leads'>

// Provider Aliases
export type ProviderAlias = Tables<'provider_aliases'>
export type ProviderAliasInsert = TablesInsert<'provider_aliases'>

// Catalog Visibility (for backwards compatibility - deprecated)
export type CatalogVisibility = 'public' | 'private' | 'unlisted'

// Enums
export type UserRole = Database['public']['Enums']['user_role']
export type UserStatus = Database['public']['Enums']['user_status']
export type CategoryType = Database['public']['Enums']['category_type']
export type ListingStatus = Database['public']['Enums']['listing_status']
export type ListingTier = Database['public']['Enums']['listing_tier']
export type ContentStatus = Database['public']['Enums']['content_status']
export type FeatureDataType = Database['public']['Enums']['feature_data_type']
export type FilterType = Database['public']['Enums']['filter_type']

// User with role check
export type UserWithRole = Profile & { role: UserRole }
