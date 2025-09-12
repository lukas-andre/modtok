import React from 'react';
import { StatCard } from './StatCard';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { PendingApprovals } from './PendingApprovals';

// Mock data - in real app this would come from props or API
const mockStats = [
  {
    title: 'Proveedores',
    value: 12,
    trend: { value: 8.2, label: 'desde el mes pasado', isPositive: true },
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h4a1 1 0 011 1v5m-4-5V9a1 1 0 011-1h2a1 1 0 011 1v4.01"/>
      </svg>
    ),
  },
  {
    title: 'Casas',
    value: 84,
    trend: { value: 12.1, label: 'desde el mes pasado', isPositive: true },
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z"/>
      </svg>
    ),
  },
  {
    title: 'Consultas',
    value: 15,
    trend: { value: 5.4, label: 'desde la semana pasada', isPositive: true },
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z"/>
      </svg>
    ),
  },
  {
    title: 'Usuarios',
    value: 156,
    trend: { value: 3.2, label: 'desde el mes pasado', isPositive: true },
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
      </svg>
    ),
  },
];

const mockQuickActions = [
  {
    id: '1',
    title: 'Crear Proveedor',
    description: 'Agregar un nuevo proveedor a la plataforma',
    icon: '+',
    href: '/admin/providers/create',
  },
  {
    id: '2',
    title: 'Agregar Casa',
    description: 'Publicar una nueva casa en el catálogo',
    icon: '+',
    href: '/admin/content/houses/create',
  },
  {
    id: '3',
    title: 'Escribir Artículo',
    description: 'Crear un nuevo post para el blog',
    icon: '+',
    href: '/admin/content/blog/create',
  },
  {
    id: '4',
    title: 'Ver Reportes',
    description: 'Revisar estadísticas y analíticas',
    icon: '▦',
    href: '/admin/analytics',
  },
];

const mockActivities = [
  {
    id: '1',
    type: 'provider' as const,
    action: 'se registró en la plataforma',
    actor: 'Casa Modular SpA',
    target: 'Nuevo Proveedor',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'success' as const,
  },
  {
    id: '2',
    type: 'content' as const,
    action: 'publicó',
    actor: 'Admin',
    target: 'Casa Moderna 120m²',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: 'success' as const,
  },
  {
    id: '3',
    type: 'inquiry' as const,
    action: 'envió una consulta sobre',
    actor: 'Juan Pérez',
    target: 'Casa en Valparaíso',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    status: 'info' as const,
  },
];

const mockApprovals = [
  {
    id: '1',
    type: 'provider' as const,
    title: 'ModularHome Solutions',
    submittedBy: 'María González',
    submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    priority: 'high' as const,
    description: 'Solicitud de registro como proveedor premium',
  },
  {
    id: '2',
    type: 'house' as const,
    title: 'Casa Sustentable 90m²',
    submittedBy: 'EcoHomes',
    submittedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    priority: 'medium' as const,
    description: 'Nueva casa con certificación energética A+',
  },
];

interface AdminDashboardProps {
  user?: any;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const handleApproval = (id: string) => {
    console.log('Approving:', id);
    // Here you would make an API call to approve the item
  };

  const handleRejection = (id: string) => {
    console.log('Rejecting:', id);
    // Here you would make an API call to reject the item
  };

  const handleView = (id: string) => {
    console.log('Viewing:', id);
    // Here you would navigate to the item detail page
  };

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {mockStats.map((stat, index) => {
          const isConsultas = stat.title === 'Consultas';
          return (
            <div key={index} className={isConsultas ? 'relative' : ''}>
              <StatCard
                title={stat.title}
                value={stat.value}
                trend={stat.trend}
                icon={stat.icon}
                onClick={isConsultas ? undefined : () => {
                  // Navigate to relevant section
                  const routes = {
                    'Proveedores': '/admin/providers',
                    'Casas': '/admin/content/houses',
                    'Usuarios': '/admin/users',
                  };
                  window.location.href = routes[stat.title as keyof typeof routes] || '/admin';
                }}
              />
              {isConsultas && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">Próximamente</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dashboard Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <QuickActions actions={mockQuickActions} />
        <RecentActivity activities={mockActivities} />
        <div className="relative">
          <PendingApprovals 
            approvals={mockApprovals}
            onApprove={handleApproval}
            onReject={handleRejection}
            onView={handleView}
          />
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900 mb-1">Próximamente</div>
              <div className="text-sm text-gray-600">Esta función estará disponible pronto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}