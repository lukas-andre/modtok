import { useState, useEffect } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import FeatureFormBuilder from './FeatureFormBuilder';
import ImageGalleryManager from './ImageGalleryManager';
import type { Database } from '@/lib/database.types';

type HouseInsert = Database['public']['Tables']['houses']['Insert'];
type HouseUpdate = Database['public']['Tables']['houses']['Update'];
type Provider = Database['public']['Tables']['providers']['Row'];

interface HouseFormData {
  // Basic info
  name: string;
  slug: string;
  model_code: string;
  sku: string;
  description: string;
  description_long: string;

  // Provider (manufacturer)
  provider_id: string;

  // House specs
  topology_code: string;
  bedrooms: number;
  bathrooms: number;
  area_m2: number;
  floors: number;

  // Pricing
  price: number;
  price_opportunity: number;
  price_per_m2: number;
  currency: string;

  // Images & Media
  main_image_url: string;
  gallery_images: string[];
  floor_plans: string[];
  videos: string[];
  virtual_tour_url: string;
  brochure_pdf_url: string;

  // Location
  location_city: string;
  location_region: string;
  latitude: number | null;
  longitude: number | null;

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

  // Stock & availability
  is_available: boolean;
  stock_status: string;
  stock_quantity: number;

  // Timeline
  delivery_time_days: number;
  assembly_time_days: number;
  warranty_years: number;

  // SEO
  meta_title: string;
  meta_description: string;
  keywords: string[];

  // Variants
  has_variants: boolean;
  parent_house_id: string | null;
  variant_attributes: Record<string, any>;
}

interface Props {
  mode: 'create' | 'edit';
  houseId?: string;
  initialData?: Partial<HouseFormData>;
  onSuccess?: (houseId: string) => void;
}

