import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getRelativeTime } from '@/lib/utils';

interface PendingApproval {
  id: string;
  type: 'provider' | 'house' | 'blog' | 'user';
  title: string;
  submittedBy: string;
  submittedAt: Date;
  priority: 'low' | 'medium' | 'high';
  description?: string;
}

interface PendingApprovalsProps {
  approvals: PendingApproval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}

const typeLabels = {
  provider: 'Proveedor',
  house: 'Casa',
  blog: 'Artículo',
  user: 'Usuario',
};

const typeIcons = {
  provider: '■',
  house: '□',
  blog: '▢',
  user: '○',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export function PendingApprovals({ 
  approvals, 
  onApprove, 
  onReject, 
  onView 
}: PendingApprovalsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Aprobaciones Pendientes</span>
          <span className="text-sm font-normal bg-primary/10 text-primary px-2 py-1 rounded-full">
            {approvals.length}
          </span>
        </CardTitle>
        <CardDescription>
          Elementos que requieren revisión y aprobación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✓</div>
            <p className="text-sm text-muted-foreground">
              ¡No hay aprobaciones pendientes!
            </p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div
              key={approval.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-3">
                  <div className="text-lg">
                    {typeIcons[approval.type]}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{approval.title}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          priorityColors[approval.priority]
                        }`}
                      >
                        {approval.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{typeLabels[approval.type]}</span>
                      <span>Por: {approval.submittedBy}</span>
                      <span>{getRelativeTime(approval.submittedAt)}</span>
                    </div>
                    {approval.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {approval.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onView(approval.id)}
                >
                  Ver
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onReject(approval.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Rechazar
                </Button>
                <Button 
                  size="sm"
                  onClick={() => onApprove(approval.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Aprobar
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}