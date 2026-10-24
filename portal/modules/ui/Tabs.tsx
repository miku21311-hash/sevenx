'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from './cn';

export type TabItem<K extends string> = {
  key: K;
  label: ReactNode;
  icon?: ReactNode;
  badge?: number;
};

type Indicator = { left: number; width: number };

// erxes-ui Tabs: `underline` (2px primary line) and `segment` (pills) variants.
// The indicator slides between tabs instead of jumping.
export function Tabs<K extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
}: {
  items: Array<TabItem<K>>;
  value: K;
  onChange: (key: K) => void;
  variant?: 'underline' | 'pills';
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const active = list.querySelector<HTMLElement>('[aria-selected="true"]');
      if (active) setIndicator({ left: active.offsetLeft, width: active.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value, items.length]);

  return (
    <div
      ref={listRef}
      role="tablist"
      className={cn(
        'relative flex overflow-x-auto',
        variant === 'underline' && 'gap-2 border-b py-1',
        variant === 'pills' && 'grid w-full auto-cols-fr grid-flow-col gap-1 rounded-lg bg-foreground/5 p-1',
      )}
    >
      {indicator && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute left-0 transition-[transform,width] duration-300 ease-nav',
            variant === 'underline' && 'bottom-0 h-0.5 bg-primary',
            variant === 'pills' && 'inset-y-1 rounded-md bg-background shadow-sm',
          )}
          style={{ width: indicator.width, transform: `translateX(${indicator.left}px)` }}
        />
      )}
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              'relative z-10 inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors duration-200 [&>svg]:size-4',
              variant === 'underline' &&
                (active ? 'text-primary hover:bg-accent' : 'text-accent-foreground hover:bg-accent hover:text-foreground'),
              variant === 'pills' &&
                (active ? 'rounded-md font-normal text-primary' : 'rounded-md font-normal text-muted hover:text-foreground'),
            )}
          >
            {item.icon}
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span
                className={cn(
                  'min-w-5 rounded-sm px-1 text-xs leading-5 transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'bg-accent text-muted',
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
