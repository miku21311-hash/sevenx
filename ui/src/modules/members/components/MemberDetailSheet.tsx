import { IconAlertCircle, IconTrash, IconUserQuestion } from '@tabler/icons-react';
import {
  Avatar,
  Badge,
  Button,
  Empty,
  FocusSheet,
  Label,
  RelativeDateDisplay,
  ScrollArea,
  Separator,
  TextField,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { useClasses } from '~/modules/classes/hooks/useClasses';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import {
  ISevenxMember,
  SevenxRole,
  memberFullName,
} from '~/modules/shared/types';
import {
  MemberEditableField,
  useMemberMutations,
} from '../hooks/useMemberMutations';
import { useMembers } from '../hooks/useMembers';

/** URL query key of the open member, like core's `cpUserId`. */
export const MEMBER_DETAIL_QUERY_KEY = 'memberId';

const DetailItem = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <fieldset className="space-y-2 min-w-0">
    <Label asChild>
      <legend>{label}</legend>
    </Label>
    {children}
  </fieldset>
);

export const MemberDetailSheet = ({ role }: { role: SevenxRole }) => {
  const { t } = useTranslation('sevenx');
  const [memberId, setMemberId] = useQueryState<string>(MEMBER_DETAIL_QUERY_KEY);
  const { members, loading, error } = useMembers({ role });
  const member = members.find((m) => m._id === memberId);

  return (
    <FocusSheet
      open={!!memberId}
      onOpenChange={(open) => !open && setMemberId(null)}
    >
      <FocusSheet.View
        className="lg:w-[880px]"
        loading={loading}
        error={!!error}
        notFound={!member && !loading}
        errorState={
          <DetailState icon={IconAlertCircle} title={t('error-title')}>
            {error?.message}
          </DetailState>
        }
        notFoundState={
          <DetailState icon={IconUserQuestion} title={t('member-not-found')}>
            {t('member-not-found-description')}
          </DetailState>
        }
      >
        <FocusSheet.Header
          title={role === 'teacher' ? t('teacher') : t('student')}
        />
        <FocusSheet.Content>
          {member && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <MemberDetailGeneral
                member={member}
                onRemoved={() => setMemberId(null)}
              />
              <Separator />
              <ScrollArea className="h-full">
                <MemberDetailFields member={member} />
              </ScrollArea>
            </div>
          )}
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};

const DetailState = ({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children?: React.ReactNode;
}) => (
  <div className="flex items-center justify-center h-full">
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <Icon />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{children}</Empty.Description>
      </Empty.Header>
    </Empty>
  </div>
);

const MemberDetailGeneral = ({
  member,
  onRemoved,
}: {
  member: ISevenxMember;
  onRemoved: () => void;
}) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { confirm } = useConfirm();
  const { removeMember, loading } = useMemberMutations();
  const name = memberFullName(member) || member.email;

  const handleDelete = () =>
    confirm({
      message: t('remove-member'),
      options: {
        description: t('confirm-remove-description'),
        confirmationValue: 'delete',
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(async () => {
      try {
        await removeMember(member._id);
        toast.success(t('member-removed'));
        onRemoved();
      } catch (err) {
        toast.error(err);
      }
    });

  return (
    <div className="py-5 px-4 sm:px-8 flex gap-3 items-center flex-col sm:flex-row">
      <Avatar size="lg" className="h-12 w-12">
        <Avatar.Fallback>{name.charAt(0).toUpperCase()}</Avatar.Fallback>
      </Avatar>
      <div className="flex flex-col items-center sm:items-start flex-1 min-w-0">
        <span className="text-base font-semibold truncate max-w-full">
          {name}
        </span>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge variant="secondary">
            {member.role === 'teacher' ? t('teacher') : t('student')}
          </Badge>
          <Badge variant={member.status === 'active' ? 'success' : 'warning'}>
            {member.status === 'active' ? t('active') : t('invited')}
          </Badge>
          <Badge variant={member.cpUserId ? 'success' : 'secondary'}>
            {member.cpUserId ? t('portal-linked') : t('portal-not-linked')}
          </Badge>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="text-destructive shrink-0"
        onClick={handleDelete}
        disabled={loading}
      >
        <IconTrash className="w-4 h-4" />
        {t('delete')}
      </Button>
    </div>
  );
};

const MemberDetailFields = ({ member }: { member: ISevenxMember }) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { editMember } = useMemberMutations();
  const { classes, loading: classesLoading } = useClasses();

  const memberClasses = classes.filter((c) =>
    member.role === 'teacher'
      ? c.teacherId === member._id
      : member.classIds.includes(c._id),
  );

  const schemas: Record<MemberEditableField, z.ZodString> = {
    firstName: z.string().trim().min(1, t('field-required')).max(100),
    lastName: z.string().trim().min(1, t('field-required')).max(100),
    phone: z
      .string()
      .trim()
      .max(30, t('invalid-phone'))
      .regex(/^[+\d\s()-]*$/, t('invalid-phone')),
  };

  const save = async (field: MemberEditableField, value: string) => {
    const parsed = schemas[field].safeParse(value);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message);
      return;
    }
    try {
      await editMember(member._id, field, parsed.data);
      toast.success(t('member-updated'));
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
      <DetailItem label={t('first-name')}>
        <TextField
          value={member.firstName}
          placeholder={t('first-name')}
          onSave={(value) => save('firstName', value)}
        />
      </DetailItem>
      <DetailItem label={t('last-name')}>
        <TextField
          value={member.lastName}
          placeholder={t('last-name')}
          onSave={(value) => save('lastName', value)}
        />
      </DetailItem>
      <DetailItem label={t('email')}>
        <p className="h-8 flex items-center px-2 text-sm text-muted-foreground truncate">
          {member.email}
        </p>
      </DetailItem>
      <DetailItem label={t('phone')}>
        <TextField
          value={member.phone ?? ''}
          placeholder={t('phone')}
          onSave={(value) => save('phone', value)}
        />
      </DetailItem>
      <DetailItem label={t('class-list')}>
        <div className="flex flex-wrap gap-1 min-h-8 items-center">
          {classesLoading && (
            <span className="text-sm text-muted-foreground">…</span>
          )}
          {!classesLoading && memberClasses.length === 0 && (
            <span className="text-sm text-muted-foreground">
              {t('no-member-classes')}
            </span>
          )}
          {memberClasses.map((c) => (
            <Link key={c._id} to={`/sevenx/classes/${c._id}`}>
              <Badge variant="secondary" className="hover:underline">
                {c.name}
              </Badge>
            </Link>
          ))}
        </div>
      </DetailItem>
      <DetailItem label={t('created-at')}>
        {member.createdAt ? (
          <RelativeDateDisplay value={member.createdAt} asChild>
            <span className="text-sm">
              <RelativeDateDisplay.Value value={member.createdAt} />
            </span>
          </RelativeDateDisplay>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </DetailItem>
    </div>
  );
};
