import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 font-semibold rounded-full transition-all duration-200',
  {
    variants: {
      variant: {
        // Success: Green
        success: 'bg-green-100 text-green-700 border border-green-200',

        // Error: Red
        error: 'bg-red-100 text-red-700 border border-red-200',

        // Warning: Gold/Yellow
        warning: 'bg-yellow-100 text-yellow-700 border border-yellow-200',

        // Info: Accent Blue
        info: 'bg-accent-blue-pale text-accent-blue border border-accent-blue/20',

        // Neutral: Gray
        neutral: 'bg-gray-100 text-gray-700 border border-gray-200',

        // Primary: Accent Blue (solid)
        primary: 'bg-accent-blue text-white shadow-apple-sm',

        // Secondary: Brand Green (solid)
        secondary: 'bg-brand-green text-white shadow-apple-sm',

        // Gold: Premium/Featured
        gold: 'bg-accent-gold text-white shadow-apple-sm',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
      withDot: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'default',
      withDot: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, withDot, icon, onRemove, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, withDot }), className)}
        {...props}
      >
        {withDot && (
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
        )}
        {icon && <span className="inline-flex">{icon}</span>}
        {children}
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center justify-center hover:bg-black/10 rounded-full p-0.5 -mr-1 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);
Badge.displayName = 'Badge';

// Status Badge - with dot indicator for status
export interface StatusBadgeProps extends Omit<BadgeProps, 'withDot'> {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusMap = {
      active: { variant: 'success' as const, label: 'Activo' },
      inactive: { variant: 'neutral' as const, label: 'Inactivo' },
      pending: { variant: 'warning' as const, label: 'Pendiente' },
      error: { variant: 'error' as const, label: 'Error' },
      success: { variant: 'success' as const, label: 'Éxito' },
    };

    const { variant, label } = statusMap[status];

    return (
      <Badge ref={ref} variant={variant} withDot {...props}>
        {label}
      </Badge>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

// Tier Badge - for premium/featured/standard tiers
export interface TierBadgeProps extends Omit<BadgeProps, 'variant'> {
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
}

const TierBadge = React.forwardRef<HTMLSpanElement, TierBadgeProps>(
  ({ tier, ...props }, ref) => {
    const tierMap = {
      free: { variant: 'neutral' as const, label: 'Gratis', icon: null },
      basic: { variant: 'info' as const, label: 'Básico', icon: null },
      premium: {
        variant: 'gold' as const,
        label: 'Premium',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ),
      },
      enterprise: {
        variant: 'secondary' as const,
        label: 'Enterprise',
        icon: (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
          </svg>
        ),
      },
    };

    const { variant, label, icon } = tierMap[tier];

    return (
      <Badge ref={ref} variant={variant} icon={icon} {...props}>
        {label}
      </Badge>
    );
  }
);
TierBadge.displayName = 'TierBadge';

export { Badge, StatusBadge, TierBadge, badgeVariants };
