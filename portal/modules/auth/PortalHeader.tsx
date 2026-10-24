'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { Badge, IconLogout, IconSelector, cn } from '@/modules/ui';
import type { SevenxMember } from '@/modules/sevenx/types';
import { memberFullName } from '@/modules/sevenx/types';
import { useLogout } from './useLogout';

// Org logo tile from erxes CoreTab: a small bordered square on the sidebar tone.
export function BrandMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md border border-border/60 bg-background font-semibold text-primary shadow-xs',
        size === 'sm' && 'size-6 text-[10px]',
        size === 'md' && 'size-8 text-xs',
        size === 'lg' && 'size-10 text-sm',
      )}
    >
      7x
    </span>
  );
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary',
        className,
      )}
    >
      {initials || '?'}
    </span>
  );
}

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="relative grid grid-cols-2 rounded-md bg-foreground/5 p-0.5 text-xs" aria-label="language">
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-sm bg-background shadow-xs transition-transform duration-300 ease-nav',
          locale === 'en' && 'translate-x-full',
        )}
      />
      {(['mn', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          onClick={() => setLocale(l)}
          className={cn(
            'relative z-10 h-6 w-8 cursor-pointer font-medium uppercase transition-colors duration-200',
            locale === l ? 'text-primary' : 'text-muted hover:text-foreground',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

// erxes CoreTabUserMenu: avatar trigger opening a small account popover.
export function UserMenu({ me }: { me: SevenxMember }) {
  const t = useT();
  const { logout, loading } = useLogout();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const name = memberFullName(me);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-7 cursor-pointer items-center gap-2 rounded px-1.5 transition-colors hover:bg-accent-foreground/10',
          open && 'bg-accent-foreground/10',
        )}
      >
        <Avatar name={name} />
        <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">{name}</span>
        <IconSelector size={14} className="hidden text-accent-foreground sm:block" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-1 w-60 origin-top-right animate-zoom rounded-lg bg-background p-1 shadow-lg"
        >
          <div className="flex items-center gap-2.5 px-2 py-2">
            <Avatar name={name} className="size-8 text-xs" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted">{me.email}</p>
            </div>
          </div>
          <div className="px-2 pb-2">
            <Badge tone={me.role === 'teacher' ? 'indigo' : 'blue'}>{t(`role.${me.role}`)}</Badge>
          </div>
          <div className="-mx-1 my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            disabled={loading}
            onClick={() => logout()}
            className="flex h-8 w-full cursor-pointer items-center gap-2 rounded px-2 text-sm text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
          >
            <IconLogout size={16} />
            {t('common.logout')}
          </button>
        </div>
      )}
    </div>
  );
}
