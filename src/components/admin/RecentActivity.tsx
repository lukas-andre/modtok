import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRelativeTime } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'provider' | 'user' | 'content' | 'inquiry';
  action: string;
  actor: string;
  target: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const typeIcons: Record<string, React.ReactNode> = {
  provider: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h4a1 1 0 011 1v5m-4-5V9a1 1 0 011-1h2a1 1 0 011 1v4.01" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  content: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  inquiry: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 4v-4z" />
    </svg>
  ),
};

const statusVariantMap = {
  success: 'success' as const,
  warning: 'warning' as const,
  error: 'error' as const,
  info: 'info' as const,
};

export function RecentActivity({ activities, maxItems = 10 }: RecentActivityProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">Actividad Reciente</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Últimas acciones realizadas en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No hay actividad reciente</p>
          </div>
        ) : (
          displayedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-9 h-9 rounded-lg bg-accent-blue-pale text-accent-blue flex items-center justify-center">
                  {typeIcons[activity.type]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {activity.actor}
                  </p>
                  <time className="text-xs text-gray-500 whitespace-nowrap">
                    {getRelativeTime(activity.timestamp)}
                  </time>
                </div>
                <p className="text-sm text-gray-600">
                  {activity.action} <span className="font-medium text-gray-900">{activity.target}</span>
                </p>
                {activity.status && (
                  <div className="mt-2">
                    <Badge variant={statusVariantMap[activity.status]} size="sm" withDot>
                      {activity.status === 'success' && 'Completado'}
                      {activity.status === 'warning' && 'Advertencia'}
                      {activity.status === 'error' && 'Error'}
                      {activity.status === 'info' && 'Info'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}