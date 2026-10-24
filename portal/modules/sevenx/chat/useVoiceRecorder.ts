'use client';

import { useEffect, useRef, useState } from 'react';

/** Recording stops by itself after this long. */
const MAX_VOICE_MS = 5 * 60_000;

// Chrome/Firefox record webm/opus, Safari records mp4/aac.
const MIME_CANDIDATES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

const pickMimeType = (): string | undefined =>
  typeof MediaRecorder === 'undefined'
    ? undefined
    : MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));

export type VoiceRecorder = {
  recording: boolean;
  elapsedMs: number;
  supported: boolean;
  start: () => Promise<void>;
  /** Stops and returns the recorded voice note, or null when nothing was captured. */
  stop: () => Promise<File | null>;
  cancel: () => void;
};

/** Microphone voice notes through MediaRecorder. */
export const useVoiceRecorder = (onAutoStop: (file: File | null) => void): VoiceRecorder => {
  const [recording, setRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const autoStopRef = useRef(onAutoStop);
  useEffect(() => {
    autoStopRef.current = onAutoStop;
  }, [onAutoStop]);

  const supported =
    typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    Boolean(navigator.mediaDevices?.getUserMedia);

  const release = () => {
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    recorderRef.current = null;
    setRecording(false);
    setElapsedMs(0);
  };

  const stop = () =>
    new Promise<File | null>((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        release();
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        const type = (recorder.mimeType || 'audio/webm').split(';')[0];
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        release();
        if (blob.size === 0) {
          resolve(null);
          return;
        }
        const ext = type.includes('mp4') ? 'm4a' : 'webm';
        resolve(new File([blob], `voice-${Date.now()}.${ext}`, { type }));
      };
      recorder.stop();
    });

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.start(250);
    recorderRef.current = recorder;
    startedAtRef.current = Date.now();
    setElapsedMs(0);
    setRecording(true);
  };

  const cancel = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    chunksRef.current = [];
    release();
  };

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      setElapsedMs(elapsed);
      if (elapsed >= MAX_VOICE_MS) {
        void stop().then((file) => autoStopRef.current(file));
      }
    }, 200);
    return () => window.clearInterval(id);
    // stop only reads refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording]);

  // Never leave the microphone on when the panel unmounts.
  useEffect(
    () => () => recorderRef.current?.stream.getTracks().forEach((track) => track.stop()),
    [],
  );

  return { recording, elapsedMs, supported, start, stop, cancel };
};
