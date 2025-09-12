import { useState, useEffect } from 'react';

interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description: string;
  order: number;
}

interface ProviderGalleryManagerProps {
  providerId: string;
  initialImages?: string[];
  onImagesChange?: (images: string[]) => void;
}

export default function ProviderGalleryManager({ 
  providerId, 
  initialImages = [], 
  onImagesChange 
}: ProviderGalleryManagerProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize images from props
  useEffect(() => {
    const galleryImages = initialImages.map((url, index) => ({
      id: `img-${index}`,
      url,
      title: '',
      description: '',
      order: index
    }));
    setImages(galleryImages);
  }, [initialImages]);

  // Update parent component when images change
  useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images.map(img => img.url));
    }
  }, [images, onImagesChange]);

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('providerId', providerId);
        formData.append('imageType', 'gallery');

        const response = await fetch('/api/admin/providers/upload-image', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          const newImage: GalleryImage = {
            id: `img-${Date.now()}-${Math.random()}`,
            url: result.url,
            title: file.name.split('.')[0],
            description: '',
            order: images.length
          };
          setImages(prev => [...prev, newImage]);
        } else {
          alert(`Error uploading ${file.name}: ${result.error}`);
        }
      } catch (error) {
        alert(`Error uploading ${file.name}`);
      }
    }

    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = async (imageIndex: number) => {
    const image = images[imageIndex];
    
    if (confirm('¿Estás seguro que deseas eliminar esta imagen?')) {
      try {
        const response = await fetch('/api/admin/providers/upload-image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: image.url,
            providerId: providerId,
            imageType: 'gallery'
          })
        });

        const result = await response.json();
        if (result.success) {
          setImages(prev => prev.filter((_, i) => i !== imageIndex));
        } else {
          alert('Error al eliminar imagen: ' + result.error);
        }
      } catch (error) {
        alert('Error de conexión al eliminar imagen');
      }
    }
  };

  const updateImageInfo = (index: number, field: 'title' | 'description', value: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, [field]: value } : img
    ));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return newImages.map((img, index) => ({ ...img, order: index }));
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      reorderImages(draggedIndex, dropIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Galería de Imágenes</h3>
        <span className="text-sm text-gray-500">{images.length} imágenes</span>
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Subiendo imágenes...' : 'Arrastra imágenes aquí'}
            </p>
            <p className="text-gray-600">o</p>
            <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">
              Seleccionar archivos
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                disabled={uploading}
              />
            </label>
          </div>
          <p className="text-sm text-gray-500">
            PNG, JPG, WebP hasta 5MB cada una
          </p>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleImageDrop(e, index)}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="relative group">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={() => window.open(image.url, '_blank')}
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-600"
                      title="Ver imagen completa"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600"
                      title="Eliminar imagen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white bg-opacity-75 text-gray-600 text-xs px-2 py-1 rounded cursor-move">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={image.title}
                    onChange={(e) => updateImageInfo(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Título de la imagen"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={image.description}
                    onChange={(e) => updateImageInfo(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción opcional"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">No hay imágenes en la galería</p>
          <p className="text-gray-400 text-sm mt-1">Sube algunas imágenes para mostrar el trabajo del proveedor</p>
        </div>
      )}
    </div>
  );
}