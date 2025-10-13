import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Primary: Accent Blue (Design System v2.0)
        default: 'bg-accent-blue text-white hover:bg-accent-blue-dark focus-visible:ring-accent-blue shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5',

        // Secondary: Brand Green
        secondary: 'bg-brand-green text-white hover:bg-brand-green-dark focus-visible:ring-brand-green shadow-apple-sm hover:shadow-apple-md hover:-translate-y-0.5',

        // Ghost: Transparent with subtle hover
        ghost: 'bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-accent-blue hover:text-accent-blue focus-visible:ring-accent-blue',

        // Destructive: Red for dangerous actions
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-apple-sm hover:shadow-apple-md',

        // Outline: Similar to ghost but with more emphasis
        outline: 'border-2 border-accent-blue bg-transparent text-accent-blue hover:bg-accent-blue hover:text-white focus-visible:ring-accent-blue transition-colors',

        // Link: Text only
        link: 'text-accent-blue hover:text-accent-blue-dark underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3 py-1.5 text-sm',
        lg: 'h-12 px-6 py-3 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };