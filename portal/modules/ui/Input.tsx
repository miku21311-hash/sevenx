'use client';

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { cn } from './cn';

// erxes-ui input/textarea: borderless, ring shadow, focus ring via shadow-focus.
const FIELD =
  'w-full rounded-sm bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow] duration-200 placeholder:text-accent-foreground/70 focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50';

export function Label({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 inline-block font-mono text-xs font-semibold uppercase leading-none text-accent-foreground"
    >
      {children}
      {hint && <span className="ml-1 font-sans font-normal normal-case">({hint})</span>}
    </label>
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 animate-shake text-xs text-danger">
      {children}
    </p>
  );
}

export function Input({
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(FIELD, 'h-8 py-1', className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(FIELD, 'min-h-[60px] py-1.5', className)} {...rest} />;
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <select className={cn(FIELD, 'h-8', className)} {...rest}>
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'flex flex-col',
        Boolean(error) &&
          '[&_input]:shadow-[0_0_0_1px_var(--danger)] [&_select]:shadow-[0_0_0_1px_var(--danger)] [&_textarea]:shadow-[0_0_0_1px_var(--danger)] [&_input:focus-visible]:shadow-focus-danger [&_textarea:focus-visible]:shadow-focus-danger',
      )}
    >
      <Label htmlFor={htmlFor} hint={hint}>
        {label}
      </Label>
      {children}
      <FieldError>{error}</FieldError>
    </div>
  );
}
