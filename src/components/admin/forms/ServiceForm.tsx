import React, { useState, useEffect } from 'react';
import { InputField } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import { TextAreaField } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/admin/FormSection';

interface Provider {
  id: string;
  company_name: string;
}

interface Category {
  id: string;
  name: string;
}

interface ServiceFormProps {
  providers: Provider[];
  categories: Category[];
  mode: 'create' | 'edit';
  initialData?: any;
  serviceId?: string;
}

const CHILEAN_REGIONS = [
  'Región Metropolitana',
  'Valparaíso',
  'Biobío',
  'La Araucanía',
  'Los Lagos',
  'Los Ríos',
  'Maule',
  'Ñuble',
  "O'Higgins",
  'Coquimbo',
  'Atacama',
  'Antofagasta',
  'Tarapacá',
  'Arica y Parinacota',
  'Aysén',
  'Magallanes'
];

export default function ServiceForm({
  providers,
  categories,
  mode,
  initialData,
  serviceId
}: ServiceFormProps) {
  const [formData, setFormData] = useState(initialData || {
    status: 'draft',
    tier: 'standard',
    price_unit: 'per_project',
    current_bookings: 0,
    is_available: true,
    coverage_areas: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleSubmit = async (e: React.FormEvent, saveAs?: string) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      ...formData,
      status: saveAs || formData.status
    };

    try {
      const url = mode === 'create'
        ? '/api/admin/services'
        : `/api/admin/services/${serviceId}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        const result = await response.json();
        window.location.href = `/admin/catalog/services`;
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

  const handleCoverageChange = (region: string, checked: boolean) => {
    const currentCoverage = formData.coverage_areas || [];
    if (checked) {
      setFormData(prev => ({
        ...prev,
        coverage_areas: [...currentCoverage, region]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        coverage_areas: currentCoverage.filter((r: string) => r !== region)
      }));
    }
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

          <SelectField
            label="Categoría"
            name="category_id"
            value={formData.category_id || ''}
            onChange={(e) => handleChange('category_id', e.target.value)}
            required
            options={[
              { value: '', label: 'Seleccionar categoría' },
              ...categories.map(c => ({ value: c.id, label: c.name }))
            ]}
            errorMessage={errors.category_id}
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

      {/* Áreas de Cobertura */}
      <FormSection
        title="Áreas de Cobertura"
        description="Regiones donde se ofrece el servicio"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {CHILEAN_REGIONS.map(region => (
            <div key={region} className="flex items-center">
              <input
                type="checkbox"
                id={`coverage_${region}`}
                checked={(formData.coverage_areas || []).includes(region)}
                onChange={(e) => handleCoverageChange(region, e.target.checked)}
                className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
              />
              <label
                htmlFor={`coverage_${region}`}
                className="ml-2 block text-sm text-gray-900 cursor-pointer"
              >
                {region}
              </label>
            </div>
          ))}
        </div>
      </FormSection>

      {/* SEO y Estado */}
      <FormSection
        title="SEO y Estado"
        description="Optimización para buscadores y estado de publicación"
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

          <SelectField
            label="Tier"
            name="tier"
            value={formData.tier || 'standard'}
            onChange={(e) => handleChange('tier', e.target.value)}
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'destacado', label: 'Destacado' },
              { value: 'premium', label: 'Premium' }
            ]}
          />
        </div>

        <InputField
          label="Meta Title"
          name="meta_title"
          value={formData.meta_title || ''}
          onChange={(e) => handleChange('meta_title', e.target.value)}
          maxLength={60}
          helperText="Máximo 60 caracteres"
        />

        <TextAreaField
          label="Meta Description"
          name="meta_description"
          value={formData.meta_description || ''}
          onChange={(e) => handleChange('meta_description', e.target.value)}
          rows={2}
          maxLength={160}
          helperText="Máximo 160 caracteres"
        />

        <InputField
          label="Keywords"
          name="keywords"
          value={formData.keywords || ''}
          onChange={(e) => handleChange('keywords', e.target.value)}
          placeholder="paneles solares, energía renovable, instalación (separadas por comas)"
        />
      </FormSection>

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
