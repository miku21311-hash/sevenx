'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cn } from './cn';
import { IconAlertCircle, IconCircleCheck, IconInfoCircle, IconX } from './icons';

type ToastKind = 'success' | 'error' | 'info';

type ToastItem = { id: number; kind: ToastKind; message: string; duration: number; leaving?: boolean };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const ICON: Record<ToastKind, { Icon: typeof IconCircleCheck; className: string }> = {
  success: { Icon: IconCircleCheck, className: 'text-success' },
  error: { Icon: IconAlertCircle, className: 'text-danger' },
  info: { Icon: IconInfoCircle, className: 'text-primary' },
};

const BAR: Record<ToastKind, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-primary',
};

const EXIT_MS = 220;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, leaving: true } : item)));
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, EXIT_MS);
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = ++counter.current;
      const duration = kind === 'error' ? 6000 : 3500;
      setItems((prev) => [...prev, { id, kind, message, duration }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end">
        {items.map((item) => {
          const { Icon, className } = ICON[item.kind];
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                'pointer-events-auto relative flex w-full max-w-[356px] items-start gap-2.5 overflow-hidden rounded-lg bg-background px-4 py-3 pr-9 text-sm shadow-lg transition-[opacity,transform] duration-200 ease-nav',
                item.leaving ? 'translate-y-1 opacity-0' : 'animate-toast',
              )}
            >
              <Icon size={16} className={cn('mt-px shrink-0', className)} />
              <p className="min-w-0 flex-1 break-words font-medium leading-5">{item.message}</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => dismiss(item.id)}
                className="absolute right-2 top-2.5 rounded-sm p-1 text-accent-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <IconX size={14} />
              </button>
              <span
                aria-hidden
                className={cn('absolute inset-x-0 bottom-0 h-0.5 origin-left opacity-60', BAR[item.kind])}
                style={{ animation: `progress ${item.duration}ms linear forwards` }}
              />
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
