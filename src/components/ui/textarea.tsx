import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  "block w-full rounded-lg border bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "border-gray-300 focus:border-accent-blue focus:ring-accent-blue/20",
        error: "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      },
      textSize: {
        sm: "text-sm px-3 py-2",
        default: "text-sm px-3.5 py-2.5",
        lg: "text-base px-4 py-3"
      }
    },
    defaultVariants: {
      variant: "default",
      textSize: "default"
    }
  }
);

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, variant, textSize, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, textSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
TextArea.displayName = "TextArea";

// TextAreaField with label, helper, and error
interface TextAreaFieldProps extends TextAreaProps {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  required?: boolean;
}

const TextAreaField = React.forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, helperText, errorMessage, required, id, className, ...props }, ref) => {
    const fieldId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!errorMessage;

    return (
      <div className={className}>
        {label && (
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <TextArea
          id={fieldId}
          ref={ref}
          variant={hasError ? 'error' : 'default'}
          {...props}
        />

        {helperText && !hasError && (
          <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
        )}

        {hasError && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
TextAreaField.displayName = "TextAreaField";

export { TextArea, TextAreaField, textareaVariants };
