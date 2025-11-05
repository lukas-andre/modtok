/**
 * TierSEOPanel Component
 * Unified tier selector and SEO fields for Provider, Service, and House entities.
 */

import React, { useEffect, useState } from 'react';
import type { Tier } from '../../../lib/schemas/unified';
import { RequiredMediaByTier } from '../../../lib/schemas/unified';

interface TierSEOPanelProps {
  tier: Tier;
  onTierChange: (tier: Tier) => void;
  seoFields: {
    meta_title?: string | null;
    meta_description?: string | null;
  };
  onSeoChange: (fields: { meta_title?: string; meta_description?: string }) => void;
  entityType: 'provider' | 'service' | 'house';
  currentMediaRoles?: string[];
}

export default function TierSEOPanel({
  tier,
  onTierChange,
  seoFields,
  onSeoChange,
  entityType,
  currentMediaRoles = [],
}: TierSEOPanelProps) {
  const [metaTitle, setMetaTitle] = useState(seoFields.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(seoFields.meta_description || '');

  useEffect(() => {
    setMetaTitle(seoFields.meta_title || '');
    setMetaDescription(seoFields.meta_description || '');
  }, [seoFields]);

  const handleMetaTitleChange = (value: string) => {
    setMetaTitle(value);
    onSeoChange({ meta_title: value, meta_description: metaDescription });
  };

  const handleMetaDescriptionChange = (value: string) => {
    setMetaDescription(value);
    onSeoChange({ meta_title: metaTitle, meta_description: value });
  };

  const tierInfo = {
    standard: {
      label: 'Standard',
      color: 'bg-gray-100 text-gray-700 border-gray-300',
      activeColor: 'bg-gray-200 border-gray-500',
      description: 'Ficha simple con datos básicos',
      benefits: ['Listado básico', 'Contacto directo', 'Sin destacar'],
    },
    destacado: {
      label: 'Destacado',
      color: 'bg-blue-50 text-blue-700 border-blue-300',
      activeColor: 'bg-blue-100 border-blue-500',
      description: 'Card bonita en listados + sección visual',
      benefits: ['Thumbnail requerida', 'Posición destacada', 'Más visibilidad'],
    },
    premium: {
      label: 'Premium',
      color: 'bg-purple-50 text-purple-700 border-purple-300',
      activeColor: 'bg-purple-100 border-purple-500',
      description: 'Landing dedicada con contenido rico + SEO',
      benefits: ['Landing propia', 'SEO completo', '3 imágenes landing', 'Máxima visibilidad'],
    },
  };

  const requiredMedia = RequiredMediaByTier[tier];
  const missingMedia = requiredMedia.filter((role) => !currentMediaRoles.includes(role));

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Tier de {entityType === 'provider' ? 'Landing' : 'Listado'}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['standard', 'destacado', 'premium'] as Tier[]).map((t) => {
            const info = tierInfo[t];
            const isActive = tier === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => onTierChange(t)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  isActive ? info.activeColor : info.color
                } hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-bold text-lg">{info.label}</div>
                  {isActive && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="text-sm mb-3">{info.description}</div>
                <ul className="text-xs space-y-1">
                  {info.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center"><span className="mr-2">•</span>{benefit}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </div>

      {requiredMedia.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-amber-900 mb-2">Requisitos para tier {tierInfo[tier].label}</div>
              <ul className="text-sm text-amber-800 space-y-1">
                {requiredMedia.map((role) => {
                  const hasRole = currentMediaRoles.includes(role);
                  return (
                    <li key={role} className="flex items-center">
                      {hasRole ? (
                        <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      Media: {role}
                    </li>
                  );
                })}
                {tier === 'premium' && (
                  <li className="flex items-center">
                    {metaTitle && metaDescription ? (
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    SEO completo (meta title + description)
                  </li>
                )}
              </ul>
              {missingMedia.length > 0 && (
                <div className="mt-2 text-sm text-amber-900 font-medium">
                  Faltan {missingMedia.length} requisito(s) para publicar
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tier === 'premium' ? (
        <div className="space-y-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center text-purple-900 font-semibold mb-2">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
            SEO (Requerido para Premium)
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Título *</label>
            <input type="text" value={metaTitle} onChange={(e) => handleMetaTitleChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Título para SEO (10-60 caracteres)" maxLength={60} />
            <div className="mt-1 text-xs text-gray-500">{metaTitle.length}/60 caracteres</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Descripción *</label>
            <textarea value={metaDescription} onChange={(e) => handleMetaDescriptionChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" placeholder="Descripción para SEO (30-160 caracteres)" rows={3} maxLength={160} />
            <div className="mt-1 text-xs text-gray-500">{metaDescription.length}/160 caracteres</div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>Los campos SEO se activan al seleccionar tier <strong>Premium</strong>. Esto habilita una landing dedicada con mejor posicionamiento.</div>
          </div>
        </div>
      )}
    </div>
  );
}
