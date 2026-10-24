'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from './cn';
import { IconX } from './icons';

type DialogContent = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}) {
  // Keep the dialog mounted while its exit animation runs.
  const [rendered, setRendered] = useState(open);
  if (open && !rendered) setRendered(true);
  const closing = rendered && !open;

  // Callers usually clear their content when closing; show the last open content during exit.
  const [snapshot, setSnapshot] = useState<DialogContent>({ title, description, children, footer });
  if (
    open &&
    (snapshot.title !== title ||
      snapshot.description !== description ||
      snapshot.children !== children ||
      snapshot.footer !== footer)
  ) {
    setSnapshot({ title, description, children, footer });
  }
  const content: DialogContent = closing ? snapshot : { title, description, children, footer };

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => setRendered(false), 200);
    return () => window.clearTimeout(timer);
  }, [closing]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!rendered || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 transition-opacity duration-150 sm:items-center sm:p-4',
        closing ? 'pointer-events-none opacity-0' : 'animate-fade',
      )}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'flex max-h-[92vh] w-full flex-col rounded-t-xl bg-background shadow-lg transition-[opacity,transform] duration-150 ease-nav sm:rounded-lg',
          size === 'md' ? 'sm:max-w-lg' : 'sm:max-w-3xl',
          closing
            ? 'translate-y-4 opacity-0 sm:translate-y-0 sm:scale-[0.96]'
            : 'animate-sheet sm:animate-zoom',
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <h2 className="text-lg font-semibold leading-none tracking-tight">{content.title}</h2>
            {content.description && (
              <p className="mt-1.5 text-sm text-muted">{content.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 rounded-sm p-1 text-accent-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
          >
            <IconX size={16} />
          </button>
        </div>
        <div className="styled-scroll overflow-y-auto overflow-x-hidden px-5 py-2">{content.children}</div>
        {content.footer && (
          <div className="flex justify-end gap-2 px-5 pb-5 pt-3">
            {content.footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
