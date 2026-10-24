'use client';

import { useLayoutEffect, useRef } from 'react';
import { useCurrentMember } from '@/modules/auth/MeContext';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { classAccent } from '@/modules/sevenx/components/DashboardParts';
import { useClassDetail } from '@/modules/sevenx/useClassDetail';
import type { SevenxAttachmentInput, SevenxChatMessage, SevenxClass } from '@/modules/sevenx/types';
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconArrowRight,
  IconMessages,
  IconUsers,
  IconX,
  LoadingState,
  Skeleton,
  useToast,
} from '@/modules/ui';
import { ChatComposer } from './ChatComposer';
import { useChatPanel } from './ChatPanelContext';
import { MessageList, attachmentKind, timeOf } from './ChatMessages';
import { useClassChat } from './useClassChat';

const PANEL_POLL_MS = 4_000;
const CARD_POLL_MS = 20_000;

const usePreviewText = () => {
  const t = useT();
  return (msg: SevenxChatMessage) => {
    if (msg.body) return msg.body;
    const first = msg.attachments?.[0];
    if (!first) return '';
    return t(`chat.preview.${attachmentKind(first)}`);
  };
};

/** Class page entry point: latest message preview and a button that opens the side panel. */
export function ChatEntryCard({ cls }: { cls: SevenxClass }) {
  const t = useT();
  const me = useCurrentMember();
  const panel = useChatPanel();
  const previewText = usePreviewText();
  const { messages, loading, error } = useClassChat(cls._id, CARD_POLL_MS);
  const last = messages[messages.length - 1];
  const isOpen = panel.classId === cls._id;

  return (
    <Card className="animate-enter flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconMessages size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{t('chat.title')}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <IconUsers size={12} />
            {t('chat.members', { count: cls.studentIds.length + 1 })}
          </p>
        </div>
        <Button
          size="lg"
          variant={isOpen ? 'outline' : 'primary'}
          onClick={() => (isOpen ? panel.close() : panel.open(cls._id))}
        >
          {isOpen ? t('chat.close') : t('chat.open')}
          {isOpen ? <IconX /> : <IconArrowRight />}
        </Button>
      </div>
      <button
        type="button"
        onClick={() => panel.open(cls._id)}
        className="block w-full cursor-pointer border-t bg-sidebar px-4 py-2.5 text-left text-xs transition-colors hover:bg-accent"
      >
        {loading ? (
          <Skeleton className="h-4 w-2/3" />
        ) : error ? (
          <span className="text-danger">{error.message}</span>
        ) : last ? (
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="shrink-0 font-medium text-foreground">
              {last.senderId === me._id ? t('chat.you') : last.senderName}:
            </span>
            <span className="truncate text-muted">{previewText(last)}</span>
            <span className="ml-auto shrink-0 text-accent-foreground tabular-nums">{timeOf(last.createdAt)}</span>
          </span>
        ) : (
          <span className="text-muted">{t('chat.emptyHint')}</span>
        )}
      </button>
    </Card>
  );
}

/** Side-panel group chat for one class: teacher and students, polled every few seconds. */
export function ClassChatPanel({ classId, onClose }: { classId: string; onClose: () => void }) {
  const t = useT();
  const { locale } = useLocale();
  const me = useCurrentMember();
  const toast = useToast();
  const { cls, loading: clsLoading, error: clsError, refetch: refetchClass } = useClassDetail(classId);
  const { messages, loading, error, refetch, send, sending } = useClassChat(classId, PANEL_POLL_MS);
  const listRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Follow new messages only when the reader is already at the bottom.
  const lastId = messages[messages.length - 1]?._id;
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [lastId]);

  // Media loads after layout; keep the view pinned while the reader is at the bottom.
  const onMediaLoad = () => {
    const el = listRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  };

  const onSend = async (body: string, attachments: SevenxAttachmentInput[]) => {
    try {
      stickToBottom.current = true;
      await send(body, attachments);
      return true;
    } catch (err) {
      toast.error((err as Error).message || t('chat.sendFailed'));
      return false;
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b px-3 py-2.5">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-white"
          style={{ background: classAccent(classId) }}
        >
          <IconMessages size={18} />
        </span>
        <div className="min-w-0 flex-1">
          {clsLoading ? (
            <Skeleton className="h-4 w-32" />
          ) : (
            <p className="truncate text-sm font-semibold">{cls?.name ?? t('chat.title')}</p>
          )}
          <p className="truncate text-xs text-muted">
            {t('chat.title')}
            {cls ? ` · ${t('chat.members', { count: cls.studentIds.length + 1 })}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-accent-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <IconX size={18} />
        </button>
      </div>

      <div
        ref={listRef}
        onScroll={onScroll}
        onLoadCapture={onMediaLoad}
        className="styled-scroll min-h-0 flex-1 overflow-y-auto bg-sidebar px-3 py-4"
        aria-live="polite"
      >
        {(loading || clsLoading) && <LoadingState rows={4} />}
        {clsError && !cls && <ErrorState message={clsError.message} onRetry={() => refetchClass()} />}
        {error && !loading && messages.length === 0 && (
          <ErrorState message={error.message} onRetry={() => refetch()} />
        )}
        {!loading && !error && messages.length === 0 && (
          <EmptyState title={t('chat.empty')} description={t('chat.emptyHint')} />
        )}
        {cls && <MessageList messages={messages} myId={me._id} teacherId={cls.teacherId} locale={locale} />}
      </div>

      <ChatComposer onSend={onSend} sending={sending} />
    </div>
  );
}
