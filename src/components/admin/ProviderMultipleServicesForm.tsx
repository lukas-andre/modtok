import React, { useState, useEffect } from 'react';
import FeatureFormBuilder from './FeatureFormBuilder';
import type { Database } from "@/lib/database.helpers";

type CategoryType = Database['public']['Enums']['category_type'];
type ListingTier = Database['public']['Enums']['listing_tier'];
type ListingStatus = Database['public']['Enums']['listing_status'];

interface ProviderFormData {
  // Basic Info
  company_name: string;
  email: string;
  phone: string;
  website?: string;
  whatsapp?: string;
  description?: string;

  // Location
  address?: string;
  city?: string;
  region?: string;

  // Services (NEW - múltiples servicios)
  is_manufacturer: boolean;
  is_service_provider: boolean;

  // Features dinámicas
  features: Record<string, any>;

  // Business Details
  years_experience?: number;
  specialties?: string[];
  services_offered?: string[];
  coverage_areas?: string[];
  price_range_min?: number;
  price_range_max?: number;
  price_per_m2_min?: number;
  price_per_m2_max?: number;
  llave_en_mano?: boolean;
  financing_available?: boolean;

  // Tier & Status
  tier: ListingTier;
  status: ListingStatus;

  // Editorial Flags (NEW)
  has_quality_images?: boolean;
  has_complete_info?: boolean;
  editor_approved_for_premium?: boolean;
  has_landing_page?: boolean;
  landing_slug?: string;

  // Premium settings
  featured_until?: string;
  premium_until?: string;
  featured_order?: number;
  internal_rating?: number;

  // Admin
  admin_notes?: string;
  temp_password?: string;
}

interface Props {
  mode: 'create' | 'edit';
  providerId?: string;
  initialData?: Partial<ProviderFormData>;
  onSuccess?: (providerId: string) => void;
}

const REGIONES_CHILE = [
  'Región de Arica y Parinacota',
  'Región de Tarapacá',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región de Valparaíso',
  'Región Metropolitana',
  'Región del Libertador General Bernardo O\'Higgins',
  'Región del Maule',
  'Región de Ñuble',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Ríos',
  'Región de Los Lagos',
  'Región Aysén del General Carlos Ibáñez del Campo',
  'Región de Magallanes y de la Antártica Chilena'
];

