/**
 * Publish Validation Utilities
 *
 * Centralized validation logic for publishing Provider, Service, and House entities.
 * Validates tier-based requirements including media, SEO, and entity-specific rules.
 */

import type {
  Tier,
  MediaRole,
  ValidationResult,
  ValidationError,
} from '../schemas/unified';
import { RequiredMediaByTier } from '../schemas/unified';

// ============================================================================
// TYPES
// ============================================================================

export type EntityType = 'provider' | 'service' | 'house';

export interface MediaAssetCount {
  role: MediaRole;
  count: number;
}

export interface PublishValidationContext {
  entityType: EntityType;
  entityId: string;
  tier: Tier;
  record: any; // The entity record (provider/service/house)
  mediaAssets: MediaAssetCount[]; // Media assets grouped by role with counts
  landingRecord?: any; // For providers, the landing record
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validates if an entity can be published based on tier requirements
 */
export function validatePublish(context: PublishValidationContext): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. Validate media requirements by tier
  const mediaErrors = validateMediaRequirements(context.tier, context.mediaAssets, context.entityType);
  errors.push(...mediaErrors);

  // 2. Validate SEO requirements for premium tier
  if (context.tier === 'premium') {
    const seoErrors = validateSEORequirements(context.record, context.entityType);
    errors.push(...seoErrors);
  }

  // 3. Validate entity-specific requirements
  switch (context.entityType) {
    case 'provider':
      errors.push(...validateProviderRequirements(context.record, context.landingRecord));
      break;
    case 'service':
      errors.push(...validateServiceRequirements(context.record));
      break;
    case 'house':
      errors.push(...validateHouseRequirements(context.record));
      break;
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

// ============================================================================
// MEDIA VALIDATION
// ============================================================================

/**
 * Validates media assets meet tier requirements
 */
function validateMediaRequirements(
  tier: Tier,
  mediaAssets: MediaAssetCount[],
  entityType: EntityType
): ValidationError[] {
  const errors: ValidationError[] = [];
  const requiredRoles = RequiredMediaByTier[tier];

  // Build a map of available roles
  const availableRoles = new Set(
    mediaAssets.filter((m) => m.count > 0).map((m) => m.role)
  );

  // Check each required role
  for (const role of requiredRoles) {
    if (!availableRoles.has(role)) {
      errors.push({
        field: `media.${role}`,
        message: `Falta imagen requerida: ${getRoleLabel(role)}`,
        section: 'media',
      });
    }
  }

  // Entity-specific media validations
  if (entityType === 'house') {
    // Houses benefit from having at least one gallery image for destacado/premium
    if ((tier === 'destacado' || tier === 'premium')) {
      const galleryCount = mediaAssets.find((m) => m.role === 'gallery')?.count || 0;
      if (galleryCount === 0) {
        errors.push({
          field: 'media.gallery',
          message: 'Se recomienda al menos una imagen de galería para casas destacadas/premium',
          section: 'media',
        });
      }
    }
  }

  return errors;
}

/**
 * Gets a human-readable label for a media role
 */
function getRoleLabel(role: MediaRole): string {
  const labels: Record<MediaRole, string> = {
    thumbnail: 'Imagen principal (thumbnail)',
    landing_hero: 'Imagen hero de landing',
    landing_secondary: 'Imagen secundaria de landing',
    landing_third: 'Tercera imagen de landing',
    gallery: 'Galería',
    plan: 'Plano',
    brochure_pdf: 'Brochure PDF',
    cover: 'Imagen de portada',
    logo: 'Logo',
  };
  return labels[role] || role;
}

// ============================================================================
// SEO VALIDATION
// ============================================================================

/**
 * Validates SEO requirements for premium tier
 */
function validateSEORequirements(record: any, entityType: EntityType): ValidationError[] {
  const errors: ValidationError[] = [];

  // For providers, check the landing record
  const seoRecord = entityType === 'provider' ? record.landing : record;

  if (!seoRecord.meta_title || seoRecord.meta_title.trim().length === 0) {
    errors.push({
      field: 'seo.meta_title',
      message: 'Meta título requerido para tier premium',
      section: 'seo',
    });
  } else if (seoRecord.meta_title.length < 10) {
    errors.push({
      field: 'seo.meta_title',
      message: 'Meta título debe tener al menos 10 caracteres',
      section: 'seo',
    });
  } else if (seoRecord.meta_title.length > 60) {
    errors.push({
      field: 'seo.meta_title',
      message: 'Meta título no debe exceder 60 caracteres',
      section: 'seo',
    });
  }

  if (!seoRecord.meta_description || seoRecord.meta_description.trim().length === 0) {
    errors.push({
      field: 'seo.meta_description',
      message: 'Meta descripción requerida para tier premium',
      section: 'seo',
    });
  } else if (seoRecord.meta_description.length < 30) {
    errors.push({
      field: 'seo.meta_description',
      message: 'Meta descripción debe tener al menos 30 caracteres',
      section: 'seo',
    });
  } else if (seoRecord.meta_description.length > 160) {
    errors.push({
      field: 'seo.meta_description',
      message: 'Meta descripción no debe exceder 160 caracteres',
      section: 'seo',
    });
  }

  return errors;
}

// ============================================================================
// ENTITY-SPECIFIC VALIDATION
// ============================================================================

/**
 * Validates provider-specific requirements
 */
function validateProviderRequirements(provider: any, landing?: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Basic required fields
  if (!provider.company_name || provider.company_name.trim().length === 0) {
    errors.push({
      field: 'company_name',
      message: 'Nombre de empresa requerido',
      section: 'identity',
    });
  }

  if (!provider.email || provider.email.trim().length === 0) {
    errors.push({
      field: 'email',
      message: 'Email requerido',
      section: 'identity',
    });
  }

  if (!provider.hq_region_code) {
    errors.push({
      field: 'hq_region_code',
      message: 'Región de oficina principal requerida',
      section: 'location',
    });
  }

  // At least one role
  if (!provider.is_manufacturer && !provider.is_service_provider) {
    errors.push({
      field: 'roles',
      message: 'Debe seleccionar al menos un rol (Fabricante o Proveedor H&S)',
      section: 'roles',
    });
  }

  // Coverage for service providers
  if (provider.is_service_provider) {
    const coverageCount = provider.coverage_regions?.length || 0;
    if (coverageCount === 0) {
      errors.push({
        field: 'coverage_regions',
        message: 'Proveedores de H&S deben tener al menos una región de cobertura',
        section: 'coverage',
      });
    }
  }

  // Manufacturer-specific validations
  if (provider.is_manufacturer && landing) {
    // Landing must be configured for manufacturers
    if (!landing.slug || landing.slug.trim().length === 0) {
      errors.push({
        field: 'landing.slug',
        message: 'Slug de landing requerido para fabricantes',
        section: 'landing',
      });
    }
  }

  return errors;
}

/**
 * Validates service-specific requirements
 */
function validateServiceRequirements(service: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Basic required fields
  if (!service.name || service.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Nombre del servicio requerido',
      section: 'identity',
    });
  }

