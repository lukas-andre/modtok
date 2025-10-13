import React, { useState, useEffect } from 'react';
import { InputField } from '@/components/ui/input';
import { SelectField } from '@/components/ui/select';
import { TextAreaField } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FormSection } from '@/components/admin/FormSection';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: any;
  userId?: string;
}

export default function UserForm({
  mode,
  initialData,
  userId
}: UserFormProps) {
  const [formData, setFormData] = useState(initialData || {
    role: 'user',
    status: 'active',
    email_verified: false,
    phone_verified: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const url = mode === 'create'
        ? '/api/admin/users'
        : `/api/admin/users/${userId}`;

      const response = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        window.location.href = '/admin/users';
      } else {
        const error = await response.json();
        setErrors(error.errors || {});
        alert('Error al guardar el usuario. Revisa los campos marcados en rojo.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el usuario');
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <FormSection
        title="Información Básica"
        description="Datos principales del usuario"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Nombre Completo"
            name="full_name"
            value={formData.full_name || ''}
            onChange={(e) => handleChange('full_name', e.target.value)}
            required
            placeholder="Juan Pérez González"
            errorMessage={errors.full_name}
          />

          <InputField
            type="email"
            label="Email"
            name="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            placeholder="usuario@ejemplo.com"
            errorMessage={errors.email}
            helperText={mode === 'edit' ? 'El email no puede ser modificado después de creado' : undefined}
            disabled={mode === 'edit'}
          />

          <InputField
            type="tel"
            label="Teléfono"
            name="phone"
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+56 9 1234 5678"
            errorMessage={errors.phone}
          />

          <InputField
            label="RUT"
            name="rut"
            value={formData.rut || ''}
            onChange={(e) => handleChange('rut', e.target.value)}
            placeholder="12.345.678-9"
            errorMessage={errors.rut}
          />

          <InputField
            label="Empresa/Organización"
            name="company_name"
            value={formData.company_name || ''}
            onChange={(e) => handleChange('company_name', e.target.value)}
            placeholder="Nombre de la empresa (opcional)"
          />

          <InputField
            type="url"
            label="Sitio Web"
            name="website"
            value={formData.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="https://www.ejemplo.com"
            errorMessage={errors.website}
          />
        </div>

        <TextAreaField
          label="Biografía"
          name="bio"
          value={formData.bio || ''}
          onChange={(e) => handleChange('bio', e.target.value)}
          rows={3}
          placeholder="Breve descripción del usuario (opcional)"
          maxLength={500}
          helperText="Máximo 500 caracteres"
        />
      </FormSection>

      {/* Rol y Permisos */}
      <FormSection
        title="Rol y Permisos"
        description="Configuración de acceso y permisos"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Rol"
            name="role"
            value={formData.role || 'user'}
            onChange={(e) => handleChange('role', e.target.value)}
            required
            options={[
              { value: 'user', label: 'Usuario' },
              { value: 'provider', label: 'Proveedor' },
              { value: 'admin', label: 'Administrador' },
              { value: 'super_admin', label: 'Super Administrador' }
            ]}
            helperText="Define el nivel de acceso del usuario"
            errorMessage={errors.role}
          />

          <SelectField
            label="Estado"
            name="status"
            value={formData.status || 'active'}
            onChange={(e) => handleChange('status', e.target.value)}
            required
            options={[
              { value: 'active', label: 'Activo' },
              { value: 'inactive', label: 'Inactivo' },
              { value: 'suspended', label: 'Suspendido' },
              { value: 'pending_verification', label: 'Pendiente Verificación' }
            ]}
            errorMessage={errors.status}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="email_verified"
              name="email_verified"
              checked={formData.email_verified === true}
              onChange={(e) => handleChange('email_verified', e.target.checked)}
              className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
            />
            <label htmlFor="email_verified" className="text-sm text-gray-900">
              Email Verificado
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="phone_verified"
              name="phone_verified"
              checked={formData.phone_verified === true}
              onChange={(e) => handleChange('phone_verified', e.target.checked)}
              className="h-4 w-4 text-accent-blue focus:ring-accent-blue/20 border-gray-300 rounded"
            />
            <label htmlFor="phone_verified" className="text-sm text-gray-900">
              Teléfono Verificado
            </label>
          </div>
        </div>
      </FormSection>

      {/* Contraseña (solo en modo creación) */}
      {mode === 'create' && (
        <FormSection
          title="Contraseña"
          description="Configuración de acceso inicial"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              type="password"
              label="Contraseña"
              name="password"
              value={formData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              required={mode === 'create'}
              placeholder="Mínimo 8 caracteres"
              errorMessage={errors.password}
              helperText="Mínimo 8 caracteres, se recomienda usar combinación de letras, números y símbolos"
            />

            <InputField
              type="password"
              label="Confirmar Contraseña"
              name="password_confirm"
              value={formData.password_confirm || ''}
              onChange={(e) => handleChange('password_confirm', e.target.value)}
              required={mode === 'create'}
              placeholder="Repite la contraseña"
              errorMessage={errors.password_confirm}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Información de Seguridad</p>
                <p>El usuario recibirá un correo electrónico de bienvenida con instrucciones para activar su cuenta y puede cambiar su contraseña desde su perfil.</p>
              </div>
            </div>
          </div>
        </FormSection>
      )}

      {/* URL de Avatar (Opcional) */}
      <FormSection
        title="Imagen de Perfil"
        description="URL de la imagen de avatar (opcional)"
        variant="flat"
      >
        <InputField
          type="url"
          label="URL del Avatar"
          name="avatar_url"
          value={formData.avatar_url || ''}
          onChange={(e) => handleChange('avatar_url', e.target.value)}
          placeholder="https://ejemplo.com/avatar.jpg"
          helperText="URL de la imagen de perfil del usuario"
          errorMessage={errors.avatar_url}
        />

        {formData.avatar_url && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
            <img
              src={formData.avatar_url}
              alt="Avatar preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>
        )}
      </FormSection>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={() => window.location.href = '/admin/users'}
          disabled={loading}
        >
          Cancelar
        </Button>

        <Button
          type="submit"
          variant="default"
          disabled={loading}
        >
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear Usuario' : 'Actualizar Usuario'}
        </Button>
      </div>
    </form>
  );
}
