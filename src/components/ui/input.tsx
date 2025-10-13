import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-4 py-2.5 text-sm font-medium transition-all duration-200 placeholder:text-gray-400 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent-blue/20 focus:border-accent-blue hover:border-gray-400',
        error: 'border-red-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500',
      },
      inputSize: {
        sm: 'h-9 px-3 py-2 text-sm',
        default: 'h-11 px-4 py-2.5 text-base',
        lg: 'h-12 px-5 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, type, error, leadingIcon, trailingIcon, ...props }, ref) => {
    const hasIcons = leadingIcon || trailingIcon;

    if (hasIcons) {
      return (
        <div className="relative">
          {leadingIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leadingIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: error ? 'error' : variant, inputSize }),
              leadingIcon && 'pl-10',
              trailingIcon && 'pr-10',
              className
            )}
            ref={ref}
            {...props}
          />
          {trailingIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {trailingIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        className={cn(
          inputVariants({ variant: error ? 'error' : variant, inputSize }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

// Input Field with Label and Helper Text
export interface InputFieldProps extends InputProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
}

const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, helperText, errorMessage, required, error, id, className, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || !!errorMessage;

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-gray-700"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <Input
          ref={ref}
          id={inputId}
          error={hasError}
          {...props}
        />
        {errorMessage && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
InputField.displayName = 'InputField';

export { Input, InputField, inputVariants };