/**
 * MediaUploaderV2 Component
 * Role-based media uploader for tier-based requirements
 */

import React, { useState, useEffect, useRef } from 'react';
import type { MediaRole, OwnerType, OwnerContext } from '../../lib/schemas/unified';

interface MediaAsset {
  id: string;
  url: string;
  role: MediaRole;
  position: number;
  alt_text?: string | null;
  caption?: string | null;
}

interface MediaUploaderV2Props {
  ownerType: OwnerType;
  ownerId: string;
  ownerContext: OwnerContext;
  requiredRoles: MediaRole[];
  allowedRoles: MediaRole[];
  maxFiles?: Partial<Record<MediaRole, number>>;
  onUploadComplete?: (asset: MediaAsset) => void;
  onMediaChange?: (assets: MediaAsset[]) => void;
}

export default function MediaUploaderV2({
  ownerType,
  ownerId,
  ownerContext,
  requiredRoles,
  allowedRoles,
  maxFiles = {},
  onUploadComplete,
  onMediaChange,
}: MediaUploaderV2Props) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<MediaRole>(allowedRoles[0] || 'gallery');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing media
  useEffect(() => {
    if (!ownerId) return;
    fetchMedia();
  }, [ownerId, ownerType, ownerContext]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ownerType,
        ownerId,
        ownerContext,
      });
      const res = await fetch(`/api/admin/media?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAssets(data);
        onMediaChange?.(data);
      }
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => uploadFile(file));
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ownerType', ownerType);
      formData.append('ownerId', ownerId);
      formData.append('ownerContext', ownerContext);
      formData.append('role', selectedRole);
      formData.append('position', String(assets.filter(a => a.role === selectedRole).length));

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const newAsset = await res.json();
        setAssets((prev) => [...prev, newAsset]);
        onUploadComplete?.(newAsset);
        onMediaChange?.([...assets, newAsset]);
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (id: string) => {
    if (!confirm('¿Eliminar este archivo?')) return;
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = assets.filter((a) => a.id !== id);
        setAssets(updated);
        onMediaChange?.(updated);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getRoleLabel = (role: MediaRole): string => {
    const labels: Record<MediaRole, string> = {
      thumbnail: 'Thumbnail',
      landing_hero: 'Hero Landing',
      landing_secondary: 'Landing 2',
      landing_third: 'Landing 3',
      gallery: 'Galería',
      plan: 'Plano',
      brochure_pdf: 'Brochure',
      cover: 'Portada',
      logo: 'Logo',
    };
    return labels[role];
  };

  const getAssetsByRole = (role: MediaRole) => assets.filter((a) => a.role === role);
  const getMissingRoles = () => requiredRoles.filter((role) => getAssetsByRole(role).length === 0);

  const missingRoles = getMissingRoles();

  return (
    <div className="space-y-6">
      {/* Role Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Media a Subir
        </label>
        <div className="flex flex-wrap gap-2">
          {allowedRoles.map((role) => {
            const count = getAssetsByRole(role).length;
            const max = maxFiles[role];
            const isSelected = selectedRole === role;
            const isMissing = requiredRoles.includes(role) && count === 0;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isMissing
                    ? 'bg-red-50 text-red-700 border border-red-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                } hover:shadow-md`}
              >
                {getRoleLabel(role)}
                {count > 0 && <span className="ml-2">({count}{max ? `/${max}` : ''})</span>}
                {isMissing && <span className="ml-1">⚠️</span>}
              </button>
            );
          })}
        </div>
        {missingRoles.length > 0 && (
          <div className="mt-2 text-sm text-red-600">
            Faltan: {missingRoles.map(getRoleLabel).join(', ')}
          </div>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,video/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <svg
          className="w-12 h-12 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-600 mb-2">
          Arrastra archivos aquí o{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:underline"
          >
            selecciona archivos
          </button>
        </p>
        <p className="text-xs text-gray-500">
          Se subirán como: <strong>{getRoleLabel(selectedRole)}</strong>
        </p>
      </div>

      {/* Loading/Uploading State */}
      {(loading || uploading) && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600 mt-2">
            {uploading ? 'Subiendo...' : 'Cargando...'}
          </p>
        </div>
      )}

      {/* Assets Grid by Role */}
      {allowedRoles.map((role) => {
        const roleAssets = getAssetsByRole(role);
        if (roleAssets.length === 0) return null;

        return (
          <div key={role} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900">
                {getRoleLabel(role)} ({roleAssets.length})
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {roleAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="relative group border border-gray-200 rounded-lg overflow-hidden"
                >
                  <img
                    src={asset.url}
                    alt={asset.alt_text || ''}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => deleteAsset(asset.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {assets.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No hay archivos subidos. Arrastra o selecciona archivos para comenzar.
        </div>
      )}
    </div>
  );
}