export default function ProviderMultipleServicesForm({
  mode,
  providerId,
  initialData = {},
  onSuccess
}: Props) {
  const [formData, setFormData] = useState<ProviderFormData>({
    company_name: initialData.company_name || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    website: initialData.website || '',
    whatsapp: initialData.whatsapp || '',
    description: initialData.description || '',
    address: initialData.address || '',
    city: initialData.city || '',
    region: initialData.region || '',

    // Services - NEW MODEL
    is_manufacturer: initialData.is_manufacturer || false,
    is_service_provider: initialData.is_service_provider || false,

    features: initialData.features || {},

    years_experience: initialData.years_experience,
    specialties: initialData.specialties || [],
    services_offered: initialData.services_offered || [],
    coverage_areas: initialData.coverage_areas || [],
    price_range_min: initialData.price_range_min,
    price_range_max: initialData.price_range_max,
    price_per_m2_min: initialData.price_per_m2_min,
    price_per_m2_max: initialData.price_per_m2_max,
    llave_en_mano: initialData.llave_en_mano || false,
    financing_available: initialData.financing_available || false,

    tier: (initialData.tier as ListingTier) || 'standard',
    status: (initialData.status as ListingStatus) || 'draft',

    // Editorial Flags - NEW
    has_quality_images: initialData.has_quality_images || false,
    has_complete_info: initialData.has_complete_info || false,
    editor_approved_for_premium: initialData.editor_approved_for_premium || false,
    has_landing_page: initialData.has_landing_page || false,
    landing_slug: initialData.landing_slug || '',

    featured_until: initialData.featured_until,
    premium_until: initialData.premium_until,
    featured_order: initialData.featured_order,
    internal_rating: initialData.internal_rating,

    admin_notes: initialData.admin_notes || '',
    temp_password: initialData.temp_password || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auto-generate landing_slug from company_name
  useEffect(() => {
    if (formData.has_landing_page && formData.company_name && !formData.landing_slug) {
      const slug = formData.company_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, landing_slug: slug }));
    }
  }, [formData.has_landing_page, formData.company_name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validación
    if (!formData.company_name || !formData.email || !formData.phone) {
      setError('Nombre de empresa, email y teléfono son requeridos');
      setLoading(false);
      return;
    }

    if (!formData.is_manufacturer && !formData.is_service_provider) {
      setError('Debe seleccionar al menos un tipo de servicio (Fabricante o H&S)');
      setLoading(false);
      return;
    }

    if (mode === 'create' && (!formData.temp_password || formData.temp_password.length < 8)) {
      setError('La contraseña temporal debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    try {
      const url = mode === 'create'
        ? '/api/admin/providers/create'
        : `/api/admin/providers/${providerId}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setError(null);

        if (onSuccess) {
          onSuccess(result.provider?.id || providerId || '');
        } else {
          // Redirect after 1.5 seconds
          setTimeout(() => {
            window.location.href = mode === 'create'
              ? '/admin/providers'
              : `/admin/providers/${providerId}`;
          }, 1500);
        }
      } else {
        setError(result.error || 'Error al guardar el proveedor');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleArrayInput = (field: 'specialties' | 'services_offered' | 'coverage_areas', value: string) => {
    const array = value ? value.split(',').map(s => s.trim()).filter(s => s) : [];
    setFormData(prev => ({ ...prev, [field]: array }));
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, temp_password: password }));
  };

  // Determinar qué categorías mostrar en FeatureFormBuilder
  const getActiveCategories = (): CategoryType[] => {
    const categories: CategoryType[] = [];
    if (formData.is_manufacturer) categories.push('fabrica');
    if (formData.is_service_provider) categories.push('habilitacion_servicios');
    return categories;
  };

  const activeCategories = getActiveCategories();

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-800 font-medium">
              {mode === 'create' ? '¡Proveedor creado exitosamente!' : '¡Proveedor actualizado exitosamente!'}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* 1. INFORMACIÓN BÁSICA */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Información de la Empresa</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              id="company_name"
              required
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: EcoModular Chile"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="contacto@empresa.cl"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+56 9 1234 5678"
            />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <input
              type="tel"
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="+56 9 8765 4321"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              Sitio Web
            </label>
            <input
              type="url"
              id="website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://www.empresa.cl"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe los servicios y especialidades de la empresa..."
            />
          </div>
        </div>
      </div>

      {/* 2. UBICACIÓN */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Ubicación</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Av. Providencia 1234"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              id="city"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Santiago"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
              Región
            </label>
            <select
              id="region"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccionar región...</option>
              {REGIONES_CHILE.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. SERVICIOS QUE OFRECE (NUEVO - MÚLTIPLES SERVICIOS) */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
        <div className="px-6 py-4 border-b border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Servicios que Ofrece
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            Selecciona todos los servicios que ofrece este proveedor
          </p>
        </div>
        <div className="p-6 space-y-4">
          <label className="flex items-start space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_manufacturer}
              onChange={(e) => setFormData({ ...formData, is_manufacturer: e.target.checked })}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="text-base font-semibold text-gray-900">🏭 Fabricante de Casas Modulares</span>
              <p className="text-sm text-gray-600 mt-1">
                Empresa que construye y fabrica casas modulares/prefabricadas
              </p>
            </div>
          </label>

          <label className="flex items-start space-x-3 p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_service_provider}
              onChange={(e) => setFormData({ ...formData, is_service_provider: e.target.checked })}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <span className="text-base font-semibold text-gray-900">🔧 Servicios de Habilitación (H&S)</span>
              <p className="text-sm text-gray-600 mt-1">
                Contratista especialista en servicios básicos: agua, energía, instalación, etc.
              </p>
            </div>
          </label>

          {!formData.is_manufacturer && !formData.is_service_provider && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ Debes seleccionar al menos un tipo de servicio
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4. FEATURES DINÁMICAS (Solo si hay servicios seleccionados) */}
      {activeCategories.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Features Específicas por Servicio</h3>
            <p className="text-sm text-gray-600 mt-1">
              Campos dinámicos según los servicios seleccionados
            </p>
          </div>
          <div className="p-6 space-y-6">
            {formData.is_manufacturer && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  🏭 Features de Fabricante
                </h4>
                <FeatureFormBuilder
                  category="fabrica"
                  currentFeatures={formData.features?.manufacturer_features || {}}
                  onChange={(features) => setFormData(prev => ({
                    ...prev,
                    features: {
                      ...prev.features,
                      manufacturer_features: features
                    }
                  }))}
                  disabled={loading}
                />
              </div>
            )}

            {formData.is_service_provider && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                  🔧 Features de Servicios H&S
                </h4>
                <FeatureFormBuilder
                  category="habilitacion_servicios"
                  currentFeatures={formData.features?.service_features || {}}
                  onChange={(features) => setFormData(prev => ({
                    ...prev,
                    features: {
                      ...prev.features,
                      service_features: features
                    }
                  }))}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TIER Y ESTADO */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Tier y Estado</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tier" className="block text-sm font-medium text-gray-700 mb-2">
              Tier *
            </label>
            <select
              id="tier"
              required
              value={formData.tier}
              onChange={(e) => setFormData({ ...formData, tier: e.target.value as ListingTier })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="standard">📝 Standard</option>
              <option value="destacado">⭐ Destacado</option>
              <option value="premium">💎 Premium</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              id="status"
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ListingStatus })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Borrador</option>
              <option value="pending_review">Pendiente Revisión</option>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* 6. FLAGS EDITORIALES (NUEVO) */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
        <div className="px-6 py-4 border-b border-purple-200">
          <h3 className="text-lg font-medium text-purple-900 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Control Editorial
          </h3>
          <p className="text-sm text-purple-700 mt-1">
            Flags para control de calidad y aprobación de contenido premium
          </p>
        </div>
        <div className="p-6 space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.has_quality_images}
              onChange={(e) => setFormData({ ...formData, has_quality_images: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Tiene Imágenes de Calidad</span>
              <p className="text-xs text-gray-500">Imágenes profesionales, alta resolución</p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.has_complete_info}
              onChange={(e) => setFormData({ ...formData, has_complete_info: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Información Completa</span>
              <p className="text-xs text-gray-500">Todos los campos relevantes completados</p>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.editor_approved_for_premium}
              onChange={(e) => setFormData({ ...formData, editor_approved_for_premium: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Aprobado para Premium (Editor)</span>
              <p className="text-xs text-gray-500">Cumple con estándares de calidad premium</p>
            </div>
          </label>

          <div className="pt-3 border-t border-purple-200">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.has_landing_page}
                onChange={(e) => setFormData({ ...formData, has_landing_page: e.target.checked })}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Generar Landing Dedicada</span>
                <p className="text-xs text-gray-500">Crear página individual en /{'{slug}'}</p>
              </div>
            </label>

            {formData.has_landing_page && (
              <div className="mt-3 ml-7">
                <label htmlFor="landing_slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Slug de Landing
                </label>
                <input
                  type="text"
                  id="landing_slug"
                  value={formData.landing_slug}
                  onChange={(e) => setFormData({ ...formData, landing_slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="ecomodular-chile"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /fabricantes/{formData.landing_slug || 'slug'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 7. DETALLES DEL NEGOCIO */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detalles del Negocio</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 mb-2">
              Años de Experiencia
            </label>
            <input
              type="number"
              id="years_experience"
              min="0"
              value={formData.years_experience || ''}
              onChange={(e) => setFormData({ ...formData, years_experience: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="15"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="specialties" className="block text-sm font-medium text-gray-700 mb-2">
              Especialidades (separadas por comas)
            </label>
            <input
              type="text"
              id="specialties"
              value={formData.specialties?.join(', ')}
              onChange={(e) => handleArrayInput('specialties', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paneles SIP, Tiny Houses, Construcción Sustentable"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="services_offered" className="block text-sm font-medium text-gray-700 mb-2">
              Servicios Ofrecidos (separados por comas)
            </label>
            <input
              type="text"
              id="services_offered"
              value={formData.services_offered?.join(', ')}
              onChange={(e) => handleArrayInput('services_offered', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Llave en Mano, Diseño Personalizado, Financiamiento"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="coverage_areas" className="block text-sm font-medium text-gray-700 mb-2">
              Áreas de Cobertura (separadas por comas)
            </label>
            <input
              type="text"
              id="coverage_areas"
              value={formData.coverage_areas?.join(', ')}
              onChange={(e) => handleArrayInput('coverage_areas', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Región Metropolitana, Valparaíso"
            />
          </div>

          <div>
            <label htmlFor="price_range_min" className="block text-sm font-medium text-gray-700 mb-2">
              Precio Mínimo (CLP)
            </label>
            <input
              type="number"
              id="price_range_min"
              min="0"
              value={formData.price_range_min || ''}
              onChange={(e) => setFormData({ ...formData, price_range_min: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="45000000"
            />
          </div>

          <div>
            <label htmlFor="price_range_max" className="block text-sm font-medium text-gray-700 mb-2">
              Precio Máximo (CLP)
            </label>
            <input
              type="number"
              id="price_range_max"
              min="0"
              value={formData.price_range_max || ''}
              onChange={(e) => setFormData({ ...formData, price_range_max: e.target.value ? parseFloat(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="200000000"
            />
          </div>

          <div className="md:col-span-2 flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.llave_en_mano}
                onChange={(e) => setFormData({ ...formData, llave_en_mano: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ofrece Llave en Mano</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.financing_available}
                onChange={(e) => setFormData({ ...formData, financing_available: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Ofrece Financiamiento</span>
            </label>
          </div>
        </div>
      </div>

      {/* 8. CONTRASEÑA (Solo en modo create) */}
      {mode === 'create' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Credenciales de Acceso</h3>
          </div>
          <div className="p-6">
            <label htmlFor="temp_password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Temporal *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                id="temp_password"
                required
                minLength={8}
                value={formData.temp_password}
                onChange={(e) => setFormData({ ...formData, temp_password: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={generatePassword}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
              >
                🎲 Generar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Se enviará un email al proveedor con estas credenciales
            </p>
          </div>
        </div>
      )}

      {/* 9. NOTAS ADMIN */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Notas Administrativas</h3>
        </div>
        <div className="p-6">
          <textarea
            id="admin_notes"
            rows={4}
            value={formData.admin_notes}
            onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Notas internas solo para administradores..."
          />
        </div>
      </div>

      {/* SUBMIT BUTTONS */}
      <div className="flex justify-end space-x-4 sticky bottom-0 bg-white p-4 border-t border-gray-200 rounded-lg shadow-lg">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {mode === 'create' ? 'Creando...' : 'Actualizando...'}
            </span>
          ) : (
            mode === 'create' ? 'Crear Proveedor' : 'Actualizar Proveedor'
          )}
        </button>
      </div>
    </form>
  );
}
