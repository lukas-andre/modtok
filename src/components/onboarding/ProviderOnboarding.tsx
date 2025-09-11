import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createBrowserClient } from '@supabase/ssr';
import type { CategoryType } from '@/lib/types';

interface Props {
  userId: string;
}

const ProviderOnboarding: React.FC<Props> = ({ userId }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [companyName, setCompanyName] = useState('');
  const [rut, setRut] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('fabricantes');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [specialties, setSpecialties] = useState('');
  
  const supabase = createBrowserClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_name: companyName,
          rut: rut,
          phone: phone,
          website: website,
          phone_verified: true,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Create provider entry
      const slug = companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { error: providerError } = await supabase
        .from('providers')
        .insert({
          profile_id: userId,
          category_type: categoryType,
          company_name: companyName,
          slug: slug,
          email: (await supabase.auth.getUser()).data.user?.email,
          phone: phone,
          website: website,
          address: address,
          city: city,
          region: region,
          description: description,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          specialties: specialties.split(',').map(s => s.trim()).filter(s => s),
          status: 'pending_review',
          tier: 'standard',
        });

      if (providerError) throw providerError;

      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Error al guardar la información');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

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
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rut">RUT de la empresa</Label>
              <Input
                id="rut"
                type="text"
                placeholder="12.345.678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryType">Tipo de proveedor *</Label>
              <select
                id="categoryType"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={categoryType}
                onChange={(e) => setCategoryType(e.target.value as CategoryType)}
                disabled={loading}
              >
                <option value="fabricantes">Fabricante de Casas</option>
                <option value="habilitacion_servicios">Habilitación y Servicios</option>
                <option value="decoracion">Decoración y Mejoras</option>
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.tuempresa.cl"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ciudad *</Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Región *</Label>
                <Input
                  id="region"
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  disabled={loading}
                />
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
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Años de experiencia</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Especialidades (separadas por coma)</Label>
              <Input
                id="specialties"
                type="text"
                placeholder="Casas modulares, Construcción sustentable, Llave en mano"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
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
              disabled={loading}
              className="ml-auto"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
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