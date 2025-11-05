import React, { useState, useEffect } from 'react';
import { InputField } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import { TextAreaField } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/admin/FormSection';
import FeatureFormBuilder from '@/components/admin/FeatureFormBuilder';
import MediaUploaderV2 from '@/components/admin/MediaUploaderV2';
import TierSEOPanel from '@/components/admin/forms/TierSEOPanel';
import PublishChecklist from '@/components/admin/PublishChecklist';
import type { Tier } from '../../../lib/schemas/unified';

interface Provider {
  id: string;
  company_name: string;
}

interface ServiceFormProps {
  providers: Provider[];
  mode: 'create' | 'edit';
  initialData?: any;
  serviceId?: string;
}

const CHILEAN_REGIONS = [
  { code: 'RM', name: 'Región Metropolitana' },
  { code: 'V', name: 'Valparaíso' },
  { code: 'VIII', name: 'Biobío' },
  { code: 'IX', name: 'La Araucanía' },
  { code: 'X', name: 'Los Lagos' },
  { code: 'XIV', name: 'Los Ríos' },
  { code: 'VII', name: 'Maule' },
  { code: 'XVI', name: 'Ñuble' },
  { code: 'VI', name: "O'Higgins" },
  { code: 'IV', name: 'Coquimbo' },
  { code: 'III', name: 'Atacama' },
  { code: 'II', name: 'Antofagasta' },
  { code: 'I', name: 'Tarapacá' },
  { code: 'XV', name: 'Arica y Parinacota' },
  { code: 'XI', name: 'Aysén' },
  { code: 'XII', name: 'Magallanes' }
];

