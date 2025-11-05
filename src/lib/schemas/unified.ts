/**
 * Unified Schemas for Provider, Service, and House Entities
 *
 * Provides consistent tier-based validation and media requirements
 * across all three entity types.
 */

import { z } from 'zod';

// ============================================================================
// TIER & SEO SCHEMAS
// ============================================================================

/**
 * Tier levels for listings and provider landings
 */
export const TierEnum = z.enum(['standard', 'destacado', 'premium']);
export type Tier = z.infer<typeof TierEnum>;

/**
 * SEO metadata schema (required for premium tier)
 */
export const SeoSchema = z.object({
  meta_title: z.string()
    .min(10, 'Meta title debe tener al menos 10 caracteres')
    .max(60, 'Meta title no debe exceder 60 caracteres'),
  meta_description: z.string()
    .min(30, 'Meta description debe tener al menos 30 caracteres')
    .max(160, 'Meta description no debe exceder 160 caracteres'),
  keywords: z.array(z.string()).optional(),
});
export type SeoMetadata = z.infer<typeof SeoSchema>;

// ============================================================================
// MEDIA ROLES & REQUIREMENTS
// ============================================================================

/**
 * Media roles for the new role-based system
 */
export const MediaRoleEnum = z.enum([
  'thumbnail',
  'landing_hero',
  'landing_secondary',
  'landing_third',
  'gallery',
  'plan',
  'brochure_pdf',
  'cover',
  'logo',
]);
export type MediaRole = z.infer<typeof MediaRoleEnum>;

/**
 * Owner context for media assets
 */
export const OwnerContextEnum = z.enum(['identity', 'landing', 'product']);
export type OwnerContext = z.infer<typeof OwnerContextEnum>;

/**
 * Owner type for media assets
 */
export const OwnerTypeEnum = z.enum([
  'provider',
  'provider_landing',
  'house',
  'service_product',
  'blog',
  'news',
]);
export type OwnerType = z.infer<typeof OwnerTypeEnum>;

/**
 * Required media roles by tier
 * Defines which media assets are mandatory for each tier level
 */
export const RequiredMediaByTier: Record<Tier, MediaRole[]> = {
  standard: [],
  destacado: ['thumbnail'],
  premium: ['thumbnail', 'landing_hero', 'landing_secondary', 'landing_third'],
};

/**
 * Media asset schema
 */
export const MediaAssetSchema = z.object({
  id: z.string().uuid().optional(),
  owner_type: OwnerTypeEnum,
  owner_id: z.string().uuid(),
  owner_context: OwnerContextEnum,
  role: MediaRoleEnum,
  kind: z.enum(['image', 'video', 'pdf', 'plan']).optional(), // Legacy field
  url: z.string().url(),
  alt_text: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  position: z.number().int().min(0).default(0),
  meta: z.record(z.string(), z.any()).optional(),
});
export type MediaAsset = z.infer<typeof MediaAssetSchema>;

// ============================================================================
// STATUS ENUMS
// ============================================================================

export const ListingStatusEnum = z.enum([
  'draft',
  'pending_review',
  'active',
  'inactive',
  'rejected',
]);
export type ListingStatus = z.infer<typeof ListingStatusEnum>;

export const EditorialStatusEnum = z.enum(['draft', 'review', 'published']);
export type EditorialStatus = z.infer<typeof EditorialStatusEnum>;

// ============================================================================
// PROVIDER SCHEMAS
// ============================================================================

/**
 * Base provider schema (corporate identity)
 */
export const ProviderBaseSchema = z.object({
  company_name: z.string().min(2, 'Nombre de empresa requerido'),
  slug: z.string().min(2).optional(), // Auto-generated
  email: z.string().email('Email inválido'),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().url('URL inválida').optional().nullable().or(z.literal('')),
  description: z.string().max(300, 'Descripción no debe exceder 300 caracteres').optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  hq_region_code: z.string().min(1, 'Región HQ requerida'),

  // Roles
  is_manufacturer: z.boolean().default(false),
  is_service_provider: z.boolean().default(false),

  // Coverage (for service providers)
  coverage_regions: z.array(z.string()).default([]),

  // Status
  status: ListingStatusEnum.default('draft'),
  admin_notes: z.string().optional().nullable(),
}).refine(
  (data) => data.is_manufacturer || data.is_service_provider,
  { message: 'Debe seleccionar al menos un rol (fabricante o proveedor de servicios)' }
).refine(
  (data) => !data.is_service_provider || data.coverage_regions.length > 0,
  { message: 'Proveedores de H&S deben tener al menos una región de cobertura' }
);
export type ProviderBase = z.infer<typeof ProviderBaseSchema>;

/**
 * Manufacturer profile capabilities schema
 */
