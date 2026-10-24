import { Model } from 'mongoose';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { sevenxAttendanceSchema } from '@/attendance/db/definitions/attendance';
import {
  ISevenxAttendanceDocument,
  ISevenxAttendanceItemInput,
  ISevenxAttendanceSummary,
  ISevenxCheckInInput,
  ISevenxCheckInStatus,
} from '@/attendance/@types/attendance';
import { ISevenxClassDocument } from '@/classes/@types/classes';
import { isSessionDate, pastSessionDates, toDateString } from '@/common/schedule';
import {
  DEFAULT_CHECK_IN_RADIUS,
  MAX_POSITION_ACCURACY,
  distanceMeters,
  isValidLatitude,
  isValidLongitude,
  resolveCheckInWindow,
  statusForWindow,
} from '@/common/checkIn';

const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export interface ISevenxAttendanceModel extends Model<ISevenxAttendanceDocument> {
  markAttendance(
    classId: string,
    date: string,
    items: ISevenxAttendanceItemInput[],
    markedBy: string,
  ): Promise<ISevenxAttendanceDocument[]>;
  listByClass(classId: string, from?: string, to?: string): Promise<ISevenxAttendanceDocument[]>;
  summarize(classId: string, studentIds: string[]): Promise<ISevenxAttendanceSummary[]>;
  checkInStatus(
    cls: ISevenxClassDocument,
    studentId: string,
    now?: Date,
  ): Promise<ISevenxCheckInStatus>;
  checkIn(
    cls: ISevenxClassDocument,
    studentId: string,
    position: ISevenxCheckInInput,
    now?: Date,
  ): Promise<ISevenxAttendanceDocument>;
}

