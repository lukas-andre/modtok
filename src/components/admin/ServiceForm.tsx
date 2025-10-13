import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import FeatureFormBuilder from './FeatureFormBuilder';
import ImageGalleryManager from './ImageGalleryManager';
import type { Database } from '@/lib/database.types';

type ServiceInsert = Database['public']['Tables']['service_products']['Insert'];
type ServiceUpdate = Database['public']['Tables']['service_products']['Update'];
type Provider = Database['public']['Tables']['providers']['Row'];

interface ServiceFormData {
  // Basic info
  name: string;
  slug: string;
  sku: string;
  description: string;
  description_long: string;

  // Provider (H&S)
  provider_id: string;

  // Service type
  service_type: string;
  service_family: string;

  // Coverage
  coverage_areas: string[];

  // Pricing
  price_from: number;
  price_to: number;
  price_unit: string;
  currency: string;

  // Images & Media
  main_image_url: string;
  gallery_images: string[];
  videos: string[];

  // Features (JSONB)
  features: Record<string, any>;

  // Business logic
  tier: 'premium' | 'destacado' | 'standard';
  status: 'draft' | 'pending_review' | 'active' | 'inactive' | 'rejected';

  // Editorial flags
  has_quality_images: boolean;
  has_complete_info: boolean;
  editor_approved_for_premium: boolean;
  has_landing_page: boolean;
  landing_slug: string;

  // Availability
  is_available: boolean;
  max_bookings: number;
  current_bookings: number;

  // SEO
  meta_title: string;
  meta_description: string;
  keywords: string[];
}

interface Props {
  mode: 'create' | 'edit';
  serviceId?: string;
  initialData?: Partial<ServiceFormData>;
  onSuccess?: (serviceId: string) => void;
}

