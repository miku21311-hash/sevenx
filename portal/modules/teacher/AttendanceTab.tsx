'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useT } from '@/modules/i18n/I18nProvider';
import { addDays, toDateKey, todayKey } from '@/modules/sevenx/date';
import { SEVENX_ATTENDANCE_BY_DATE, SEVENX_ATTENDANCE_MARK } from '@/modules/sevenx/graphql';
import type {
  SevenxAttendance,
  SevenxAttendanceStatus,
  SevenxClass,
  SevenxMember,
  SevenxSession,
} from '@/modules/sevenx/types';
import { memberFullName } from '@/modules/sevenx/types';
import { useSessions } from '@/modules/sevenx/useSessions';
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  ErrorState,
  IconMapPinCheck,
  Input,
  LoadingState,
  cn,
  useToast,
} from '@/modules/ui';

type CheckIn = { at: string; distance: number };

const STATUSES: SevenxAttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

const STATUS_STYLE: Record<SevenxAttendanceStatus, string> = {
  present: 'bg-success text-white border-success',
  late: 'bg-warning text-white border-warning',
  absent: 'bg-danger text-white border-danger',
  excused: 'bg-info text-white border-info',
};

const STATUS_TONE: Record<SevenxAttendanceStatus, 'green' | 'amber' | 'red' | 'blue'> = {
  present: 'green',
  late: 'amber',
  absent: 'red',
  excused: 'blue',
};

type Row = { status: SevenxAttendanceStatus; note: string };
type AttendanceData = { sevenxAttendanceByDate: SevenxAttendance[] };

const nearestSessionDate = (dates: string[], today: string): string => {
  if (dates.length === 0 || dates.includes(today)) return today;
  const t0 = new Date(today).getTime();
  return [...dates].sort(
    (a, b) => Math.abs(new Date(a).getTime() - t0) - Math.abs(new Date(b).getTime() - t0),
  )[0];
};

export function AttendanceTab({ cls }: { cls: SevenxClass }) {
  const t = useT();
  const today = todayKey();
  const from = toDateKey(addDays(new Date(), -60));
  const to = toDateKey(addDays(new Date(), 60));
  const { sessions, loading: sessionsLoading } = useSessions(cls._id, from, to);
  const sessionDates = useMemo(() => sessions.map((s) => s.date), [sessions]);

  // The picked date is derived until the teacher touches the picker: today if
  // there is a session today, otherwise the nearest session date.
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const date = pickedDate ?? (sessionsLoading ? today : nearestSessionDate(sessionDates, today));

  const { data, loading, error, refetch } = useQuery<AttendanceData>(SEVENX_ATTENDANCE_BY_DATE, {
    variables: { classId: cls._id, date },
    fetchPolicy: 'network-only',
  });

  const students = useMemo(() => {
    const byId = new Map<string, SevenxMember>(cls.students.map((s) => [s._id, s]));
    for (const att of data?.sevenxAttendanceByDate ?? []) {
      if (att.student && !byId.has(att.studentId)) byId.set(att.studentId, att.student);
    }
    return Array.from(byId.values());
  }, [cls.students, data]);

  const initialRows = useMemo(() => {
    const next: Record<string, Row> = {};
    for (const student of students) next[student._id] = { status: 'absent', note: '' };
    for (const att of data?.sevenxAttendanceByDate ?? []) {
      next[att.studentId] = { status: att.status, note: att.note ?? '' };
    }
    return next;
  }, [students, data]);

  const checkIns = useMemo(() => {
    const next: Record<string, CheckIn> = {};
    for (const att of data?.sevenxAttendanceByDate ?? []) {
      if (att.checkedInAt) {
        next[att.studentId] = { at: att.checkedInAt, distance: att.checkInDistance ?? 0 };
      }
    }
    return next;
  }, [data]);

  const hasSession = sessionDates.includes(date);
  const nearby = sessions.filter(
    (s) => Math.abs(new Date(s.date).getTime() - new Date(date).getTime()) < 15 * 86_400_000,
  );

  return (
    <div className="space-y-4">
      <DatePicker
        date={date}
        today={today}
        nearby={nearby}
        onChange={setPickedDate}
        label={t('common.date')}
        todayLabel={t('common.today')}
      />

      {!sessionsLoading && !hasSession && (
        <p className="animate-enter rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-xs text-warning">
          {t('att.noSessionOnDate')}
        </p>
      )}

      {loading && !data && <LoadingState />}
      {error && !data && <ErrorState message={error.message} onRetry={() => refetch()} />}
      {data && students.length === 0 && (
        <Card>
          <EmptyState title={t('att.noStudents')} />
        </Card>
      )}
      {data && students.length > 0 && (
        <AttendanceEditor
          // remount whenever the date or the server rows change so local edits reset
          key={`${date}:${JSON.stringify(initialRows)}`}
          classId={cls._id}
          date={date}
          students={students}
          initialRows={initialRows}
          checkIns={checkIns}
          onSaved={() => refetch()}
        />
      )}
    </div>
  );
}

