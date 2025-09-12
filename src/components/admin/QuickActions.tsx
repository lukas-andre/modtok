import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>
          Acciones frecuentes para administrar la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || "outline"}
              className="h-auto p-4 flex flex-col items-start text-left hover:bg-muted/50"
              onClick={() => {
                if (action.onClick) {
                  action.onClick();
                } else if (action.href) {
                  window.location.href = action.href;
                }
              }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{action.icon}</span>
                <span className="font-semibold">{action.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {action.description}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}