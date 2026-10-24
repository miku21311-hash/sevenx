import {
  IconArrowLeft,
  IconCalendarOff,
  IconCalendarWeek,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Button, cn, Skeleton } from 'erxes-ui';
import { CSSProperties, ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ISevenxClass, memberFullName } from '~/modules/shared/types';
import { SevenxEmpty } from '~/modules/shared/components';
import {
  layoutOverlaps,
  startOfWeek,
  timeToMinutes,
  WEEK_DAYS,
} from '~/modules/shared/utils/schedule';

const HOUR_HEIGHT = 56;
const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 21;
const DAY_FORMAT = 'YYYY-MM-DD';
/** Horizontal gap (px) between side-by-side blocks. */
const COLUMN_GAP = 3;
/** Below this height (px) a block shows name and time on one line. */
const COMPACT_HEIGHT = 40;
/** From this height (px) a block also shows location, teacher and room. */
const DETAILS_HEIGHT = 64;

/** Golden-angle steps keep neighbouring hues far apart for any count. */
const hueAt = (index: number) => Math.round((210 + index * 137.508) % 360);

const swatchStyle = (hue: number): CSSProperties => ({
  backgroundColor: `hsl(${hue} 75% 55% / 0.16)`,
  borderColor: `hsl(${hue} 75% 55% / 0.5)`,
  borderLeft: `4px solid hsl(${hue} 75% 50%)`,
});

const dotStyle = (hue: number): CSSProperties => ({
  backgroundColor: `hsl(${hue} 75% 50%)`,
});

/** Index (0 = Monday) of today inside the week starting at `weekStart`, else 0. */
const todayIndexIn = (weekStart: dayjs.Dayjs) => {
  const diff = dayjs().startOf('day').diff(weekStart, 'day');
  return diff >= 0 && diff < 7 ? diff : 0;
};

interface ColorGroup {
  id: string;
  name: string;
  hue: number;
}

interface WeeklyScheduleProps {
  classes: ISevenxClass[];
  loading: boolean;
  /** Selected location. Without it blocks are colored per location, with it per class. */
  locationId?: string;
  onLocationSelect: (locationId?: string) => void;
}

