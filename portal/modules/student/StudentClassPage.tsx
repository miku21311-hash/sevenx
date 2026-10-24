'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useT } from '@/modules/i18n/I18nProvider';
import { AnnouncementsPanel } from '@/modules/sevenx/components/AnnouncementsPanel';
import { ClassInfoHeader } from '@/modules/sevenx/components/ClassInfoHeader';
import { ChatEntryCard } from '@/modules/sevenx/chat/ClassChat';
import { useClassDetail } from '@/modules/sevenx/useClassDetail';
import {
  EmptyState,
  ErrorState,
  IconCalendar,
  IconClipboardCheck,
  IconClipboardList,
  IconSpeakerphone,
  LoadingState,
  Skeleton,
  Tabs,
} from '@/modules/ui';
import { CheckInCard } from './CheckInCard';
import { MyAttendanceTab } from './MyAttendanceTab';
import { ScheduleTab } from './ScheduleTab';
import { StudentAssignmentsTab } from './StudentAssignmentsTab';

type TabKey = 'assignments' | 'announcements' | 'schedule' | 'attendance';

const TAB_KEYS: TabKey[] = ['assignments', 'announcements', 'schedule', 'attendance'];

export function StudentClassPage({ classId }: { classId: string }) {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TabKey = TAB_KEYS.includes(tabParam as TabKey) ? (tabParam as TabKey) : 'assignments';
  const { cls, loading, error, refetch } = useClassDetail(classId);

  const setTab = (next: TabKey) => router.replace(`/s/classes/${classId}?tab=${next}`);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <LoadingState />
      </div>
    );
  }
  if (error && !cls) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!cls) return <EmptyState title={t('class.notFound')} />;

  return (
    <div className="space-y-4">
      <ClassInfoHeader cls={cls} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <ChatEntryCard cls={cls} />
        <CheckInCard cls={cls} />
      </div>
      <div>
        <Tabs<TabKey>
          value={tab}
          onChange={setTab}
          items={[
            { key: 'assignments', icon: <IconClipboardList />, label: t('tab.assignments') },
            { key: 'announcements', icon: <IconSpeakerphone />, label: t('tab.announcements') },
            { key: 'schedule', icon: <IconCalendar />, label: t('tab.schedule') },
            { key: 'attendance', icon: <IconClipboardCheck />, label: t('tab.myAttendance') },
          ]}
        />
        <div key={tab} className="animate-enter pt-4">
          {tab === 'assignments' && <StudentAssignmentsTab cls={cls} />}
          {tab === 'announcements' && <AnnouncementsPanel classId={cls._id} markReadOnOpen />}
          {tab === 'schedule' && <ScheduleTab cls={cls} />}
          {tab === 'attendance' && <MyAttendanceTab cls={cls} />}
        </div>
      </div>
    </div>
  );
}
