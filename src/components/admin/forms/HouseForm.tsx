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
import type { Tier } from '@/lib/schemas/unified';

interface Provider {
  id: string;
  company_name: string;
}

interface Topology {
  id: string;
  code: string;
  description: string;
}

interface HouseFormProps {
  providers: Provider[];
  topologies: Topology[];
  mode: 'create' | 'edit';
  initialData?: any;
  houseId?: string;
}

export default function HouseForm({
  providers,
  topologies,
  mode,
  initialData,
  houseId
}: HouseFormProps) {
  const [formData, setFormData] = useState(initialData || {
    status: 'draft',
    tier: 'standard',
    currency: 'CLP',
    stock_status: 'available',
    floors: 1,
    stock_quantity: 0,
    is_available: true,
    features: {} // JSONB features from FeatureFormBuilder
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdHouseId, setCreatedHouseId] = useState(houseId || '');

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

  // Auto-calculate price per m2
  useEffect(() => {
    if (formData.price && formData.area_m2) {
      const pricePerM2 = Math.round(formData.price / formData.area_m2);
      if (pricePerM2 !== formData.price_per_m2) {
        setFormData(prev => ({ ...prev, price_per_m2: pricePerM2 }));
      }
    }
  }, [formData.price, formData.area_m2]);

  const handleSubmit = async (e: React.FormEvent, saveAs?: string) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      ...formData,
      status: saveAs || formData.status
    };

    try {
      const url = mode === 'create' && !createdHouseId
        ? '/api/admin/houses'
        : `/api/admin/houses/${createdHouseId || houseId}`;

      const response = await fetch(url, {
        method: mode === 'create' && !createdHouseId ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        // Auto-draft: if first save in create mode, store ID and stay on page
        if (mode === 'create' && !createdHouseId && result.id) {
          setCreatedHouseId(result.id);
          alert('Casa creada como borrador. Ahora puedes agregar imágenes.');
        } else {
          window.location.href = `/admin/catalog/houses`;
        }
      } else {
        const error = await response.json();
        setErrors(error.errors || {});
        alert('Error al guardar la casa. Revisa los campos marcados en rojo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la casa');
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

  const handleFeaturesChange = (features: Record<string, any>) => {
    setFormData(prev => ({ ...prev, features }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <FormSection
        title="Información Básica"
        description="Datos principales de la casa"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nombre de la Casa"
            name="name"
            value={formData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            placeholder="Ej: Casa Lago Premium"
            errorMessage={errors.name}
          />

          <InputField
            label="Slug URL"
            name="slug"
            value={formData.slug || ''}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="casa-lago-premium (auto-generado)"
            helperText="Se genera automáticamente del nombre"
            errorMessage={errors.slug}
          />

          <InputField
            label="SKU / Código"
            name="sku"
            value={formData.sku || ''}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="SKU-001"
          />

          <InputField
            label="Código del Modelo"
            name="model_code"
            value={formData.model_code || ''}
            onChange={(e) => handleChange('model_code', e.target.value)}
            placeholder="MOD-2024-001"
          />

          <SelectField
            label="Proveedor de Casas"
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

          <SelectField
            label="Topología"
            name="topology_code"
            value={formData.topology_code || ''}
            onChange={(e) => handleChange('topology_code', e.target.value)}
            options={[
              { value: '', label: 'Seleccionar topología' },
              ...topologies.map(t => ({
                value: t.code,
                label: `${t.code} - ${t.description}`
              }))
            ]}
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
          placeholder="Descripción detallada para la página del producto"
        />
      </FormSection>

      {/* Dimensiones y Especificaciones */}
      <FormSection
        title="Dimensiones y Especificaciones"
        description="Características técnicas de la casa"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField
            type="number"
            label="Habitaciones"
            name="bedrooms"
            value={formData.bedrooms || ''}
            onChange={(e) => handleChange('bedrooms', parseInt(e.target.value) || 0)}
            min={0}
          />

          <InputField
            type="number"
            label="Baños"
            name="bathrooms"
            value={formData.bathrooms || ''}
            onChange={(e) => handleChange('bathrooms', parseFloat(e.target.value) || 0)}
            min={0}
            step={0.5}
          />

          <InputField
            type="number"
            label="Área Total (m²)"
            name="area_m2"
            value={formData.area_m2 || ''}
            onChange={(e) => handleChange('area_m2', parseFloat(e.target.value) || 0)}
            min={0}
            step={0.01}
            helperText="Tamaño total incluyendo todas las áreas"
          />

          <InputField
            type="number"
            label="Área Construida (m²)"
            name="area_built_m2"
            value={formData.area_built_m2 || ''}
            onChange={(e) => handleChange('area_built_m2', parseFloat(e.target.value) || 0)}
            min={0}
            step={0.01}
            helperText="Solo el área efectivamente construida/habitable"
          />

          <InputField
            type="number"
            label="Pisos"
            name="floors"
            value={formData.floors || 1}
            onChange={(e) => handleChange('floors', parseInt(e.target.value) || 1)}
            min={1}
          />

          <InputField
            label="Material Principal"
            name="main_material"
            value={formData.main_material || ''}
            onChange={(e) => handleChange('main_material', e.target.value)}
            placeholder="Ej: Paneles SIP, Madera, Steel Frame"
            helperText="Material principal de construcción"
          />

          <SelectField
            label="Calificación Energética"
            name="energy_rating"
            value={formData.energy_rating || ''}
            onChange={(e) => handleChange('energy_rating', e.target.value)}
            options={[
              { value: '', label: 'Sin calificación' },
              { value: 'A+', label: 'A+ (Más eficiente)' },
              { value: 'A', label: 'A' },
              { value: 'B', label: 'B' },
              { value: 'C', label: 'C' },
              { value: 'D', label: 'D' },
              { value: 'E', label: 'E' },
              { value: 'F', label: 'F (Menos eficiente)' }
            ]}
            helperText="Certificación de eficiencia energética"
          />

          <InputField
            type="number"
            label="Garantía (años)"
            name="warranty_years"
            value={formData.warranty_years || ''}
            onChange={(e) => handleChange('warranty_years', parseInt(e.target.value) || 0)}
            min={0}
          />
        </div>
      </FormSection>

      {/* Precio y Stock */}
      <FormSection
        title="Precio y Stock"
        description="Información comercial"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            type="number"
            label="Precio (CLP)"
            name="price"
            value={formData.price || ''}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
            min={0}
          />

          <InputField
            type="number"
            label="Precio Oportunidad (CLP)"
            name="price_opportunity"
            value={formData.price_opportunity || ''}
            onChange={(e) => handleChange('price_opportunity', parseFloat(e.target.value) || 0)}
            min={0}
          />

          <InputField
            type="number"
            label="Precio por m² (CLP)"
            name="price_per_m2"
            value={formData.price_per_m2 || ''}
            onChange={(e) => handleChange('price_per_m2', parseFloat(e.target.value) || 0)}
            min={0}
            helperText="Se calcula automáticamente"
            disabled
          />

          <InputField
            type="number"
            label="Stock Disponible"
            name="stock_quantity"
            value={formData.stock_quantity || 0}
            onChange={(e) => handleChange('stock_quantity', parseInt(e.target.value) || 0)}
            min={0}
          />

          <SelectField
            label="Estado del Stock"
            name="stock_status"
            value={formData.stock_status || 'available'}
            onChange={(e) => handleChange('stock_status', e.target.value)}
            options={[
              { value: 'available', label: 'Disponible' },
              { value: 'low_stock', label: 'Stock Bajo' },
              { value: 'out_of_stock', label: 'Sin Stock' },
              { value: 'pre_order', label: 'Pre-orden' }
            ]}
          />

          <SelectField
            label="Moneda"
            name="currency"
            value={formData.currency || 'CLP'}
            onChange={(e) => handleChange('currency', e.target.value)}
            options={[
              { value: 'CLP', label: 'CLP - Peso Chileno' },
              { value: 'USD', label: 'USD - Dólar' },
              { value: 'UF', label: 'UF - Unidad de Fomento' }
            ]}
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
            Disponible para Venta
          </label>
        </div>
      </FormSection>

      {/* Entrega y Ubicación */}
      <FormSection
        title="Entrega y Ubicación"
        description="Tiempos y región de entrega"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            type="number"
            label="Tiempo de Entrega (días)"
            name="delivery_time_days"
            value={formData.delivery_time_days || ''}
            onChange={(e) => handleChange('delivery_time_days', parseInt(e.target.value) || 0)}
            min={0}
          />

          <InputField
            type="number"
            label="Tiempo de Montaje (días)"
            name="assembly_time_days"
            value={formData.assembly_time_days || ''}
            onChange={(e) => handleChange('assembly_time_days', parseInt(e.target.value) || 0)}
            min={0}
          />

          <SelectField
            label="Región"
            name="location_region"
            value={formData.location_region || ''}
            onChange={(e) => handleChange('location_region', e.target.value)}
            options={[
              { value: '', label: 'Sin ubicación específica' },
              { value: 'Región Metropolitana', label: 'Región Metropolitana' },
              { value: 'Valparaíso', label: 'Valparaíso' },
              { value: 'Biobío', label: 'Biobío' },
              { value: 'La Araucanía', label: 'La Araucanía' },
              { value: 'Los Lagos', label: 'Los Lagos' },
              { value: 'Los Ríos', label: 'Los Ríos' }
            ]}
          />
        </div>
      </FormSection>

      {/* Características y Features Dinámicas */}
      <FormSection
        title="Características del Producto"
        description="Features dinámicas según categoría casas"
      >
        <FeatureFormBuilder
          category="casas"
          currentFeatures={formData.features || {}}
          onChange={handleFeaturesChange}
          disabled={loading}
        />
      </FormSection>

      {/* Media Management (Role-based) */}
      {createdHouseId && (
        <FormSection
          title="Imágenes y Multimedia"
          description="Gestión de imágenes basada en roles según tier"
        >
          <MediaUploaderV2
            ownerType="house"
            ownerId={createdHouseId}
            ownerContext="product"
            requiredRoles={
              formData.tier === 'destacado'
                ? ['thumbnail']
                : formData.tier === 'premium'
                ? ['thumbnail', 'landing_hero', 'landing_secondary', 'landing_third']
                : []
            }
            allowedRoles={['thumbnail', 'landing_hero', 'landing_secondary', 'landing_third', 'gallery', 'plan', 'brochure_pdf']}
            maxFiles={{
              thumbnail: 1,
              landing_hero: 1,
              landing_secondary: 1,
              landing_third: 1,
              gallery: 15,
              plan: 5,
              brochure_pdf: 2,
            }}
          />
        </FormSection>
      )}

      {!createdHouseId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Nota:</strong> Guarde la casa primero para poder agregar imágenes y documentos.
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
      </FormSection>

      {/* Tier & SEO (Unified Component) */}
      <FormSection
        title="Tier y SEO"
        description="Configura el nivel de visibilidad y metadatos"
      >
        <TierSEOPanel
          tier={formData.tier as Tier}
          onTierChange={(tier) => handleChange('tier', tier)}
          seoFields={{
            meta_title: formData.meta_title,
            meta_description: formData.meta_description,
            keywords: formData.keywords,
          }}
          onSeoChange={(fields) => {
            setFormData(prev => ({ ...prev, ...fields }));
          }}
          entityType="house"
        />
      </FormSection>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.location.href = '/admin/catalog/houses'}
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
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear Casa' : 'Actualizar Casa'}
        </Button>
      </div>
    </form>
  );
}
