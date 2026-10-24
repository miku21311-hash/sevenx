'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { Avatar } from '@/modules/auth/PortalHeader';
import { attachmentHref, readableSize } from '@/modules/files/upload';
import { useT, type Locale } from '@/modules/i18n/I18nProvider';
import { formatDate, parseDate, toDateKey } from '@/modules/sevenx/date';
import type { SevenxAttachment, SevenxChatMessage } from '@/modules/sevenx/types';
import {
  Badge,
  IconDownload,
  IconFile,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
  cn,
} from '@/modules/ui';

/** Consecutive messages from one sender within this gap are grouped under one name. */
const GROUP_GAP_MS = 5 * 60_000;

export type AttachmentKind = 'image' | 'video' | 'audio' | 'file';

export const attachmentKind = (a: Pick<SevenxAttachment, 'name' | 'type'>): AttachmentKind => {
  const type = a.type ?? '';
  const ext = a.name.split('.').pop()?.toLowerCase() ?? '';
  if (type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image';
  if (type.startsWith('audio/') || a.name.startsWith('voice-')) return 'audio';
  if (type.startsWith('video/') || ['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) return 'video';
  return 'file';
};

export const timeOf = (value?: string | null) => {
  const d = parseDate(value);
  return d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '';
};

export const formatDuration = (seconds: number) => {
  const s = Math.max(0, Math.round(Number.isFinite(seconds) ? seconds : 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function MessageList({
  messages,
  myId,
  teacherId,
  locale,
}: {
  messages: SevenxChatMessage[];
  myId: string;
  teacherId: string;
  locale: Locale;
}) {
  const t = useT();
  const todayKey = toDateKey(new Date());
  const [preview, setPreview] = useState<SevenxAttachment | null>(null);

  return (
    <>
      <ol className="flex flex-col gap-0.5">
        {messages.map((msg, i) => {
          const prev = messages[i - 1];
          const at = parseDate(msg.createdAt);
          const prevAt = parseDate(prev?.createdAt);
          const dayKey = at ? toDateKey(at) : '';
          const newDay = !prev || (prevAt ? toDateKey(prevAt) : '') !== dayKey;
          const grouped =
            !newDay &&
            prev?.senderId === msg.senderId &&
            Boolean(at && prevAt) &&
            (at?.getTime() ?? 0) - (prevAt?.getTime() ?? 0) < GROUP_GAP_MS;
          const mine = msg.senderId === myId;
          const isTeacher = msg.senderRole === 'teacher' || msg.senderId === teacherId;
          const attachments = msg.attachments ?? [];
          const images = attachments.filter((a) => attachmentKind(a) === 'image');
          const others = attachments.filter((a) => attachmentKind(a) !== 'image');

          return (
            <Fragment key={msg._id}>
              {newDay && (
                <li className="my-3 flex justify-center">
                  <span className="rounded-full bg-background px-2.5 py-0.5 text-[11px] text-muted shadow-xs">
                    {dayKey === todayKey ? t('common.today') : formatDate(msg.createdAt, locale)}
                  </span>
                </li>
              )}
              <li className={cn('flex animate-fade items-end gap-2', mine && 'flex-row-reverse', !grouped && 'mt-2')}>
                {!mine && (
                  <span className="w-7 shrink-0">
                    {!grouped && (
                      <Avatar name={msg.senderName} className={cn('size-7', isTeacher && 'bg-warning/15 text-warning')} />
                    )}
                  </span>
                )}
                <div className={cn('flex min-w-0 max-w-[80%] flex-col gap-1', mine ? 'items-end' : 'items-start')}>
                  {!grouped && !mine && (
                    <span className="flex items-center gap-1.5 px-1 text-xs font-medium">
                      {msg.senderName}
                      {isTeacher && (
                        <Badge tone="amber" className="h-4 px-1 text-[10px]">
                          {t('role.teacher')}
                        </Badge>
                      )}
                    </span>
                  )}

                  {images.length > 0 && <ImageGrid images={images} onOpen={setPreview} />}

                  {others.map((a, idx) => {
                    const kind = attachmentKind(a);
                    if (kind === 'video') {
                      return (
                        <video
                          key={`${a.url}-${idx}`}
                          src={attachmentHref(a.url)}
                          controls
                          playsInline
                          preload="metadata"
                          className="max-h-72 w-60 max-w-full rounded-2xl bg-black shadow-xs"
                        />
                      );
                    }
                    if (kind === 'audio') return <VoiceNote key={`${a.url}-${idx}`} item={a} mine={mine} />;
                    return <FileChip key={`${a.url}-${idx}`} item={a} mine={mine} />;
                  })}

                  {msg.body ? (
                    <div
                      className={cn(
                        'whitespace-pre-wrap break-words rounded-2xl px-3 py-1.5 text-sm shadow-xs',
                        mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-background',
                      )}
                    >
                      {msg.body}
                      <span
                        className={cn(
                          'ml-2 inline-block translate-y-0.5 text-[10px] tabular-nums',
                          mine ? 'text-primary-foreground/70' : 'text-accent-foreground',
                        )}
                      >
                        {timeOf(msg.createdAt)}
                      </span>
                    </div>
                  ) : (
                    <span className="px-1 text-[10px] text-accent-foreground tabular-nums">{timeOf(msg.createdAt)}</span>
                  )}
                </div>
              </li>
            </Fragment>
          );
        })}
      </ol>
      {preview && <Lightbox item={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

function ImageGrid({ images, onOpen }: { images: SevenxAttachment[]; onOpen: (a: SevenxAttachment) => void }) {
  if (images.length === 1) {
    const [img] = images;
    return (
      <button type="button" onClick={() => onOpen(img)} className="cursor-zoom-in overflow-hidden rounded-2xl shadow-xs">
        {/* eslint-disable-next-line @next/next/no-img-element -- files come from the erxes file service */}
        <img src={attachmentHref(img.url)} alt={img.name} loading="lazy" className="block max-h-72 w-60 max-w-full object-cover" />
      </button>
    );
  }
  return (
    <div className="grid w-60 max-w-full grid-cols-2 gap-1 overflow-hidden rounded-2xl shadow-xs">
      {images.map((img, i) => (
        <button key={`${img.url}-${i}`} type="button" onClick={() => onOpen(img)} className="aspect-square cursor-zoom-in">
          {/* eslint-disable-next-line @next/next/no-img-element -- files come from the erxes file service */}
          <img src={attachmentHref(img.url)} alt={img.name} loading="lazy" className="size-full object-cover" />
        </button>
      ))}
    </div>
  );
}

function VoiceNote({ item, mine }: { item: SevenxAttachment; mine: boolean }) {
  const t = useT();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div
      className={cn(
        'flex w-56 items-center gap-2.5 rounded-2xl px-2 py-1.5 shadow-xs',
        mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-background',
      )}
    >
      <audio
        ref={audioRef}
        src={attachmentHref(item.url)}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrent(0);
        }}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
        onDurationChange={(e) => setDuration(Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 0)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t('chat.pause') : t('chat.play')}
        className={cn(
          'flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-90',
          mine ? 'bg-primary-foreground text-primary' : 'bg-primary text-primary-foreground',
        )}
      >
        {playing ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} className="translate-x-px" />}
      </button>
      <div className="min-w-0 flex-1">
        <div className={cn('relative h-1 overflow-hidden rounded-full', mine ? 'bg-primary-foreground/30' : 'bg-accent')}>
          <span
            className={cn('absolute inset-y-0 left-0 rounded-full', mine ? 'bg-primary-foreground' : 'bg-primary')}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={cn('mt-1 block text-[10px] tabular-nums', mine ? 'text-primary-foreground/80' : 'text-muted')}>
          {formatDuration(playing || current > 0 ? current : duration)}
        </span>
      </div>
    </div>
  );
}

function FileChip({ item, mine }: { item: SevenxAttachment; mine: boolean }) {
  return (
    <a
      href={attachmentHref(item.url)}
      target="_blank"
      rel="noreferrer"
      className={cn(
        'flex w-60 max-w-full items-center gap-2.5 rounded-2xl px-3 py-2 shadow-xs transition-opacity hover:opacity-90',
        mine ? 'rounded-br-md bg-primary text-primary-foreground' : 'rounded-bl-md bg-background',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          mine ? 'bg-primary-foreground/15' : 'bg-primary/10 text-primary',
        )}
      >
        <IconFile size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.name}</span>
        {item.size ? (
          <span className={cn('block text-[11px]', mine ? 'text-primary-foreground/70' : 'text-muted')}>
            {readableSize(item.size)}
          </span>
        ) : null}
      </span>
      <IconDownload size={16} className="shrink-0 opacity-70" />
    </a>
  );
}

function Lightbox({ item, onClose }: { item: SevenxAttachment; onClose: () => void }) {
  const t = useT();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={item.name} className="fixed inset-0 z-[60] flex animate-fade items-center justify-center bg-black/85 p-4">
      <button type="button" aria-label={t('common.close')} className="absolute inset-0 cursor-zoom-out" onClick={onClose} />
      {/* eslint-disable-next-line @next/next/no-img-element -- files come from the erxes file service */}
      <img src={attachmentHref(item.url)} alt={item.name} className="relative max-h-full max-w-full animate-zoom rounded-lg object-contain" />
      <div className="absolute right-3 top-3 flex gap-2">
        <a
          href={attachmentHref(item.url)}
          target="_blank"
          rel="noreferrer"
          aria-label={t('chat.download')}
          className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <IconDownload size={18} />
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
        >
          <IconX size={18} />
        </button>
      </div>
    </div>
  );
}
