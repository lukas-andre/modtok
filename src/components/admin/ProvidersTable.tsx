import React from 'react';
import DataTable from './catalog/DataTable';
import { Badge } from '@/components/ui/badge';

interface Provider {
  id: string;
  company_name: string;
  logo_url: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  region: string | null;
  status: string;
  tier: string;
  years_experience: number | null;
  specialties: string[] | null;
  views_count: number | null;
  inquiries_count: number | null;
  clicks_count: number | null;
  internal_rating: number | null;
  provider_categories: Array<{ category_type: string }>;
}

interface ProvidersTableProps {
  providers: Provider[];
  userRole: string;
}

const formatCategoryName = (categoryType: string) => {
  const categoryNames: Record<string, string> = {
    'casas': 'Casas Modulares',
    'fabrica': 'Fábrica',
    'habilitacion_servicios': 'Habilitación y Servicios'
  };
  return categoryNames[categoryType] || categoryType;
};

const getCategoryVariant = (categoryType: string) => {
  const variants: Record<string, 'primary' | 'secondary' | 'success'> = {
    'casas': 'primary',
    'fabrica': 'secondary',
    'habilitacion_servicios': 'success'
  };
  return variants[categoryType] || 'neutral' as const;
};

export default function ProvidersTable({ providers, userRole }: ProvidersTableProps) {
  const columns = [
    {
      key: 'company_name',
      label: 'Proveedor',
      sortable: true,
      render: (_: any, row: Provider) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {row.logo_url ? (
              <img
                className="h-12 w-12 rounded-lg object-cover shadow-apple-sm"
                src={row.logo_url}
                alt={row.company_name}
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-accent-blue to-accent-blue-dark flex items-center justify-center shadow-apple-sm">
                <span className="text-lg font-bold text-white">
                  {row.company_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <a
              href={`/admin/providers/${row.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-accent-blue transition-colors block truncate"
            >
              {row.company_name}
            </a>
            {row.years_experience && (
              <div className="text-xs text-gray-500 mt-0.5">
                {row.years_experience} años exp.
              </div>
            )}
            {row.specialties && row.specialties.length > 0 && (
              <div className="text-xs text-accent-blue mt-0.5 truncate">
                {row.specialties.slice(0, 2).join(', ')}
                {row.specialties.length > 2 && '...'}
              </div>
            )}
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      key: 'provider_categories',
      label: 'Categoría',
      render: (_: any, row: Provider) => (
        <div className="flex flex-wrap gap-1">
          {row.provider_categories && row.provider_categories.length > 0 ? (
            row.provider_categories.map((pc, idx) => (
              <Badge key={idx} variant={getCategoryVariant(pc.category_type)} size="sm">
                {formatCategoryName(pc.category_type)}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400">Sin categorías</span>
          )}
        </div>
      ),
      width: '200px'
    },
    {
      key: 'email',
      label: 'Contacto',
      render: (_: any, row: Provider) => (
        <div className="text-sm">
          <div className="text-gray-900 font-medium truncate">{row.email}</div>
          {row.phone && <div className="text-gray-500 text-xs mt-0.5">{row.phone}</div>}
          {row.city && row.region && (
            <div className="text-gray-500 text-xs mt-0.5">
              {row.city}, {row.region}
            </div>
          )}
        </div>
      ),
      width: '220px'
    },
    {
      key: 'tier',
      label: 'Nivel',
      sortable: true,
      render: (_: any, row: Provider) => (
        <div className="flex flex-col gap-1.5">
          <Badge
            variant={
              row.tier === 'destacado' ? 'gold' :
              row.tier === 'premium' ? 'primary' :
              'neutral'
            }
            size="sm"
          >
            {row.tier === 'destacado' ? 'Destacado' :
             row.tier === 'premium' ? 'Premium' :
             'Estándar'}
          </Badge>
          {row.internal_rating && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < (row.internal_rating || 0) ? 'text-accent-gold' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
      ),
      width: '140px'
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      width: '120px'
    },
    {
      key: 'metrics',
      label: 'Métricas',
      render: (_: any, row: Provider) => (
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{row.views_count || 0} vistas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{row.inquiries_count || 0} consultas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span>{row.clicks_count || 0} clicks</span>
          </div>
        </div>
      ),
      width: '160px'
    },
  ];

  const handleView = (provider: Provider) => {
    window.location.href = `/admin/providers/${provider.id}`;
  };

  const handleEdit = (provider: Provider) => {
    window.location.href = `/admin/providers/${provider.id}/edit`;
  };

  const handleDelete = async (provider: Provider) => {
    if (!confirm(`¿Estás seguro que deseas eliminar al proveedor "${provider.company_name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/providers/${provider.id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        alert('Error al eliminar proveedor: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión al eliminar proveedor');
    }
  };

  return (
    <DataTable
      data={providers}
      columns={columns}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={userRole === 'super_admin' ? handleDelete : undefined}
      searchable
      selectable
    />
  );
}
