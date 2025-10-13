import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const formSectionVariants = cva(
  "bg-white rounded-lg overflow-hidden transition-all duration-200",
  {
    variants: {
      variant: {
        default: "shadow-apple-sm border border-gray-200",
        flat: "shadow-none border-0",
        elevated: "shadow-apple-md border border-gray-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

interface FormSectionProps extends VariantProps<typeof formSectionVariants> {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  actions,
  variant,
  className
}: FormSectionProps) {
  return (
    <div className={`${formSectionVariants({ variant })} ${className || ''}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-4">
        {children}
      </div>
    </div>
  );
}
