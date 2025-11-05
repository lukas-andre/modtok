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
  hq_region_code: string | null;
  status: string;
  is_manufacturer: boolean;
  is_service_provider: boolean;
}

interface ProvidersTableProps {
  providers: Provider[];
  userRole: string;
}

// Helper function removed - categories now based on boolean flags

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
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      key: 'roles',
      label: 'Roles',
      render: (_: any, row: Provider) => (
        <div className="flex flex-wrap gap-1">
          {row.is_manufacturer && (
            <Badge variant="secondary" size="sm">
              Fabricante
            </Badge>
          )}
          {row.is_service_provider && (
            <Badge variant="success" size="sm">
              Servicios H&S
            </Badge>
          )}
          {!row.is_manufacturer && !row.is_service_provider && (
            <span className="text-xs text-gray-400">Sin rol</span>
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
          {row.city && row.hq_region_code && (
            <div className="text-gray-500 text-xs mt-0.5">
              {row.city}, {row.hq_region_code}
            </div>
          )}
        </div>
      ),
      width: '220px'
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      width: '120px'
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
