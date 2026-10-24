import { IconCheck, IconCopy, IconTrash } from '@tabler/icons-react';
import { Button, Skeleton, Table } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ISevenxInvite, SevenxRole } from '~/modules/shared/types';
import { QueryError } from '~/modules/shared/components';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { formatDate } from '~/modules/shared/utils/schedule';
import { useInvites } from '../hooks/useInvites';
import { useMemberMutations } from '../hooks/useMemberMutations';

export const InvitesList = ({
  role,
  classId,
}: {
  role?: SevenxRole;
  classId?: string;
}) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { invites, loading, error, refetch } = useInvites({ role, classId });
  const { removeInvite, loading: removing } = useMemberMutations();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (invite: ISevenxInvite) => {
    try {
      await navigator.clipboard.writeText(invite.url);
      setCopiedId(invite._id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      toast.error(err);
    }
  };

  const remove = async (invite: ISevenxInvite) => {
    try {
      await removeInvite(invite._id);
      toast.success(t('invite-removed'));
    } catch (err) {
      toast.error(err);
    }
  };

  const inviteName = (invite: ISevenxInvite) =>
    [invite.firstName, invite.lastName].filter(Boolean).join(' ') || '—';

  const actions = (invite: ISevenxInvite) => (
    <div className="inline-flex shrink-0 gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => copy(invite)}
        aria-label={t('copy-link')}
      >
        {copiedId === invite._id ? <IconCheck /> : <IconCopy />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive"
        disabled={removing}
        onClick={() => remove(invite)}
        aria-label={t('remove')}
      >
        <IconTrash />
      </Button>
    </div>
  );

  if (error) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="px-3 pb-3">
      <h3 className="text-sm font-semibold text-muted-foreground px-1 py-2">
        {t('pending-invites')}
      </h3>
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : invites.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1 py-2">
          {t('no-pending-invites')}
        </p>
      ) : (
        <>
          {/* Phones: one card per invite; the fixed-layout table cannot fit. */}
          <ul className="flex flex-col gap-2 sm:hidden">
            {invites.map((invite) => (
              <li
                key={invite._id}
                className="flex items-center gap-2 rounded-lg border bg-sidebar px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {invite.email}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {[
                      inviteName(invite),
                      `${t('class-list')}: ${invite.classIds.length}`,
                      `${t('expires-at')}: ${formatDate(invite.expiresAt)}`,
                    ].join(' · ')}
                  </div>
                </div>
                {actions(invite)}
              </li>
            ))}
          </ul>
          <Table className="hidden sm:table">
            <Table.Header>
              <Table.Row>
                <Table.Head className="w-[35%]">{t('email')}</Table.Head>
                <Table.Head>{t('name')}</Table.Head>
                <Table.Head className="w-20">{t('class-list')}</Table.Head>
                <Table.Head className="w-28">{t('expires-at')}</Table.Head>
                <Table.Head className="w-28 text-right">
                  {t('actions')}
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {invites.map((invite) => (
                <Table.Row key={invite._id}>
                  <Table.Cell className="truncate" title={invite.email}>
                    {invite.email}
                  </Table.Cell>
                  <Table.Cell className="truncate">
                    {inviteName(invite)}
                  </Table.Cell>
                  <Table.Cell>{invite.classIds.length}</Table.Cell>
                  <Table.Cell>{formatDate(invite.expiresAt)}</Table.Cell>
                  <Table.Cell className="text-right">
                    {actions(invite)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </>
      )}
    </div>
  );
};
