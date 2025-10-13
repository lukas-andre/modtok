import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-xl transition-all duration-300',
  {
    variants: {
      variant: {
        // Default: Clean white with subtle border
        default: 'bg-white border border-gray-200 shadow-apple-sm hover:shadow-apple-lg hover:-translate-y-1',

        // Premium: Brand green gradient with gold badge
        premium: 'bg-gradient-to-br from-brand-green to-brand-green-dark text-white border-2 border-accent-gold shadow-apple-md hover:shadow-apple-xl relative overflow-visible',

        // Featured: Accent blue border highlight
        featured: 'bg-white border-2 border-accent-blue shadow-apple-md hover:shadow-apple-lg hover:-translate-y-1',

        // Ghost: Transparent with subtle hover
        ghost: 'bg-transparent border border-gray-200 hover:bg-gray-50 hover:border-accent-blue',
      },
      clickable: {
        true: 'cursor-pointer',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      clickable: false,
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  isPremium?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, clickable, isPremium, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant: isPremium ? 'premium' : variant, clickable, className }))}
      {...props}
    >
      {isPremium && (
        <span className="absolute -top-3 right-4 bg-accent-gold text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-apple-sm">
          Premium
        </span>
      )}
      {children}
    </div>
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-2xl font-bold leading-none tracking-tight', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };