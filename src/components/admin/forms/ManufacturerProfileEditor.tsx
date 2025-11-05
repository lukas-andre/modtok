import React, { useState, useEffect } from 'react';
import { InputField } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/admin/FormSection';

interface ManufacturerProfileEditorProps {
  providerId: string;
  companyName: string;
}

interface ManufacturerProfile {
  // Tier (NUEVO)
  tier?: 'premium' | 'destacado' | 'standard';

  // Servicios disponibles
  dise_std?: boolean;
  dise_pers?: boolean;
  insta_premontada?: boolean;
  contr_terreno?: boolean;
  instalacion?: boolean;
  kit_autocons?: boolean;
  ases_tecnica?: boolean;
  ases_legal?: boolean;
  logist_transporte?: boolean;
  financiamiento?: boolean;

  // Especialidad
  tiny_houses?: boolean;
  modulares_sip?: boolean;
  modulares_container?: boolean;
  modulares_hormigon?: boolean;
  modulares_madera?: boolean;
  prefabricada_tradicional?: boolean;
  oficinas_modulares?: boolean;

  // Generales
  llave_en_mano?: boolean;
  publica_precios?: boolean;
  precio_ref_min_m2?: number | null;
  precio_ref_max_m2?: number | null;

  // Meta
  experiencia_years?: number | null;
  verified_by_admin?: boolean;
}

const SERVICIOS_OPTIONS = [
  { key: 'dise_std', label: 'Diseño Estándar' },
  { key: 'dise_pers', label: 'Diseño Personalizado' },
  { key: 'insta_premontada', label: 'Instalación Premontada' },
  { key: 'contr_terreno', label: 'Construcción en Terreno' },
  { key: 'instalacion', label: 'Instalación' },
  { key: 'kit_autocons', label: 'Kit Autoconstrucción' },
  { key: 'ases_tecnica', label: 'Asesoría Técnica' },
  { key: 'ases_legal', label: 'Asesoría Legal' },
  { key: 'logist_transporte', label: 'Logística y Transporte' },
  { key: 'financiamiento', label: 'Financiamiento' }
];

const ESPECIALIDAD_OPTIONS = [
  { key: 'tiny_houses', label: 'Tiny Houses' },
  { key: 'modulares_sip', label: 'Modulares SIP' },
  { key: 'modulares_container', label: 'Modulares Container' },
  { key: 'modulares_hormigon', label: 'Modulares Hormigón' },
  { key: 'modulares_madera', label: 'Modulares Madera' },
  { key: 'prefabricada_tradicional', label: 'Prefabricada Tradicional' },
  { key: 'oficinas_modulares', label: 'Oficinas Modulares' }
];

