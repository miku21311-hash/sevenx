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
  IconClipboardCheck,
  IconClipboardList,
  IconSpeakerphone,
  IconUsers,
  LoadingState,
  Skeleton,
  Tabs,
} from '@/modules/ui';
import { AssignmentsTab } from './AssignmentsTab';
import { AttendanceTab } from './AttendanceTab';
import { StudentsTab } from './StudentsTab';

type TabKey = 'attendance' | 'assignments' | 'students' | 'announcements';

const TAB_KEYS: TabKey[] = ['attendance', 'assignments', 'students', 'announcements'];

export function TeacherClassPage({ classId }: { classId: string }) {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TabKey = TAB_KEYS.includes(tabParam as TabKey) ? (tabParam as TabKey) : 'attendance';
  const { cls, loading, error, refetch } = useClassDetail(classId);

  const setTab = (next: TabKey) => router.replace(`/t/classes/${classId}?tab=${next}`);

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
      <ClassInfoHeader cls={cls} showTeacher={false} />
      <ChatEntryCard cls={cls} />
      <div>
        <Tabs<TabKey>
          value={tab}
          onChange={setTab}
          items={[
            { key: 'attendance', icon: <IconClipboardCheck />, label: t('tab.attendance') },
            { key: 'assignments', icon: <IconClipboardList />, label: t('tab.assignments') },
            { key: 'students', icon: <IconUsers />, label: t('tab.students'), badge: cls.students.length },
            { key: 'announcements', icon: <IconSpeakerphone />, label: t('tab.announcements') },
          ]}
        />
        <div key={tab} className="animate-enter pt-4">
          {tab === 'attendance' && <AttendanceTab cls={cls} />}
          {tab === 'assignments' && <AssignmentsTab cls={cls} />}
          {tab === 'students' && <StudentsTab cls={cls} onChanged={() => refetch()} />}
          {tab === 'announcements' && <AnnouncementsPanel classId={cls._id} canCreate />}
        </div>
      </div>
    </div>
  );
}
