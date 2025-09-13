import React, { useState, useEffect, useRef } from 'react';
import {
  MapPinIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MapLocation {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  region: string;
  city: string;
}

interface InteractiveMapEditorProps {
  locations: MapLocation[];
  selectedLocation?: MapLocation;
  onLocationSelect: (location: MapLocation) => void;
  onLocationAdd: (location: Omit<MapLocation, 'id'>) => void;
  onLocationUpdate: (id: string, location: Partial<MapLocation>) => void;
  onLocationDelete: (id: string) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  readonly?: boolean;
}

export default function InteractiveMapEditor({
  locations = [],
  selectedLocation,
  onLocationSelect,
  onLocationAdd,
  onLocationUpdate,
  onLocationDelete,
  center = { lat: -33.4489, lng: -70.6693 }, // Santiago default
  zoom = 6,
  readonly = false
}: InteractiveMapEditorProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MapLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [newLocationForm, setNewLocationForm] = useState({
    name: '',
    description: '',
    region: '',
    city: '',
    latitude: 0,
    longitude: 0
  });

  // Chilean regions for dropdown
  const chileanRegions = [
    'Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo',
    'Valparaíso', 'Metropolitana', 'O\'Higgins', 'Maule', 'Ñuble', 'Biobío',
    'Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'
  ];

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapReady) return;

    // Since we're in development, let's create a placeholder map
    // In production, you would integrate with Google Maps, Leaflet, or Mapbox
    const createPlaceholderMap = () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div class="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div class="text-center">
              <MapPinIcon class="mx-auto h-12 w-12 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">Mapa Interactivo</h3>
              <p class="mt-1 text-sm text-gray-500">
                Vista de mapa de Chile con ubicaciones marcadas
              </p>
              <div class="mt-4 text-xs text-gray-400">
                Coordenadas: ${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}
                <br />
                Zoom: ${zoom}x
              </div>
            </div>
          </div>
        `;
        setMapReady(true);
      }
    };

    createPlaceholderMap();
  }, [center, zoom, mapReady]);

  // Handle map click to add new location
  const handleMapClick = (event: React.MouseEvent) => {
    if (!isAddingLocation || readonly) return;
    
    // Simulate getting coordinates from click
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert pixel coordinates to lat/lng (simplified)
    const lat = center.lat + (0.5 - y / rect.height) * 10;
    const lng = center.lng + (x / rect.width - 0.5) * 20;
    
    setNewLocationForm(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
  };

  // Search locations
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form submission
  const handleSubmitNewLocation = () => {
    if (!newLocationForm.name || !newLocationForm.region || !newLocationForm.city) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    onLocationAdd({
      name: newLocationForm.name,
      description: newLocationForm.description,
      region: newLocationForm.region,
      city: newLocationForm.city,
      latitude: newLocationForm.latitude,
      longitude: newLocationForm.longitude
    });

    // Reset form
    setNewLocationForm({
      name: '',
      description: '',
      region: '',
      city: '',
      latitude: 0,
      longitude: 0
    });
    setIsAddingLocation(false);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Editor de Mapa Interactivo
          </h3>
          {!readonly && (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsAddingLocation(!isAddingLocation)}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                  isAddingLocation
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isAddingLocation ? (
                  <>
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar Ubicación
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar ubicaciones..."
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Map Area */}
        <div className="flex-1 p-6">
          <div
            ref={mapRef}
            className="w-full h-96 bg-gray-50 rounded-lg cursor-pointer"
            onClick={handleMapClick}
          />
          
          {isAddingLocation && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-800 mb-3">
                Agregar Nueva Ubicación
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newLocationForm.name}
                    onChange={(e) => setNewLocationForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ej: Valle de Casablanca"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Región *
                  </label>
                  <select
                    value={newLocationForm.region}
                    onChange={(e) => setNewLocationForm(prev => ({ ...prev, region: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar región...</option>
                    {chileanRegions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={newLocationForm.city}
                    onChange={(e) => setNewLocationForm(prev => ({ ...prev, city: e.target.value }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ej: Casablanca"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Latitud
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newLocationForm.latitude}
                      onChange={(e) => setNewLocationForm(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Longitud
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newLocationForm.longitude}
                      onChange={(e) => setNewLocationForm(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={newLocationForm.description}
                    onChange={(e) => setNewLocationForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Descripción de la ubicación..."
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => setIsAddingLocation(false)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmitNewLocation}
                  className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <CheckIcon className="h-4 w-4 mr-1 inline" />
                  Agregar Ubicación
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Locations List */}
        <div className="w-80 border-l border-gray-200">
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Ubicaciones ({filteredLocations.length})
            </h4>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedLocation?.id === location.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onLocationSelect(location)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {location.name}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {location.city}, {location.region}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    </div>
                    
                    {!readonly && (
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLocation(location);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <PencilIcon className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (location.id && window.confirm('¿Está seguro de eliminar esta ubicación?')) {
                              onLocationDelete(location.id);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredLocations.length === 0 && (
                <div className="text-center py-8">
                  <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay ubicaciones
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? 'No se encontraron resultados' : 'Comience agregando una ubicación'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}