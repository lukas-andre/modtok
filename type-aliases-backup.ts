// Type aliases for easier use
export type Profile = Tables<"profiles">
export type ProfileInsert = TablesInsert<"profiles">
export type ProfileUpdate = TablesUpdate<"profiles">

export type Provider = Tables<"providers">
export type ProviderInsert = TablesInsert<"providers">
export type ProviderUpdate = TablesUpdate<"providers">

export type House = Tables<"houses">
export type HouseInsert = TablesInsert<"houses">
export type HouseUpdate = TablesUpdate<"houses">

export type Service = Tables<"services">
export type ServiceInsert = TablesInsert<"services">
export type ServiceUpdate = TablesUpdate<"services">

export type Inquiry = Tables<"inquiries">
export type InquiryInsert = TablesInsert<"inquiries">
export type InquiryUpdate = TablesUpdate<"inquiries">

export type Category = Tables<"categories">
export type CategoryInsert = TablesInsert<"categories">
export type CategoryUpdate = TablesUpdate<"categories">

export type BlogPost = Tables<"blog_posts">
export type BlogPostInsert = TablesInsert<"blog_posts">
export type BlogPostUpdate = TablesUpdate<"blog_posts">

export type BlogComment = Tables<"blog_comments">
export type BlogCommentInsert = TablesInsert<"blog_comments">
export type BlogCommentUpdate = TablesUpdate<"blog_comments">

export type UserFavorite = Tables<"user_favorites">
export type UserFavoriteInsert = TablesInsert<"user_favorites">
export type UserFavoriteUpdate = TablesUpdate<"user_favorites">

export type UserSearch = Tables<"user_searches">
export type UserSearchInsert = TablesInsert<"user_searches">
export type UserSearchUpdate = TablesUpdate<"user_searches">

export type Hotspot = Tables<"hotspots">
export type HotspotInsert = TablesInsert<"hotspots">
export type HotspotUpdate = TablesUpdate<"hotspots">

export type HouseTopology = Tables<"house_topologies">
export type HouseTopologyInsert = TablesInsert<"house_topologies">
export type HouseTopologyUpdate = TablesUpdate<"house_topologies">

export type Feature = Tables<"features">
export type FeatureInsert = TablesInsert<"features">
export type FeatureUpdate = TablesUpdate<"features">

export type AdminAction = Tables<"admin_actions">
export type AdminActionInsert = TablesInsert<"admin_actions">
export type AdminActionUpdate = TablesUpdate<"admin_actions">

export type AdminLog = Tables<"admin_logs">
export type AdminLogInsert = TablesInsert<"admin_logs">
export type AdminLogUpdate = TablesUpdate<"admin_logs">

export type AnalyticsDaily = Tables<"analytics_daily">
export type AnalyticsDailyInsert = TablesInsert<"analytics_daily">
export type AnalyticsDailyUpdate = TablesUpdate<"analytics_daily">

export type AnalyticsEvent = Tables<"analytics_events">
export type AnalyticsEventInsert = TablesInsert<"analytics_events">
export type AnalyticsEventUpdate = TablesUpdate<"analytics_events">

export type ContentReview = Tables<"content_reviews">
export type ContentReviewInsert = TablesInsert<"content_reviews">
export type ContentReviewUpdate = TablesUpdate<"content_reviews">

export type Decoration = Tables<"decorations">
export type DecorationInsert = TablesInsert<"decorations">
export type DecorationUpdate = TablesUpdate<"decorations">

export type StaticPage = Tables<"static_pages">
export type StaticPageInsert = TablesInsert<"static_pages">
export type StaticPageUpdate = TablesUpdate<"static_pages">

export type LandingSection = Tables<"landing_sections">
export type LandingSectionInsert = TablesInsert<"landing_sections">
export type LandingSectionUpdate = TablesUpdate<"landing_sections">

export type FaqItem = Tables<"faq_items">
export type FaqItemInsert = TablesInsert<"faq_items">
export type FaqItemUpdate = TablesUpdate<"faq_items">

export type ComparisonList = Tables<"comparison_lists">
export type ComparisonListInsert = TablesInsert<"comparison_lists">
export type ComparisonListUpdate = TablesUpdate<"comparison_lists">

export type ImportLog = Tables<"import_logs">
export type ImportLogInsert = TablesInsert<"import_logs">
export type ImportLogUpdate = TablesUpdate<"import_logs">

export type ProductVariant = Tables<"product_variants">
export type ProductVariantInsert = TablesInsert<"product_variants">
export type ProductVariantUpdate = TablesUpdate<"product_variants">

export type HotspotProvider = Tables<"hotspot_providers">
export type HotspotProviderInsert = TablesInsert<"hotspot_providers">
export type HotspotProviderUpdate = TablesUpdate<"hotspot_providers">

export type HotspotFeature = Tables<"hotspot_features">
export type HotspotFeatureInsert = TablesInsert<"hotspot_features">
export type HotspotFeatureUpdate = TablesUpdate<"hotspot_features">

export type HotspotDemographic = Tables<"hotspot_demographics">
export type HotspotDemographicInsert = TablesInsert<"hotspot_demographics">
export type HotspotDemographicUpdate = TablesUpdate<"hotspot_demographics">

export type HotspotCostEstimate = Tables<"hotspot_cost_estimates">
export type HotspotCostEstimateInsert = TablesInsert<"hotspot_cost_estimates">
export type HotspotCostEstimateUpdate = TablesUpdate<"hotspot_cost_estimates">

export type ContactSetting = Tables<"contact_settings">
export type ContactSettingInsert = TablesInsert<"contact_settings">
export type ContactSettingUpdate = TablesUpdate<"contact_settings">

// Provider Categories (NEW)
export type ProviderCategory = Tables<"provider_categories">
export type ProviderCategoryInsert = TablesInsert<"provider_categories">
export type ProviderCategoryUpdate = TablesUpdate<"provider_categories">

// Views
export type ProviderAdminView = Tables<"provider_admin_view">
export type ProviderPublicView = Tables<"provider_public_view">
export type ProvidersWithCategories = Tables<"providers_with_categories">

// Enum type exports
export type UserRole = Enums<"user_role">
export type UserStatus = Enums<"user_status">
export type CategoryType = Enums<"category_type">
export type ListingStatus = Enums<"listing_status">
export type ListingTier = Enums<"listing_tier">
export type BlogStatus = Enums<"blog_status">
export type BlogCategory = Enums<"blog_category">
export type PageStatus = Enums<"page_status">
export type PageType = Enums<"page_type">