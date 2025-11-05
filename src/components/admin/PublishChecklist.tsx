/**
 * PublishChecklist Component
 * Displays validation checklist and publish button for entities
 */

import React, { useState, useEffect } from 'react';
import type { EntityType } from '../../lib/validation/publishValidation';

interface ValidationError {
  field: string;
  message: string;
  section?: string;
}

interface PublishChecklistProps {
  entityType: EntityType;
  entityId: string;
  tier: string;
  onPublishSuccess?: () => void;
}

export default function PublishChecklist({
  entityType,
  entityId,
  tier,
  onPublishSuccess,
}: PublishChecklistProps) {
  const [validating, setValidating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (entityId) {
      validateEntity();
    }
  }, [entityId, tier]);

  const validateEntity = async () => {
    setValidating(true);
    try {
      const res = await fetch(`/api/admin/${entityType}s/${entityId}/validate-publish`);
      if (res.ok) {
        const result = await res.json();
        setIsValid(result.ok);
        setErrors(result.errors || []);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setValidating(false);
    }
  };

  const handlePublish = async () => {
    if (!isValid) {
      alert('Por favor corrige los errores antes de publicar');
      return;
    }

    if (!confirm('¿Publicar este contenido? Será visible públicamente.')) {
      return;
    }

    setPublishing(true);
    try {
      const res = await fetch(`/api/admin/${entityType}s/${entityId}/publish`, {
        method: 'PUT',
      });

      if (res.ok) {
        alert('¡Publicado exitosamente!');
        onPublishSuccess?.();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error || 'No se pudo publicar'}`);
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Error al publicar');
    } finally {
      setPublishing(false);
    }
  };

  const getStatusIcon = (hasError: boolean) => {
    if (hasError) {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    );
  };

  // Group errors by section
  const errorsBySection = errors.reduce((acc, error) => {
    const section = error.section || 'general';
    if (!acc[section]) acc[section] = [];
    acc[section].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);

  const sectionLabels: Record<string, string> = {
    identity: 'Identidad',
    location: 'Ubicación',
    roles: 'Roles',
    coverage: 'Cobertura',
    media: 'Media',
    seo: 'SEO',
    dimensions: 'Dimensiones',
    landing: 'Landing',
    general: 'General',
  };

  const totalChecks = Math.max(
    5,
    Object.keys(errorsBySection).length + (tier === 'premium' ? 2 : 1)
  );
  const passedChecks = totalChecks - errors.length;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Estado de Publicación</h3>
          {validating && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Requisitos completados</span>
            <span className="font-semibold">
              {passedChecks}/{totalChecks}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isValid ? 'bg-green-600' : 'bg-amber-500'
              }`}
              style={{ width: `${(passedChecks / totalChecks) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          {Object.entries(errorsBySection).map(([section, sectionErrors]) => (
            <div key={section} className="space-y-2">
              <div className="flex items-start">
                {getStatusIcon(true)}
                <div className="ml-3 flex-1">
                  <div className="font-medium text-gray-900">
                    {sectionLabels[section] || section}
                  </div>
                  <ul className="mt-1 text-sm text-red-600 space-y-1">
                    {sectionErrors.map((error, idx) => (
                      <li key={idx}>• {error.message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {isValid && (
            <div className="flex items-start">
              {getStatusIcon(false)}
              <div className="ml-3 flex-1">
                <div className="font-medium text-green-700">
                  ¡Todo listo para publicar!
                </div>
                <div className="text-sm text-gray-600">
                  Todos los requisitos han sido cumplidos
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Publish Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={handlePublish}
            disabled={!isValid || publishing}
            className={`w-full px-4 py-3 rounded-lg font-semibold transition-all ${
              isValid && !publishing
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {publishing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Publicando...
              </span>
            ) : (
              'Publicar'
            )}
          </button>

          {!isValid && errors.length > 0 && (
            <p className="mt-2 text-sm text-red-600 text-center">
              Completa los {errors.length} requisito(s) faltante(s) para publicar
            </p>
          )}
        </div>
      </div>

      {/* Refresh Button */}
      <button
        type="button"
        onClick={validateEntity}
        disabled={validating}
        className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
      >
        {validating ? 'Validando...' : 'Revalidar Requisitos'}
      </button>
    </div>
  );
}
