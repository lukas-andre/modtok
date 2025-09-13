import React, { useState, useCallback } from 'react';
import {
  PhotoIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  PlusIcon,
  TrashIcon,
  ArrowsPointingOutIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ImageGalleryManagerProps {
  images: string[];
  mainImage?: string;
  onImagesChange: (images: string[]) => void;
  onMainImageChange?: (image: string) => void;
  maxImages?: number;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export default function ImageGalleryManager({
  images = [],
  mainImage,
  onImagesChange,
  onMainImageChange,
  maxImages = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMB = 5
}: ImageGalleryManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file type
      if (!acceptedFormats.includes(file.type)) {
        newErrors.push(`${file.name}: Formato no permitido. Use JPG, PNG o WebP.`);
        continue;
      }
      
      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        newErrors.push(`${file.name}: Archivo muy grande (máx ${maxSizeMB}MB).`);
        continue;
      }
      
      // Check max images
      if (images.length + validFiles.length >= maxImages) {
        newErrors.push(`Máximo ${maxImages} imágenes permitidas.`);
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
  }, [images, maxImages, acceptedFormats, maxSizeMB]);

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      try {
        // Simulate upload progress
        const fileId = Math.random().toString(36);
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        // Here you would implement actual file upload to your storage service
        // For now, we'll create object URLs as placeholders
        const url = URL.createObjectURL(file);
        uploadedUrls.push(url);
        
        // Simulate progress
        for (let i = 0; i <= 100; i += 20) {
          setUploadProgress(prev => ({ ...prev, [fileId]: i }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      } catch (error) {
        setErrors(prev => [...prev, `Error subiendo ${file.name}`]);
      }
    }
    
    onImagesChange([...images, ...uploadedUrls]);
    
    // Set first image as main if none selected
    if (!mainImage && uploadedUrls.length > 0) {
      onMainImageChange?.(uploadedUrls[0]);
    }
    
    setIsUploading(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;
    
    const draggedImage = images[draggedIndex];
    const newImages = [...images];
    
    // Remove dragged item
    newImages.splice(draggedIndex, 1);
    
    // Insert at new position
    newImages.splice(dropIndex, 0, draggedImage);
    
    onImagesChange(newImages);
    setDraggedIndex(null);
  };

  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // If removed image was main, set first image as main
    if (mainImage === imageToRemove && newImages.length > 0) {
      onMainImageChange?.(newImages[0]);
    }
  };

  const handleSetMainImage = (image: string) => {
    onMainImageChange?.(image);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    
    if (files.length > 0) {
      const dt = new DataTransfer();
      files.forEach(file => dt.items.add(file));
      handleFileSelect(dt.files);
    }
  }, [handleFileSelect]);

  const handleUrlAdd = () => {
    const url = prompt('Ingrese la URL de la imagen:');
    if (url && isValidUrl(url)) {
      if (images.length < maxImages) {
        onImagesChange([...images, url]);
        if (!mainImage) {
          onMainImageChange?.(url);
        }
      } else {
        setErrors([`Máximo ${maxImages} imágenes permitidas.`]);
        setTimeout(() => setErrors([]), 5000);
      }
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        onDrop={(e) => {
          e.preventDefault();
          handleFileSelect(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
      >
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="mt-2 block text-sm font-medium text-gray-900">
              Haga clic para cargar o arrastre imágenes aquí
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              multiple
              accept={acceptedFormats.join(',')}
              onChange={(e) => handleFileSelect(e.target.files)}
              disabled={isUploading || images.length >= maxImages}
            />
          </label>
          <p className="text-xs text-gray-500">
            o pegue imágenes con Ctrl+V
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, WebP hasta {maxSizeMB}MB • Máx {maxImages} imágenes
          </p>
        </div>
        
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleUrlAdd}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Agregar desde URL
          </button>
        </div>
      </div>

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
                Error al cargar imágenes
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

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group cursor-move"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewImage(image)}
                  className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                  title="Ver imagen"
                >
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                </button>
                
                {onMainImageChange && (
                  <button
                    type="button"
                    onClick={() => handleSetMainImage(image)}
                    className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Establecer como principal"
                  >
                    {mainImage === image ? (
                      <StarIconSolid className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <StarIcon className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-1.5 bg-white rounded-full text-red-600 hover:bg-red-50"
                  title="Eliminar"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
              
              {/* Main Image Badge */}
              {mainImage === image && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                  Principal
                </div>
              )}
              
              {/* Image Number */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && !isUploading && (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay imágenes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Comience cargando algunas imágenes del producto
          </p>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={() => setPreviewImage(null)}
        >
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black opacity-75"></div>
            <div className="relative max-w-4xl max-h-[90vh]">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}