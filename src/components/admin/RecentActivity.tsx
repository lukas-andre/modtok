import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const typeIcons = {
  provider: '■',
  user: '○',
  content: '▢',
  inquiry: '◆',
};

const statusColors = {
  success: 'text-green-600 bg-green-50',
  warning: 'text-yellow-600 bg-yellow-50',
  error: 'text-red-600 bg-red-50',
  info: 'text-blue-600 bg-blue-50',
};

export function RecentActivity({ activities, maxItems = 10 }: RecentActivityProps) {
  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <CardDescription>
          Últimas acciones realizadas en la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedActivities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay actividad reciente
          </p>
        ) : (
          displayedActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm">
                  {typeIcons[activity.type]}
                </div>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.actor}
                  </p>
                  <time className="text-xs text-muted-foreground">
                    {getRelativeTime(activity.timestamp)}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.action} <span className="font-medium">{activity.target}</span>
                </p>
                {activity.status && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      statusColors[activity.status]
                    }`}
                  >
                    {activity.status === 'success' && '•'}
                    {activity.status === 'warning' && '•'}
                    {activity.status === 'error' && '•'}
                    {activity.status === 'info' && '•'}
                    <span className="ml-1 capitalize">{activity.status}</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}