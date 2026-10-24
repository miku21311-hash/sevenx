'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { useCurrentMember } from '@/modules/auth/MeContext';
import { Avatar } from '@/modules/auth/PortalHeader';
import { AnnouncementsCard } from '@/modules/sevenx/components/AnnouncementsPanel';
import { classAccent } from '@/modules/sevenx/components/DashboardParts';
import { formatDate, formatDateTime, formatSchedule, parseDate } from '@/modules/sevenx/date';
import { useMyClasses } from '@/modules/sevenx/useMyClasses';
import { memberFullName, type SevenxClass } from '@/modules/sevenx/types';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  IconCalendar,
  IconCalendarEvent,
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSchool,
  IconUserCheck,
  LoadingState,
  Skeleton,
  cn,
  stagger,
} from '@/modules/ui';
import { CheckInButton } from './CheckInCard';
import { useStudentOverview } from './useStudentOverview';

export function StudentDashboard() {
  const t = useT();
  const { locale } = useLocale();
  const me = useCurrentMember();
  const { classes, loading, error, refetch } = useMyClasses();
  const overview = useStudentOverview(classes);
  const name = memberFullName(me);
  const now = new Date();

  const next = classes
    .filter((c) => parseDate(c.nextSession))
    .sort(
      (a, b) => (parseDate(a.nextSession)?.getTime() ?? 0) - (parseDate(b.nextSession)?.getTime() ?? 0),
    )[0];

  return (
    <div className="space-y-5">
      <Card className="animate-enter overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
          <Avatar name={name} className="size-12 text-base sm:size-14 sm:text-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{t('dash.welcome', { name })}</h1>
              <Badge tone="blue">{t('role.student')}</Badge>
            </div>
            <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
              <li className="inline-flex min-w-0 items-center gap-1.5">
                <IconMail size={14} className="shrink-0 text-accent-foreground" />
                <span className="truncate">{me.email}</span>
              </li>
              {me.phone && (
                <li className="inline-flex items-center gap-1.5">
                  <IconPhone size={14} className="text-accent-foreground" />
                  {me.phone}
                </li>
              )}
            </ul>
          </div>
          <span className="hidden h-7 items-center gap-1.5 rounded bg-background px-2.5 text-sm text-muted shadow-button-outline sm:inline-flex">
            <IconCalendar size={14} />
            {formatDate(now.getTime(), locale)} · {t(`day.${now.getDay()}`)}
          </span>
        </div>
        <dl className="sx-stagger grid grid-cols-1 border-t sm:grid-cols-3 sm:divide-x">
          <ProfileStat
            index={0}
            icon={<IconSchool />}
            tone="bg-primary/10 text-primary"
            label={t('dash.statClasses')}
            value={loading ? null : String(classes.length)}
          />
          <ProfileStat
            index={1}
            icon={<IconCalendarEvent />}
            tone="bg-info/10 text-info"
            label={t('dash.nextSession')}
            value={loading ? null : next ? formatDateTime(next.nextSession, locale) : '—'}
            hint={next?.name}
          />
          <ProfileStat
            index={2}
            icon={<IconClock />}
            tone="bg-warning/10 text-warning"
            label={t('dash.statDue')}
            value={loading || overview.loading ? null : String(overview.dueSoon.length)}
          />
        </dl>
      </Card>

      <div className="animate-enter [animation-delay:80ms]">
        <AnnouncementsCard markReadOnOpen />
      </div>

      <Card className="animate-enter [animation-delay:160ms]">
        <CardHeader
          icon={<IconSchool />}
          title={t('common.myClasses')}
          description={t('dash.classesHint')}
        />
        <CardBody>
          {loading && <LoadingState rows={2} />}
          {error && !loading && <ErrorState message={error.message} onRetry={() => refetch()} />}
          {!loading && !error && classes.length === 0 && <EmptyState title={t('common.noClasses')} />}
          <ul className="sx-stagger grid gap-3 lg:grid-cols-2">
            {classes.map((cls, i) => (
              <StudentClassItem key={cls._id} cls={cls} index={i} />
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}

function ProfileStat({
  index,
  icon,
  tone,
  label,
  value,
  hint,
}: {
  index: number;
  icon: ReactNode;
  tone: string;
  label: string;
  value: string | null;
  hint?: string;
}) {
  return (
    <div style={stagger(index)} className="flex items-center gap-3 border-t px-4 py-3 first:border-t-0 sm:border-t-0 sm:px-5">
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg [&>svg]:size-[18px]', tone)}>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="truncate text-xs text-muted">{label}</dt>
        <dd className="truncate">
          {value === null ? (
            <Skeleton className="mt-1 h-5 w-16" />
          ) : (
            <span className="animate-fade text-lg font-semibold tabular-nums">{value}</span>
          )}
          {hint && value !== null && <span className="ml-2 text-xs text-muted">{hint}</span>}
        </dd>
      </div>
    </div>
  );
}

function StudentClassItem({ cls, index }: { cls: SevenxClass; index: number }) {
  const t = useT();
  const href = `/s/classes/${cls._id}`;
  const place = [cls.location?.name, cls.room ? `${t('common.room')} ${cls.room}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <li
      style={stagger(Math.min(index, 8))}
      className="flex flex-wrap items-start gap-3 rounded-lg bg-background p-3 shadow-xs transition-shadow duration-200 hover:shadow-sm"
    >
      <Link
        href={href}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
        style={{ background: classAccent(cls._id) }}
        aria-hidden
        tabIndex={-1}
      >
        <IconSchool size={18} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={href} className="block truncate font-medium transition-colors hover:text-primary">
          {cls.name}
        </Link>
        <ul className="mt-1 space-y-0.5 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <IconCalendarEvent size={12} className="shrink-0" />
            <span className="truncate">{formatSchedule(cls.schedule, (d) => t(`day.${d}`))}</span>
          </li>
          {cls.teacher && (
            <li className="flex items-center gap-1.5">
              <IconUserCheck size={12} className="shrink-0" />
              <span className="truncate">{memberFullName(cls.teacher)}</span>
            </li>
          )}
          {place && (
            <li className="flex items-center gap-1.5">
              <IconMapPin size={12} className="shrink-0" />
              <span className="truncate">{place}</span>
            </li>
          )}
        </ul>
      </div>
      <CheckInButton cls={cls} className="max-sm:basis-full" />
    </li>
  );
}