function DatePicker({
  date,
  today,
  nearby,
  onChange,
  label,
  todayLabel,
}: {
  date: string;
  today: string;
  nearby: SevenxSession[];
  onChange: (next: string) => void;
  label: string;
  todayLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="att-date" className="mb-1 block text-sm font-medium">
          {label}
        </label>
        <Input
          id="att-date"
          type="date"
          value={date}
          onChange={(e) => onChange(e.target.value || today)}
          className="w-44"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {nearby.map((s) => (
          <button
            key={s.date}
            type="button"
            onClick={() => onChange(s.date)}
            className={cn(
              'h-6 cursor-pointer rounded-sm px-2 text-xs font-medium transition-[background-color,box-shadow,color,transform] duration-200 active:scale-95',
              s.date === date
                ? 'bg-primary/10 text-primary shadow-[0_0_0_1px_color-mix(in_srgb,var(--primary)_20%,transparent)]'
                : 'bg-background text-muted shadow-button-outline hover:bg-accent hover:text-foreground',
            )}
          >
            {s.date.slice(5)}
            {s.isToday ? ` · ${todayLabel}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

function AttendanceEditor({
  classId,
  date,
  students,
  initialRows,
  checkIns,
  onSaved,
}: {
  classId: string;
  date: string;
  students: SevenxMember[];
  initialRows: Record<string, Row>;
  checkIns: Record<string, CheckIn>;
  onSaved: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const [rows, setRows] = useState<Record<string, Row>>(initialRows);
  const [dirty, setDirty] = useState(false);
  const [mark, { loading: saving }] = useMutation<{ sevenxAttendanceMark: SevenxAttendance[] }>(
    SEVENX_ATTENDANCE_MARK,
  );

  const setStatus = (studentId: string, status: SevenxAttendanceStatus) => {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
    setDirty(true);
  };

  const setNote = (studentId: string, note: string) => {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note } }));
    setDirty(true);
  };

  const allPresent = () => {
    setRows((prev) => {
      const next: Record<string, Row> = {};
      for (const s of students) next[s._id] = { status: 'present', note: prev[s._id]?.note ?? '' };
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    try {
      await mark({
        variables: {
          classId,
          date,
          items: students.map((s) => ({
            studentId: s._id,
            status: rows[s._id]?.status ?? 'absent',
            note: rows[s._id]?.note?.trim() || null,
          })),
        },
      });
      toast.success(t('att.saved'));
      setDirty(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const counts = useMemo(() => {
    const c: Record<SevenxAttendanceStatus, number> = { present: 0, late: 0, absent: 0, excused: 0 };
    for (const s of students) c[rows[s._id]?.status ?? 'absent'] += 1;
    return c;
  }, [rows, students]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {STATUSES.map((s) => (
          <Badge key={s} tone={STATUS_TONE[s]}>
            {t(`att.${s}`)}: {counts[s]}
          </Badge>
        ))}
        {dirty && <Badge tone="gray">{t('att.unsaved')}</Badge>}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={allPresent}>
            {t('att.allPresent')}
          </Button>
          <Button size="sm" onClick={save} loading={saving} disabled={!dirty}>
            {t('att.save')}
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <ul className="divide-y divide-border">
            {students.map((student, index) => {
              const row = rows[student._id] ?? { status: 'absent', note: '' };
              return (
                <li key={student._id} className="flex flex-col gap-2 px-4 py-2.5 transition-colors hover:bg-accent/40 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="w-5 text-right text-xs text-muted">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{memberFullName(student)}</p>
                      <p className="truncate text-xs text-muted">{student.email}</p>
                      {checkIns[student._id] && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                          <IconMapPinCheck size={12} />
                          {t('checkIn.selfBadge', {
                            time: new Date(checkIns[student._id].at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            }),
                            distance: checkIns[student._id].distance,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex shrink-0 overflow-hidden rounded-md shadow-button-outline">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(student._id, s)}
                          className={cn(
                            'h-7 cursor-pointer border-r px-2.5 text-xs font-medium transition-[background-color,color,border-color] duration-200 last:border-r-0 active:brightness-95',
                            row.status === s
                              ? STATUS_STYLE[s]
                              : 'border-border bg-card text-muted hover:bg-accent hover:text-foreground',
                          )}
                        >
                          {t(`att.${s}`)}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={row.note}
                      onChange={(e) => setNote(student._id, e.target.value)}
                      placeholder={t('att.note')}
                      className="h-7 min-w-28 flex-1 text-xs lg:max-w-40"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
