import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const iconMap: Record<string, React.ReactNode> = {
  '+': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  '▦': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
};

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-gray-900">Acciones Rápidas</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          Acciones frecuentes para administrar la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.id}
              className="w-full flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-accent-blue hover:bg-accent-blue-pale transition-all duration-200 text-left group"
              onClick={() => {
                if (action.onClick) {
                  action.onClick();
                } else if (action.href) {
                  window.location.href = action.href;
                }
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-accent-blue-pale text-accent-blue flex items-center justify-center group-hover:bg-accent-blue group-hover:text-white transition-all duration-200 flex-shrink-0">
                {iconMap[action.icon] || action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm mb-0.5">
                  {action.title}
                </div>
                <p className="text-xs text-gray-500">
                  {action.description}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-accent-blue transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}