import type { ReactNode } from 'react';

// Templates remount on every navigation; the fade matches core-ui PAGE_ENTER_KEYFRAMES.
export default function RouteTransition({ children }: { children: ReactNode }) {
  return <div className="animate-page">{children}</div>;
}
