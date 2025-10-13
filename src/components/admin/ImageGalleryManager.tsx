import { useState } from 'react';

interface Props {
  mainImage: string;
  galleryImages: string[];
  onMainImageChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
}

export default function ImageGalleryManager({
  mainImage,
  galleryImages,
  onMainImageChange,
  onGalleryChange
}: Props) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      onGalleryChange([...galleryImages, newImageUrl.trim()]);
      setNewImageUrl('');
      setShowUrlInput(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index);
    onGalleryChange(updated);
  };

  const handleSetAsMain = (url: string) => {
    onMainImageChange(url);
  };

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagen Principal *
        </label>
        <div className="flex items-start space-x-4">
          {mainImage && (
            <div className="relative w-48 h-48 border-2 border-blue-500 rounded-lg overflow-hidden">
              <img
                src={mainImage}
                alt="Imagen principal"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Principal
              </div>
            </div>
          )}
          <div className="flex-1">
            <input
              type="url"
              value={mainImage}
              onChange={(e) => onMainImageChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta imagen se mostrará en tarjetas y listados
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Images */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Galería de Imágenes ({galleryImages.length})
          </label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
          >
            + Agregar Imagen
          </button>
        </div>

        {showUrlInput && (
          <div className="mb-4 flex items-center space-x-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => {
                setNewImageUrl('');
                setShowUrlInput(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        )}

        {galleryImages.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative w-full h-40 border border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Galería ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleSetAsMain(url)}
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                      title="Establecer como principal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1 truncate">{index + 1}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500">No hay imágenes en la galería</p>
            <p className="text-xs text-gray-400 mt-1">Haz clic en "Agregar Imagen" para empezar</p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
        💡 <strong>Tip:</strong> Las imágenes se mostrarán en el orden que aparecen aquí. La imagen principal también aparecerá automáticamente en la galería.
      </div>
    </div>
  );
}