export default function HouseForm({ mode, houseId, initialData = {}, onSuccess }: Props) {
  const [formData, setFormData] = useState<HouseFormData>({
    name: '',
    slug: '',
    model_code: '',
    sku: '',
    description: '',
    description_long: '',
    provider_id: '',
    topology_code: '',
    bedrooms: 0,
    bathrooms: 0,
    area_m2: 0,
    floors: 1,
    price: 0,
    price_opportunity: 0,
    price_per_m2: 0,
    currency: 'CLP',
    main_image_url: '',
    gallery_images: [],
    floor_plans: [],
    videos: [],
    virtual_tour_url: '',
    brochure_pdf_url: '',
    location_city: '',
    location_region: '',
    latitude: null,
    longitude: null,
    features: {},
    tier: 'standard',
    status: 'draft',
    has_quality_images: false,
    has_complete_info: false,
    editor_approved_for_premium: false,
    has_landing_page: false,
    landing_slug: '',
    is_available: true,
    stock_status: 'in_stock',
    stock_quantity: 0,
    delivery_time_days: 0,
    assembly_time_days: 0,
    warranty_years: 0,
    meta_title: '',
    meta_description: '',
    keywords: [],
    has_variants: false,
    parent_house_id: null,
    variant_attributes: {},
    ...initialData
  });

  const [manufacturers, setManufacturers] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateProviderModal, setShowCreateProviderModal] = useState(false);

  // Load manufacturers (providers with is_manufacturer=true)
  useEffect(() => {
    loadManufacturers();
  }, []);

  const loadManufacturers = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('is_manufacturer', true)
        .order('company_name');

      if (error) throw error;
      setManufacturers(data || []);
    } catch (err: any) {
      console.error('Error loading manufacturers:', err);
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

  // Auto-calculate price_per_m2
  useEffect(() => {
    if (formData.price && formData.area_m2) {
      const pricePerM2 = Math.round(formData.price / formData.area_m2);
      setFormData(prev => ({ ...prev, price_per_m2: pricePerM2 }));
    }
  }, [formData.price, formData.area_m2]);

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
        throw new Error('Debe seleccionar un fabricante');
      }

      if (!formData.price || formData.price <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      if (!formData.area_m2 || formData.area_m2 <= 0) {
        throw new Error('El área debe ser mayor a 0');
      }

      const endpoint = mode === 'create'
        ? '/api/admin/houses'
        : `/api/admin/houses/${houseId}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar la casa');
      }

      setSuccess(`Casa ${mode === 'create' ? 'creada' : 'actualizada'} exitosamente`);

      if (onSuccess && result.house) {
        onSuccess(result.house.id);
      }

      // Redirect after success
      setTimeout(() => {
        window.location.href = `/admin/houses/${result.house.id}`;
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
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
                Nombre de la Casa *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
                placeholder="ej: EcoCasa Modelo A"
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
                placeholder="ecocasa-modelo-a"
              />
              <p className="text-xs text-gray-500 mt-1">Se genera automáticamente del nombre</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Modelo
              </label>
              <input
                type="text"
                value={formData.model_code}
                onChange={(e) => setFormData({ ...formData, model_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ej: ECO-A-001"
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
                placeholder="ej: ECO-2024-001"
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

        {/* Manufacturer Selection */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🏭 Fabricante</h3>
            <button
              type="button"
              onClick={() => setShowCreateProviderModal(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
            >
              + Crear Fabricante Rápido
            </button>
          </div>

          <select
            value={formData.provider_id}
            onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          >
            <option value="">Seleccione un fabricante...</option>
            {manufacturers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.company_name} - {provider.city || 'Sin ciudad'} ({provider.tier})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-2">
            Solo aparecen providers con servicio "Fabricante" activo
          </p>
        </div>

        {/* House Specifications */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏠 Especificaciones</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código Topología
              </label>
              <input
                type="text"
                value={formData.topology_code}
                onChange={(e) => setFormData({ ...formData, topology_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="ej: 3D2B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dormitorios *
              </label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baños *
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área (m²) *
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.area_m2}
                onChange={(e) => setFormData({ ...formData, area_m2: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pisos
              </label>
              <input
                type="number"
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Precios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Normal *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Oferta
              </label>
              <input
                type="number"
                value={formData.price_opportunity}
                onChange={(e) => setFormData({ ...formData, price_opportunity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio por m² (auto-calculado)
              </label>
              <input
                type="number"
                value={formData.price_per_m2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                readOnly
              />
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

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Tour Virtual
              </label>
              <input
                type="url"
                value={formData.virtual_tour_url}
                onChange={(e) => setFormData({ ...formData, virtual_tour_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Brochure PDF
              </label>
              <input
                type="url"
                value={formData.brochure_pdf_url}
                onChange={(e) => setFormData({ ...formData, brochure_pdf_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Características</h3>
          <FeatureFormBuilder
            category="casas"
            features={formData.features}
            onChange={(newFeatures) => setFormData({ ...formData, features: newFeatures })}
          />
        </div>

        {/* Location */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={formData.location_city}
                onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Región
              </label>
              <input
                type="text"
                value={formData.location_region}
                onChange={(e) => setFormData({ ...formData, location_region: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado Stock
              </label>
              <select
                value={formData.stock_status}
                onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="in_stock">En Stock</option>
                <option value="low_stock">Stock Bajo</option>
                <option value="out_of_stock">Sin Stock</option>
                <option value="pre_order">Pre-orden</option>
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
                <span className="text-sm font-medium text-gray-700">Disponible para venta</span>
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
            href="/admin/houses"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </a>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : mode === 'create' ? 'Crear Casa' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      {/* Quick Create Provider Modal */}
      {showCreateProviderModal && (
        <QuickCreateProviderModal
          onClose={() => setShowCreateProviderModal(false)}
          onSuccess={(providerId) => {
            setFormData({ ...formData, provider_id: providerId });
            setShowCreateProviderModal(false);
            loadManufacturers();
          }}
        />
      )}
    </div>
  );
}

// Quick Create Provider Modal Component
function QuickCreateProviderModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (id: string) => void }) {
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
          is_manufacturer: true,
          is_service_provider: false,
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
          <h3 className="text-lg font-semibold">Crear Fabricante Rápido</h3>
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

          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 text-sm"
            >
              {loading ? 'Creando...' : 'Crear Fabricante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
