import React, { useState, useEffect } from 'react';
import { InputField } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import { TextAreaField } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/admin/FormSection';
import MediaUploaderV2 from '@/components/admin/MediaUploaderV2';
import ManufacturerProfileEditor from '@/components/admin/forms/ManufacturerProfileEditor';
import TierSEOPanel from '@/components/admin/forms/TierSEOPanel';
import PublishChecklist from '@/components/admin/PublishChecklist';
import type { Tier } from '../../../lib/schemas/unified';

interface ProviderFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  providerId?: string;
  landingData?: any;
}

const CHILEAN_REGIONS = [
  { code: 'XV', name: 'Arica y Parinacota' },
  { code: 'I', name: 'Tarapacá' },
  { code: 'II', name: 'Antofagasta' },
  { code: 'III', name: 'Atacama' },
  { code: 'IV', name: 'Coquimbo' },
  { code: 'V', name: 'Valparaíso' },
  { code: 'RM', name: 'Región Metropolitana' },
  { code: 'VI', name: "O'Higgins" },
  { code: 'VII', name: 'Maule' },
  { code: 'XVI', name: 'Ñuble' },
  { code: 'VIII', name: 'Biobío' },
  { code: 'IX', name: 'La Araucanía' },
  { code: 'XIV', name: 'Los Ríos' },
  { code: 'X', name: 'Los Lagos' },
  { code: 'XI', name: 'Aysén' },
  { code: 'XII', name: 'Magallanes' }
];

