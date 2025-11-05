import React, { useState, useEffect, useCallback } from 'react';
import {
  PhotoIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  DocumentIcon,
  FilmIcon
} from '@heroicons/react/24/outline';
import type { MediaAsset } from "@/lib/database.helpers";

interface MediaGalleryManagerProps {
  ownerType: 'provider' | 'house' | 'service_product' | 'blog' | 'news';
  ownerId: string;
  allowedKinds?: Array<'image' | 'video' | 'pdf' | 'plan'>;
  maxFiles?: number;
  maxSizeMB?: number;
  disabled?: boolean;
  onChange?: () => void; // Callback when media changes
}

export default function MediaGalleryManager({
  ownerType,
  ownerId,
  allowedKinds = ['image'],
  maxFiles = 10,
  maxSizeMB = 10,
  disabled = false,
  onChange
}: MediaGalleryManagerProps) {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [previewMedia, setPreviewMedia] = useState<MediaAsset | null>(null);
  const [editingMedia, setEditingMedia] = useState<MediaAsset | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Load media assets
  const loadMediaAssets = useCallback(async () => {
    if (!ownerId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        ownerType,
        ownerId
      });

      const response = await fetch(`/api/admin/media?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load media assets');

      const result = await response.json();
      setMediaAssets(result.data || []);
    } catch (error) {
      console.error('Error loading media assets:', error);
      setErrors(['Error al cargar los archivos multimedia']);
    } finally {
      setLoading(false);
    }
  }, [ownerType, ownerId]);

  useEffect(() => {
    loadMediaAssets();
  }, [loadMediaAssets]);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || disabled) return;

    const newErrors: string[] = [];
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Determine file kind
      let kind: 'image' | 'video' | 'pdf' | 'plan' | null = null;
      if (file.type.startsWith('image/')) kind = 'image';
      else if (file.type.startsWith('video/')) kind = 'video';
      else if (file.type === 'application/pdf') kind = 'pdf';

      if (!kind || !allowedKinds.includes(kind)) {
        newErrors.push(`${file.name}: Tipo de archivo no permitido.`);
        continue;
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        newErrors.push(`${file.name}: Archivo muy grande (máx ${maxSizeMB}MB).`);
        continue;
      }

      // Check max files
      if (mediaAssets.length + validFiles.length >= maxFiles) {
        newErrors.push(`Máximo ${maxFiles} archivos permitidos.`);
        break;
      }

      validFiles.push(file);
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors([]), 5000);
    }

    if (validFiles.length > 0) {
      await uploadFiles(validFiles);
    }
  }, [mediaAssets, maxFiles, allowedKinds, maxSizeMB, disabled]);

  // Upload files
  const uploadFiles = async (files: File[]) => {
    setUploading(true);

    for (const file of files) {
      try {
        const fileId = Math.random().toString(36);
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Determine kind
        let kind: 'image' | 'video' | 'pdf' | 'plan' = 'image';
        if (file.type.startsWith('video/')) kind = 'video';
        else if (file.type === 'application/pdf') {
          kind = allowedKinds.includes('plan') ? 'plan' : 'pdf';
        }

        // Prepare form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ownerType', ownerType);
        formData.append('ownerId', ownerId);
        formData.append('kind', kind);
        formData.append('sortOrder', String(mediaAssets.length));

        // Upload
        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData
        });

        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        // Remove progress indicator
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 500);

      } catch (error: any) {
        console.error('Upload error:', error);
        setErrors(prev => [...prev, `Error subiendo ${file.name}: ${error.message}`]);
      }
    }

    setUploading(false);
    await loadMediaAssets();
    onChange?.();
  };

  // Handle drag and drop reorder
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const reorderedAssets = [...mediaAssets];
    const [draggedItem] = reorderedAssets.splice(draggedIndex, 1);
    reorderedAssets.splice(dropIndex, 0, draggedItem);

    // Update sort_order for all items
    const updates = reorderedAssets.map((asset, index) => ({
      id: asset.id,
      sortOrder: index
    }));

    // Optimistically update UI
    setMediaAssets(reorderedAssets);
    setDraggedIndex(null);

    // Send reorder request
    try {
      const response = await fetch('/api/admin/media/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder');
      }

      onChange?.();
    } catch (error) {
      console.error('Reorder error:', error);
      setErrors(['Error al reordenar archivos']);
      // Reload to get correct order
      await loadMediaAssets();
    }
  };

  // Delete media asset
  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm('¿Está seguro de eliminar este archivo?')) return;

    try {
      const response = await fetch(`/api/admin/media/${asset.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete');

      await loadMediaAssets();
      onChange?.();
    } catch (error) {
      console.error('Delete error:', error);
      setErrors(['Error al eliminar archivo']);
    }
  };

  // Update metadata
  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const altText = formData.get('alt_text') as string;
    const caption = formData.get('caption') as string;

    try {
      const response = await fetch(`/api/admin/media/${editingMedia.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alt_text: altText,
          caption: caption
        })
      });

      if (!response.ok) throw new Error('Failed to update');

      setEditingMedia(null);
      await loadMediaAssets();
      onChange?.();
    } catch (error) {
      console.error('Update error:', error);
      setErrors(['Error al actualizar metadatos']);
    }
  };

  // Get icon for media type
  const getMediaIcon = (kind: string) => {
    switch (kind) {
      case 'image': return <PhotoIcon className="h-full w-full text-gray-400" />;
      case 'video': return <FilmIcon className="h-full w-full text-gray-400" />;
      case 'pdf':
      case 'plan': return <DocumentIcon className="h-full w-full text-gray-400" />;
      default: return <PhotoIcon className="h-full w-full text-gray-400" />;
    }
  };

  // Render media preview
  const renderMediaPreview = (asset: MediaAsset) => {
    if (asset.kind === 'image') {
      return (
        <img
          src={asset.url}
          alt={asset.alt_text || `Media ${asset.id}`}
          className="w-full h-full object-cover"
        />
      );
    } else if (asset.kind === 'video') {
      return (
        <video
          src={asset.url}
          className="w-full h-full object-cover"
          muted
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full p-4">
          {getMediaIcon(asset.kind)}
        </div>
      );
    }
  };

  const acceptedFileTypes = allowedKinds.map(kind => {
    switch (kind) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'pdf':
      case 'plan': return 'application/pdf';
      default: return '';
    }
  }).join(',');

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!disabled && mediaAssets.length < maxFiles && (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          onDrop={(e) => {
            e.preventDefault();
            handleFileSelect(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="media-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">
                Haga clic para cargar o arrastre archivos aquí
              </span>
              <input
                id="media-upload"
                name="media-upload"
                type="file"
                className="sr-only"
                multiple
                accept={acceptedFileTypes}
                onChange={(e) => handleFileSelect(e.target.files)}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Tipos permitidos: {allowedKinds.join(', ')} • Máx {maxSizeMB}MB por archivo
            </p>
            <p className="text-xs text-gray-500">
              {mediaAssets.length} / {maxFiles} archivos
            </p>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.entries(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([id, progress]) => (
            <div key={id} className="bg-gray-50 rounded p-2">
              <div className="flex items-center justify-between text-sm">
                <span>Subiendo...</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Errores
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Cargando...</p>
        </div>
      ) : mediaAssets.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaAssets.map((asset, index) => (
            <div
              key={asset.id}
              className="relative group cursor-move"
              draggable={!disabled}
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {renderMediaPreview(asset)}
              </div>

              {/* Overlay Controls */}
              {!disabled && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMedia(asset)}
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Ver"
                  >
                    <ArrowsPointingOutIcon className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingMedia(asset)}
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Editar metadatos"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(asset)}
                    className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50"
                    title="Eliminar"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Media Type Badge */}
              <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded uppercase">
                {asset.kind}
              </div>

              {/* Sort Order */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay archivos
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience cargando algunos archivos multimedia
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={() => setPreviewMedia(null)}
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black opacity-75"></div>
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg p-4">
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>

              {previewMedia.kind === 'image' && (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.alt_text || ''}
                  className="max-w-full max-h-[80vh] object-contain"
                />
              )}

              {previewMedia.kind === 'video' && (
                <video
                  src={previewMedia.url}
                  controls
                  className="max-w-full max-h-[80vh]"
                />
              )}

              {(previewMedia.kind === 'pdf' || previewMedia.kind === 'plan') && (
                <div className="p-8 text-center">
                  <DocumentIcon className="h-32 w-32 mx-auto text-gray-400" />
                  <p className="mt-4 text-sm text-gray-600">{previewMedia.caption || 'PDF Document'}</p>
                  <a
                    href={previewMedia.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Abrir PDF
                  </a>
                </div>
              )}

              {previewMedia.caption && (
                <p className="mt-2 text-sm text-gray-600 text-center">
                  {previewMedia.caption}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black opacity-50" onClick={() => setEditingMedia(null)}></div>
            <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar Metadatos
              </h3>

              <form onSubmit={handleUpdateMetadata} className="space-y-4">
                <div>
                  <label htmlFor="alt_text" className="block text-sm font-medium text-gray-700">
                    Texto Alternativo
                  </label>
                  <input
                    type="text"
                    id="alt_text"
                    name="alt_text"
                    defaultValue={editingMedia.alt_text || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="caption" className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    id="caption"
                    name="caption"
                    rows={3}
                    defaultValue={editingMedia.caption || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingMedia(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
