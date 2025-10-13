import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'flex w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition-all duration-200 appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue hover:border-gray-400',
        error: 'border-red-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500',
      },
      selectSize: {
        sm: 'h-9 px-3 py-2 text-sm',
        default: 'h-11 px-4 py-2.5 text-base',
        lg: 'h-12 px-5 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      selectSize: 'default',
    },
  }
);

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  error?: boolean;
  options?: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, selectSize, error, children, options, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            selectVariants({ variant: error ? 'error' : variant, selectSize }),
            'pr-10',
            className
          )}
          ref={ref}
          {...props}
        >
          {options
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>
        {/* Custom Chevron Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';

// Select Field with Label and Helper Text
export interface SelectFieldProps extends SelectProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, helperText, errorMessage, required, error, id, className, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || !!errorMessage;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-semibold text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Select
          ref={ref}
          id={selectId}
          error={hasError}
          {...props}
        />
        {errorMessage && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}
        {helperText && !errorMessage && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);
SelectField.displayName = 'SelectField';

export { Select, SelectField, selectVariants };
