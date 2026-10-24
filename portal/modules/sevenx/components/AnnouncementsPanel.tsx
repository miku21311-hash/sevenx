'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { AttachmentList, AttachmentPicker } from '@/modules/files/Attachments';
import { formatDateTime } from '@/modules/sevenx/date';
import {
  SEVENX_ANNOUNCEMENTS,
  SEVENX_ANNOUNCEMENT_ADD,
  SEVENX_ANNOUNCEMENT_MARK_READ,
} from '@/modules/sevenx/graphql';
import type { SevenxAnnouncement, SevenxAttachmentInput } from '@/modules/sevenx/types';
import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  IconChevronDown,
  IconSpeakerphone,
  Input,
  LoadingState,
  Textarea,
  cn,
  stagger,
  useToast,
} from '@/modules/ui';

export type AnnouncementsData = { sevenxAnnouncements: SevenxAnnouncement[] };

export function AnnouncementsPanel({
  classId,
  canCreate,
  markReadOnOpen,
  limit,
  initialCount = 3,
}: {
  classId?: string;
  canCreate?: boolean;
  markReadOnOpen?: boolean;
  limit?: number;
  /** How many of the newest announcements show before "Show more". */
  initialCount?: number;
}) {
  const t = useT();
  const { locale } = useLocale();
  const variables = { classId, limit };
  const { data, loading, error, refetch } = useQuery<AnnouncementsData>(SEVENX_ANNOUNCEMENTS, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const [open, setOpen] = useState<SevenxAnnouncement | null>(null);
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [markRead] = useMutation<{ sevenxAnnouncementMarkRead: SevenxAnnouncement }>(
    SEVENX_ANNOUNCEMENT_MARK_READ,
  );

  const onOpen = async (item: SevenxAnnouncement) => {
    setOpen(item);
    if (markReadOnOpen && !item.isRead) {
      try {
        await markRead({ variables: { _id: item._id } });
      } catch {
        // read state is cosmetic, do not interrupt reading
      }
    }
  };

  const items = data?.sevenxAnnouncements ?? [];
  const visible = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = Math.max(items.length - initialCount, 0);
  const hiddenUnread = items.slice(initialCount).filter((item) => !item.isRead).length;

  return (
    <div className="space-y-3">
      {canCreate && classId && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreating(true)}>
            {t('ann.new')}
          </Button>
        </div>
      )}

      {loading && !data && <LoadingState />}
      {error && !data && <ErrorState message={error.message} onRetry={() => refetch()} />}
      {data && items.length === 0 && <EmptyState title={t('ann.none')} />}

      <ul className="sx-stagger space-y-2">
        {visible.map((item, i) => (
          <li
            key={item._id}
            // Revealed items stagger from the first hidden one, not from the top.
            style={stagger(Math.min(i >= initialCount ? i - initialCount : i, 8))}
          >
            <button
              type="button"
              onClick={() => onOpen(item)}
              className={cn(
                'w-full cursor-pointer rounded-lg bg-background px-4 py-3 text-left shadow-xs transition-[box-shadow,background-color] duration-200 hover:bg-accent/60 hover:shadow-sm',
                !item.isRead && 'shadow-[inset_3px_0_0_var(--primary),0_0_0_1px_var(--border-shadow),0_1px_1px_var(--shadow),0_2px_2px_var(--shadow)]',
              )}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted">{item.body}</p>
                </div>
                <div className="order-first flex shrink-0 flex-wrap gap-1 sm:order-none sm:flex-col sm:items-end">
                  {!item.isRead && <Badge tone="indigo">{t('ann.new_badge')}</Badge>}
                  <Badge tone={item.scope === 'all' ? 'amber' : 'gray'}>
                    {item.scope === 'all' ? t('ann.scope.all') : item.class?.name ?? t('ann.scope.class')}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">
                {item.createdByName ? `${item.createdByName} · ` : ''}
                {formatDateTime(item.createdAt, locale)}
                {canCreate ? ` · ${t('ann.readBy', { count: item.readCount })}` : ''}
              </p>
            </button>
          </li>
        ))}
      </ul>

      {hiddenCount > 0 && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-md text-sm font-medium text-muted transition-colors duration-200 hover:bg-accent hover:text-foreground"
        >
          {expanded ? t('ann.showLess') : t('ann.showMore', { count: hiddenCount })}
          {!expanded && hiddenUnread > 0 && (
            <Badge tone="indigo">{t('ann.hiddenUnread', { count: hiddenUnread })}</Badge>
          )}
          <IconChevronDown
            size={16}
            className={cn('transition-transform duration-300 ease-nav', expanded && 'rotate-180')}
          />
        </button>
      )}

      <Dialog open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open && (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              {open.createdByName ? `${open.createdByName} · ` : ''}
              {formatDateTime(open.createdAt, locale)}
            </p>
            <p className="whitespace-pre-wrap text-sm">{open.body}</p>
            <AttachmentList items={open.attachments} />
          </div>
        )}
      </Dialog>

      {canCreate && classId && (
        <AnnouncementDialog
          classId={classId}
          open={creating}
          onClose={() => setCreating(false)}
          onCreated={() => refetch()}
        />
      )}
    </div>
  );
}

function AnnouncementDialog({
  classId,
  open,
  onClose,
  onCreated,
}: {
  classId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<SevenxAttachmentInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [add, { loading }] = useMutation<{ sevenxAnnouncementAdd: SevenxAnnouncement }>(
    SEVENX_ANNOUNCEMENT_ADD,
  );

  const reset = () => {
    setTitle('');
    setBody('');
    setAttachments([]);
    setErrors({});
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = t('common.required');
    if (!body.trim()) next.body = t('common.required');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      await add({
        variables: { scope: 'class', classId, title: title.trim(), body: body.trim(), attachments },
      });
      toast.success(t('ann.created'));
      reset();
      onClose();
      onCreated();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('ann.new')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="announcement-form" loading={loading}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <form id="announcement-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label={t('ann.title')} htmlFor="ann-title" error={errors.title}>
          <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t('ann.body')} htmlFor="ann-body" error={errors.body}>
          <Textarea id="ann-body" value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>
        <Field label={t('common.attachments')} hint={t('common.optional')}>
          <AttachmentPicker value={attachments} onChange={setAttachments} />
        </Field>
      </form>
    </Dialog>
  );
}

export function AnnouncementsCard({
  classId,
  markReadOnOpen,
  limit,
}: {
  classId?: string;
  markReadOnOpen?: boolean;
  limit?: number;
}) {
  const t = useT();
  return (
    <Card>
      <CardHeader icon={<IconSpeakerphone />} title={t('dash.announcements')} />
      <CardBody>
        <AnnouncementsPanel classId={classId} markReadOnOpen={markReadOnOpen} limit={limit} />
      </CardBody>
    </Card>
  );
}
