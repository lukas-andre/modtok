import React from 'react';
import DataTable from './catalog/DataTable';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  status: string;
  phone: string | null;
  company_name: string | null;
  created_at: string | null;
  last_login_at: string | null;
}

interface UsersTableProps {
  users: User[];
  userRole: string;
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    'super_admin': 'Super Admin',
    'admin': 'Admin',
    'provider': 'Proveedor',
    'user': 'Usuario'
  };
  return labels[role] || role;
};

const getRoleVariant = (role: string) => {
  const variants: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'gold'> = {
    'super_admin': 'gold',
    'admin': 'warning',
    'provider': 'primary',
    'user': 'secondary'
  };
  return variants[role] || 'neutral' as const;
};

export default function UsersTable({ users, userRole }: UsersTableProps) {
  const columns = [
    {
      key: 'full_name',
      label: 'Usuario',
      sortable: true,
      render: (_: any, row: User) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {row.avatar_url ? (
              <img
                className="h-12 w-12 rounded-full object-cover shadow-apple-sm ring-2 ring-gray-100"
                src={row.avatar_url}
                alt={row.full_name}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-blue-dark flex items-center justify-center shadow-apple-sm ring-2 ring-gray-100">
                <span className="text-lg font-bold text-white">
                  {row.full_name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <a
              href={`/admin/users/${row.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-accent-blue transition-colors block truncate"
            >
              {row.full_name}
            </a>
            {row.company_name && (
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                {row.company_name}
              </div>
            )}
            {row.phone && (
              <div className="text-xs text-accent-blue mt-0.5">
                {row.phone}
              </div>
            )}
          </div>
        </div>
      ),
      width: '280px'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (_: any, row: User) => (
        <div className="text-sm text-gray-900 truncate max-w-xs">
          {row.email}
        </div>
      ),
      width: '220px'
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (_: any, row: User) => (
        <Badge variant={getRoleVariant(row.role)} size="sm">
          {getRoleLabel(row.role)}
        </Badge>
      ),
      width: '140px'
    },
    {
      key: 'status',
      label: 'Estado',
      sortable: true,
      render: (_: any, row: User) => (
        <Badge
          variant={
            row.status === 'active' ? 'success' :
            row.status === 'inactive' ? 'neutral' :
            row.status === 'suspended' ? 'error' :
            'warning'
          }
          size="sm"
          withDot
        >
          {row.status === 'active' ? 'Activo' :
           row.status === 'inactive' ? 'Inactivo' :
           row.status === 'suspended' ? 'Suspendido' :
           'Pendiente'}
        </Badge>
      ),
      width: '120px'
    },
    {
      key: 'created_at',
      label: 'Registro',
      sortable: true,
      render: (_: any, row: User) => (
        <div className="text-sm text-gray-600">
          {row.created_at ? (
            <>
              <div className="font-medium">
                {new Date(row.created_at).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {new Date(row.created_at).toLocaleTimeString('es-CL', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </>
          ) : (
            <span className="text-gray-400 italic">Desconocido</span>
          )}
        </div>
      ),
      width: '140px'
    },
    {
      key: 'last_login_at',
      label: 'Último Acceso',
      sortable: true,
      render: (_: any, row: User) => (
        <div className="text-sm text-gray-600">
          {row.last_login_at ? (
            <div className="text-xs">
              {new Date(row.last_login_at).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          ) : (
            <span className="text-gray-400 italic text-xs">Nunca</span>
          )}
        </div>
      ),
      width: '120px'
    },
  ];

  const handleView = (user: User) => {
    window.location.href = `/admin/users/${user.id}`;
  };

  const handleEdit = (user: User) => {
    window.location.href = `/admin/users/${user.id}/edit`;
  };

  return (
    <DataTable
      data={users}
      columns={columns}
      onView={handleView}
      onEdit={userRole === 'super_admin' || userRole === 'admin' ? handleEdit : undefined}
      searchable
      selectable
    />
  );
}
