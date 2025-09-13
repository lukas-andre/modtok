import React, { useState, useEffect } from 'react';
import {
  CloudIcon,
  SunIcon,
  EyeDropperIcon,
  WindIcon,
  TemperatureIcon,
  ChartBarIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ClimateData {
  avg_temp_summer?: number;
  avg_temp_winter?: number;
  avg_rainfall_mm?: number;
  humidity_avg?: number;
  wind_speed_avg?: number;
  climate_data?: {
    temperature_range?: { min: number; max: number };
    seasons?: {
      summer?: { temp_min: number; temp_max: number; rainfall: number };
      winter?: { temp_min: number; temp_max: number; rainfall: number };
      spring?: { temp_min: number; temp_max: number; rainfall: number };
      autumn?: { temp_min: number; temp_max: number; rainfall: number };
    };
    weather_patterns?: string[];
    best_construction_months?: string[];
    climate_zone?: string;
    microclimate_notes?: string;
  };
}

interface DemographicsData {
  population?: number;
  population_density?: number;
  median_income?: number;
  education_index?: number;
  age_distribution?: {
    [ageRange: string]: number;
  };
  economic_indicators?: {
    unemployment_rate?: number;
    gdp_per_capita?: number;
    housing_demand_index?: number;
    construction_activity_level?: string;
  };
}

interface ClimateDataManagerProps {
  hotspotId: string;
  climateData: ClimateData;
  demographicsData: DemographicsData;
  onClimateUpdate: (data: ClimateData) => void;
  onDemographicsUpdate: (data: DemographicsData) => void;
  readonly?: boolean;
}

export default function ClimateDataManager({
  hotspotId,
  climateData = {},
  demographicsData = {},
  onClimateUpdate,
  onDemographicsUpdate,
  readonly = false
}: ClimateDataManagerProps) {
  const [activeTab, setActiveTab] = useState<'climate' | 'demographics'>('climate');
  const [editingClimate, setEditingClimate] = useState(false);
  const [editingDemographics, setEditingDemographics] = useState(false);
  const [tempClimateData, setTempClimateData] = useState<ClimateData>(climateData);
  const [tempDemographicsData, setTempDemographicsData] = useState<DemographicsData>(demographicsData);

  // Reset temp data when props change
  useEffect(() => {
    setTempClimateData(climateData);
  }, [climateData]);

  useEffect(() => {
    setTempDemographicsData(demographicsData);
  }, [demographicsData]);

  const handleClimateUpdate = () => {
    onClimateUpdate(tempClimateData);
    setEditingClimate(false);
  };

  const handleDemographicsUpdate = () => {
    onDemographicsUpdate(tempDemographicsData);
    setEditingDemographics(false);
  };

  const cancelClimateEdit = () => {
    setTempClimateData(climateData);
    setEditingClimate(false);
  };

  const cancelDemographicsEdit = () => {
    setTempDemographicsData(demographicsData);
    setEditingDemographics(false);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 py-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('climate')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'climate'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CloudIcon className="h-5 w-5 mr-2" />
            Datos Climáticos
          </button>
          <button
            onClick={() => setActiveTab('demographics')}
            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'demographics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Datos Demográficos
          </button>
        </nav>
      </div>

      {/* Climate Data Tab */}
      {activeTab === 'climate' && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Información Climática</h3>
            {!readonly && (
              <div className="flex space-x-2">
                {editingClimate ? (
                  <>
                    <button
                      onClick={handleClimateUpdate}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelClimateEdit}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingClimate(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                )}
              </div>
            )}
          </div>

          {editingClimate ? (
            <div className="space-y-6">
              {/* Basic Climate Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Temperatura promedio verano (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempClimateData.avg_temp_summer || ''}
                    onChange={(e) => setTempClimateData(prev => ({
                      ...prev,
                      avg_temp_summer: parseFloat(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Temperatura promedio invierno (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempClimateData.avg_temp_winter || ''}
                    onChange={(e) => setTempClimateData(prev => ({
                      ...prev,
                      avg_temp_winter: parseFloat(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Precipitaciones anuales (mm)
                  </label>
                  <input
                    type="number"
                    value={tempClimateData.avg_rainfall_mm || ''}
                    onChange={(e) => setTempClimateData(prev => ({
                      ...prev,
                      avg_rainfall_mm: parseInt(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Humedad promedio (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={tempClimateData.humidity_avg || ''}
                    onChange={(e) => setTempClimateData(prev => ({
                      ...prev,
                      humidity_avg: parseFloat(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Velocidad viento promedio (km/h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempClimateData.wind_speed_avg || ''}
                    onChange={(e) => setTempClimateData(prev => ({
                      ...prev,
                      wind_speed_avg: parseFloat(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Zona climática
                  </label>
                  <select
                    value={tempClimateData.climate_data?.climate_zone || ''}
                    onChange={(e) => setTempClimateData(prev => ({
                      ...prev,
                      climate_data: {
                        ...prev.climate_data,
                        climate_zone: e.target.value || undefined
                      }
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="mediterranean">Mediterráneo</option>
                    <option value="oceanic">Oceánico</option>
                    <option value="continental">Continental</option>
                    <option value="desert">Desértico</option>
                    <option value="temperate">Templado</option>
                    <option value="subtropical">Subtropical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mejores meses para construcción
                </label>
                <input
                  type="text"
                  value={tempClimateData.climate_data?.best_construction_months?.join(', ') || ''}
                  onChange={(e) => setTempClimateData(prev => ({
                    ...prev,
                    climate_data: {
                      ...prev.climate_data,
                      best_construction_months: e.target.value.split(',').map(m => m.trim()).filter(Boolean)
                    }
                  }))}
                  placeholder="Ej: Octubre, Noviembre, Diciembre, Enero, Febrero, Marzo"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notas de microclima
                </label>
                <textarea
                  rows={3}
                  value={tempClimateData.climate_data?.microclimate_notes || ''}
                  onChange={(e) => setTempClimateData(prev => ({
                    ...prev,
                    climate_data: {
                      ...prev.climate_data,
                      microclimate_notes: e.target.value || undefined
                    }
                  }))}
                  placeholder="Características especiales del microclima local..."
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Climate Display Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <SunIcon className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Temperatura Verano</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {climateData.avg_temp_summer ? `${climateData.avg_temp_summer}°C` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <TemperatureIcon className="h-8 w-8 text-indigo-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Temperatura Invierno</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {climateData.avg_temp_winter ? `${climateData.avg_temp_winter}°C` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-cyan-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CloudIcon className="h-8 w-8 text-cyan-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Precipitaciones</p>
                      <p className="text-2xl font-bold text-cyan-600">
                        {climateData.avg_rainfall_mm ? `${climateData.avg_rainfall_mm}mm` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-teal-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <EyeDropperIcon className="h-8 w-8 text-teal-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Humedad</p>
                      <p className="text-2xl font-bold text-teal-600">
                        {climateData.humidity_avg ? `${climateData.humidity_avg}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <WindIcon className="h-8 w-8 text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Velocidad Viento</p>
                      <p className="text-2xl font-bold text-gray-600">
                        {climateData.wind_speed_avg ? `${climateData.wind_speed_avg} km/h` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <SunIcon className="h-8 w-8 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Zona Climática</p>
                      <p className="text-lg font-bold text-green-600 capitalize">
                        {climateData.climate_data?.climate_zone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {climateData.climate_data?.best_construction_months && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Mejores meses para construcción</h4>
                  <div className="flex flex-wrap gap-2">
                    {climateData.climate_data.best_construction_months.map((month, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                      >
                        {month}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {climateData.climate_data?.microclimate_notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Notas de microclima</h4>
                  <p className="text-sm text-gray-600">{climateData.climate_data.microclimate_notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Demographics Data Tab */}
      {activeTab === 'demographics' && (
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Información Demográfica</h3>
            {!readonly && (
              <div className="flex space-x-2">
                {editingDemographics ? (
                  <>
                    <button
                      onClick={handleDemographicsUpdate}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Guardar
                    </button>
                    <button
                      onClick={cancelDemographicsEdit}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditingDemographics(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    Editar
                  </button>
                )}
              </div>
            )}
          </div>

          {editingDemographics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Población
                  </label>
                  <input
                    type="number"
                    value={tempDemographicsData.population || ''}
                    onChange={(e) => setTempDemographicsData(prev => ({
                      ...prev,
                      population: parseInt(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Densidad poblacional (hab/km²)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempDemographicsData.population_density || ''}
                    onChange={(e) => setTempDemographicsData(prev => ({
                      ...prev,
                      population_density: parseFloat(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ingreso mediano (CLP)
                  </label>
                  <input
                    type="number"
                    value={tempDemographicsData.median_income || ''}
                    onChange={(e) => setTempDemographicsData(prev => ({
                      ...prev,
                      median_income: parseInt(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Índice de educación (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={tempDemographicsData.education_index || ''}
                    onChange={(e) => setTempDemographicsData(prev => ({
                      ...prev,
                      education_index: parseFloat(e.target.value) || undefined
                    }))}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Población</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {demographicsData.population ? demographicsData.population.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-pink-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Densidad</p>
                    <p className="text-lg font-bold text-pink-600">
                      {demographicsData.population_density ? `${demographicsData.population_density} hab/km²` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-emerald-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ingreso Mediano</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {demographicsData.median_income ? `$${demographicsData.median_income.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Índice Educación</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {demographicsData.education_index ? demographicsData.education_index.toFixed(2) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}