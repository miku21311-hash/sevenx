import { IconPlus, IconSearch } from '@tabler/icons-react';
import { Button, Input, PageSubHeader, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { QueryError, SevenxPageHeader } from '~/modules/shared/components';
import { SevenxRole } from '~/modules/shared/types';
import { useMemberMutations } from '../hooks/useMemberMutations';
import { useMembers } from '../hooks/useMembers';
import { InviteSheet } from './InviteSheet';
import { InvitesList } from './InvitesList';
import {
  MEMBER_DETAIL_QUERY_KEY,
  MemberDetailSheet,
} from './MemberDetailSheet';
import { MembersTable } from './MembersTable';

interface MembersViewProps {
  memberRole: SevenxRole;
  icon: React.ElementType;
  iconName: string;
  title: string;
  path: string;
  emptyTitle: string;
}

export const MembersView = ({
  memberRole: role,
  icon,
  iconName,
  title,
  path,
  emptyTitle,
}: MembersViewProps) => {
  const { t } = useTranslation('sevenx');
  const [search, setSearch] = useState('');
  const [searchValue] = useDebounce(search, 300);
  const { members, loading, error, refetch } = useMembers({
    role,
    searchValue: searchValue || undefined,
  });
  const { removeMember } = useMemberMutations();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [, setMemberId] = useQueryState<string>(MEMBER_DETAIL_QUERY_KEY);

  const inviteLabel = role === 'teacher' ? t('invite-teacher') : t('invite-student');

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader icon={icon} iconName={iconName} title={title} path={path}>
        <Button onClick={() => setInviteOpen(true)} aria-label={inviteLabel}>
          <IconPlus />
          <span className="hidden sm:inline">{inviteLabel}</span>
        </Button>
      </SevenxPageHeader>
      <PageSubHeader>
        <div className="relative w-full sm:w-64">
          <IconSearch className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </PageSubHeader>
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {error ? (
          <QueryError message={error.message} onRetry={() => refetch()} />
        ) : (
          <MembersTable
            members={members}
            loading={loading}
            emptyIcon={icon}
            emptyTitle={emptyTitle}
            onOpen={(member) => setMemberId(member._id)}
            onRemove={removeMember}
            onInvite={() => setInviteOpen(true)}
            t={t}
          />
        )}
        <InvitesList role={role} />
      </div>
      <InviteSheet open={inviteOpen} onOpenChange={setInviteOpen} role={role} />
      <MemberDetailSheet role={role} />
    </div>
  );
};