export const loadSevenxAttendanceClass = (models: IModels) => {
  class Attendance {
    public static async markAttendance(
      classId: string,
      date: string,
      items: ISevenxAttendanceItemInput[],
      markedBy: string,
    ) {
      const cls = await models.Classes.getClass(classId);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new ExpectedError('date must be YYYY-MM-DD', 'VALIDATION');
      }
      if (!isSessionDate(cls.schedule, date)) {
        throw new ExpectedError('The class has no session on this date', 'VALIDATION');
      }
      const allowed = new Set(cls.studentIds);
      for (const item of items) {
        if (!allowed.has(item.studentId)) {
          throw new ExpectedError('Student is not enrolled in this class', 'VALIDATION');
        }
      }
      if (items.length) {
        await models.Attendances.bulkWrite(
          items.map((item) => ({
            updateOne: {
              filter: { classId, date, studentId: item.studentId },
              update: { $set: { status: item.status, note: item.note, markedBy } },
              upsert: true,
            },
          })),
        );
      }
      return models.Attendances.find({ classId, date }).lean();
    }

    public static async listByClass(classId: string, from?: string, to?: string) {
      const query: Record<string, unknown> = { classId };
      if (from || to) {
        query.date = { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) };
      }
      return models.Attendances.find(query).sort({ date: 1 }).lean();
    }

    public static async summarize(classId: string, studentIds: string[]) {
      const cls = await models.Classes.getClass(classId);
      const rows = await models.Attendances.find({ classId, studentId: { $in: studentIds } }).lean();
      // A session counts once it is in the past or once anyone has been marked for it.
      const sessionDates = new Set<string>(pastSessionDates(cls.schedule));
      const markedDates = await models.Attendances.distinct('date', { classId });
      for (const date of markedDates) {
        sessionDates.add(date);
      }
      const total = sessionDates.size;

      return studentIds.map((studentId) => {
        const mine = rows.filter((r) => r.studentId === studentId && sessionDates.has(r.date));
        const count = (status: string) => mine.filter((r) => r.status === status).length;
        const present = count('present');
        const late = count('late');
        const excused = count('excused');
        const absentMarked = count('absent');
        const unmarked = Math.max(total - mine.length, 0);
        const absent = absentMarked + unmarked;
        // Fraction 0..1 (UIs format it as a percentage).
        const rate = total > 0 ? Math.min(1, Math.round(((present + late) / total) * 1000) / 1000) : 0;
        return { studentId, total, present, late, absent, excused, rate };
      });
    }

    /** Today's self check-in window for a student, evaluated at server time. */
    public static async checkInStatus(
      cls: ISevenxClassDocument,
      studentId: string,
      now: Date = new Date(),
    ): Promise<ISevenxCheckInStatus> {
      const location = await models.Locations.findOne({ _id: cls.locationId }).lean();
      const locationReady =
        isValidLatitude(location?.latitude) && isValidLongitude(location?.longitude);
      const base = {
        classId: cls._id,
        serverTime: now,
        locationReady,
        checkInRadius: location ? location.checkInRadius ?? DEFAULT_CHECK_IN_RADIUS : null,
      };

      const date = toDateString(now);
      if (cls.status !== 'active' || !isSessionDate(cls.schedule, date)) {
        return { ...base, date: null, window: 'none', attendance: null, canCheckIn: false };
      }

      const { startTime, endTime } = cls.schedule;
      const info = resolveCheckInWindow(date, startTime, endTime, now);
      const attendance = await models.Attendances.findOne({ classId: cls._id, date, studentId }).lean();
      const canCheckIn =
        Boolean(statusForWindow(info.window)) &&
        locationReady &&
        !attendance?.checkedInAt &&
        attendance?.status !== 'excused';

      return { ...base, date, startTime, endTime, ...info, attendance, canCheckIn };
    }

    /**
     * Student self check-in. Status comes from the window at server time; the
     * position must lie within the location's check-in radius.
     */
    public static async checkIn(
      cls: ISevenxClassDocument,
      studentId: string,
      { latitude, longitude, accuracy }: ISevenxCheckInInput,
      now: Date = new Date(),
    ) {
      if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
        throw new ExpectedError('A valid location is required to check in', 'VALIDATION');
      }
      if (accuracy !== undefined && accuracy !== null) {
        if (!Number.isFinite(accuracy) || accuracy < 0) {
          throw new ExpectedError('Location accuracy is invalid', 'VALIDATION');
        }
        if (accuracy > MAX_POSITION_ACCURACY) {
          throw new ExpectedError(
            'Your location is too imprecise. Turn on precise location and try again',
            'VALIDATION',
          );
        }
      }

      const state = await models.Attendances.checkInStatus(cls, studentId, now);
      const status = statusForWindow(state.window);

      if (state.window === 'none') {
        throw new ExpectedError('This class has no session today', 'VALIDATION');
      }
      if (state.window === 'early' && state.opensAt) {
        throw new ExpectedError(`Check-in opens at ${hhmm(state.opensAt)}`, 'VALIDATION');
      }
      if (!status) {
        throw new ExpectedError("Check-in for today's session is closed", 'VALIDATION');
      }
      if (!state.locationReady) {
        throw new ExpectedError(
          'Check-in is not set up for this location yet. Ask your teacher to mark you',
          'VALIDATION',
        );
      }
      if (state.attendance?.checkedInAt) {
        throw new ExpectedError('You have already checked in for this session', 'VALIDATION');
      }
      if (state.attendance?.status === 'excused') {
        throw new ExpectedError('You are already excused for this session', 'VALIDATION');
      }

      const location = await models.Locations.getLocation(cls.locationId);
      const radius = location.checkInRadius ?? DEFAULT_CHECK_IN_RADIUS;
      const distance = distanceMeters(
        { latitude, longitude },
        { latitude: location.latitude as number, longitude: location.longitude as number },
      );
      if (distance > radius) {
        throw new ExpectedError(
          `You are ${Math.round(distance)} m from ${location.name}. Check-in works within ${radius} m`,
          'VALIDATION',
        );
      }

      try {
        // The checkedInAt guard makes a concurrent second check-in hit the unique index.
        return await models.Attendances.findOneAndUpdate(
          { classId: cls._id, date: state.date, studentId, checkedInAt: { $exists: false } },
          {
            $set: {
              status,
              checkedInAt: now,
              checkInDistance: Math.round(distance),
              markedBy: studentId,
            },
          },
          { new: true, upsert: true },
        ).lean();
      } catch (e) {
        if ((e as { code?: number }).code === 11000) {
          throw new ExpectedError('You have already checked in for this session', 'VALIDATION');
        }
        throw e;
      }
    }
  }

  sevenxAttendanceSchema.loadClass(Attendance);
  return sevenxAttendanceSchema;
};
