import React from 'react';
import DataTable from './catalog/DataTable';
import { Badge } from '@/components/ui/badge';

interface House {
  id: string;
  name: string;
  slug: string;
  model_code: string | null;
  main_image_url: string | null;
  area_m2: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  price: number | null;
  price_per_m2: number | null;
  status: string;
  tier: string;
  views_count: number | null;
  clicks_count: number | null;
  inquiries_count: number | null;
  saves_count: number | null;
  provider: {
    company_name: string;
    slug: string;
  } | null;
  topology: {
    code: string;
    bedrooms: number;
    bathrooms: number;
  } | null;
}

interface HousesTableProps {
  houses: House[];
  userRole: string;
}

export default function HousesTable({ houses, userRole }: HousesTableProps) {
  const columns = [
    {
      key: 'name',
      label: 'Casa',
      sortable: true,
      render: (_: any, row: House) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {row.main_image_url ? (
              <img
                className="h-16 w-16 rounded-lg object-cover shadow-apple-sm"
                src={row.main_image_url}
                alt={row.name}
              />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-apple-sm">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <a
              href={`/admin/catalog/houses/${row.id}/edit`}
              className="text-sm font-semibold text-gray-900 hover:text-accent-blue transition-colors block truncate"
            >
              {row.name}
            </a>
            {row.model_code && (
              <div className="text-xs text-gray-500 mt-0.5">
                Modelo: {row.model_code}
              </div>
            )}
            {row.area_m2 && (
              <div className="text-xs text-accent-blue mt-0.5 font-medium">
                {row.area_m2}m²
              </div>
            )}
          </div>
        </div>
      ),
      width: '300px'
    },
    {
      key: 'provider',
      label: 'Fabricante',
      render: (_: any, row: House) => (
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
      key: 'topology',
      label: 'Topología',
      render: (_: any, row: House) => (
        <div className="text-sm">
          {row.topology ? (
            <div>
              <div className="font-semibold text-gray-900">{row.topology.code}</div>
              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                <span className="flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  {row.topology.bedrooms}
                </span>
                <span className="flex items-center gap-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {row.topology.bathrooms}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-gray-400 italic">N/A</span>
          )}
        </div>
      ),
      width: '140px'
    },
    {
      key: 'price',
      label: 'Precio',
      sortable: true,
      render: (_: any, row: House) => (
        <div className="text-sm">
          <div className="font-bold text-gray-900">
            {row.price ? `$${row.price.toLocaleString('es-CL')}` : 'Sin precio'}
          </div>
          {row.price_per_m2 && (
            <div className="text-xs text-gray-500 mt-0.5">
              ${row.price_per_m2.toLocaleString('es-CL')}/m²
            </div>
          )}
        </div>
      ),
      width: '140px'
    },
    {
      key: 'tier',
      label: 'Nivel',
      sortable: true,
      render: (_: any, row: House) => (
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
      render: (_: any, row: House) => (
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{row.saves_count || 0} favoritos</span>
          </div>
        </div>
      ),
      width: '160px'
    },
  ];

  const handleView = (house: House) => {
    window.location.href = `/casas/${house.slug}`;
  };

  const handleEdit = (house: House) => {
    window.location.href = `/admin/catalog/houses/${house.id}/edit`;
  };

  const handleDuplicate = async (house: House) => {
    if (!confirm(`¿Deseas duplicar la casa "${house.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/houses/${house.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        alert('Error al duplicar casa: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión al duplicar casa');
    }
  };

  const handleDelete = async (house: House) => {
    if (!confirm(`¿Estás seguro que deseas eliminar la casa "${house.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/houses/${house.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success) {
        window.location.reload();
      } else {
        alert('Error al eliminar casa: ' + result.error);
      }
    } catch (error) {
      alert('Error de conexión al eliminar casa');
    }
  };

  return (
    <DataTable
      data={houses}
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