export const WeeklySchedule = ({
  classes,
  loading,
  locationId,
  onLocationSelect,
}: WeeklyScheduleProps) => {
  const { t } = useTranslation('sevenx');
  const [weekStart, setWeekStart] = useState(() => startOfWeek(dayjs()));
  // Day shown by the phone agenda (0 = Monday).
  const [dayIndex, setDayIndex] = useState(() => todayIndexIn(startOfWeek(dayjs())));
  const weekEnd = useMemo(() => weekStart.add(6, 'day').endOf('day'), [weekStart]);

  const goToWeek = (start: dayjs.Dayjs) => {
    setWeekStart(start);
    setDayIndex(todayIndexIn(start));
  };

  const weekClasses = useMemo(
    () =>
      classes.filter(
        (c) =>
          c.status !== 'archived' &&
          !dayjs(c.schedule.startDate).isAfter(weekEnd) &&
          !dayjs(c.schedule.endDate).isBefore(weekStart),
      ),
    [classes, weekStart, weekEnd],
  );

  const { startHour, endHour } = useMemo(() => {
    let start = DEFAULT_START_HOUR;
    let end = DEFAULT_END_HOUR;
    weekClasses.forEach((c) => {
      start = Math.min(start, Math.floor(timeToMinutes(c.schedule.startTime) / 60));
      end = Math.max(end, Math.ceil(timeToMinutes(c.schedule.endTime) / 60));
    });
    return { startHour: start, endHour: end };
  }, [weekClasses]);

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const today = dayjs().format(DAY_FORMAT);

  // Built from every listed class (not only this week's) so colors stay
  // stable while paging through weeks.
  const groups = useMemo<ColorGroup[]>(() => {
    const byId = new Map<string, string>();
    classes.forEach((c) => {
      if (locationId) {
        byId.set(c._id, c.name);
      } else if (c.locationId) {
        byId.set(c.locationId, c.location?.name ?? c.locationId);
      }
    });
    return [...byId.entries()]
      .sort(([, a], [, b]) => a.localeCompare(b))
      .map(([id, name], index) => ({ id, name, hue: hueAt(index) }));
  }, [classes, locationId]);

  const hueFor = (c: ISevenxClass) =>
    groups.find((g) => g.id === (locationId ? c._id : c.locationId))?.hue ?? hueAt(0);

  const selectedLocationName = locationId
    ? classes.find((c) => c.locationId === locationId)?.location?.name ?? ''
    : '';

  const classesOn = (day: number, date: dayjs.Dayjs) =>
    weekClasses
      .filter(
        (c) =>
          c.schedule.daysOfWeek.includes(day) &&
          !date.isBefore(dayjs(c.schedule.startDate), 'day') &&
          !date.isAfter(dayjs(c.schedule.endDate), 'day'),
      )
      .sort((a, b) => timeToMinutes(a.schedule.startTime) - timeToMinutes(b.schedule.startTime));

  /** Overview: a block opens its location; inside a location it opens the class. */
  const renderBlock = (
    c: ISevenxClass,
    className: string,
    style: CSSProperties,
    density: 'compact' | 'normal' | 'full' = 'full',
  ) => {
    const blockClassName = cn(
      'min-w-0 rounded border px-2 py-1 text-left text-xs leading-4 overflow-hidden hover:opacity-80',
      className,
    );
    const blockStyle = { ...swatchStyle(hueFor(c)), ...style };
    const time = `${c.schedule.startTime}–${c.schedule.endTime}`;
    const details = [c.location?.name, memberFullName(c.teacher), c.room]
      .filter(Boolean)
      .join(' · ');
    const blockDetails = [locationId ? null : c.location?.name, memberFullName(c.teacher), c.room]
      .filter(Boolean)
      .join(' · ');
    const title = [c.name, time, details].filter(Boolean).join('\n');
    const content: ReactNode =
      density === 'compact' ? (
        <div className="truncate">
          <span className="font-semibold">{c.name}</span>
          <span className="opacity-80"> {time}</span>
        </div>
      ) : (
        <>
          <div className="font-semibold truncate">{c.name}</div>
          <div className="truncate opacity-80">{time}</div>
          {density === 'full' && blockDetails && (
            <div className="truncate opacity-80">{blockDetails}</div>
          )}
        </>
      );

    return locationId ? (
      <Link
        key={c._id}
        to={`/sevenx/classes/${c._id}`}
        className={blockClassName}
        style={blockStyle}
        title={title}
      >
        {content}
      </Link>
    ) : (
      <button
        key={c._id}
        type="button"
        onClick={() => onLocationSelect(c.locationId)}
        className={blockClassName}
        style={blockStyle}
        title={title}
      >
        {content}
      </button>
    );
  };

  /** Positions a day's blocks, placing overlapping classes side by side. */
  const renderDay = (dayClasses: ISevenxClass[]) => {
    const slots = layoutOverlaps(
      dayClasses.map((c) => ({
        start: timeToMinutes(c.schedule.startTime),
        end: timeToMinutes(c.schedule.endTime),
      })),
    );
    return dayClasses.map((c, i) => {
      const { column, columns, span } = slots[i];
      const start = timeToMinutes(c.schedule.startTime);
      const top = ((start - startHour * 60) / 60) * HOUR_HEIGHT;
      const height = Math.max(
        ((timeToMinutes(c.schedule.endTime) - start) / 60) * HOUR_HEIGHT,
        24,
      );
      const left = (column / columns) * 100;
      const width = (span / columns) * 100;
      const reachesEdge = column + span === columns;
      return renderBlock(
        c,
        cn('absolute', columns > 2 && 'px-1.5'),
        {
          top,
          height,
          left: `${left}%`,
          width: reachesEdge ? `${width}%` : `calc(${width}% - ${COLUMN_GAP}px)`,
          zIndex: column + 1,
        },
        height < COMPACT_HEIGHT ? 'compact' : height < DETAILS_HEIGHT ? 'normal' : 'full',
      );
    });
  };

  const agendaDate = weekStart.add(dayIndex, 'day');
  const agendaClasses = classesOn(WEEK_DAYS[dayIndex], agendaDate);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b">
        <Button
          variant="outline"
          size="icon"
          aria-label={t('prev-week')}
          onClick={() => goToWeek(weekStart.subtract(7, 'day'))}
        >
          <IconChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('next-week')}
          onClick={() => goToWeek(weekStart.add(7, 'day'))}
        >
          <IconChevronRight />
        </Button>
        <Button variant="ghost" onClick={() => goToWeek(startOfWeek(dayjs()))}>
          {t('today')}
        </Button>
        <span className="text-sm font-medium sm:ml-2">
          {weekStart.format(DAY_FORMAT)} – {weekEnd.format(DAY_FORMAT)}
        </span>
      </div>
      {!loading && groups.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b">
          {locationId && (
            <Button variant="ghost" size="sm" onClick={() => onLocationSelect(undefined)}>
              <IconArrowLeft />
              {t('all-locations')}
            </Button>
          )}
          {groups.map((group) =>
            locationId ? (
              <Link
                key={group.id}
                to={`/sevenx/classes/${group.id}`}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs hover:bg-accent"
              >
                <span className="size-2.5 rounded-full" style={dotStyle(group.hue)} />
                {group.name}
              </Link>
            ) : (
              <button
                key={group.id}
                type="button"
                onClick={() => onLocationSelect(group.id)}
                className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs hover:bg-accent"
              >
                <span className="size-2.5 rounded-full" style={dotStyle(group.hue)} />
                {group.name}
              </button>
            ),
          )}
          <span className="w-full text-xs text-muted-foreground md:w-auto md:ml-auto">
            {locationId
              ? t('schedule-by-class', { location: selectedLocationName })
              : t('schedule-by-location')}
          </span>
        </div>
      )}
      {loading ? (
        <div className="p-4 flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : weekClasses.length === 0 ? (
        <SevenxEmpty icon={IconCalendarWeek} title={t('no-classes-week')} className="h-full" />
      ) : (
        <>
          {/* Phones: one day at a time as a list. */}
          <div className="flex flex-1 flex-col overflow-hidden md:hidden">
            <div className="grid grid-cols-7 gap-1 border-b p-2">
              {WEEK_DAYS.map((day, index) => {
                const date = weekStart.add(index, 'day');
                const isToday = date.format(DAY_FORMAT) === today;
                const hasClasses = classesOn(day, date).length > 0;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDayIndex(index)}
                    aria-pressed={index === dayIndex}
                    className={cn(
                      'flex flex-col items-center rounded-md py-1.5 text-xs',
                      index === dayIndex
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent',
                      isToday && index !== dayIndex && 'text-primary font-semibold',
                    )}
                  >
                    <span>{t(`day-${day}`)}</span>
                    <span className="text-sm font-medium">{date.format('D')}</span>
                    <span
                      className={cn(
                        'mt-0.5 size-1 rounded-full',
                        hasClasses ? 'bg-current' : 'bg-transparent',
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
              {agendaClasses.length === 0 ? (
                <SevenxEmpty icon={IconCalendarOff} title={t('no-classes-day')} />
              ) : (
                <div className="flex flex-col gap-2">
                  {agendaClasses.map((c) => renderBlock(c, 'block py-2 text-sm', {}))}
                </div>
              )}
            </div>
          </div>

          {/* Tablets and up: the full week grid. */}
          <div className="hidden flex-1 overflow-auto md:block">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] sticky top-0 bg-background z-10 border-b">
                <div />
                {WEEK_DAYS.map((day, index) => {
                  const date = weekStart.add(index, 'day');
                  const isToday = date.format(DAY_FORMAT) === today;
                  return (
                    <div
                      key={day}
                      className={`px-2 py-2 text-center text-sm border-l ${
                        isToday ? 'font-semibold text-primary' : ''
                      }`}
                    >
                      {t(`day-${day}`)}{' '}
                      <span className="text-muted-foreground text-xs">{date.format('MM/DD')}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
                <div className="relative" style={{ height: hours.length * HOUR_HEIGHT }}>
                  {hours.map((hour, i) => (
                    <div
                      key={hour}
                      className="absolute right-2 text-xs text-muted-foreground -translate-y-1/2"
                      style={{ top: i * HOUR_HEIGHT }}
                    >
                      {String(hour).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                {WEEK_DAYS.map((day, index) => (
                  <div
                    key={day}
                    className="relative border-l"
                    style={{ height: hours.length * HOUR_HEIGHT }}
                  >
                    {hours.map((hour, i) => (
                      <div
                        key={hour}
                        className="absolute inset-x-0 border-t border-dashed border-border/60"
                        style={{ top: i * HOUR_HEIGHT }}
                      />
                    ))}
                    <div className="absolute inset-y-0 inset-x-1">
                      {renderDay(classesOn(day, weekStart.add(index, 'day')))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
