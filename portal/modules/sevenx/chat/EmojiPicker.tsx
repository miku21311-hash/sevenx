'use client';

import dynamic from 'next/dynamic';
import { Spinner } from '@/modules/ui';

// The emoji data is large, so the picker is only fetched the first time it opens.
export const EmojiPicker = dynamic(() => import('./EmojiPickerPanel').then((m) => m.EmojiPickerPanel), {
  ssr: false,
  loading: () => (
    <div className="flex h-[380px] items-center justify-center rounded-2xl border border-border bg-background">
      <Spinner />
    </div>
  ),
});
