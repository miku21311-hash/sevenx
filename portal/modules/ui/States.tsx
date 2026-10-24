'use client';

import type { ReactNode } from 'react';
import { useT } from '@/modules/i18n/I18nProvider';
import { Button } from './Button';
import { cn } from './cn';
import { IconAlertCircle, IconInbox } from './icons';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary',
        className,
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn('sx-skeleton block rounded-sm', className)} />;
}

// Placeholder rows shaped like erxes record-table cells.
export function LoadingState({ label, rows = 3 }: { label?: string; rows?: number }) {
  const t = useT();
  return (
    <div role="status" aria-live="polite" aria-label={label ?? t('common.loading')} className="animate-fade space-y-2.5 py-2">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-7 shrink-0 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-2.5 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// erxes-ui Empty with the `icon` media variant.
export function EmptyState({
  title,
  description,
  action,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex animate-enter flex-col items-center justify-center gap-2 px-4 py-8 text-center text-balance">
      <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted-bg text-foreground shadow-sm">
        <IconInbox size={22} stroke={1.75} />
      </span>
      <p className="text-base font-medium tracking-tight">{title ?? t('common.empty')}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const t = useT();
  return (
    <div
      role="alert"
      className="flex animate-enter flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-danger/30 px-4 py-8 text-center"
    >
      <span className="mb-1 flex size-10 items-center justify-center rounded-lg bg-danger/10 text-danger">
        <IconAlertCircle size={22} stroke={1.75} />
      </span>
      <p className="text-base font-medium">{t('common.error')}</p>
      {message && <p className="max-w-md break-words text-sm text-muted">{message}</p>}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-1">
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
