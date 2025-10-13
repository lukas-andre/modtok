import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const typeIcons: Record<string, React.ReactNode> = {
  provider: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m4 0v-5a1 1 0 011-1h4a1 1 0 011 1v5m-4-5V9a1 1 0 011-1h2a1 1 0 011 1v4.01" />
    </svg>
  ),
  house: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  blog: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

const priorityVariantMap = {
  low: 'neutral' as const,
  medium: 'warning' as const,
  high: 'error' as const,
};

export function PendingApprovals({
  approvals,
  onApprove,
  onReject,
  onView
}: PendingApprovalsProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-bold text-gray-900">Aprobaciones Pendientes</CardTitle>
          <Badge variant="primary" size="sm">
            {approvals.length}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-500">
          Elementos que requieren revisión y aprobación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {approvals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Todo al día</p>
            <p className="text-sm text-gray-500">No hay aprobaciones pendientes</p>
          </div>
        ) : (
          approvals.map((approval) => (
            <div
              key={approval.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-accent-blue hover:bg-accent-blue-pale/50 transition-all duration-200"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-accent-blue-pale text-accent-blue flex items-center justify-center flex-shrink-0">
                  {typeIcons[approval.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    <h4 className="font-semibold text-sm text-gray-900 flex-1">{approval.title}</h4>
                    <Badge variant={priorityVariantMap[approval.priority]} size="sm">
                      {approval.priority === 'low' && 'Baja'}
                      {approval.priority === 'medium' && 'Media'}
                      {approval.priority === 'high' && 'Alta'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <span className="font-medium text-gray-700">{typeLabels[approval.type]}</span>
                    </span>
                    <span>•</span>
                    <span>Por: {approval.submittedBy}</span>
                    <span>•</span>
                    <span>{getRelativeTime(approval.submittedAt)}</span>
                  </div>
                  {approval.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {approval.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(approval.id)}
                >
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(approval.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                >
                  Rechazar
                </Button>
                <Button
                  size="sm"
                  onClick={() => onApprove(approval.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
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