export default function ManufacturerProfileEditor({
  providerId,
  companyName
}: ManufacturerProfileEditorProps) {
  const [profile, setProfile] = useState<ManufacturerProfile>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [providerId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/providers/${providerId}/manufacturer-profile`);

      if (response.status === 404) {
        // Profile doesn't exist yet - that's ok
        setProfileExists(false);
        setProfile({});
      } else if (response.ok) {
        const data = await response.json();
        setProfile(data.profile || {});
        setProfileExists(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar el perfil');
      }
    } catch (err: any) {
      setError('Error de conexión al cargar el perfil');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (key: keyof ManufacturerProfile, checked: boolean) => {
    setProfile(prev => ({ ...prev, [key]: checked }));
  };

  const handleNumberChange = (key: keyof ManufacturerProfile, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setProfile(prev => ({ ...prev, [key]: numValue }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(`/api/admin/providers/${providerId}/manufacturer-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setSuccess(true);
        setProfileExists(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al guardar el perfil');
      }
    } catch (err: any) {
      setError('Error de conexión al guardar');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando perfil de fabricante...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Perfil de Fabricante: {companyName}
        </h3>
        <p className="text-sm text-blue-700">
          {profileExists
            ? 'Este fabricante ya declaró sus capacidades. Puedes editar y actualizar la información.'
            : 'Este fabricante aún no ha declarado sus capacidades. Crea el perfil para comenzar.'}
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">✓ Perfil guardado exitosamente</p>
        </div>
      )}

      {/* Tier y Visibilidad */}
      <FormSection
        title="Tier y Visibilidad"
        description="Solo tier Premium puede tener landing pages dedicadas con SEO"
      >
        <div className="space-y-3">
          <div className="flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tier"
                value="standard"
                checked={profile.tier === 'standard' || !profile.tier}
                onChange={(e) => setProfile(prev => ({ ...prev, tier: 'standard' }))}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
              />
              <span className="ml-2 text-sm font-medium text-gray-900">Standard</span>
              <span className="ml-2 text-xs text-gray-500">(Listado básico)</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tier"
                value="destacado"
                checked={profile.tier === 'destacado'}
                onChange={(e) => setProfile(prev => ({ ...prev, tier: 'destacado' }))}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
              />
              <span className="ml-2 text-sm font-medium text-orange-900">Destacado</span>
              <span className="ml-2 text-xs text-gray-500">(Mayor visibilidad)</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tier"
                value="premium"
                checked={profile.tier === 'premium'}
                onChange={(e) => setProfile(prev => ({ ...prev, tier: 'premium' }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm font-medium text-blue-900">Premium</span>
              <span className="ml-2 text-xs text-gray-500">(Landing + SEO + máxima visibilidad)</span>
            </label>
          </div>

          {profile.tier === 'premium' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Premium: Este fabricante puede tener landing page dedicada en /fabricantes/[slug]
              </p>
              <p className="text-sm text-blue-700">
                Configura el SEO y contenido de la landing en la sección <strong>"Landing Page Configuration"</strong> más abajo.
              </p>
            </div>
          )}

          {profile.tier !== 'premium' && (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600">
                Los fabricantes Premium tienen landing pages dedicadas con SEO optimizado.
                Cambia el tier a Premium para habilitar esta funcionalidad.
              </p>
            </div>
          )}
        </div>
      </FormSection>

      {/* Servicios Disponibles */}
      <FormSection
        title="Servicios Disponibles"
        description="Servicios que el fabricante puede ofrecer"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SERVICIOS_OPTIONS.map(({ key, label }) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={`servicio_${key}`}
                checked={profile[key as keyof ManufacturerProfile] as boolean || false}
                onChange={(e) => handleCheckboxChange(key as keyof ManufacturerProfile, e.target.checked)}
                className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
              />
              <label
                htmlFor={`servicio_${key}`}
                className="ml-2 block text-sm text-gray-900 cursor-pointer"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </FormSection>

      {/* Especialidad */}
      <FormSection
        title="Especialidad"
        description="Tipos de casas modulares que fabrica"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {ESPECIALIDAD_OPTIONS.map(({ key, label }) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={`especialidad_${key}`}
                checked={profile[key as keyof ManufacturerProfile] as boolean || false}
                onChange={(e) => handleCheckboxChange(key as keyof ManufacturerProfile, e.target.checked)}
                className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
              />
              <label
                htmlFor={`especialidad_${key}`}
                className="ml-2 block text-sm text-gray-900 cursor-pointer"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
      </FormSection>

      {/* Características Generales */}
      <FormSection
        title="Características Generales"
        description="Información sobre modalidades y precios"
      >
        <div className="space-y-4">
          {/* Llave en Mano */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="llave_en_mano"
              checked={profile.llave_en_mano || false}
              onChange={(e) => handleCheckboxChange('llave_en_mano', e.target.checked)}
              className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
            />
            <label htmlFor="llave_en_mano" className="ml-2 block text-sm font-medium text-gray-900 cursor-pointer">
              Ofrece Llave en Mano
            </label>
          </div>

          {/* Publica Precios */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="publica_precios"
              checked={profile.publica_precios || false}
              onChange={(e) => handleCheckboxChange('publica_precios', e.target.checked)}
              className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
            />
            <label htmlFor="publica_precios" className="ml-2 block text-sm font-medium text-gray-900 cursor-pointer">
              Publica Precios Públicamente
            </label>
          </div>

          {/* Precio Referencial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <InputField
              label="Precio Referencial Mínimo (por m²)"
              name="precio_ref_min_m2"
              type="number"
              value={profile.precio_ref_min_m2?.toString() || ''}
              onChange={(e) => handleNumberChange('precio_ref_min_m2', e.target.value)}
              placeholder="28000"
              helperText="En pesos chilenos (CLP)"
            />

            <InputField
              label="Precio Referencial Máximo (por m²)"
              name="precio_ref_max_m2"
              type="number"
              value={profile.precio_ref_max_m2?.toString() || ''}
              onChange={(e) => handleNumberChange('precio_ref_max_m2', e.target.value)}
              placeholder="42000"
              helperText="En pesos chilenos (CLP)"
            />
          </div>
        </div>
      </FormSection>

      {/* Meta Info */}
      <FormSection
        title="Información Adicional"
        description="Experiencia y verificación"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Años de Experiencia"
            name="experiencia_years"
            type="number"
            value={profile.experiencia_years?.toString() || ''}
            onChange={(e) => handleNumberChange('experiencia_years', e.target.value)}
            placeholder="10"
            helperText="Años en la industria"
          />

          <div className="flex items-center pt-6">
            <input
              type="checkbox"
              id="verified_by_admin"
              checked={profile.verified_by_admin || false}
              onChange={(e) => handleCheckboxChange('verified_by_admin', e.target.checked)}
              className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
            />
            <label htmlFor="verified_by_admin" className="ml-2 block text-sm font-medium text-gray-900 cursor-pointer">
              ✓ Verificado por Admin
            </label>
          </div>
        </div>
      </FormSection>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="default"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando...' : profileExists ? 'Actualizar Perfil' : 'Crear Perfil'}
        </Button>
      </div>
    </div>
  );
}
