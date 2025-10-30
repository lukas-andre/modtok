import { useState } from 'react';

const CHILEAN_REGIONS = [
  { code: 'XV', name: 'Arica y Parinacota' },
  { code: 'I', name: 'Tarapacá' },
  { code: 'II', name: 'Antofagasta' },
  { code: 'III', name: 'Atacama' },
  { code: 'IV', name: 'Coquimbo' },
  { code: 'V', name: 'Valparaíso' },
  { code: 'RM', name: 'Metropolitana' },
  { code: 'VI', name: "O'Higgins" },
  { code: 'VII', name: 'Maule' },
  { code: 'XVI', name: 'Ñuble' },
  { code: 'VIII', name: 'Biobío' },
  { code: 'IX', name: 'Araucanía' },
  { code: 'XIV', name: 'Los Ríos' },
  { code: 'X', name: 'Los Lagos' },
  { code: 'XI', name: 'Aisén' },
  { code: 'XII', name: 'Magallanes' }
];

const SERVICIOS_OPTIONS = [
  { key: 'dise_std', label: 'Diseño Estándar' },
  { key: 'dise_pers', label: 'Diseño Personalizado' },
  { key: 'instalacion', label: 'Instalación' },
  { key: 'financiamiento', label: 'Financiamiento' },
  { key: 'ases_tecnica', label: 'Asesoría Técnica' },
  { key: 'logist_transporte', label: 'Transporte' }
];

const ESPECIALIDAD_OPTIONS = [
  { key: 'tiny_houses', label: 'Tiny Houses' },
  { key: 'modulares_sip', label: 'Modulares SIP' },
  { key: 'modulares_container', label: 'Container' },
  { key: 'modulares_madera', label: 'Madera' },
  { key: 'modulares_hormigon', label: 'Hormigón' },
  { key: 'prefabricada_tradicional', label: 'Prefabricadas' },
  { key: 'oficinas_modulares', label: 'Oficinas' }
];

interface Filters {
  regions: string[];
  servicios: string[];
  especialidad: string[];
  llave_en_mano: boolean | null;
  publica_precios: boolean | null;
  price_m2_min: number | null;
  price_m2_max: number | null;
  verifiedOnly: boolean;
  sort: string;
}

interface ManufacturerFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  resultsCount: number;
}

export default function ManufacturerFilters({
  filters,
  onFilterChange,
  resultsCount
}: ManufacturerFiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    regions: true,
    servicios: true,
    especialidad: true,
    price: false,
    other: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleRegion = (code: string) => {
    const newRegions = filters.regions.includes(code)
      ? filters.regions.filter(r => r !== code)
      : [...filters.regions, code];
    onFilterChange({ regions: newRegions });
  };

  const toggleServicio = (key: string) => {
    const newServicios = filters.servicios.includes(key)
      ? filters.servicios.filter(s => s !== key)
      : [...filters.servicios, key];
    onFilterChange({ servicios: newServicios });
  };

  const toggleEspecialidad = (key: string) => {
    const newEspecialidad = filters.especialidad.includes(key)
      ? filters.especialidad.filter(e => e !== key)
      : [...filters.especialidad, key];
    onFilterChange({ especialidad: newEspecialidad });
  };

  const clearAllFilters = () => {
    onFilterChange({
      regions: [],
      servicios: [],
      especialidad: [],
      llave_en_mano: null,
      publica_precios: null,
      price_m2_min: null,
      price_m2_max: null,
      verifiedOnly: false
    });
  };

  const hasActiveFilters =
    filters.regions.length > 0 ||
    filters.servicios.length > 0 ||
    filters.especialidad.length > 0 ||
    filters.llave_en_mano !== null ||
    filters.publica_precios !== null ||
    filters.price_m2_min !== null ||
    filters.price_m2_max !== null ||
    filters.verifiedOnly;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Limpiar todo
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600">{resultsCount} resultados</p>
      </div>

      <div className="divide-y divide-gray-200">
        {/* Solo Verificados */}
        <div className="p-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => onFilterChange({ verifiedOnly: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm font-medium text-gray-900">
              ✓ Solo verificados
            </span>
          </label>
          <p className="mt-1 ml-6 text-xs text-gray-500">
            Fabricantes con casas publicadas
          </p>
        </div>

        {/* Regiones */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('regions')}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-900">
              Regiones
              {filters.regions.length > 0 && (
                <span className="ml-2 text-primary">({filters.regions.length})</span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.regions ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.regions && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {CHILEAN_REGIONS.map((region) => (
                <label key={region.code} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.regions.includes(region.code)}
                    onChange={() => toggleRegion(region.code)}
                    className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{region.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Servicios */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('servicios')}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-900">
              Servicios
              {filters.servicios.length > 0 && (
                <span className="ml-2 text-primary">({filters.servicios.length})</span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.servicios ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.servicios && (
            <div className="mt-3 space-y-2">
              {SERVICIOS_OPTIONS.map((servicio) => (
                <label key={servicio.key} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.servicios.includes(servicio.key)}
                    onChange={() => toggleServicio(servicio.key)}
                    className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{servicio.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Especialidad */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('especialidad')}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-900">
              Especialidad
              {filters.especialidad.length > 0 && (
                <span className="ml-2 text-primary">({filters.especialidad.length})</span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.especialidad ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.especialidad && (
            <div className="mt-3 space-y-2">
              {ESPECIALIDAD_OPTIONS.map((esp) => (
                <label key={esp.key} className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.especialidad.includes(esp.key)}
                    onChange={() => toggleEspecialidad(esp.key)}
                    className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{esp.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Precio por m² */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-900">
              Precio por m²
              {(filters.price_m2_min || filters.price_m2_max) && (
                <span className="ml-2 text-primary">✓</span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.price && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Mínimo (CLP)
                </label>
                <input
                  type="number"
                  value={filters.price_m2_min || ''}
                  onChange={(e) => onFilterChange({
                    price_m2_min: e.target.value ? parseInt(e.target.value) : null
                  })}
                  placeholder="25,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Máximo (CLP)
                </label>
                <input
                  type="number"
                  value={filters.price_m2_max || ''}
                  onChange={(e) => onFilterChange({
                    price_m2_max: e.target.value ? parseInt(e.target.value) : null
                  })}
                  placeholder="45,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Otros Filtros */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('other')}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-sm font-semibold text-gray-900">
              Otros filtros
              {(filters.llave_en_mano || filters.publica_precios) && (
                <span className="ml-2 text-primary">✓</span>
              )}
            </span>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${expandedSections.other ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSections.other && (
            <div className="mt-3 space-y-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.llave_en_mano === true}
                  onChange={(e) => onFilterChange({
                    llave_en_mano: e.target.checked ? true : null
                  })}
                  className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Llave en Mano</span>
              </label>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.publica_precios === true}
                  onChange={(e) => onFilterChange({
                    publica_precios: e.target.checked ? true : null
                  })}
                  className="h-4 w-4 text-primary focus:ring-primary/20 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Publica Precios</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