export default function ServiceForm({
  providers,
  mode,
  initialData,
  serviceId
}: ServiceFormProps) {
  const [formData, setFormData] = useState(initialData || {
    status: 'draft',
    tier: 'standard' as Tier,
    price_unit: 'per_project',
    current_bookings: 0,
    is_available: true,
    coverage_mode: 'inherit',
    coverage_deltas: [],
    features: {},
    meta_title: '',
    meta_description: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [providerRegions, setProviderRegions] = useState<string[]>([]);
  const [effectiveCoverage, setEffectiveCoverage] = useState<string[]>([]);
  const [createdServiceId, setCreatedServiceId] = useState(serviceId);

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name && (!formData.slug || mode === 'create')) {
      const slug = formData.name
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
  }, [formData.name]);

  // Fetch provider coverage regions when provider changes
  useEffect(() => {
    if (formData.provider_id) {
      fetch(`/api/admin/providers/${formData.provider_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.coverage_regions) {
            const regions = data.coverage_regions.map((cr: any) => cr.region_code);
            setProviderRegions(regions);
          }
        })
        .catch(err => console.error('Error fetching provider regions:', err));
    }
  }, [formData.provider_id]);

  // Update effective coverage when coverage_mode or deltas change
  useEffect(() => {
    if (formData.coverage_mode === 'inherit') {
      // Start with provider regions
      let effective = [...providerRegions];

      // Apply deltas
      (formData.coverage_deltas || []).forEach((delta: any) => {
        if (delta.op === 'exclude') {
          effective = effective.filter(r => r !== delta.region_code);
        } else if (delta.op === 'include' && !effective.includes(delta.region_code)) {
          effective.push(delta.region_code);
        }
      });

      setEffectiveCoverage(effective);
    } else {
      // Override mode: only includes
      const effective = (formData.coverage_deltas || [])
        .filter((d: any) => d.op === 'include')
        .map((d: any) => d.region_code);
      setEffectiveCoverage(effective);
    }
  }, [formData.coverage_mode, formData.coverage_deltas, providerRegions]);

  // Load service data including coverage_deltas when in edit mode
  useEffect(() => {
    if (mode === 'edit' && serviceId && !initialData) {
      setLoading(true);
      fetch(`/api/admin/services/${serviceId}`)
        .then(res => res.json())
        .then(data => {
          setFormData({
            ...data,
            coverage_deltas: data.coverage_deltas || []
          });
        })
        .catch(err => {
          console.error('Error loading service:', err);
          alert('Error al cargar el servicio');
        })
        .finally(() => setLoading(false));
    }
  }, [mode, serviceId]);

  const handleSubmit = async (e: React.FormEvent, saveAs?: string) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      ...formData,
      status: mode === 'create' ? 'draft' : (saveAs || formData.status)
    };

    try {
      const url = mode === 'create'
        ? '/api/admin/services'
        : `/api/admin/services/${createdServiceId}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        if (mode === 'create' && result.id) {
          setCreatedServiceId(result.id);
          alert('Servicio creado como borrador. Ahora puedes agregar media.');
        } else {
          alert('Servicio actualizado exitosamente');
        }
      } else {
        const error = await response.json();
        setErrors(error.errors || {});
        alert('Error al guardar el servicio. Revisa los campos marcados en rojo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el servicio');
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

  // P0.5: Handle coverage region changes with inherit/override/delta logic
  const handleRegionChange = (regionCode: string, state: 'neutral' | 'include' | 'exclude') => {
    const currentDeltas = formData.coverage_deltas || [];

    if (state === 'neutral') {
      // Remove any delta for this region
      setFormData(prev => ({
        ...prev,
        coverage_deltas: currentDeltas.filter((d: any) => d.region_code !== regionCode)
      }));
    } else {
      // Remove existing delta for this region, then add new one
      const filtered = currentDeltas.filter((d: any) => d.region_code !== regionCode);
      setFormData(prev => ({
        ...prev,
        coverage_deltas: [...filtered, { region_code: regionCode, op: state }]
      }));
    }
  };

  // Get region state for tri-state selector (inherit mode only)
  const getRegionState = (regionCode: string): 'neutral' | 'include' | 'exclude' => {
    const delta = (formData.coverage_deltas || []).find((d: any) => d.region_code === regionCode);
    if (!delta) return 'neutral';
    return delta.op as 'include' | 'exclude';
  };

  const handleFeaturesChange = (features: Record<string, any>) => {
    setFormData(prev => ({ ...prev, features }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <FormSection
        title="Información Básica"
        description="Datos principales del servicio"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nombre del Servicio"
            name="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Ej: Instalación de Paneles Solares"
            errorMessage={errors.name}
          />

          <InputField
            label="Slug URL"
            name="slug"
            value={formData.slug || ''}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="instalacion-paneles-solares (auto-generado)"
            helperText="Se genera automáticamente del nombre"
            errorMessage={errors.slug}
          />

          <InputField
            label="SKU / Código"
            name="sku"
            value={formData.sku || ''}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="SERV-001"
          />

          <SelectField
            label="Proveedor"
            name="provider_id"
            value={formData.provider_id || ''}
            onChange={(e) => handleChange('provider_id', e.target.value)}
            required
            options={[
              { value: '', label: 'Seleccionar proveedor' },
              ...providers.map(p => ({ value: p.id, label: p.company_name }))
            ]}
            errorMessage={errors.provider_id}
          />
        </div>

        <TextAreaField
          label="Descripción Corta"
          name="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
          placeholder="Descripción breve para cards y listados"
        />

        <TextAreaField
          label="Descripción Completa"
          name="description_long"
          value={formData.description_long || ''}
          onChange={(e) => handleChange('description_long', e.target.value)}
          rows={4}
          placeholder="Descripción detallada del servicio, proceso, qué incluye, etc."
        />
      </FormSection>

      {/* Precio y Disponibilidad */}
      <FormSection
        title="Precio y Disponibilidad"
        description="Información comercial del servicio"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            type="number"
            label="Precio Desde (CLP)"
            name="price_from"
            value={formData.price_from || ''}
            onChange={(e) => handleChange('price_from', parseFloat(e.target.value) || 0)}
            min={0}
            placeholder="Precio mínimo"
          />

          <InputField
            type="number"
            label="Precio Hasta (CLP)"
            name="price_to"
            value={formData.price_to || ''}
            onChange={(e) => handleChange('price_to', parseFloat(e.target.value) || 0)}
            min={0}
            placeholder="Precio máximo"
          />

          <SelectField
            label="Unidad de Precio"
            name="price_unit"
            value={formData.price_unit || 'per_project'}
            onChange={(e) => handleChange('price_unit', e.target.value)}
            options={[
              { value: 'per_project', label: 'Por proyecto' },
              { value: 'per_m2', label: 'Por m²' },
              { value: 'per_hour', label: 'Por hora' },
              { value: 'per_day', label: 'Por día' },
              { value: 'per_unit', label: 'Por unidad' },
              { value: 'per_visit', label: 'Por visita' },
              { value: 'monthly', label: 'Mensual' },
              { value: 'annual', label: 'Anual' }
            ]}
          />

          <InputField
            type="number"
            label="Máximo de Reservas"
            name="max_bookings"
            value={formData.max_bookings || ''}
            onChange={(e) => handleChange('max_bookings', parseInt(e.target.value) || null)}
            min={0}
            placeholder="Sin límite si está vacío"
          />

          <InputField
            type="number"
            label="Reservas Actuales"
            name="current_bookings"
            value={formData.current_bookings || 0}
            onChange={(e) => handleChange('current_bookings', parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_available"
            name="is_available"
            checked={formData.is_available !== false}
            onChange={(e) => handleChange('is_available', e.target.checked)}
            className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
          />
          <label htmlFor="is_available" className="text-sm text-gray-900">
            Servicio Disponible
          </label>
        </div>
      </FormSection>

      {/* P0.5: Áreas de Cobertura con inherit/override */}
      <FormSection
        title="Áreas de Cobertura"
        description="Regiones donde se ofrece el servicio"
      >
        <div className="space-y-4">
          {/* Coverage Mode Radio Buttons */}
          <div className="flex items-center space-x-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="coverage_mode"
                value="inherit"
                checked={formData.coverage_mode === 'inherit'}
                onChange={(e) => handleChange('coverage_mode', e.target.value)}
                className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-900">
                Usar cobertura del proveedor (recomendado)
              </span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="coverage_mode"
                value="override"
                checked={formData.coverage_mode === 'override'}
                onChange={(e) => handleChange('coverage_mode', e.target.value)}
                className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-900">
                Definir cobertura para este servicio
              </span>
            </label>
          </div>

          {/* Region Selector */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {CHILEAN_REGIONS.map(region => {
              const isIncluded = effectiveCoverage.includes(region.code);
              const state = formData.coverage_mode === 'inherit'
                ? getRegionState(region.code)
                : (formData.coverage_deltas || []).some((d: any) => d.region_code === region.code && d.op === 'include') ? 'include' : 'neutral';

              if (formData.coverage_mode === 'inherit') {
                // Tri-state selector for inherit mode
                const isProviderRegion = providerRegions.includes(region.code);
                return (
                  <div key={region.code} className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (state === 'neutral') {
                          handleRegionChange(region.code, isProviderRegion ? 'exclude' : 'include');
                        } else if (state === 'include') {
                          handleRegionChange(region.code, 'exclude');
                        } else {
                          handleRegionChange(region.code, 'neutral');
                        }
                      }}
                      className={`flex items-center justify-center w-6 h-6 rounded border ${
                        state === 'include' ? 'bg-green-100 border-green-500 text-green-700' :
                        state === 'exclude' ? 'bg-red-100 border-red-500 text-red-700' :
                        isProviderRegion ? 'bg-gray-100 border-gray-400 text-gray-600' :
                        'bg-white border-gray-300 text-gray-400'
                      }`}
                      title={
                        state === 'include' ? 'Incluido (click para excluir)' :
                        state === 'exclude' ? 'Excluido (click para neutral)' :
                        isProviderRegion ? 'Heredado del proveedor (click para excluir)' :
                        'No heredado (click para incluir)'
                      }
                    >
                      {state === 'include' && '+'}
                      {state === 'exclude' && '−'}
                      {state === 'neutral' && (isProviderRegion ? '○' : '·')}
                    </button>
                    <label className="text-sm text-gray-900">
                      {region.name}
                    </label>
                  </div>
                );
              } else {
                // Simple checkbox for override mode
                return (
                  <div key={region.code} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`coverage_${region.code}`}
                      checked={state === 'include'}
                      onChange={(e) => handleRegionChange(region.code, e.target.checked ? 'include' : 'neutral')}
                      className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`coverage_${region.code}`}
                      className="ml-2 block text-sm text-gray-900 cursor-pointer"
                    >
                      {region.name}
                    </label>
                  </div>
                );
              }
            })}
          </div>

          {/* Effective Coverage Chip */}
          {effectiveCoverage.length > 0 && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Cobertura efectiva:
              </p>
              <p className="text-sm text-blue-700">
                {effectiveCoverage.map(code => CHILEAN_REGIONS.find(r => r.code === code)?.name || code).join(', ')}
              </p>
            </div>
          )}
        </div>
      </FormSection>

      {/* Características y Features Dinámicas */}
      <FormSection
        title="Características del Servicio"
        description="Features dinámicas para servicios de habilitación"
      >
        <FeatureFormBuilder
          category="habilitacion_servicios"
          currentFeatures={formData.features || {}}
          onChange={handleFeaturesChange}
          disabled={loading}
        />
      </FormSection>

      {!serviceId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Nota:</strong> Guarde el servicio primero para poder agregar imágenes.
          </p>
        </div>
      )}

      {/* Tier, Estado y Visibilidad */}
      <FormSection
        title="Tier, Estado y Visibilidad"
        description="Tier premium desbloquea landing pages con SEO optimizado"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Estado"
            name="status"
            value={formData.status || 'draft'}
            onChange={(e) => handleChange('status', e.target.value)}
            required
            options={[
              { value: 'draft', label: 'Borrador' },
              { value: 'pending_review', label: 'Pendiente Revisión' },
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' }
            ]}
          />

        </div>

        <TierSEOPanel
          tier={formData.tier}
          onTierChange={(tier) => handleChange('tier', tier)}
          seoFields={{
            meta_title: formData.meta_title,
            meta_description: formData.meta_description
          }}
          onSeoChange={(fields) => {
            if (fields.meta_title !== undefined) handleChange('meta_title', fields.meta_title);
            if (fields.meta_description !== undefined) handleChange('meta_description', fields.meta_description);
          }}
          entityType="service"
        />
      </FormSection>

      {/* Media Section */}
      {createdServiceId && (
        <FormSection
          title="Media"
          description="Imágenes según tier"
        >
          <MediaUploaderV2
            ownerType="service_product"
            ownerId={createdServiceId}
            ownerContext="product"
            requiredRoles={
              formData.tier === 'premium'
                ? ['thumbnail', 'landing_hero', 'landing_secondary', 'landing_third']
                : formData.tier === 'destacado'
                ? ['thumbnail']
                : []
            }
            allowedRoles={['thumbnail', 'landing_hero', 'landing_secondary', 'landing_third', 'gallery']}
            maxFiles={{ thumbnail: 1, landing_hero: 1, landing_secondary: 1, landing_third: 1, gallery: 10 }}
          />
        </FormSection>
      )}

      {createdServiceId && (
        <PublishChecklist
          entityType="service"
          entityId={createdServiceId}
          tier={formData.tier}
        />
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.location.href = '/admin/catalog/services'}
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
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'}
        </Button>
      </div>
    </form>
  );
}
