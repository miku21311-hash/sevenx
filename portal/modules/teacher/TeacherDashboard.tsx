'use client';

import Link from 'next/link';
import { useT } from '@/modules/i18n/I18nProvider';
import { useCurrentMember } from '@/modules/auth/MeContext';
import { AnnouncementsCard } from '@/modules/sevenx/components/AnnouncementsPanel';
import {
  ClassCard,
  DashboardHero,
  ICONS,
  StatTiles,
} from '@/modules/sevenx/components/DashboardParts';
import { formatSchedule } from '@/modules/sevenx/date';
import { useMyClasses } from '@/modules/sevenx/useMyClasses';
import { memberFullName } from '@/modules/sevenx/types';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  LoadingState,
  IconCalendarEvent,
  IconClipboardCheck,
  IconSchool,
  stagger,
} from '@/modules/ui';
import { useTeacherOverview } from './useTeacherOverview';

export function TeacherDashboard() {
  const t = useT();
  const me = useCurrentMember();
  const { classes, loading, error, refetch } = useMyClasses();
  const overview = useTeacherOverview(classes);
  const pendingTotal = overview.ungraded.reduce((n, u) => n + u.pending, 0);

  return (
    <div className="space-y-6">
      <div>
        <DashboardHero title={t('dash.welcome', { name: memberFullName(me) })} />
        <StatTiles
          stats={[
            {
              key: 'classes',
              label: t('dash.statClasses'),
              value: loading ? null : classes.length,
              icon: ICONS.classes,
              tone: 'primary',
            },
            {
              key: 'today',
              label: t('dash.statToday'),
              value: loading || overview.loading ? null : overview.today.length,
              icon: ICONS.calendar,
              tone: 'info',
            },
            {
              key: 'pending',
              label: t('dash.statPending'),
              value: loading || overview.loading ? null : pendingTotal,
              icon: ICONS.clipboard,
              tone: 'warning',
            },
          ]}
        />
      </div>

      {loading && (
        <Card>
          <CardBody>
            <LoadingState />
          </CardBody>
        </Card>
      )}
      {error && !loading && <ErrorState message={error.message} onRetry={() => refetch()} />}

      {!loading && !error && (
        <>
          <div className="sx-stagger grid gap-4 md:grid-cols-2">
            <Card style={stagger(3)}>
              <CardHeader icon={<IconCalendarEvent />} title={t('dash.todaySessions')} />
              <CardBody>
                {overview.loading && <LoadingState rows={2} />}
                {overview.error && <ErrorState message={overview.error} />}
                {!overview.loading && !overview.error && overview.today.length === 0 && (
                  <EmptyState title={t('dash.noSessionsToday')} />
                )}
                <ul className="-mx-2 divide-y divide-border-light">
                  {overview.today.map(({ cls, session }) => (
                    <li key={`${cls._id}-${session.startTime}`}>
                      <Link
                        href={`/t/classes/${cls._id}`}
                        className="group flex items-center justify-between rounded-md px-2 py-2.5 transition-colors hover:bg-accent"
                      >
                        <div>
                          <p className="font-medium transition-colors group-hover:text-primary">{cls.name}</p>
                          <p className="text-xs text-muted">
                            {cls.location?.name}
                            {cls.room ? ` · ${cls.room}` : ''}
                          </p>
                        </div>
                        <Badge tone={session.isPast ? 'gray' : 'green'}>
                          {session.startTime}–{session.endTime}
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card style={stagger(4)}>
              <CardHeader
                icon={<IconClipboardCheck />}
                title={t('dash.ungraded')}
                description={`${pendingTotal} ${t('dash.ungradedHint')}`}
              />
              <CardBody>
                {overview.loading && <LoadingState rows={2} />}
                {!overview.loading && overview.ungraded.length === 0 && <EmptyState />}
                <ul className="-mx-2 divide-y divide-border-light">
                  {overview.ungraded.map(({ cls, assignment, pending }) => (
                    <li key={assignment._id}>
                      <Link
                        href={`/t/classes/${cls._id}?tab=assignments`}
                        className="group flex items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium transition-colors group-hover:text-primary">
                            {assignment.title}
                          </p>
                          <p className="text-xs text-muted">{cls.name}</p>
                        </div>
                        <Badge tone="amber">{pending}</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </div>

          <Card className="animate-enter [animation-delay:240ms]">
            <CardHeader icon={<IconSchool />} title={t('common.myClasses')} />
            <CardBody>
              {classes.length === 0 && <EmptyState title={t('common.noClasses')} />}
              <ul className="sx-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls, i) => (
                  <ClassCard
                    key={cls._id}
                    id={cls._id}
                    index={i}
                    href={`/t/classes/${cls._id}`}
                    name={cls.name}
                    lines={[
                      formatSchedule(cls.schedule, (d) => t(`day.${d}`)),
                      t('dash.studentsCount', { count: cls.studentIds.length }),
                    ]}
                  />
                ))}
              </ul>
            </CardBody>
          </Card>

          <div className="animate-enter [animation-delay:320ms]">
            <AnnouncementsCard />
          </div>
        </>
      )}
    </div>
  );
}
