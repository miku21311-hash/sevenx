'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

type ChatPanelValue = {
  /** Class whose chat is open in the side panel, or null when closed. */
  classId: string | null;
  open: (classId: string) => void;
  close: () => void;
};

const ChatPanelContext = createContext<ChatPanelValue | null>(null);

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [classId, setClassId] = useState<string | null>(null);
  const value = useMemo<ChatPanelValue>(
    () => ({ classId, open: setClassId, close: () => setClassId(null) }),
    [classId],
  );
  return <ChatPanelContext.Provider value={value}>{children}</ChatPanelContext.Provider>;
}

export const useChatPanel = (): ChatPanelValue => {
  const value = useContext(ChatPanelContext);
  if (!value) throw new Error('useChatPanel must be used inside ChatPanelProvider');
  return value;
};
