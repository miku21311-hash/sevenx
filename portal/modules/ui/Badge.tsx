import type { ReactNode } from 'react';
import { cn } from './cn';

type Tone = 'gray' | 'green' | 'red' | 'amber' | 'blue' | 'indigo';

// erxes-ui badgeVariants: 10% tint, matching text, faint border.
const TONES: Record<Tone, string> = {
  gray: 'bg-accent text-foreground border-border/60',
  green: 'bg-success/10 text-success border-success/10',
  red: 'bg-danger/10 text-danger border-danger/10',
  amber: 'bg-warning/10 text-warning border-warning/10',
  blue: 'bg-info/10 text-info border-info/10',
  indigo: 'bg-primary/10 text-primary border-primary/10',
};

export function Badge({
  tone = 'gray',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-6 w-fit items-center gap-1 whitespace-nowrap rounded-sm border px-2 text-xs font-medium transition-colors',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
