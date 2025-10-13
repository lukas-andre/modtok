import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatNumber } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, trend, icon, className, onClick }: StatCardProps) {
  return (
    <Card
      clickable
      className={cn(
        "group hover:border-accent-blue/30 transition-all duration-200",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold text-gray-600">
          {title}
        </CardTitle>
        <div className="w-10 h-10 rounded-lg bg-accent-blue-pale text-accent-blue flex items-center justify-center group-hover:bg-accent-blue group-hover:text-white transition-all duration-200 shadow-apple-sm">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{formatNumber(value)}</div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
                trend.isPositive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}%
            </span>
            <span className="text-xs text-gray-500">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}