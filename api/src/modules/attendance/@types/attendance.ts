import { Document } from 'mongoose';
import { SevenxAttendanceStatus } from '@/common/types';
import { SevenxCheckInWindow } from '@/common/checkIn';

export interface ISevenxAttendance {
  classId: string;
  date: string;
  studentId: string;
  status: SevenxAttendanceStatus;
  note?: string;
  markedBy?: string;
  checkedInAt?: Date;
  checkInDistance?: number;
}

export interface ISevenxAttendanceDocument extends ISevenxAttendance, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISevenxAttendanceItemInput {
  studentId: string;
  status: SevenxAttendanceStatus;
  note?: string;
}

export interface ISevenxCheckInInput {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface ISevenxCheckInStatus {
  classId: string;
  date: string | null;
  startTime?: string;
  endTime?: string;
  window: SevenxCheckInWindow;
  opensAt?: Date;
  presentUntil?: Date;
  lateUntil?: Date;
  closesAt?: Date;
  serverTime: Date;
  locationReady: boolean;
  checkInRadius: number | null;
  attendance: ISevenxAttendanceDocument | null;
  canCheckIn: boolean;
}

export interface ISevenxAttendanceSummary {
  studentId: string;
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  rate: number;
}
