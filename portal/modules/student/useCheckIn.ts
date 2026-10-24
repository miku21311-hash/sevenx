'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useT } from '@/modules/i18n/I18nProvider';
import { SEVENX_ATTENDANCE_CHECK_IN, SEVENX_CHECK_IN_STATUS } from '@/modules/sevenx/graphql';
import type {
  SevenxAttendance,
  SevenxCheckInStatus,
  SevenxCheckInWindow,
  SevenxClass,
} from '@/modules/sevenx/types';
import { useToast } from '@/modules/ui';

type StatusData = { sevenxCheckInStatus: SevenxCheckInStatus };
type CheckInData = { sevenxAttendanceCheckIn: SevenxAttendance };

export type CheckInStep = 'idle' | 'locating' | 'sending';

const POLL_MS = 30_000;

export const hhmm = (ms: number) => {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const countdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mmss = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
};

export const toMs = (value?: string | null) => (value ? new Date(value).getTime() : NaN);

/** Mirrors the server rule so the UI updates between polls; the server still decides. */
const windowAt = (now: number, status: SevenxCheckInStatus): SevenxCheckInWindow => {
  const opens = toMs(status.opensAt);
  const presentUntil = toMs(status.presentUntil);
  const lateUntil = toMs(status.lateUntil);
  const closes = toMs(status.closesAt);
  if (!status.date || [opens, presentUntil, lateUntil, closes].some(Number.isNaN)) {
    return status.window;
  }
  if (now < opens) return 'early';
  if (now > closes) return 'closed';
  if (now >= lateUntil) return 'absent';
  if (now <= presentUntil) return 'present';
  return 'late';
};

const getPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 0,
    }),
  );

export type CheckInState = {
  loading: boolean;
  status: SevenxCheckInStatus | undefined;
  /** Server-synced clock in ms. */
  now: number;
  live: SevenxCheckInWindow;
  attendance: SevenxAttendance | null | undefined;
  checkedIn: boolean;
  excused: boolean;
  canCheckIn: boolean;
  step: CheckInStep;
  error: string | null;
  onCheckIn: () => Promise<void>;
};

/** Today's self check-in for one class: polled status, live window and the geolocated check-in. */
export const useCheckIn = (cls: SevenxClass): CheckInState => {
  const t = useT();
  const toast = useToast();
  const { data, loading } = useQuery<StatusData>(SEVENX_CHECK_IN_STATUS, {
    variables: { classId: cls._id },
    fetchPolicy: 'cache-and-network',
    pollInterval: POLL_MS,
  });
  const [checkIn] = useMutation<CheckInData>(SEVENX_ATTENDANCE_CHECK_IN, {
    refetchQueries: [
      'sevenxPortalCheckInStatus',
      'sevenxPortalMyAttendance',
      'sevenxPortalMyAttendanceSummary',
    ],
    awaitRefetchQueries: true,
  });
  const [step, setStep] = useState<CheckInStep>('idle');
  const [error, setError] = useState<string | null>(null);

  const status = data?.sevenxCheckInStatus;

  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Server clock offset (within a second) so countdowns follow server time, not the phone's clock.
  const [offset, setOffset] = useState(0);
  const [serverStamp, setServerStamp] = useState<string | null>(null);
  if (status && status.serverTime !== serverStamp) {
    setServerStamp(status.serverTime);
    setOffset(new Date(status.serverTime).getTime() - tick);
  }
  const now = tick + offset;

  const live: SevenxCheckInWindow = status ? windowAt(now, status) : 'none';
  const attendance = status?.attendance;
  const checkedIn = Boolean(attendance?.checkedInAt);
  const excused = attendance?.status === 'excused';
  const open = live === 'present' || live === 'late' || live === 'absent';
  const canCheckIn = Boolean(status?.locationReady) && open && !checkedIn && !excused;

  const geoMessage = (err: GeolocationPositionError) =>
    err.code === err.PERMISSION_DENIED
      ? t('checkIn.geo.denied')
      : err.code === err.TIMEOUT
        ? t('checkIn.geo.timeout')
        : t('checkIn.geo.unavailable');

  // Server errors are English; translate the ones students can act on.
  const serverMessage = (message: string) => {
    const far = message.match(/You are (\d+) m from .+ within (\d+) m/);
    if (far) return t('checkIn.tooFar', { distance: far[1], radius: far[2] });
    return message;
  };

  const onCheckIn = async () => {
    setError(null);
    if (!window.isSecureContext) {
      setError(t('checkIn.geo.insecure'));
      return;
    }
    if (!('geolocation' in navigator)) {
      setError(t('checkIn.geo.unsupported'));
      return;
    }
    setStep('locating');
    let position: GeolocationPosition;
    try {
      position = await getPosition();
    } catch (err) {
      setError(geoMessage(err as GeolocationPositionError));
      setStep('idle');
      return;
    }
    setStep('sending');
    try {
      const { data: result } = await checkIn({
        variables: {
          classId: cls._id,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
      });
      const recorded = result?.sevenxAttendanceCheckIn.status;
      if (recorded === 'present' || recorded === 'late' || recorded === 'absent') {
        const message = t(`checkIn.success.${recorded}`);
        if (recorded === 'present') toast.success(message);
        else toast.info(message);
      }
    } catch (err) {
      const message = serverMessage((err as Error).message);
      setError(message);
      toast.error(message);
    } finally {
      setStep('idle');
    }
  };

  return {
    loading: loading && !status,
    status,
    now,
    live,
    attendance,
    checkedIn,
    excused,
    canCheckIn,
    step,
    error,
    onCheckIn,
  };
};
