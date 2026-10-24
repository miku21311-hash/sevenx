import { parseDateString, timeToMinutes } from './schedule';
import { SevenxAttendanceStatus } from './types';

/** Minutes before the start when self check-in opens. */
export const CHECK_IN_OPENS_BEFORE = 30;
/** Minutes after the start that still count as on time. */
export const CHECK_IN_PRESENT_AFTER = 10;
/** Final minutes of a session in which a check-in counts as absent. */
export const CHECK_IN_ABSENT_LAST = 20;

export const DEFAULT_CHECK_IN_RADIUS = 150;
export const MIN_CHECK_IN_RADIUS = 20;
export const MAX_CHECK_IN_RADIUS = 2000;
/** Positions reported less precisely than this (meters) are rejected. */
export const MAX_POSITION_ACCURACY = 1000;

export type SevenxCheckInWindow = 'none' | 'early' | 'present' | 'late' | 'absent' | 'closed';

export interface ICheckInWindowInfo {
  window: SevenxCheckInWindow;
  opensAt: Date;
  presentUntil: Date;
  lateUntil: Date;
  closesAt: Date;
}

export interface IGeoPoint {
  latitude: number;
  longitude: number;
}

const atTime = (date: string, time: string, offsetMinutes = 0): Date => {
  const d = parseDateString(date);
  d.setMinutes(timeToMinutes(time) + offsetMinutes);
  return d;
};

/**
 * Window for a session on `date` (server local time):
 * present [start-30, start+10], late (start+10, end-20), absent [end-20, end].
 * When a session is too short for a late phase, absent wins from end-20.
 */
export const resolveCheckInWindow = (
  date: string,
  startTime: string,
  endTime: string,
  now: Date,
): ICheckInWindowInfo => {
  const opensAt = atTime(date, startTime, -CHECK_IN_OPENS_BEFORE);
  const presentUntil = atTime(date, startTime, CHECK_IN_PRESENT_AFTER);
  const closesAt = atTime(date, endTime);
  const lateUntil = atTime(date, endTime, -CHECK_IN_ABSENT_LAST);
  const t = now.getTime();

  let window: SevenxCheckInWindow;
  if (t < opensAt.getTime()) {
    window = 'early';
  } else if (t > closesAt.getTime()) {
    window = 'closed';
  } else if (t >= lateUntil.getTime()) {
    window = 'absent';
  } else if (t <= presentUntil.getTime()) {
    window = 'present';
  } else {
    window = 'late';
  }

  return { window, opensAt, presentUntil, lateUntil, closesAt };
};

export const statusForWindow = (window: SevenxCheckInWindow): SevenxAttendanceStatus | null =>
  window === 'present' || window === 'late' || window === 'absent' ? window : null;

/** Great-circle distance in meters (haversine). */
export const distanceMeters = (a: IGeoPoint, b: IGeoPoint): number => {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

export const isValidLatitude = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= -90 && value <= 90;

export const isValidLongitude = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= -180 && value <= 180;
