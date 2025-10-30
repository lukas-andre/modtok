import { useState, useEffect } from 'react';
import ManufacturerFilters from './ManufacturerFilters';
import ManufacturerCard from './ManufacturerCard';
import Pagination from './Pagination';

interface Manufacturer {
  provider_id: string;
  company_name: string;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  hq_region_code: string | null;
  regions: string[];

  // Servicios
  dise_std: boolean;
  dise_pers: boolean;
  insta_premontada: boolean;
  contr_terreno: boolean;
  instalacion: boolean;
  kit_autocons: boolean;
  ases_tecnica: boolean;
  ases_legal: boolean;
  logist_transporte: boolean;
  financiamiento: boolean;

  // Especialidad
  tiny_houses: boolean;
  modulares_sip: boolean;
  modulares_container: boolean;
  modulares_hormigon: boolean;
  modulares_madera: boolean;
  prefabricada_tradicional: boolean;
  oficinas_modulares: boolean;

  // Generales
  llave_en_mano: boolean;
  publica_precios: boolean;
  price_m2_min: number | null;
  price_m2_max: number | null;

  // Meta
  has_verified: boolean;
  house_count: number;
  house_premium_count: number;
  verified_by_admin: boolean;
  experiencia_years: number | null;
}

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

export default function ManufacturersGrid() {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState<Filters>({
    regions: [],
    servicios: [],
    especialidad: [],
    llave_en_mano: null,
    publica_precios: null,
    price_m2_min: null,
    price_m2_max: null,
    verifiedOnly: false,
    sort: 'house_count'
  });

  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchManufacturers();
  }, [page, filters]);

  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '30');
      params.append('sort', filters.sort);

      if (filters.regions.length > 0) {
        params.append('regions', filters.regions.join(','));
      }
      if (filters.servicios.length > 0) {
        params.append('servicios', filters.servicios.join(','));
      }
      if (filters.especialidad.length > 0) {
        params.append('especialidad', filters.especialidad.join(','));
      }
      if (filters.llave_en_mano !== null) {
        params.append('llave_en_mano', filters.llave_en_mano.toString());
      }
      if (filters.publica_precios !== null) {
        params.append('publica_precios', filters.publica_precios.toString());
      }
      if (filters.price_m2_min !== null) {
        params.append('price_m2_min', filters.price_m2_min.toString());
      }
      if (filters.price_m2_max !== null) {
        params.append('price_m2_max', filters.price_m2_max.toString());
      }
      if (filters.verifiedOnly) {
        params.append('verifiedOnly', 'true');
      }

      const response = await fetch(`/api/manufacturers?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar fabricantes');
      }

      const data = await response.json();

      setManufacturers(data.manufacturers || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);

    } catch (err: any) {
      setError(err.message || 'Error al cargar fabricantes');
      console.error('Error fetching manufacturers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
        >
          <span className="text-sm font-medium text-gray-700">
            Filtros {total > 0 && `(${total} resultados)`}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${filtersOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`
        lg:w-80 lg:flex-shrink-0
        ${filtersOpen ? 'block' : 'hidden lg:block'}
      `}>
        <div className="sticky top-4">
          <ManufacturerFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            resultsCount={total}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Cargando...' : `${total} Fabricantes`}
            </h2>
            {!loading && manufacturers.length > 0 && (
              <p className="mt-1 text-sm text-gray-600">
                Página {page} de {totalPages}
              </p>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-gray-600 hidden sm:block">
              Ordenar:
            </label>
            <select
              id="sort"
              value={filters.sort}
              onChange={(e) => handleFilterChange({ sort: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="house_count">Más modelos</option>
              <option value="premium_first">Premium primero</option>
              <option value="price_m2_min">Precio más bajo</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="bg-white p-4 rounded-b-lg border border-gray-200">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && manufacturers.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No se encontraron fabricantes</h3>
            <p className="mt-2 text-sm text-gray-600">
              Intenta ajustar los filtros para ver más resultados
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && manufacturers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {manufacturers.map((manufacturer) => (
                <ManufacturerCard
                  key={manufacturer.provider_id}
                  manufacturer={manufacturer}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