export const ManufacturerProfileSchema = z.object({
  // Services
  dise_std: z.boolean().default(false),
  dise_pers: z.boolean().default(false),
  insta_premontada: z.boolean().default(false),
  contr_terreno: z.boolean().default(false),
  instalacion: z.boolean().default(false),
  kit_autocons: z.boolean().default(false),
  ases_tecnica: z.boolean().default(false),
  ases_legal: z.boolean().default(false),
  logist_transporte: z.boolean().default(false),
  financiamiento: z.boolean().default(false),

  // Specialties
  tiny_houses: z.boolean().default(false),
  modulares_sip: z.boolean().default(false),
  modulares_container: z.boolean().default(false),
  modulares_hormigon: z.boolean().default(false),
  modulares_madera: z.boolean().default(false),
  prefabricada_tradicional: z.boolean().default(false),
  oficinas_modulares: z.boolean().default(false),

  // General
  llave_en_mano: z.boolean().default(false),
  publica_precios: z.boolean().default(false),
  precio_ref_min_m2: z.number().min(0).optional().nullable(),
  precio_ref_max_m2: z.number().min(0).optional().nullable(),
  experiencia_years: z.number().int().min(0).optional().nullable(),
  verified_by_admin: z.boolean().default(false),
});
export type ManufacturerProfile = z.infer<typeof ManufacturerProfileSchema>;

/**
 * Provider landing schema (tier + SEO for manufacturers)
 */
export const ProviderLandingSchema = z.object({
  provider_id: z.string().uuid(),
  tier: TierEnum.default('standard'),
  enabled: z.boolean().default(false),
  slug: z.string().min(2).optional(),
  editorial_status: EditorialStatusEnum.default('draft'),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  og_image_url: z.string().url().optional().nullable().or(z.literal('')),
  sections: z.record(z.string(), z.any()).optional(),
  published_at: z.date().optional().nullable(),
}).refine(
  (data) => data.tier !== 'premium' || (data.meta_title && data.meta_description),
  { message: 'Landing premium requiere meta_title y meta_description' }
);
export type ProviderLanding = z.infer<typeof ProviderLandingSchema>;

// ============================================================================
// SERVICE SCHEMAS
// ============================================================================

/**
 * Service product schema
 */
export const ServiceSchema = z.object({
  name: z.string().min(2, 'Nombre del servicio requerido'),
  slug: z.string().min(2).optional(), // Auto-generated
  provider_id: z.string().uuid('Proveedor requerido'),
  sku: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  description_long: z.string().optional().nullable(),

  // Tier & SEO
  tier: TierEnum.default('standard'),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional(),

  // Pricing
  price_from: z.number().min(0).optional().nullable(),
  price_to: z.number().min(0).optional().nullable(),
  price_unit: z.string().optional().nullable(),
  currency: z.string().default('CLP'),

  // Availability
  is_available: z.boolean().default(true),
  max_bookings: z.number().int().min(0).optional().nullable(),
  current_bookings: z.number().int().min(0).default(0),

  // Coverage
  coverage_mode: z.enum(['inherit', 'override']).default('inherit'),

  // Features
  features: z.record(z.string(), z.any()).optional(),

  // Status
  status: ListingStatusEnum.default('draft'),
}).refine(
  (data) => data.tier !== 'premium' || (data.meta_title && data.meta_description),
  { message: 'Servicios premium requieren meta_title y meta_description' }
);
export type Service = z.infer<typeof ServiceSchema>;

/**
 * Service coverage delta schema
 */
export const CoverageDeltaSchema = z.object({
  region_code: z.string(),
  op: z.enum(['include', 'exclude']),
});
export type CoverageDelta = z.infer<typeof CoverageDeltaSchema>;

// ============================================================================
// HOUSE SCHEMAS
// ============================================================================

/**
 * House product schema
 */
export const HouseSchema = z.object({
  name: z.string().min(2, 'Nombre de la casa requerido'),
  slug: z.string().min(2).optional(), // Auto-generated
  provider_id: z.string().uuid('Fabricante requerido'),
  sku: z.string().optional().nullable(),
  model_code: z.string().optional().nullable(),
  topology_code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  description_long: z.string().optional().nullable(),

  // Tier & SEO
  tier: TierEnum.default('standard'),
  meta_title: z.string().optional().nullable(),
  meta_description: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional(),

  // Dimensions
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().min(0).optional().nullable(),
  area_m2: z.number().min(0).optional().nullable(),
  area_built_m2: z.number().min(0).optional().nullable(),
  floors: z.number().int().min(1).default(1),
  main_material: z.string().optional().nullable(),
  energy_rating: z.enum(['A+', 'A', 'B', 'C', 'D', 'E', 'F']).optional().nullable(),
  warranty_years: z.number().int().min(0).optional().nullable(),

  // Pricing
  price: z.number().min(0).optional().nullable(),
  price_opportunity: z.number().min(0).optional().nullable(),
  price_per_m2: z.number().min(0).optional().nullable(),
  currency: z.string().default('CLP'),

  // Stock
  stock_quantity: z.number().int().min(0).default(0),
  stock_status: z.string().default('available'),
  is_available: z.boolean().default(true),

  // Delivery
  delivery_time_days: z.number().int().min(0).optional().nullable(),
  assembly_time_days: z.number().int().min(0).optional().nullable(),
  location_region: z.string().optional().nullable(),

  // Features
  features: z.record(z.string(), z.any()).optional(),

  // Status
  status: ListingStatusEnum.default('draft'),
}).refine(
  (data) => data.tier !== 'premium' || (data.meta_title && data.meta_description),
  { message: 'Casas premium requieren meta_title y meta_description' }
);
export type House = z.infer<typeof HouseSchema>;

// ============================================================================
// VALIDATION RESULT
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  section?: string; // For linking to form section
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
  warnings?: ValidationError[];
}