export default function ProviderForm({
  mode,
  initialData,
  providerId,
  landingData
}: ProviderFormProps) {
  const [formData, setFormData] = useState(initialData || {
    status: 'draft',
    is_manufacturer: false,
    is_service_provider: false,
    coverage_regions: [],
    hq_region_code: null
  });
  const [landingFormData, setLandingFormData] = useState(landingData || {
    tier: 'standard' as Tier,
    meta_title: '',
    meta_description: ''
  });
  const [activeTab, setActiveTab] = useState<'capabilities' | 'landing'>('capabilities');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdProviderId, setCreatedProviderId] = useState(providerId);

  // Auto-generate slug from company_name
  useEffect(() => {
    if (formData.company_name && (!formData.slug || mode === 'create')) {
      const slug = formData.company_name
        .toLowerCase()
        .replace(/[áàäâã]/g, 'a')
        .replace(/[éèëê]/g, 'e')
        .replace(/[íìïî]/g, 'i')
        .replace(/[óòöôõ]/g, 'o')
        .replace(/[úùüû]/g, 'u')
        .replace(/[ñ]/g, 'n')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      if (slug !== formData.slug) {
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  }, [formData.company_name]);

  const handleSubmit = async (e: React.FormEvent, saveAs?: string) => {
    e.preventDefault();

    if (!formData.is_manufacturer && !formData.is_service_provider) {
      setErrors({
        capabilities: 'Debe seleccionar al menos una capacidad: Fabricante o Proveedor de Servicios'
      });
      alert('Error: Debe seleccionar al menos una capacidad (Fabricante o Proveedor de Servicios)');
      return;
    }

    setLoading(true);

    const submitData = {
      ...formData,
      status: mode === 'create' ? 'draft' : (saveAs || formData.status)
    };

    try {
      const url = mode === 'create'
        ? '/api/admin/providers/create'
        : `/api/admin/providers/${createdProviderId}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        if (mode === 'create' && result.id) {
          setCreatedProviderId(result.id);
          alert('Provider creado como borrador. Ahora puedes agregar media y completar el perfil.');
        } else {
          alert('Provider actualizado exitosamente');
        }
      } else {
        const error = await response.json();
        setErrors(error.errors || {});
        alert('Error al guardar el proveedor. Revisa los campos marcados en rojo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el proveedor');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCoverageChange = (regionCode: string, checked: boolean) => {
    const currentCoverage = formData.coverage_regions || [];
    if (checked) {
      // Add region if not already included
      if (!currentCoverage.includes(regionCode)) {
        setFormData(prev => ({
          ...prev,
          coverage_regions: [...currentCoverage, regionCode]
        }));
      }
    } else {
      // Remove region
      setFormData(prev => ({
        ...prev,
        coverage_regions: currentCoverage.filter((code: string) => code !== regionCode)
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <FormSection
        title="Información Corporativa"
        description="Datos principales de la empresa"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nombre de la Empresa"
            name="company_name"
            value={formData.company_name || ''}
            onChange={(e) => handleChange('company_name', e.target.value)}
            required
            placeholder="Ej: Eco Modular SpA"
            errorMessage={errors.company_name}
          />

          <InputField
            label="Slug URL"
            name="slug"
            value={formData.slug || ''}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="eco-modular-spa (auto-generado)"
            helperText="Se genera automáticamente del nombre"
            errorMessage={errors.slug}
          />

          <InputField
            label="Email de Contacto"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            placeholder="contacto@ecomodular.cl"
            errorMessage={errors.email}
          />

          <InputField
            label="Teléfono"
            name="phone"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+56 9 1234 5678"
          />

          <InputField
            label="WhatsApp"
            name="whatsapp"
            value={formData.whatsapp || ''}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            placeholder="+56 9 1234 5678"
          />

          <InputField
            label="Sitio Web"
            name="website"
            type="url"
            value={formData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.ecomodular.cl"
          />
        </div>

        <TextAreaField
          label="Descripción"
          name="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={3}
          placeholder="Descripción de la empresa (máx 300 caracteres)"
          maxLength={300}
          helperText="Aparece en listados y en el perfil público del proveedor"
        />
      </FormSection>

      {/* Ubicación HQ */}
      <FormSection
        title="Ubicación de Casa Matriz"
        description="Dirección física de las oficinas principales"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Dirección"
            name="address"
            value={formData.address || ''}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Av. Principal 123"
            className="col-span-2"
          />

          <InputField
            label="Ciudad"
            name="city"
            value={formData.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Santiago"
          />

          <SelectField
            label="Región HQ"
            name="hq_region_code"
            value={formData.hq_region_code || ''}
            onChange={(e) => handleChange('hq_region_code', e.target.value)}
            options={[
              { value: '', label: 'Seleccionar región' },
              ...CHILEAN_REGIONS.map(r => ({ value: r.code, label: r.name }))
            ]}
            helperText="Región de la casa matriz"
          />
        </div>
      </FormSection>

      {/* Capacidades del Proveedor */}
      <FormSection
        title="Capacidades del Proveedor"
        description="Seleccione al menos una capacidad (puede marcar ambas)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="is_manufacturer"
              name="is_manufacturer"
              checked={formData.is_manufacturer || false}
              onChange={(e) => handleChange('is_manufacturer', e.target.checked)}
              className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded mt-1"
            />
            <div>
              <label htmlFor="is_manufacturer" className="block text-sm font-medium text-gray-900 cursor-pointer">
                Fabricante de Casas Modulares
              </label>
              <p className="text-xs text-gray-500 mt-1">
                La empresa fabrica y/o ensambla casas modulares o prefabricadas
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
            <input
              type="checkbox"
              id="is_service_provider"
              name="is_service_provider"
              checked={formData.is_service_provider || false}
              onChange={(e) => handleChange('is_service_provider', e.target.checked)}
              className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded mt-1"
            />
            <div>
              <label htmlFor="is_service_provider" className="block text-sm font-medium text-gray-900 cursor-pointer">
                Proveedor de Servicios H&S
              </label>
              <p className="text-xs text-gray-500 mt-1">
                La empresa ofrece servicios de habilitación (agua, energía, construcción, etc.)
              </p>
            </div>
          </div>
        </div>

        {errors.capabilities && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-red-700">{errors.capabilities}</p>
          </div>
        )}
      </FormSection>

      {/* Cobertura Geográfica */}
      <FormSection
        title="Cobertura Geográfica"
        description="Regiones donde el proveedor ofrece sus productos/servicios"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CHILEAN_REGIONS.map(region => (
              <div key={region.code} className="flex items-center">
                <input
                  type="checkbox"
                  id={`coverage_${region.code}`}
                  checked={(formData.coverage_regions || []).includes(region.code)}
                  onChange={(e) => handleCoverageChange(region.code, e.target.checked)}
                  className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
                />
                <label
                  htmlFor={`coverage_${region.code}`}
                  className="ml-2 block text-sm text-gray-900 cursor-pointer"
                >
                  {region.name}
                </label>
              </div>
            ))}
          </div>

          {formData.coverage_regions && formData.coverage_regions.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Cobertura seleccionada: {formData.coverage_regions.length} {formData.coverage_regions.length === 1 ? 'región' : 'regiones'}
              </p>
              <p className="text-sm text-blue-700">
                {formData.coverage_regions.map((code: string) =>
                  CHILEAN_REGIONS.find(r => r.code === code)?.name || code
                ).join(', ')}
              </p>
            </div>
          )}
        </div>
      </FormSection>

      {/* Imágenes Corporativas */}
      {createdProviderId && (
        <FormSection
          title="Imágenes Corporativas"
          description="Logo, portada y galería de identidad"
        >
          <MediaUploaderV2
            ownerType="provider"
            ownerId={createdProviderId}
            ownerContext="identity"
            requiredRoles={[]}
            allowedRoles={['logo', 'cover', 'gallery']}
            maxFiles={{ logo: 1, cover: 1, gallery: 10 }}
          />
        </FormSection>
      )}

      {!createdProviderId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            💡 <strong>Nota:</strong> Guarde el proveedor primero para poder agregar imágenes.
          </p>
        </div>
      )}

      {/* Manufacturer Tabs (only if is_manufacturer) */}
      {formData.is_manufacturer && createdProviderId && (
        <FormSection
          title="Perfil de Fabricante"
          description="Capacidades y configuración de landing"
        >
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  type="button"
                  onClick={() => setActiveTab('capabilities')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'capabilities'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Capacidades
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('landing')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'landing'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Landing & Tier
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'capabilities' && (
              <ManufacturerProfileEditor
                providerId={createdProviderId}
                companyName={formData.company_name}
              />
            )}

            {activeTab === 'landing' && (
              <div className="space-y-6">
                <TierSEOPanel
                  tier={landingFormData.tier}
                  onTierChange={(tier) => setLandingFormData(prev => ({ ...prev, tier }))}
                  seoFields={{
                    meta_title: landingFormData.meta_title,
                    meta_description: landingFormData.meta_description
                  }}
                  onSeoChange={(fields) => setLandingFormData(prev => ({ ...prev, ...fields }))}
                  entityType="provider"
                />

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">Media de Landing</h4>
                  <MediaUploaderV2
                    ownerType="provider_landing"
                    ownerId={createdProviderId}
                    ownerContext="landing"
                    requiredRoles={
                      landingFormData.tier === 'premium'
                        ? ['thumbnail', 'landing_hero', 'landing_secondary', 'landing_third']
                        : landingFormData.tier === 'destacado'
                        ? ['thumbnail']
                        : []
                    }
                    allowedRoles={['thumbnail', 'landing_hero', 'landing_secondary', 'landing_third', 'gallery']}
                    maxFiles={{ thumbnail: 1, landing_hero: 1, landing_secondary: 1, landing_third: 1, gallery: 10 }}
                  />
                </div>

                <PublishChecklist
                  entityType="provider"
                  entityId={createdProviderId}
                  tier={landingFormData.tier}
                />
              </div>
            )}
          </div>
        </FormSection>
      )}

      {/* Estado y Moderación */}
      <FormSection
        title="Estado y Moderación"
        description="Estado de publicación y notas administrativas"
      >
        <div className="grid grid-cols-1 gap-4">
          <SelectField
            label="Estado"
            name="status"
            value={formData.status || 'pending_review'}
            onChange={(e) => handleChange('status', e.target.value)}
            required
            options={[
              { value: 'draft', label: 'Borrador' },
              { value: 'pending_review', label: 'Pendiente Revisión' },
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' }
            ]}
            helperText="Estado de publicación del proveedor"
          />

          <TextAreaField
            label="Notas Administrativas"
            name="admin_notes"
            value={formData.admin_notes || ''}
            onChange={(e) => handleChange('admin_notes', e.target.value)}
            rows={2}
            placeholder="Notas internas (no visibles públicamente)"
            helperText="Notas de moderación, historial de comunicaciones, etc."
          />
        </div>
      </FormSection>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.location.href = '/admin/providers'}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={(e: any) => handleSubmit(e, 'draft')}
          disabled={loading}
        >
          Guardar Borrador
        </Button>

        <Button
          type="submit"
          variant="default"
          disabled={loading}
        >
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear Proveedor' : 'Actualizar Proveedor'}
        </Button>
      </div>
    </form>
  );
}
