import type { CSSProperties } from 'react';

// Index for `.sx-stagger` children; each step delays the entrance by 60ms.
export const stagger = (index: number): CSSProperties =>
  ({ '--i': index }) as CSSProperties;
