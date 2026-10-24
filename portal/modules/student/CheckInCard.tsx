'use client';

import { useT } from '@/modules/i18n/I18nProvider';
import type { SevenxClass } from '@/modules/sevenx/types';
import {
  Badge,
  Button,
  Card,
  IconAlertCircle,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconHourglass,
  IconMapPin,
  Skeleton,
  cn,
} from '@/modules/ui';
import { countdown, hhmm, toMs, useCheckIn, type CheckInState } from './useCheckIn';

type Phase = { key: 'present' | 'late' | 'absent'; from: number; to: number };

const PHASE_STYLE: Record<Phase['key'], string> = {
  present: 'bg-success',
  late: 'bg-warning',
  absent: 'bg-danger',
};

const STATUS_TONE = { present: 'green', late: 'amber', absent: 'red', excused: 'blue' } as const;

function CheckInAction({ state, className }: { state: CheckInState; className?: string }) {
  const t = useT();
  const { live, step, canCheckIn, onCheckIn } = state;
  return (
    <Button
      size="lg"
      variant={live === 'absent' ? 'danger' : live === 'late' ? 'outline' : 'primary'}
      disabled={!canCheckIn || step !== 'idle'}
      loading={step !== 'idle'}
      onClick={onCheckIn}
      className={cn('min-w-28', className)}
    >
      {step === 'idle' && <IconCheck />}
      {step === 'locating'
        ? t('checkIn.locating')
        : step === 'sending'
          ? t('checkIn.sending')
          : t('checkIn.button')}
    </Button>
  );
}