  if (!service.provider_id) {
    errors.push({
      field: 'provider_id',
      message: 'Proveedor requerido',
      section: 'identity',
    });
  }

  // Description recommended for destacado/premium
  if ((service.tier === 'destacado' || service.tier === 'premium')) {
    if (!service.description || service.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Descripción recomendada para servicios destacados/premium',
        section: 'identity',
      });
    }
  }

  return errors;
}

/**
 * Validates house-specific requirements
 */
function validateHouseRequirements(house: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Basic required fields
  if (!house.name || house.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Nombre de la casa requerido',
      section: 'identity',
    });
  }

  if (!house.provider_id) {
    errors.push({
      field: 'provider_id',
      message: 'Fabricante requerido',
      section: 'identity',
    });
  }

  // Recommended fields for destacado/premium
  if (house.tier === 'destacado' || house.tier === 'premium') {
    if (!house.description || house.description.trim().length === 0) {
      errors.push({
        field: 'description',
        message: 'Descripción recomendada para casas destacadas/premium',
        section: 'identity',
      });
    }

    if (!house.area_m2 || house.area_m2 <= 0) {
      errors.push({
        field: 'area_m2',
        message: 'Área total requerida para casas destacadas/premium',
        section: 'dimensions',
      });
    }

    if (!house.bedrooms || house.bedrooms <= 0) {
      errors.push({
        field: 'bedrooms',
        message: 'Número de dormitorios recomendado para casas destacadas/premium',
        section: 'dimensions',
      });
    }
  }

  return errors;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Counts media assets by role for validation
 */
export function groupMediaByRole(mediaAssets: any[]): MediaAssetCount[] {
  const counts = new Map<MediaRole, number>();

  for (const asset of mediaAssets) {
    const role = asset.role as MediaRole;
    counts.set(role, (counts.get(role) || 0) + 1);
  }

  return Array.from(counts.entries()).map(([role, count]) => ({
    role,
    count,
  }));
}

/**
 * Gets tier from different entity types
 */
export function getTierFromEntity(entityType: EntityType, record: any, landingRecord?: any): Tier {
  switch (entityType) {
    case 'provider':
      // Provider tier comes from landing (for manufacturers)
      return (landingRecord?.tier as Tier) || 'standard';
    case 'service':
    case 'house':
      return (record.tier as Tier) || 'standard';
    default:
      return 'standard';
  }
}
