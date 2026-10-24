'use client';

import { useId, type ReactNode } from 'react';
import { useT } from '@/modules/i18n/I18nProvider';
import { IconCheck, cn, stagger } from '@/modules/ui';
import { BrandMark, LanguageSwitch } from './PortalHeader';

const FEATURES = ['auth.feature.schedule', 'auth.feature.attendance', 'auth.feature.assignments'];

// Hexagon backdrop echoing erxes core-ui auth Polygons.
function Hexagons({ tone, className }: { tone: 'dark' | 'light'; className?: string }) {
  const id = useId();
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 size-full', className)}>
      <defs>
        <pattern id={`hex-${id}`} width="97" height="168" patternUnits="userSpaceOnUse" patternTransform="scale(1.6)">
          <path
            d="M48.5 0 97 28v56L48.5 112 0 84V28Z M48.5 112V168"
            fill="none"
            stroke={tone === 'dark' ? 'white' : 'var(--primary)'}
            strokeOpacity={tone === 'dark' ? 0.06 : 0.07}
            strokeWidth="1.5"
          />
        </pattern>
        <radialGradient id={`fade-${id}`} cx="50%" cy="35%" r="65%">
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`mask-${id}`}>
          <rect width="100%" height="100%" fill={`url(#fade-${id})`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#hex-${id})`} mask={`url(#mask-${id})`} />
    </svg>
  );
}

export function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const t = useT();
  return (
    <div className="flex min-h-dvh">
      <aside className="relative hidden h-dvh overflow-hidden bg-foreground lg:block lg:w-1/2">
        <Hexagons tone="dark" />
        <div className="absolute left-1/2 top-7 flex -translate-x-1/2 animate-fade items-center gap-2 text-background">
          <BrandMark size="sm" />
          <span className="text-sm font-semibold">{t('app.name')}</span>
        </div>
        <div className="relative flex h-full items-center justify-center px-10">
          <div className="flex max-w-[500px] flex-col gap-2">
            <h1 className="animate-enter text-2xl font-semibold leading-7 text-background">{t('auth.heroTitle')}</h1>
            <p className="animate-enter text-lg font-medium leading-6 text-muted [animation-delay:60ms]">
              {t('auth.heroText')}
            </p>
            <ul className="sx-stagger mt-6 space-y-2.5">
              {FEATURES.map((key, i) => (
                <li key={key} style={stagger(i + 3)} className="flex items-center gap-2.5 text-sm text-background/80">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <IconCheck size={12} stroke={3} />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="relative flex h-dvh flex-1 flex-col overflow-y-auto overflow-x-hidden bg-[radial-gradient(#F0F1FE,#F7F8FA)] py-8 sm:pt-24 lg:w-1/2 lg:flex-none">
        <Hexagons tone="light" className="hidden sm:block" />
        <div className="absolute right-4 top-4">
          <LanguageSwitch />
        </div>
        <div className="relative mx-auto flex w-full max-w-md flex-col gap-8 px-2 sm:px-6">
          <div className="flex animate-fade items-center justify-center gap-2">
            <BrandMark size="lg" />
            <div>
              <p className="text-lg font-semibold leading-tight text-primary">{t('app.name')}</p>
              <p className="text-xs text-muted">{t('app.tagline')}</p>
            </div>
          </div>
          <div className="animate-zoom overflow-hidden rounded-xl bg-sidebar shadow-xl">
            <div className="-mx-px space-y-6 rounded-b-xl border border-t-0 bg-background p-6 pt-8">{children}</div>
            {footer && <div className="px-6 py-5 text-center text-sm text-accent-foreground">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
