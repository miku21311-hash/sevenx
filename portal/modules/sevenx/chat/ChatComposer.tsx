'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react';
import { uploadFile } from '@/modules/files/upload';
import { useT } from '@/modules/i18n/I18nProvider';
import type { SevenxAttachmentInput } from '@/modules/sevenx/types';
import {
  IconFile,
  IconMicrophone,
  IconMoodSmile,
  IconPaperclip,
  IconPhoto,
  IconPlayerPlay,
  IconSend,
  IconTrash,
  IconX,
  Spinner,
  cn,
  useToast,
} from '@/modules/ui';
import { attachmentKind, formatDuration } from './ChatMessages';
import { EmojiPicker } from './EmojiPicker';
import { CHAT_MAX_ATTACHMENTS, CHAT_MAX_LENGTH } from './useClassChat';
import { useVoiceRecorder } from './useVoiceRecorder';

type Pending = {
  id: string;
  name: string;
  kind: ReturnType<typeof attachmentKind>;
  previewUrl: string | null;
  attachment: SevenxAttachmentInput | null;
};

let pendingSeq = 0;

export function ChatComposer({
  onSend,
  sending,
}: {
  onSend: (body: string, attachments: SevenxAttachmentInput[]) => Promise<boolean>;
  sending: boolean;
}) {
  const t = useT();
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<Pending[]>([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<number | null>(null);
  const pendingRef = useRef(pending);

  const sendVoice = async (file: File | null) => {
    if (!file) return;
    setVoiceBusy(true);
    try {
      const attachment = await uploadFile(file);
      await onSend('', [attachment]);
    } catch (err) {
      toast.error(`${t('common.uploadFailed')}: ${(err as Error).message}`);
    } finally {
      setVoiceBusy(false);
    }
  };
  const voice = useVoiceRecorder(sendVoice);

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  // Free local previews when the composer goes away.
  useEffect(
    () => () => pendingRef.current.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl)),
    [],
  );

  // Grow the input with its content up to a few lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [draft]);

  useEffect(() => {
    if (!emojiOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!emojiRef.current?.contains(e.target as Node)) setEmojiOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [emojiOpen]);

  const uploading = pending.some((p) => !p.attachment);
  const ready = pending.flatMap((p) => (p.attachment ? [p.attachment] : []));
  const text = draft.trim();
  const tooLong = text.length > CHAT_MAX_LENGTH;
  const hasContent = text.length > 0 || pending.length > 0;
  const canSend = (text.length > 0 || ready.length > 0) && !uploading && !tooLong && !sending;

  const addFiles = async (files: File[]) => {
    const room = CHAT_MAX_ATTACHMENTS - pending.length;
    if (files.length > room) toast.error(t('chat.tooManyFiles', { max: CHAT_MAX_ATTACHMENTS }));
    const picked = files.slice(0, Math.max(0, room));
    const items: Pending[] = picked.map((file) => {
      const kind = attachmentKind({ name: file.name, type: file.type });
      return {
        id: `p${++pendingSeq}`,
        name: file.name,
        kind,
        previewUrl: kind === 'image' || kind === 'video' ? URL.createObjectURL(file) : null,
        attachment: null,
      };
    });
    setPending((prev) => [...prev, ...items]);
    await Promise.all(
      items.map(async (item, i) => {
        try {
          const attachment = await uploadFile(picked[i]);
          setPending((prev) => prev.map((p) => (p.id === item.id ? { ...p, attachment } : p)));
        } catch (err) {
          toast.error(`${t('common.uploadFailed')}: ${(err as Error).message}`);
          if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
          setPending((prev) => prev.filter((p) => p.id !== item.id));
        }
      }),
    );
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length > 0) void addFiles(files);
  };

  const removePending = (id: string) =>
    setPending((prev) => {
      const item = prev.find((p) => p.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((p) => p.id !== id);
    });

  const insertEmoji = (emoji: string) => {
    // Read the live input value: the picker keeps the first click handler it was given.
    const el = inputRef.current;
    const value = el?.value ?? '';
    const start = caretRef.current ?? el?.selectionStart ?? value.length;
    const end = caretRef.current ?? el?.selectionEnd ?? value.length;
    const caret = start + emoji.length;
    // Remember the caret until it is restored, so quick repeated picks stay in order.
    caretRef.current = caret;
    setDraft(value.slice(0, start) + emoji + value.slice(end));
    requestAnimationFrame(() => {
      // Refocusing on touch screens would pop the keyboard over the picker.
      if (window.matchMedia('(pointer: fine)').matches) el?.focus();
      el?.setSelectionRange(caret, caret);
      if (caretRef.current === caret) caretRef.current = null;
    });
  };

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    const ok = await onSend(text, ready);
    if (ok) {
      pending.forEach((p) => p.previewUrl && URL.revokeObjectURL(p.previewUrl));
      setPending([]);
      setDraft('');
      setEmojiOpen(false);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void submit();
    }
  };

  const startVoice = async () => {
    try {
      await voice.start();
    } catch {
      toast.error(t('chat.micDenied'));
    }
  };

  const iconButton =
    'flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground transition-[background-color,transform] hover:bg-accent active:scale-90 disabled:pointer-events-none disabled:opacity-40 [&>svg]:size-[22px]';

  if (voice.recording || voiceBusy) {
    return (
      <div className="flex shrink-0 items-center gap-2 border-t bg-card p-3">
        <button
          type="button"
          onClick={voice.cancel}
          disabled={voiceBusy}
          aria-label={t('chat.voiceCancel')}
          className={cn(iconButton, 'text-danger hover:bg-danger/10')}
        >
          <IconTrash />
        </button>
        <div className="flex h-11 flex-1 items-center gap-2.5 rounded-full bg-primary/10 px-4 text-primary">
          {voiceBusy ? (
            <>
              <Spinner />
              <span className="text-sm">{t('chat.voiceSending')}</span>
            </>
          ) : (
            <>
              <span className="size-2.5 animate-pulse rounded-full bg-danger" />
              <span className="text-sm font-medium tabular-nums">{formatDuration(voice.elapsedMs / 1000)}</span>
              <span className="truncate text-xs text-primary/70">{t('chat.voiceRecording')}</span>
            </>
          )}
        </div>
        <button
          type="button"
          disabled={voiceBusy}
          onClick={() => void voice.stop().then(sendVoice)}
          aria-label={t('chat.send')}
          className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-button-primary transition-transform active:scale-90 disabled:opacity-50"
        >
          <IconSend size={20} />
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="shrink-0 border-t bg-card p-3">
      {pending.length > 0 && (
        <ul className="styled-scroll mb-2 flex gap-2 overflow-x-auto pb-1">
          {pending.map((p) => (
            <li key={p.id} className="relative size-16 shrink-0 animate-zoom overflow-hidden rounded-xl bg-accent shadow-xs">
              {p.kind === 'image' && p.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                <img src={p.previewUrl} alt={p.name} className="size-full object-cover" />
              ) : p.kind === 'video' && p.previewUrl ? (
                <>
                  <video src={p.previewUrl} muted className="size-full object-cover" />
                  <IconPlayerPlay size={18} className="absolute inset-0 m-auto text-white drop-shadow" />
                </>
              ) : (
                <span className="flex size-full flex-col items-center justify-center gap-1 px-1 text-accent-foreground">
                  <IconFile size={18} />
                  <span className="w-full truncate text-center text-[9px]">{p.name}</span>
                </span>
              )}
              {!p.attachment && (
                <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                  <Spinner />
                </span>
              )}
              <button
                type="button"
                onClick={() => removePending(p.id)}
                aria-label={t('common.remove')}
                className="absolute right-0.5 top-0.5 flex size-5 cursor-pointer items-center justify-center rounded-full bg-foreground/70 text-background"
              >
                <IconX size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative flex items-end gap-0.5 rounded-3xl border border-border bg-background px-1.5 py-1 transition-shadow focus-within:shadow-focus">
        <div ref={emojiRef} className="relative">
          <button
            type="button"
            onClick={() => setEmojiOpen((v) => !v)}
            aria-label={t('chat.emoji')}
            aria-expanded={emojiOpen}
            className={cn(iconButton, emojiOpen && 'bg-accent')}
          >
            <IconMoodSmile />
          </button>
          {emojiOpen && (
            <div className="absolute bottom-full left-0 z-20 mb-2 w-[min(352px,calc(100vw-2.5rem))] animate-zoom rounded-2xl shadow-lg">
              <EmojiPicker onPick={insertEmoji} />
            </div>
          )}
        </div>

        <label htmlFor="sx-chat-input" className="sr-only">
          {t('chat.placeholder')}
        </label>
        <textarea
          id="sx-chat-input"
          ref={inputRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('chat.placeholder')}
          aria-invalid={tooLong || undefined}
          className="block max-h-[120px] min-h-9 min-w-0 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-accent-foreground/70"
        />

        {hasContent ? (
          <button
            type="submit"
            disabled={!canSend}
            className="h-9 shrink-0 cursor-pointer rounded-full px-3 text-sm font-semibold text-primary transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-40"
          >
            {sending ? <Spinner /> : t('chat.send')}
          </button>
        ) : (
          <>
            {voice.supported && (
              <button type="button" onClick={startVoice} aria-label={t('chat.voice')} className={iconButton}>
                <IconMicrophone />
              </button>
            )}
            <button type="button" onClick={() => mediaRef.current?.click()} aria-label={t('chat.photoVideo')} className={iconButton}>
              <IconPhoto />
            </button>
            <button type="button" onClick={() => fileRef.current?.click()} aria-label={t('chat.file')} className={iconButton}>
              <IconPaperclip />
            </button>
          </>
        )}
      </div>
      {tooLong && (
        <p role="alert" className="mt-1 px-3 text-xs text-danger">
          {t('chat.tooLong', { max: CHAT_MAX_LENGTH })}
        </p>
      )}

      <input ref={mediaRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={onPick} />
      <input ref={fileRef} type="file" multiple className="hidden" onChange={onPick} />
    </form>
  );
}
