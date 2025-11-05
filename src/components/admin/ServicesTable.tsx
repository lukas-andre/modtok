import React from 'react';
import DataTable from './catalog/DataTable';
import { Badge } from '@/components/ui/badge';

interface Service {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  main_image_url: string | null;
  price_from: number | null;
  price_to: number | null;
  price_unit: string | null;
  coverage_areas: string[] | null;
  is_available: boolean | null;
  status: string;
  tier: string;
  views_count: number | null;
  clicks_count: number | null;
  inquiries_count: number | null;
  provider: {
    company_name: string;
    slug: string;
  } | null;
}

interface ServicesTableProps {
  services: Service[];
  userRole: string;
}

export default function ServicesTable({ services, userRole }: ServicesTableProps) {
  const columns = [
    {
      key: 'name',
      label: 'Servicio',
      sortable: true,
      render: (_: any, row: Service) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {row.main_image_url ? (
              <img
                className="h-16 w-16 rounded-lg object-cover shadow-apple-sm"
                src={row.main_image_url}
                alt={row.name}
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-accent-blue-pale to-accent-blue/10 flex items-center justify-center shadow-apple-sm">
                <svg className="w-8 h-8 text-accent-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <a
              href={`/admin/catalog/services/${row.id}/edit`}
              className="text-sm font-semibold text-gray-900 hover:text-accent-blue transition-colors block truncate"
            >
              {row.name}
            </a>
            {row.coverage_areas && row.coverage_areas.length > 0 && (
              <div className="text-xs text-accent-blue mt-0.5 truncate">
                {row.coverage_areas.slice(0, 2).join(', ')}
                {row.coverage_areas.length > 2 && ` +${row.coverage_areas.length - 2}`}
              </div>
            )}
          </div>
        </div>
      ),
      width: '300px'
    },
    {
      key: 'provider',
      label: 'Proveedor',
      render: (_: any, row: Service) => (
        <div className="text-sm">
          {row.provider ? (
            <a
              href={`/admin/providers/${row.provider.slug}`}
              className="text-gray-900 hover:text-accent-blue font-medium transition-colors"
            >
              {row.provider.company_name}
            </a>
          ) : (
            <span className="text-gray-400 italic">Sin asignar</span>
          )}
        </div>
      ),
      width: '180px'
    },
    {
      key: 'price',
      label: 'Precio',
      sortable: true,
      render: (_: any, row: Service) => (
        <div className="text-sm">
          {row.price_from && row.price_to ? (
            <>
              <div className="font-bold text-gray-900">
                ${row.price_from.toLocaleString('es-CL')} - ${row.price_to.toLocaleString('es-CL')}
              </div>
              {row.price_unit && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {row.price_unit}
                </div>
              )}
            </>
          ) : row.price_from ? (
            <>
              <div className="font-bold text-gray-900">
                Desde ${row.price_from.toLocaleString('es-CL')}
              </div>
              {row.price_unit && (
                <div className="text-xs text-gray-500 mt-0.5">
                  {row.price_unit}
                </div>
              )}
            </>
          ) : (
            <span className="text-gray-500 italic">Por cotizar</span>
          )}
        </div>
      ),
      width: '160px'
    },
    {
      key: 'is_available',
      label: 'Disponibilidad',
      render: (_: any, row: Service) => (
        <Badge
          variant={row.is_available ? 'success' : 'neutral'}
          size="sm"
          withDot
        >
          {row.is_available ? 'Disponible' : 'No disponible'}
        </Badge>
      ),
      width: '140px'
    },
    {
      key: 'tier',
      label: 'Nivel',
      sortable: true,
      render: (_: any, row: Service) => (
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
      ),
      width: '120px'
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
      render: (_: any, row: Service) => (
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

  const handleView = (service: Service) => {
    window.location.href = `/servicios/${service.slug}`;
  };

  const handleEdit = (service: Service) => {
    window.location.href = `/admin/catalog/services/${service.id}/edit`;
  };

  const handleDuplicate = async (service: Service) => {
    if (!confirm(`¿Deseas duplicar el servicio "${service.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/services/${service.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        alert('Error al duplicar servicio: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión al duplicar servicio');
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`¿Estás seguro que deseas eliminar el servicio "${service.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/services/${service.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        alert('Error al eliminar servicio: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión al eliminar servicio');
    }
  };

  return (
    <DataTable
      data={services}
      columns={columns}
      onView={handleView}
      onEdit={handleEdit}
      onDuplicate={userRole === 'super_admin' ? handleDuplicate : undefined}
      onDelete={userRole === 'super_admin' ? handleDelete : undefined}
      searchable
      selectable
    />
  );
}
