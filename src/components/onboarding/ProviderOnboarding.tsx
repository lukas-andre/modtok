import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createBrowserSupabaseClient } from '@/lib/supabase-browser';
import type { CategoryType, ProfileUpdate, ProviderInsert, Json } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';

interface Props {
  userId: string;
  session: Session | null;
}

const ProviderOnboarding: React.FC<Props> = ({ userId, session }) => {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data - using refs to avoid re-render issues
  const formDataRef = useRef({
    companyName: '',
    rut: '',
    categoryType: 'fabrica' as CategoryType,
    phone: '',
    website: '',
    address: '',
    city: '',
    region: '',
    description: '',
    yearsExperience: '',
    specialties: ''
  });
  
  // State for form display values
  const [formValues, setFormValues] = useState(formDataRef.current);
  
  // Track which fields have been touched
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  // Create Supabase client once
  const supabase = useRef(createBrowserSupabaseClient()).current;
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const updateFormField = (field: keyof typeof formDataRef.current, value: string) => {
    if (field === 'categoryType') {
      formDataRef.current[field] = value as CategoryType;
    } else {
      (formDataRef.current as any)[field] = value;
    }
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const formData = formDataRef.current;

      const companyName = formData.companyName.trim();
      const phoneValue = formData.phone.trim();
      const websiteValue = formData.website.trim();
      const addressValue = formData.address.trim();
      const cityValue = formData.city.trim();
      const regionValue = formData.region.trim();
      const descriptionValue = formData.description.trim();

      if (!companyName) {
        throw new Error('El nombre de la empresa es obligatorio.');
      }
      if (!descriptionValue) {
        throw new Error('La descripción es obligatoria.');
      }

      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .maybeSingle();

      if (profileFetchError) throw profileFetchError;

      const profileUpdate: ProfileUpdate = {
        company_name: companyName,
        rut: formData.rut || null,
        phone: phoneValue || null,
        website: websiteValue || null,
        phone_verified: true,
      };

      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId);

      if (profileError) throw profileError;

      const baseSlug = companyName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const specialties = formData.specialties
        ? formData.specialties
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)
        : [];

      const yearsExperience = formData.yearsExperience
        ? parseInt(formData.yearsExperience, 10)
        : null;

      const metadataContent: Record<string, unknown> = {};
      if (specialties.length > 0) {
        metadataContent.specialties = specialties;
      }
      if (!Number.isNaN(yearsExperience) && yearsExperience !== null) {
        metadataContent.years_experience = yearsExperience;
      }

      const metadata: Json | undefined =
        Object.keys(metadataContent).length > 0
          ? ({ onboarding: metadataContent } as Json)
          : undefined;

      let slug = baseSlug;
      let suffix = 1;
      // Ensure slug uniqueness client-side to avoid constraint errors
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { data: existingSlug } = await supabase
          .from('providers')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();

        if (!existingSlug) break;
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;

        if (suffix > 50) {
          throw new Error('No se pudo generar un slug único para el proveedor.');
        }
      }

      const providerData: ProviderInsert = {
        profile_id: userId,
        primary_category: formData.categoryType,
        company_name: companyName,
        slug,
        email: profile?.email || session?.user?.email || '',
        phone: phoneValue || null,
        website: websiteValue || null,
        address: addressValue || null,
        city: cityValue || null,
        region: regionValue || null,
        description: descriptionValue || null,
        status: 'pending_review',
        tier: 'standard',
        ...(metadata ? { metadata } : {})
      };
      
      const { error: providerError } = await supabase
        .from('providers')
        .insert(providerData);

      if (providerError) throw providerError;

      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Error during provider onboarding:', err);
      setError(err.message || 'Error al guardar la información');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  };

  const shouldShowError = (fieldName: string): boolean => {
    const value = formValues[fieldName as keyof typeof formValues];
    return touchedFields.has(fieldName) && (value === undefined || value === '' || value.toString().trim() === '');
  };

  const validateStep = (currentStep: number): boolean => {
    const data = formDataRef.current;
    if (currentStep === 1) {
      return data.companyName.trim() !== '';
    }
    if (currentStep === 2) {
      return data.phone.trim() !== '' && data.city.trim() !== '' && data.region.trim() !== '';
    }
    if (currentStep === 3) {
      return data.description.trim() !== '';
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) {
      setError(`Por favor completa todos los campos obligatorios del paso ${step}`);
      return;
    }
    setError(null);
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    setError(null);
    if (step > 1) setStep(step - 1);
  };

  if (!mounted) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center">Cargando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Configuración de Proveedor - Paso {step} de 3</CardTitle>
        <CardDescription>
          {step === 1 && 'Información básica de tu empresa'}
          {step === 2 && 'Ubicación y contacto'}
          {step === 3 && 'Detalles adicionales'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nombre de la empresa *</Label>
              <Input
                id="companyName"
                type="text"
                value={formValues.companyName}
                onChange={(e) => updateFormField('companyName', e.target.value)}
                onBlur={() => handleFieldBlur('companyName')}
                required
                disabled={loading}
                className={shouldShowError('companyName') ? 'border-red-300 focus:border-red-500' : ''}
              />
              {shouldShowError('companyName') && (
                <p className="text-sm text-red-600">Este campo es obligatorio</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT de la empresa</Label>
              <Input
                id="rut"
                type="text"
                placeholder="12.345.678-9"
                value={formValues.rut}
                onChange={(e) => updateFormField('rut', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryType">Tipo de proveedor *</Label>
              <select
                id="categoryType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formValues.categoryType}
                onChange={(e) => updateFormField('categoryType', e.target.value)}
                disabled={loading}
              >
                <option value="fabrica">Fábrica de Casas</option>
                <option value="casas">Casas Modulares</option>
                <option value="habilitacion_servicios">Habilitación y Servicios</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono de contacto *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+56 9 1234 5678"
                value={formValues.phone}
                onChange={(e) => updateFormField('phone', e.target.value)}
                onBlur={() => handleFieldBlur('phone')}
                required
                disabled={loading}
                className={shouldShowError('phone') ? 'border-red-300 focus:border-red-500' : ''}
              />
              {shouldShowError('phone') && (
                <p className="text-sm text-red-600">Este campo es obligatorio</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.tuempresa.cl"
                value={formValues.website}
                onChange={(e) => updateFormField('website', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                type="text"
                value={formValues.address}
                onChange={(e) => updateFormField('address', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  type="text"
                  value={formValues.city}
                  onChange={(e) => updateFormField('city', e.target.value)}
                  onBlur={() => handleFieldBlur('city')}
                  required
                  disabled={loading}
                  className={shouldShowError('city') ? 'border-red-300 focus:border-red-500' : ''}
                />
                {shouldShowError('city') && (
                  <p className="text-sm text-red-600">Este campo es obligatorio</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Región *</Label>
                <Input
                  id="region"
                  type="text"
                  value={formValues.region}
                  onChange={(e) => updateFormField('region', e.target.value)}
                  onBlur={() => handleFieldBlur('region')}
                  required
                  disabled={loading}
                  className={shouldShowError('region') ? 'border-red-300 focus:border-red-500' : ''}
                />
                {shouldShowError('region') && (
                  <p className="text-sm text-red-600">Este campo es obligatorio</p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción de la empresa *</Label>
              <textarea
                id="description"
                className={`flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ${
                  shouldShowError('description') ? 'border-red-300 focus:border-red-500' : 'border-input'
                }`}
                value={formValues.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                onBlur={() => handleFieldBlur('description')}
                required
                disabled={loading}
              />
              {shouldShowError('description') && (
                <p className="text-sm text-red-600">Este campo es obligatorio</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Años de experiencia</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                value={formValues.yearsExperience}
                onChange={(e) => updateFormField('yearsExperience', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Especialidades (separadas por coma)</Label>
              <Input
                id="specialties"
                type="text"
                placeholder="Casas modulares, Construcción sustentable, Llave en mano"
                value={formValues.specialties}
                onChange={(e) => updateFormField('specialties', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={loading}
            >
              Anterior
            </Button>
          )}
          {step < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={loading || !validateStep(step)}
              className="ml-auto"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !validateStep(step)}
              className="ml-auto"
            >
              {loading ? 'Guardando...' : 'Completar Registro'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderOnboarding;
