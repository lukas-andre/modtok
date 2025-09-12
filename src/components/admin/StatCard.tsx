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
      className={cn(
        "hover:shadow-md transition-shadow cursor-pointer", 
        className
      )} 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatNumber(value)}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span
              className={cn(
                "font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}{trend.value}%
            </span>{" "}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}