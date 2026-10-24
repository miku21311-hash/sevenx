import { SevenxInvite, SevenxMember } from '@/members/graphql/resolvers/customResolvers/members';
import { SevenxClass } from '@/classes/graphql/resolvers/customResolvers/classes';
import {
  SevenxAttendance,
  SevenxAttendanceSummary,
} from '@/attendance/graphql/resolvers/customResolvers/attendance';
import {
  SevenxAssignment,
  SevenxSubmission,
} from '@/assignments/graphql/resolvers/customResolvers/assignments';
import { SevenxAnnouncement } from '@/announcements/graphql/resolvers/customResolvers/announcements';
import { SevenxLocation } from '@/locations/graphql/resolvers/customResolvers/locations';
import { SevenxChatMessage } from '@/chat/graphql/resolvers/customResolvers/chat';

export const customResolvers = {
  SevenxLocation,
  SevenxMember,
  SevenxInvite,
  SevenxClass,
  SevenxAttendance,
  SevenxAttendanceSummary,
  SevenxAssignment,
  SevenxSubmission,
  SevenxAnnouncement,
  SevenxChatMessage,
};
