'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { useT } from '@/modules/i18n/I18nProvider';
import { ClassChatPanel } from '@/modules/sevenx/chat/ClassChat';
import { ChatPanelProvider, useChatPanel } from '@/modules/sevenx/chat/ChatPanelContext';
import { classAccent } from '@/modules/sevenx/components/DashboardParts';
import { useMyClasses } from '@/modules/sevenx/useMyClasses';
import type { SevenxMember } from '@/modules/sevenx/types';
import { IconLayoutDashboard, Skeleton, cn } from '@/modules/ui';
import { BrandMark, LanguageSwitch, UserMenu } from './PortalHeader';
import { homeForRole } from './session';

// Top navigation only: Home first, then one tab per class the member belongs to.
// On phones the tabs drop to a second, horizontally scrolling row.
export function PortalShell({ me, children }: { me: SevenxMember; children: ReactNode }) {
  return (
    <ChatPanelProvider>
      <ShellLayout me={me}>{children}</ShellLayout>
    </ChatPanelProvider>
  );
}

function ShellLayout({ me, children }: { me: SevenxMember; children: ReactNode }) {
  const t = useT();
  const chat = useChatPanel();
  const pathname = usePathname();
  const home = homeForRole(me.role);
  const { classes, loading } = useMyClasses();
  const navRef = useRef<HTMLElement>(null);

  const classMatch = pathname.match(/\/classes\/([^/?]+)/);
  const activeClassId = classMatch?.[1];

  // Keep the active class tab visible when the tab row overflows.
  useEffect(() => {
    navRef.current
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname, classes.length]);

  return (
    <div className="flex h-svh w-screen flex-col overflow-hidden">
      <header className="flex shrink-0 flex-wrap items-center gap-x-2 border-b bg-sidebar px-2 md:h-12 md:flex-nowrap">
        <Link
          href={home}
          aria-label={t('app.name')}
          className="flex h-12 items-center rounded px-1 md:h-auto"
        >
          <BrandMark size="sm" />
        </Link>

        <nav
          ref={navRef}
          aria-label={t('nav.classes')}
          className="styled-scroll order-last -mx-2 flex w-[calc(100%+1rem)] min-w-0 items-center gap-1 overflow-x-auto border-t px-2 py-1.5 md:order-none md:mx-0 md:w-auto md:flex-1 md:border-t-0 md:px-0 md:py-0"
        >
          <NavTab href={home} active={pathname === home} icon={<IconLayoutDashboard size={14} />}>
            {t('nav.dashboard')}
          </NavTab>
          {loading &&
            Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-5 w-24 shrink-0" />)}
          {classes.map((cls) => (
            <NavTab
              key={cls._id}
              href={`${home}/classes/${cls._id}`}
              active={activeClassId === cls._id}
              icon={<span className="size-2 rounded-full" style={{ background: classAccent(cls._id) }} />}
            >
              {cls.name}
            </NavTab>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitch />
          <UserMenu me={me} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <main className="styled-scroll relative min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-background">
          <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6">{children}</div>
        </main>
        {/* Chat pushes the page aside on wide screens and covers it on phones. */}
        {chat.classId && (
          <aside
            key={chat.classId}
            className="fixed inset-0 z-40 flex animate-panel flex-col bg-card md:static md:z-auto md:w-[400px] md:shrink-0 md:border-l"
          >
            <ClassChatPanel classId={chat.classId} onClose={chat.close} />
          </aside>
        )}
      </div>
    </div>
  );
}

function NavTab({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-8 shrink-0 items-center gap-2 rounded-md px-2.5 text-sm font-medium transition-[background-color,color,box-shadow] duration-200',
        active
          ? 'bg-background text-primary shadow-xs'
          : 'text-muted hover:bg-accent-foreground/10 hover:text-foreground',
      )}
    >
      {icon}
      <span className="max-w-48 truncate">{children}</span>
    </Link>
  );
}
