'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { formatDate } from '@/modules/sevenx/date';
import {
  IconCalendar,
  IconChevronRight,
  IconClipboardCheck,
  IconClock,
  IconSchool,
  Skeleton,
  cn,
  stagger,
} from '@/modules/ui';

// erxes core-ui chart/status colors used to tell classes apart at a glance.
const CLASS_ACCENTS = [
  'oklch(0.514 0.2276 276.98)',
  'oklch(0.6261 0.1859 259.6)',
  'oklch(0.7205 0.192 149.49)',
  'oklch(0.7453 0.1322 54.63)',
  'oklch(0.606 0.25 292.717)',
  'oklch(0.6368 0.2078 25.33)',
];

export const classAccent = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return CLASS_ACCENTS[hash % CLASS_ACCENTS.length];
};

export function DashboardHero({ title }: { title: string }) {
  const t = useT();
  const { locale } = useLocale();
  const now = new Date();
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{t('dash.overview')}</p>
      </div>
      <span className="inline-flex h-7 items-center gap-1.5 rounded bg-background px-2.5 text-sm text-muted shadow-button-outline">
        <IconCalendar size={14} />
        {formatDate(now.getTime(), locale)} · {t(`day.${now.getDay()}`)}
      </span>
    </div>
  );
}

export type Stat = {
  key: string;
  label: string;
  value: number | null;
  icon: ReactNode;
  tone: 'primary' | 'info' | 'warning' | 'success';
};

const TONE: Record<Stat['tone'], string> = {
  primary: 'bg-primary/10 text-primary',
  info: 'bg-info/10 text-info',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
};

export function StatTiles({ stats }: { stats: Stat[] }) {
  return (
    <div className="sx-stagger mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat, i) => (
        <div key={stat.key} style={stagger(i)} className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-lg [&>svg]:size-[18px]',
              TONE[stat.tone],
            )}
          >
            {stat.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-muted">{stat.label}</p>
            {stat.value === null ? (
              <Skeleton className="mt-1.5 h-5 w-8" />
            ) : (
              <p className="animate-fade text-2xl font-semibold tabular-nums">{stat.value}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ClassCard({
  id,
  href,
  name,
  lines,
  index,
}: {
  id: string;
  href: string;
  name: string;
  lines: ReactNode[];
  index: number;
}) {
  const accent = classAccent(id);
  return (
    <li style={stagger(Math.min(index, 8))}>
      <Link
        href={href}
        className="group flex h-full items-start gap-3 rounded-lg bg-background p-3 shadow-xs transition-[box-shadow,background-color] duration-200 hover:bg-accent/60 hover:shadow-sm"
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-white"
          style={{ background: accent }}
        >
          <IconSchool size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{name}</p>
          {lines.map((line, i) => (
            <p key={i} className="mt-1 truncate text-xs text-muted">
              {line}
            </p>
          ))}
        </div>
        <IconChevronRight
          size={16}
          className="mt-2 shrink-0 -translate-x-1 text-accent-foreground opacity-0 transition-[opacity,transform] duration-200 ease-nav group-hover:translate-x-0 group-hover:opacity-100"
        />
      </Link>
    </li>
  );
}

export const ICONS = {
  classes: <IconSchool />,
  calendar: <IconCalendar />,
  clipboard: <IconClipboardCheck />,
  clock: <IconClock />,
};