/** Right-aligned check-in control for a class card: button, or the recorded status once done. */
export function CheckInButton({ cls, className }: { cls: SevenxClass; className?: string }) {
  const t = useT();
  const state = useCheckIn(cls);
  const { status, live, attendance, checkedIn, excused, now, error } = state;

  if (state.loading) return <Skeleton className={cn('h-8 w-28 rounded', className)} />;

  let hint: string | null = null;
  if (!status || live === 'none') hint = t('checkIn.noSessionToday');
  else if (excused) hint = t('checkIn.excusedShort');
  else if (!status.locationReady) hint = t('checkIn.notReadyShort');
  else if (live === 'early') hint = t('checkIn.opensAt', { time: hhmm(toMs(status.opensAt)), left: countdown(toMs(status.opensAt) - now) });
  else if (live === 'closed') hint = t('checkIn.closedShort');
  else if (live === 'late' || live === 'absent') hint = t(`checkIn.willBe.${live}`);

  return (
    <div className={cn('flex shrink-0 flex-col items-end gap-1 text-right', className)}>
      {checkedIn && attendance ? (
        <>
          <Badge tone={STATUS_TONE[attendance.status]}>
            <IconCircleCheck size={12} />
            {t(`att.${attendance.status}`)}
          </Badge>
          <span className="text-xs text-muted tabular-nums">
            {t('checkIn.doneAt', { time: hhmm(toMs(attendance.checkedInAt)) })}
          </span>
        </>
      ) : (
        <>
          <CheckInAction state={state} />
          {hint && (
            <span
              className={cn(
                'max-w-48 text-xs tabular-nums',
                live === 'late' ? 'text-warning' : live === 'absent' ? 'text-danger' : 'text-muted',
              )}
            >
              {hint}
            </span>
          )}
        </>
      )}
      {error && (
        <span key={error} role="alert" className="max-w-56 animate-shake text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}

/** Full check-in panel for today's session with the present/late/absent timeline. */
export function CheckInCard({ cls }: { cls: SevenxClass }) {
  const t = useT();
  const state = useCheckIn(cls);
  const { status, now, live, attendance, checkedIn, excused, error } = state;

  if (state.loading) return <Skeleton className="h-24 rounded-xl" />;
  if (!status || status.window === 'none') return null;

  const opens = toMs(status.opensAt);
  const presentUntil = toMs(status.presentUntil);
  const lateUntil = toMs(status.lateUntil);
  const closes = toMs(status.closesAt);
  const phases: Phase[] = [
    { key: 'present', from: opens, to: Math.min(presentUntil, lateUntil) },
    { key: 'late', from: presentUntil, to: lateUntil },
    { key: 'absent', from: lateUntil, to: closes },
  ].filter((p): p is Phase => p.to > p.from);
  const span = closes - opens;
  const marker = Math.min(100, Math.max(0, ((now - opens) / span) * 100));
  const phaseEnd = live === 'present' ? presentUntil : live === 'late' ? lateUntil : closes;

  return (
    <Card className="animate-enter overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-300',
            checkedIn ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary',
          )}
        >
          {checkedIn ? <IconCircleCheck size={18} /> : <IconMapPin size={18} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{t('checkIn.title')}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <IconClock size={12} />
            {t('checkIn.today', { start: status.startTime ?? '', end: status.endTime ?? '' })}
            {status.locationReady && status.checkInRadius ? (
              <span className="hidden sm:inline">· {t('checkIn.radius', { radius: status.checkInRadius })}</span>
            ) : null}
          </p>
        </div>

        {checkedIn && attendance ? (
          <div className="flex animate-fade flex-col items-end gap-1">
            <Badge tone={STATUS_TONE[attendance.status]}>{t(`att.${attendance.status}`)}</Badge>
            <span className="text-xs text-muted">
              {t('checkIn.done', {
                time: hhmm(toMs(attendance.checkedInAt)),
                distance: attendance.checkInDistance ?? 0,
              })}
            </span>
          </div>
        ) : (
          <CheckInAction state={state} />
        )}
      </div>

      {phases.length > 0 && span > 0 && (
        <div className="px-4 pb-3">
          <div className="relative flex h-1.5 overflow-hidden rounded-full bg-accent">
            {phases.map((p) => (
              <span
                key={p.key}
                className={cn(
                  'h-full transition-opacity duration-300',
                  PHASE_STYLE[p.key],
                  live === p.key ? 'opacity-100' : 'opacity-30',
                )}
                style={{ width: `${((p.to - p.from) / span) * 100}%` }}
              />
            ))}
          </div>
          <div className="relative h-0">
            {(live === 'present' || live === 'late' || live === 'absent') && (
              <span
                aria-hidden
                className="absolute -top-[9px] size-3 -translate-x-1/2 rounded-full border-2 border-background bg-foreground shadow-xs transition-[left] duration-1000 ease-linear"
                style={{ left: `${marker}%` }}
              />
            )}
          </div>
          <div className="mt-1.5 flex justify-between text-[11px] text-accent-foreground tabular-nums">
            <span>{hhmm(opens)}</span>
            <span>{hhmm(presentUntil)}</span>
            <span>{hhmm(lateUntil)}</span>
            <span>{hhmm(closes)}</span>
          </div>
        </div>
      )}

      {!checkedIn && (
        <div className="border-t bg-sidebar px-4 py-2.5 text-xs">
          {excused ? (
            <p className="text-info">{t('checkIn.excused')}</p>
          ) : !status.locationReady ? (
            <p className="flex items-center gap-1.5 text-warning">
              <IconAlertCircle size={14} />
              {t('checkIn.notReady')}
            </p>
          ) : live === 'early' ? (
            <p className="flex items-center gap-1.5 text-muted">
              <IconHourglass size={14} />
              {t('checkIn.opensIn', { time: hhmm(opens), left: countdown(opens - now) })}
            </p>
          ) : live === 'closed' ? (
            <p className="text-muted">{t('checkIn.closed')}</p>
          ) : (
            <p
              className={cn(
                'flex flex-wrap items-center gap-x-2 gap-y-1',
                live === 'present' && 'text-success',
                live === 'late' && 'text-warning',
                live === 'absent' && 'text-danger',
              )}
            >
              <span className="font-medium">{t(`checkIn.willBe.${live}`)}</span>
              <span className="text-muted tabular-nums">
                · {t('checkIn.phaseEndsIn', { left: countdown(phaseEnd - now) })}
              </span>
            </p>
          )}
          {error && (
            <p key={error} role="alert" className="mt-1.5 animate-shake text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
