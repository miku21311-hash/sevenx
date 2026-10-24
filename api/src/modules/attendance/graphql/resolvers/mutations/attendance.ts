import { IContext } from '~/connectionResolvers';
import { ISevenxAttendanceItemInput, ISevenxCheckInInput } from '@/attendance/@types/attendance';
import {
  portal,
  requireClassAccess,
  requireMember,
  shared,
  SevenxResolver,
} from '@/common/auth';

export const sevenxAttendanceMutations: Record<string, SevenxResolver> = {
  sevenxAttendanceMark: shared(
    async (
      _root,
      { classId, date, items }: { classId: string; date: string; items: ISevenxAttendanceItemInput[] },
      context: IContext,
    ) => {
      const { actor } = await requireClassAccess(context, classId, 'teacher');
      const markedBy = actor.kind === 'supervisor' ? actor.userId : actor.member._id;
      return context.models.Attendances.markAttendance(classId, date, items, markedBy);
    },
  ),

  sevenxAttendanceCheckIn: portal(
    async (
      _root,
      { classId, ...position }: ISevenxCheckInInput & { classId: string },
      context: IContext,
    ) => {
      const member = await requireMember(context, 'student');
      const { cls } = await requireClassAccess(context, classId);
      return context.models.Attendances.checkIn(cls, member._id, position);
    },
  ),
};