export default function ServiceForm({ mode, serviceId, initialData = {}, onSuccess }: Props) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    slug: '',
    sku: '',
    description: '',
    description_long: '',
    provider_id: '',
    service_type: '',
    service_family: '',
    coverage_areas: [],
    price_from: 0,
    price_to: 0,
    price_unit: 'project',
    currency: 'CLP',
    main_image_url: '',
    gallery_images: [],
    videos: [],
    features: {},
    tier: 'standard',
    status: 'draft',
    has_quality_images: false,
    has_complete_info: false,
    editor_approved_for_premium: false,
    has_landing_page: false,
    landing_slug: '',
    is_available: true,
    max_bookings: 0,
    current_bookings: 0,
    meta_title: '',
    meta_description: '',
    keywords: [],
    ...initialData
  });

  const [serviceProviders, setServiceProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateProviderModal, setShowCreateProviderModal] = useState(false);

  // Load service providers (providers with is_service_provider=true)
  useEffect(() => {
    loadServiceProviders();
  }, []);

  const loadServiceProviders = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_service_provider', true)
        .order('company_name');

      if (error) throw error;
      setServiceProviders(data || []);
    } catch (err: any) {
      console.error('Error loading service providers:', err);
    }
  };

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && mode === 'create') {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, mode]);

  // Auto-generate landing_slug if has_landing_page
  useEffect(() => {
    if (formData.has_landing_page && formData.name && !formData.landing_slug) {
      const slug = formData.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, landing_slug: slug }));
    }
  }, [formData.has_landing_page, formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validations
      if (!formData.name || !formData.slug) {
        throw new Error('Nombre y slug son requeridos');
      }

      if (!formData.provider_id) {
        throw new Error('Debe seleccionar un proveedor de servicios');
      }

      const endpoint = mode === 'create'
        ? '/api/admin/services'
        : `/api/admin/services/${serviceId}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar el servicio');
      }

      setSuccess(`Servicio ${mode === 'create' ? 'creado' : 'actualizado'} exitosamente`);

      if (onSuccess && result.service) {
        onSuccess(result.service.id);
      }

      // Redirect after success
      setTimeout(() => {
        window.location.href = `/admin/services/${result.service.id}`;
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoverageArea = () => {
    const area = prompt('Ingrese zona de cobertura:');
    if (area) {
      setFormData({ ...formData, coverage_areas: [...formData.coverage_areas, area.trim()] });
    }
  };

  const handleRemoveCoverageArea = (index: number) => {
    const updated = formData.coverage_areas.filter((_, i) => i !== index);
    setFormData({ ...formData, coverage_areas: updated });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Servicio *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="ej: Instalación Eléctrica Completa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL) *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                required
                placeholder="instalacion-electrica-completa"
              />
              <p className="text-xs text-gray-500 mt-1">Se genera automáticamente del nombre</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Servicio
              </label>
              <input
                type="text"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ej: Electricidad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Familia de Servicio
              </label>
              <input
                type="text"
                value={formData.service_family}
                onChange={(e) => setFormData({ ...formData, service_family: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ej: Habilitación"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ej: ELEC-2024-001"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Corta *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Descripción breve para tarjetas y listados..."
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción Detallada
            </label>
            <textarea
              value={formData.description_long}
              onChange={(e) => setFormData({ ...formData, description_long: e.target.value })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Descripción completa para la página de detalle..."
            />
          </div>
        </div>

        {/* Provider Selection (H&S) */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🔧 Proveedor de Servicios</h3>
            <button
              type="button"
              onClick={() => setShowCreateProviderModal(true)}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition"
            >
              + Crear Proveedor Rápido
            </button>
          </div>

          <select
            value={formData.provider_id}
            onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccione un proveedor...</option>
            {serviceProviders.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.company_name} - {provider.city || 'Sin ciudad'} ({provider.tier})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-2">
            Solo aparecen providers con servicio "H&S" activo
          </p>
        </div>

        {/* Coverage Areas */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">📍 Zonas de Cobertura</h3>
            <button
              type="button"
              onClick={handleAddCoverageArea}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              + Agregar Zona
            </button>
          </div>

          {formData.coverage_areas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.coverage_areas.map((area, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {area}
                  <button
                    type="button"
                    onClick={() => handleRemoveCoverageArea(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay zonas de cobertura definidas</p>
          )}
        </div>

        {/* Pricing */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Precios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Desde
              </label>
              <input
                type="number"
                value={formData.price_from}
                onChange={(e) => setFormData({ ...formData, price_from: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Hasta
              </label>
              <input
                type="number"
                value={formData.price_to}
                onChange={(e) => setFormData({ ...formData, price_to: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unidad de Precio
              </label>
              <select
                value={formData.price_unit}
                onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="project">Por Proyecto</option>
                <option value="hour">Por Hora</option>
                <option value="m2">Por m²</option>
                <option value="unit">Por Unidad</option>
                <option value="day">Por Día</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="CLP">CLP (Pesos Chilenos)</option>
                <option value="USD">USD (Dólares)</option>
                <option value="UF">UF</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images & Media */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🖼️ Imágenes y Media</h3>

          <ImageGalleryManager
            mainImage={formData.main_image_url}
            galleryImages={formData.gallery_images}
            onMainImageChange={(url) => setFormData({ ...formData, main_image_url: url })}
            onGalleryChange={(images) => setFormData({ ...formData, gallery_images: images })}
          />
        </div>

        {/* Features */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Características</h3>
          <FeatureFormBuilder
            category="habilitacion_servicios"
            features={formData.features}
            onChange={(newFeatures) => setFormData({ ...formData, features: newFeatures })}
          />
        </div>

        {/* Tier & Status */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Configuración</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="standard">Standard</option>
                <option value="destacado">Destacado</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="draft">Borrador</option>
                <option value="pending_review">Pendiente Revisión</option>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2 mt-8">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Disponible para contratación</span>
              </label>
            </div>
          </div>
        </div>

        {/* Editorial Flags */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Control Editorial</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.has_quality_images}
                onChange={(e) => setFormData({ ...formData, has_quality_images: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">✓ Tiene Imágenes de Calidad</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.has_complete_info}
                onChange={(e) => setFormData({ ...formData, has_complete_info: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">✓ Tiene Información Completa</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.editor_approved_for_premium}
                onChange={(e) => setFormData({ ...formData, editor_approved_for_premium: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">👑 Aprobado para Premium (Editor)</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.has_landing_page}
                onChange={(e) => setFormData({ ...formData, has_landing_page: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">🌐 Generar Landing Dedicada</span>
            </label>

            {formData.has_landing_page && (
              <div className="ml-6 mt-2">
                <input
                  type="text"
                  value={formData.landing_slug}
                  onChange={(e) => setFormData({ ...formData, landing_slug: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="slug-landing-page"
                />
              </div>
            )}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 SEO</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Título
              </label>
              <input
                type="text"
                value={formData.meta_title}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                maxLength={60}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.meta_title.length}/60 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Descripción
              </label>
              <textarea
                value={formData.meta_description}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                maxLength={160}
              />
              <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/160 caracteres</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <a
            href="/admin/services"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : mode === 'create' ? 'Crear Servicio' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      {/* Quick Create Provider Modal */}
      {showCreateProviderModal && (
        <QuickCreateServiceProviderModal
          onClose={() => setShowCreateProviderModal(false)}
          onSuccess={(providerId) => {
            setFormData({ ...formData, provider_id: providerId });
            setShowCreateProviderModal(false);
            loadServiceProviders();
          }}
        />
      )}
    </div>
  );
}

// Quick Create Service Provider Modal Component
function QuickCreateServiceProviderModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (id: string) => void }) {
  const [formData, setFormData] = useState({
    company_name: '',
    email: '',
    phone: '',
    city: '',
    region: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/providers/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          is_manufacturer: false,
          is_service_provider: true,
          tier: 'standard',
          status: 'draft',
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      onSuccess(result.provider.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Crear Proveedor H&S Rápido</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Empresa *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Región
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm text-purple-700">
            Se creará como borrador. Puedes editarlo después desde la lista de proveedores.
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 text-sm"
            >
              {loading ? 'Creando...' : 'Crear Proveedor H&S'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
