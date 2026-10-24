'use client';

import type { ReactNode } from 'react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import {
  Badge,
  Card,
  IconCalendar,
  IconCalendarEvent,
  IconClock,
  IconDoor,
  IconMapPin,
  IconSchool,
  IconUserCheck,
  IconUsers,
  cn,
  stagger,
} from '@/modules/ui';
import { formatDate, formatDateTime, formatSchedule } from '@/modules/sevenx/date';
import { memberFullName, type SevenxClass } from '@/modules/sevenx/types';
import { classAccent } from './DashboardParts';

// The last cell stretches over the empty columns so the hairline grid has no holes.
const SM_SPAN = ['', 'sm:col-span-2'];
const LG_SPAN = ['', 'lg:col-span-2', 'lg:col-span-3', 'lg:col-span-4'];

type InfoItem = { key: string; icon: ReactNode; label: string; value: ReactNode; sub?: ReactNode };

/** Class record header: name and every fact a member needs (teacher, place, room, schedule, term). */
export function ClassInfoHeader({ cls, showTeacher = true }: { cls: SevenxClass; showTeacher?: boolean }) {
  const t = useT();
  const { locale } = useLocale();
  const accent = classAccent(cls._id);

  const items: InfoItem[] = [
    ...(showTeacher && cls.teacher
      ? [
          {
            key: 'teacher',
            icon: <IconUserCheck />,
            label: t('common.teacher'),
            value: memberFullName(cls.teacher),
            sub: [cls.teacher.phone, cls.teacher.email].filter(Boolean).join(' · '),
          },
        ]
      : []),
    {
      key: 'location',
      icon: <IconMapPin />,
      label: t('class.location'),
      value: cls.location?.name ?? '—',
      sub: cls.location?.address,
    },
    { key: 'room', icon: <IconDoor />, label: t('common.room'), value: cls.room || '—' },
    {
      key: 'schedule',
      icon: <IconCalendarEvent />,
      label: t('tab.schedule'),
      value: formatSchedule(cls.schedule, (d) => t(`day.${d}`)),
    },
    {
      key: 'term',
      icon: <IconCalendar />,
      label: t('class.term'),
      value: `${formatDate(cls.schedule.startDate, locale)} – ${formatDate(cls.schedule.endDate, locale)}`,
    },
    {
      key: 'next',
      icon: <IconClock />,
      label: t('dash.nextSession'),
      value: cls.nextSession ? formatDateTime(cls.nextSession, locale) : '—',
    },
    {
      key: 'students',
      icon: <IconUsers />,
      label: t('tab.students'),
      value: t('class.studentsCount', { count: cls.studentIds.length }),
    },
  ];

  return (
    <Card className="animate-enter overflow-hidden">
      <div
        className="flex items-start gap-3 p-4 sm:p-5"
        style={{ background: `linear-gradient(135deg, color-mix(in oklch, ${accent} 14%, transparent), transparent 70%)` }}
      >
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
          style={{ background: accent }}
        >
          <IconSchool size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{cls.name}</h1>
            <Badge tone={cls.status === 'active' ? 'green' : 'gray'}>{t(`class.status.${cls.status}`)}</Badge>
          </div>
          {cls.description && <p className="mt-1 text-sm text-muted">{cls.description}</p>}
        </div>
      </div>
      <dl className="sx-stagger grid grid-cols-1 gap-px border-t bg-border sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={item.key}
            style={stagger(i)}
            className={cn(
              'flex items-start gap-3 bg-card px-4 py-3',
              i === items.length - 1 && SM_SPAN[(2 - (items.length % 2)) % 2],
              i === items.length - 1 && LG_SPAN[(4 - (items.length % 4)) % 4],
            )}
          >
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground [&>svg]:size-4">
              {item.icon}
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-muted">{item.label}</dt>
              <dd className="truncate text-sm font-medium">{item.value}</dd>
              {item.sub && <dd className="truncate text-xs text-muted">{item.sub}</dd>}
            </div>
          </div>
        ))}
      </dl>
    </Card>
  );
}
