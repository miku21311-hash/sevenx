'use client';

import { Spinner } from '@/modules/ui';
import { BrandMark } from './PortalHeader';

export function FullScreenLoader({ label }: { label: string }) {
  return (
    <div role="status" className="flex min-h-screen animate-fade flex-col items-center justify-center gap-4">
      <span className="animate-pulse">
        <BrandMark size="lg" />
      </span>
      <p className="flex items-center gap-2 text-sm text-muted">
        <Spinner className="h-4 w-4" />
        {label}
      </p>
    </div>
  );
}
