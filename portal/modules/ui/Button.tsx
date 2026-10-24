'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './cn';

// Variants and sizes follow erxes-ui buttonVariants.
type Variant = 'primary' | 'secondary' | 'success' | 'ghost' | 'danger' | 'outline' | 'simple';
type Size = 'sm' | 'md' | 'lg';

const SOLID =
  'sx-btn-sheen relative border shadow-button-primary [text-shadow:0_1px_1px_rgb(0_0_0/25%)]';

const VARIANTS: Record<Variant, string> = {
  primary: cn(SOLID, 'border-primary bg-primary text-primary-foreground'),
  success: cn(SOLID, 'border-success bg-success text-white'),
  danger: cn(SOLID, 'border-danger bg-danger text-white'),
  outline: 'bg-background text-foreground shadow-button-outline hover:bg-accent',
  secondary: 'bg-accent text-foreground hover:bg-border',
  simple: 'bg-accent text-foreground hover:bg-border',
  ghost: 'text-foreground hover:bg-accent-foreground/10',
};

const SIZES: Record<Size, string> = {
  sm: 'h-6 gap-1 px-2 text-xs',
  md: 'h-7 gap-2 px-3 text-sm',
  lg: 'h-8 gap-2 px-3 text-sm font-semibold',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex cursor-pointer select-none items-center justify-center whitespace-nowrap rounded font-medium',
        'outline-offset-2 transition-[background-color,box-shadow,color,transform] duration-200 ease-nav focus-visible:outline-2 focus-visible:outline-ring/70',
        'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}
